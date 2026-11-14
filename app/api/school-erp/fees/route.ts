import { NextRequest } from 'next/server';
import crypto from 'crypto';
import pool from '@/lib/db';
import { RowDataPacket } from 'mysql2';
import { SchoolService } from '@/server/services/school.service';
import { getSchoolAuthFromRequest } from '@/lib/school-auth';
import { apiSuccess, apiError, parseBody } from '@/server/utils/api-response';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  await SchoolService.ensureTables();

  const authUser = await getSchoolAuthFromRequest(request);
  if (!authUser) return apiError('Unauthorized', 401);

  const schoolId = authUser.schoolId;
  const { searchParams } = new URL(request.url);

  const section = searchParams.get('section') || 'overview';
  const classId = searchParams.get('classId');
  const studentId = searchParams.get('studentId');
  const invoiceId = searchParams.get('invoiceId');
  const receiptNo = searchParams.get('receiptNo');

  try {
    // 1. Fee Categories & Class Structures
    if (section === 'structures' || section === 'categories') {
      const [categories] = await pool.execute<RowDataPacket[]>(
        'SELECT * FROM school_fee_categories WHERE schoolId = ? ORDER BY name ASC',
        [schoolId]
      );

      const [structures] = await pool.execute<RowDataPacket[]>(
        `SELECT fs.*, c.name as className, cat.name as categoryName, cat.frequency
         FROM school_fee_structures fs
         JOIN school_classes c ON c.id = fs.classId
         JOIN school_fee_categories cat ON cat.id = fs.categoryId
         WHERE fs.schoolId = ?
         ORDER BY c.numericOrder ASC, cat.name ASC`,
        [schoolId]
      );

      const [classes] = await pool.execute<RowDataPacket[]>(
        'SELECT id, name, numericOrder FROM school_classes WHERE schoolId = ? ORDER BY numericOrder ASC, name ASC',
        [schoolId]
      );

      return apiSuccess({ categories, structures, classes });
    }

    // 1b. Student Pending Defaulters Ledger
    if (section === 'defaulters') {
      let defQuery = `
        SELECT 
          s.id as studentId, s.firstName, s.lastName, s.admissionNo, s.rollNo,
          s.fatherName, s.fatherPhone, s.motherPhone,
          s.transportOpted, s.monthlyTransportFee,
          c.id as classId, c.name as className, sec.name as sectionName,
          r.routeName, st.stopName,
          COUNT(inv.id) as unpaidInvoicesCount,
          SUM(inv.totalAmount) as totalBilled,
          SUM(inv.paidAmount) as totalPaid,
          SUM(inv.totalAmount - inv.paidAmount) as totalPending,
          MIN(inv.dueDate) as earliestDueDate,
          MAX(inv.createdAt) as lastBilledDate,
          GROUP_CONCAT(CONCAT(inv.id, ':', inv.invoiceNo, ':', (inv.totalAmount - inv.paidAmount)) SEPARATOR '|') as pendingInvoicesSummary
        FROM school_students s
        JOIN school_classes c ON c.id = s.classId
        LEFT JOIN school_sections sec ON sec.id = s.sectionId
        LEFT JOIN school_transport_routes r ON r.id = s.transportRouteId
        LEFT JOIN school_transport_stops st ON st.id = s.transportStopId
        JOIN school_fee_invoices inv ON inv.studentId = s.id
        WHERE s.schoolId = ? AND inv.status != 'paid'
      `;
      const defParams: any[] = [schoolId];

      if (classId) {
        defQuery += ' AND s.classId = ?';
        defParams.push(classId);
      }

      defQuery += `
        GROUP BY s.id, c.id, sec.id, r.id, st.id
        HAVING totalPending > 0
        ORDER BY totalPending DESC
      `;

      const [defaulters] = await pool.execute<RowDataPacket[]>(defQuery, defParams);
      return apiSuccess({ defaulters });
    }

    // 2. Single Receipt Details
    if (receiptNo || invoiceId) {
      const [payments] = await pool.execute<RowDataPacket[]>(
        `SELECT p.*, s.firstName, s.lastName, s.admissionNo, s.fatherName, s.fatherPhone,
                s.transportOpted, s.monthlyTransportFee,
                c.name as className, sec.name as sectionName,
                sch.name as schoolName, sch.address as schoolAddress, sch.phone as schoolPhone,
                sch.email as schoolEmail, sch.logoUrl as schoolLogo,
                inv.invoiceNo, inv.title as invoiceTitle, inv.monthYear, inv.itemsJson,
                r.routeName, st.stopName
         FROM school_fee_payments p
         JOIN school_students s ON s.id = p.studentId
         JOIN school_classes c ON c.id = s.classId
         LEFT JOIN school_sections sec ON sec.id = s.sectionId
         JOIN schools sch ON sch.id = p.schoolId
         LEFT JOIN school_fee_invoices inv ON inv.id = p.invoiceId
         LEFT JOIN school_transport_routes r ON r.id = s.transportRouteId
         LEFT JOIN school_transport_stops st ON st.id = s.transportStopId
         WHERE p.schoolId = ? AND (p.receiptNo = ? OR p.invoiceId = ?)
         ORDER BY p.createdAt DESC LIMIT 1`,
        [schoolId, receiptNo || '', invoiceId || '']
      );

      if (payments.length === 0) return apiError('Receipt record not found', 404);

      return apiSuccess({ receipt: payments[0] });
    }

    // 3. Invoices List with filtering
    let invQuery = `
      SELECT inv.*, s.firstName, s.lastName, s.admissionNo, s.fatherPhone,
             s.transportOpted, s.monthlyTransportFee,
             c.name as className, sec.name as sectionName,
             r.routeName, st.stopName
      FROM school_fee_invoices inv
      JOIN school_students s ON s.id = inv.studentId
      JOIN school_classes c ON c.id = inv.classId
      LEFT JOIN school_sections sec ON sec.id = s.sectionId
      LEFT JOIN school_transport_routes r ON r.id = s.transportRouteId
      LEFT JOIN school_transport_stops st ON st.id = s.transportStopId
      WHERE inv.schoolId = ?
    `;
    const invParams: any[] = [schoolId];

    if (studentId) {
      invQuery += ' AND inv.studentId = ?';
      invParams.push(studentId);
    }
    if (classId) {
      invQuery += ' AND inv.classId = ?';
      invParams.push(classId);
    }

    invQuery += ' ORDER BY inv.createdAt DESC LIMIT 150';

    const [invoices] = await pool.execute<RowDataPacket[]>(invQuery, invParams);

    // 4. Recent Payment Transactions
    const [payments] = await pool.execute<RowDataPacket[]>(
      `SELECT p.*, s.firstName, s.lastName, s.admissionNo, c.name as className
       FROM school_fee_payments p
       JOIN school_students s ON s.id = p.studentId
       JOIN school_classes c ON c.id = s.classId
       WHERE p.schoolId = ?
       ORDER BY p.createdAt DESC LIMIT 100`,
      [schoolId]
    );

    // 5. Summary metrics
    const [summaryRows] = await pool.execute<RowDataPacket[]>(
      `SELECT 
         COALESCE(SUM(totalAmount), 0) as totalBilled,
         COALESCE(SUM(paidAmount), 0) as totalCollected,
         COALESCE(SUM(totalAmount - paidAmount), 0) as totalPending,
         COALESCE(SUM(discount), 0) as totalDiscounts,
         (SELECT COALESCE(SUM(monthlyTransportFee), 0) FROM school_students WHERE schoolId = ? AND transportOpted = 1) as totalMonthlyBusRevenue,
         (SELECT COUNT(*) FROM school_students WHERE schoolId = ? AND transportOpted = 1) as totalBusStudents
       FROM school_fee_invoices WHERE schoolId = ?`,
      [schoolId, schoolId, schoolId]
    );

    return apiSuccess({
      invoices,
      payments,
      summary: summaryRows[0] || {},
    });
  } catch (error: any) {
    console.error('Fees GET error:', error);
    return apiError(error.message || 'Failed to fetch fee records', 500);
  }
}

export async function POST(request: NextRequest) {
  await SchoolService.ensureTables();

  const authUser = await getSchoolAuthFromRequest(request);
  if (!authUser) return apiError('Unauthorized', 401);

  const schoolId = authUser.schoolId;
  const body = await parseBody<Record<string, any>>(request);
  if (!body) return apiError('Invalid request payload', 400);

  const action = body.action;

  try {
    // 1. ADD / UPDATE FEE CATEGORY
    if (action === 'add_category') {
      const { name, frequency = 'monthly', isOptional = false } = body;
      if (!name) return apiError('Fee category name is required', 400);

      const catId = crypto.randomUUID();
      await pool.execute(
        `INSERT INTO school_fee_categories (id, schoolId, name, frequency, isOptional)
         VALUES (?, ?, ?, ?, ?)`,
        [catId, schoolId, name.trim(), frequency, isOptional ? 1 : 0]
      );

      return apiSuccess({ message: `Fee category '${name}' added`, categoryId: catId });
    }

    // 2. SET CLASS FEE STRUCTURE
    if (action === 'set_class_structure') {
      const { classId, categoryId, amount } = body;
      if (!classId || !categoryId) return apiError('Class and Fee Category are required', 400);

      const parsedAmount = Number(amount) || 0;

      const [existing] = await pool.execute<RowDataPacket[]>(
        'SELECT id FROM school_fee_structures WHERE schoolId = ? AND classId = ? AND categoryId = ? LIMIT 1',
        [schoolId, classId, categoryId]
      );

      if (existing.length > 0) {
        await pool.execute(
          'UPDATE school_fee_structures SET amount = ? WHERE id = ?',
          [parsedAmount, existing[0].id]
        );
      } else {
        await pool.execute(
          'INSERT INTO school_fee_structures (id, schoolId, classId, categoryId, amount) VALUES (?, ?, ?, ?, ?)',
          [crypto.randomUUID(), schoolId, classId, categoryId, parsedAmount]
        );
      }

      return apiSuccess({ message: 'Class fee structure updated' });
    }

    // 2b. BULK SET CLASS STRUCTURES
    if (action === 'bulk_set_class_structures') {
      const { classId, structures } = body;
      if (!classId || !Array.isArray(structures)) {
        return apiError('Class ID and structures list are required', 400);
      }

      for (const item of structures) {
        const { categoryId, amount } = item;
        if (!categoryId) continue;
        const parsedAmount = Number(amount) || 0;

        const [existing] = await pool.execute<RowDataPacket[]>(
          'SELECT id FROM school_fee_structures WHERE schoolId = ? AND classId = ? AND categoryId = ? LIMIT 1',
          [schoolId, classId, categoryId]
        );

        if (existing.length > 0) {
          await pool.execute(
            'UPDATE school_fee_structures SET amount = ? WHERE id = ?',
            [parsedAmount, existing[0].id]
          );
        } else {
          await pool.execute(
            'INSERT INTO school_fee_structures (id, schoolId, classId, categoryId, amount) VALUES (?, ?, ?, ?, ?)',
            [crypto.randomUUID(), schoolId, classId, categoryId, parsedAmount]
          );
        }
      }

      return apiSuccess({ message: 'All fee categories updated for this class' });
    }

    // 2c. DELETE FEE CATEGORY
    if (action === 'delete_category') {
      const { categoryId } = body;
      if (!categoryId) return apiError('Category ID is required', 400);

      await pool.execute('DELETE FROM school_fee_structures WHERE schoolId = ? AND categoryId = ?', [schoolId, categoryId]);
      await pool.execute('DELETE FROM school_fee_categories WHERE schoolId = ? AND id = ?', [schoolId, categoryId]);

      return apiSuccess({ message: 'Fee category removed successfully' });
    }

    // 3. GENERATE INVOICES (CLASS-WISE BULK OR INDIVIDUAL)
    if (action === 'generate_invoices') {
      const { classId, studentId, monthYear = 'Current Month', title = 'Monthly School Fee', dueDate, discount = 0 } = body;
      if (!classId && !studentId) {
        return apiError('Class or Student is required to generate invoice', 400);
      }

      // Fetch students to invoice with transport allocation details
      let stdQuery = `
        SELECT s.id, s.classId, s.transportOpted, s.transportRouteId, s.transportStopId, s.monthlyTransportFee,
               st.stopName, r.routeName
        FROM school_students s
        LEFT JOIN school_transport_stops st ON st.id = s.transportStopId
        LEFT JOIN school_transport_routes r ON r.id = s.transportRouteId
        WHERE s.schoolId = ? AND s.status = 'active'
      `;
      const stdParams: any[] = [schoolId];
      if (studentId) {
        stdQuery += ' AND s.id = ?';
        stdParams.push(studentId);
      } else if (classId) {
        stdQuery += ' AND s.classId = ?';
        stdParams.push(classId);
      }

      const [students] = await pool.execute<RowDataPacket[]>(stdQuery, stdParams);
      if (students.length === 0) {
        return apiError('No active students found to invoice', 400);
      }

      // Fetch base fee structures for the class
      let targetClassId = classId || students[0].classId;
      const [structures] = await pool.execute<RowDataPacket[]>(
        `SELECT fs.amount, cat.name as categoryName
         FROM school_fee_structures fs
         JOIN school_fee_categories cat ON cat.id = fs.categoryId
         WHERE fs.schoolId = ? AND fs.classId = ?`,
        [schoolId, targetClassId]
      );

      let baseSubtotal = 0;
      const baseItems = structures.map((s) => {
        const amt = Number(s.amount) || 0;
        baseSubtotal += amt;
        return { name: s.categoryName, amount: amt };
      });

      // Default fee if no structure was assigned yet
      if (baseSubtotal === 0) {
        baseSubtotal = 2500;
        baseItems.push({ name: 'Standard Monthly Tuition Fee', amount: 2500 });
      }

      const parsedDiscount = Number(discount) || 0;
      let generatedCount = 0;
      const year = new Date().getFullYear();

      for (const std of students) {
        const invoiceNo = `INV-${year}-${Math.floor(10000 + Math.random() * 90000)}`;
        const invoiceId = crypto.randomUUID();

        // Create student-specific items list
        const studentItems = [...baseItems];
        let studentSubtotal = baseSubtotal;

        // Auto-include bus fee if student opted for transport
        if ((std.transportOpted || Number(std.monthlyTransportFee) > 0) && Number(std.monthlyTransportFee) > 0) {
          const busFee = Number(std.monthlyTransportFee);
          studentSubtotal += busFee;
          const stopLabel = std.stopName ? `Stop: ${std.stopName}` : std.routeName ? `Route: ${std.routeName}` : 'Transport';
          studentItems.push({
            name: `School Bus & Transport Fee (${stopLabel})`,
            amount: busFee,
          });
        }

        const studentTotal = Math.max(0, studentSubtotal - parsedDiscount);

        await pool.execute(
          `INSERT INTO school_fee_invoices 
           (id, schoolId, invoiceNo, studentId, classId, title, monthYear, subtotal, discount, fine, totalAmount, paidAmount, status, dueDate, itemsJson)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, 0, 'unpaid', ?, ?)`,
          [
            invoiceId,
            schoolId,
            invoiceNo,
            std.id,
            std.classId,
            title,
            monthYear,
            studentSubtotal,
            parsedDiscount,
            studentTotal,
            dueDate || null,
            JSON.stringify(studentItems),
          ]
        );
        generatedCount++;
      }

      return apiSuccess({
        message: `Successfully generated ${generatedCount} fee invoice(s)`,
        count: generatedCount,
      });
    }

    // 4. RECORD PAYMENT & ISSUE RECEIPT
    if (action === 'record_payment') {
      const {
        invoiceId,
        studentId,
        amount,
        paymentMethod = 'cash',
        transactionRef = '',
        notes = '',
        paymentDate,
      } = body;

      if (!invoiceId || !amount) {
        return apiError('Invoice ID and Payment Amount are required', 400);
      }

      const payAmt = Number(amount);
      if (payAmt <= 0) return apiError('Amount must be greater than zero', 400);

      // Verify invoice
      const [invoices] = await pool.execute<RowDataPacket[]>(
        'SELECT * FROM school_fee_invoices WHERE schoolId = ? AND id = ? LIMIT 1',
        [schoolId, invoiceId]
      );

      if (invoices.length === 0) return apiError('Invoice not found', 404);

      const inv = invoices[0];
      const targetStudentId = studentId || inv.studentId;
      const newPaid = Number(inv.paidAmount || 0) + payAmt;
      const total = Number(inv.totalAmount || 0);

      let newStatus = 'partial';
      if (newPaid >= total) newStatus = 'paid';

      // Update invoice
      await pool.execute(
        'UPDATE school_fee_invoices SET paidAmount = ?, status = ? WHERE id = ?',
        [newPaid, newStatus, invoiceId]
      );

      // Generate receipt number
      const year = new Date().getFullYear();
      const receiptNo = `REC-${year}-${Math.floor(10000 + Math.random() * 90000)}`;
      const paymentId = crypto.randomUUID();
      const pDate = paymentDate || new Date().toISOString().split('T')[0];

      await pool.execute(
        `INSERT INTO school_fee_payments 
         (id, schoolId, invoiceId, receiptNo, studentId, amount, paymentMethod, transactionRef, notes, paymentDate)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [paymentId, schoolId, invoiceId, receiptNo, targetStudentId, payAmt, paymentMethod, transactionRef, notes, pDate]
      );

      // Add corresponding income entry in accounting cashbook
      await pool.execute(
        `INSERT INTO school_accounting (id, schoolId, type, category, title, amount, paymentMode, referenceNo, date, notes)
         VALUES (?, ?, 'income', 'Fee Collection', ?, ?, ?, ?, ?, ?)`,
        [
          crypto.randomUUID(),
          schoolId,
          `Fee Received (${receiptNo})`,
          payAmt,
          paymentMethod,
          receiptNo,
          pDate,
          `Payment for Invoice ${inv.invoiceNo}`,
        ]
      );

      return apiSuccess({
        message: 'Payment recorded successfully',
        receiptNo,
        paymentId,
        invoiceStatus: newStatus,
        paidAmount: newPaid,
      });
    }

    return apiError('Unknown action', 400);
  } catch (error: any) {
    console.error('Fees POST error:', error);
    return apiError(error.message || 'Operation failed', 500);
  }
}

