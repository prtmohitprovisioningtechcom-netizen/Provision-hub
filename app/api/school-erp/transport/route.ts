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
  const routeId = searchParams.get('routeId');

  try {
    // 1. Vehicles Fleet
    const [vehicles] = await pool.execute<RowDataPacket[]>(
      `SELECT v.*,
              (SELECT COUNT(*) FROM school_transport_routes r WHERE r.vehicleId = v.id) as routesCount
       FROM school_vehicles v
       WHERE v.schoolId = ?
       ORDER BY v.vehicleNo ASC`,
      [schoolId]
    );

    // 2. Transport Routes with Vehicle details and Student counts
    const [routes] = await pool.execute<RowDataPacket[]>(
      `SELECT r.*,
              v.vehicleNo, v.vehicleType, v.capacity as vehicleCapacity,
              (SELECT COUNT(*) FROM school_students s WHERE s.schoolId = r.schoolId AND s.transportRouteId = r.id AND s.transportOpted = 1) as passengerCount,
              (SELECT COUNT(*) FROM school_transport_stops st WHERE st.schoolId = r.schoolId AND st.routeId = r.id) as stopCount
       FROM school_transport_routes r
       LEFT JOIN school_vehicles v ON v.id = r.vehicleId
       WHERE r.schoolId = ?
       ORDER BY r.routeName ASC`,
      [schoolId]
    );

    // 3. Pickup & Drop Stops
    let stopsQuery = `
      SELECT st.*, r.routeName,
             (SELECT COUNT(*) FROM school_students s WHERE s.schoolId = st.schoolId AND s.transportStopId = st.id AND s.transportOpted = 1) as studentCount
      FROM school_transport_stops st
      JOIN school_transport_routes r ON r.id = st.routeId
      WHERE st.schoolId = ?
    `;
    const stopsParams: any[] = [schoolId];
    if (routeId) {
      stopsQuery += ' AND st.routeId = ?';
      stopsParams.push(routeId);
    }
    stopsQuery += ' ORDER BY st.routeId, st.orderIndex ASC';
    const [stops] = await pool.execute<RowDataPacket[]>(stopsQuery, stopsParams);

    // 4. Students Allocated to Transport
    const [allocatedStudents] = await pool.execute<RowDataPacket[]>(
      `SELECT s.id, s.admissionNo, s.rollNo, s.firstName, s.lastName, s.fatherName, s.fatherPhone, s.photoUrl,
              s.transportOpted, s.transportRouteId, s.transportStopId, s.monthlyTransportFee,
              c.name as className, sec.name as sectionName,
              r.routeName, r.driverName, r.driverPhone,
              st.stopName, st.pickupTime, st.dropTime, st.monthlyFare as stopMonthlyFare,
              v.vehicleNo, v.vehicleType
       FROM school_students s
       JOIN school_classes c ON c.id = s.classId
       LEFT JOIN school_sections sec ON sec.id = s.sectionId
       LEFT JOIN school_transport_routes r ON r.id = s.transportRouteId
       LEFT JOIN school_transport_stops st ON st.id = s.transportStopId
       LEFT JOIN school_vehicles v ON v.id = r.vehicleId
       WHERE s.schoolId = ? AND s.transportOpted = 1
       ORDER BY r.routeName ASC, st.orderIndex ASC, s.firstName ASC`,
      [schoolId]
    );

    // 5. Bus Fee Defaulters (Transport-opted students with unpaid/partial invoices)
    const [defaulters] = await pool.execute<RowDataPacket[]>(
      `SELECT inv.id as invoiceId, inv.invoiceNo, inv.monthYear, inv.totalAmount, inv.paidAmount,
              inv.status as invoiceStatus, inv.dueDate,
              s.id as studentId, s.firstName, s.lastName, s.admissionNo, s.fatherPhone, s.monthlyTransportFee,
              c.name as className, sec.name as sectionName,
              r.routeName, st.stopName, v.vehicleNo
       FROM school_fee_invoices inv
       JOIN school_students s ON s.id = inv.studentId
       JOIN school_classes c ON c.id = inv.classId
       LEFT JOIN school_sections sec ON sec.id = s.sectionId
       LEFT JOIN school_transport_routes r ON r.id = s.transportRouteId
       LEFT JOIN school_transport_stops st ON st.id = s.transportStopId
       LEFT JOIN school_vehicles v ON v.id = r.vehicleId
       WHERE inv.schoolId = ? AND s.transportOpted = 1 AND inv.status != 'paid'
       ORDER BY inv.dueDate ASC, s.firstName ASC LIMIT 100`,
      [schoolId]
    );

    // 6. Summary KPIs
    const [summaryRows] = await pool.execute<RowDataPacket[]>(
      `SELECT 
         (SELECT COUNT(*) FROM school_vehicles WHERE schoolId = ?) as totalVehicles,
         (SELECT COUNT(*) FROM school_transport_routes WHERE schoolId = ?) as totalRoutes,
         (SELECT COUNT(*) FROM school_transport_stops WHERE schoolId = ?) as totalStops,
         (SELECT COUNT(*) FROM school_students WHERE schoolId = ? AND transportOpted = 1) as totalBusStudents,
         (SELECT COALESCE(SUM(monthlyTransportFee), 0) FROM school_students WHERE schoolId = ? AND transportOpted = 1) as totalMonthlyBusRevenue,
         (SELECT COALESCE(SUM(monthlyFuelCost), 0) FROM school_vehicles WHERE schoolId = ?) as totalMonthlyFuelCost`,
      [schoolId, schoolId, schoolId, schoolId, schoolId, schoolId]
    );

    return apiSuccess({
      vehicles,
      routes,
      stops,
      allocatedStudents,
      defaulters,
      summary: summaryRows[0] || {},
    });
  } catch (error: any) {
    console.error('Transport GET error:', error);
    return apiError(error.message || 'Failed to fetch transport data', 500);
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
    // ----------------------------------------------------
    // VEHICLE MANAGEMENT
    // ----------------------------------------------------
    if (action === 'add_vehicle') {
      const {
        vehicleNo,
        vehicleType = 'Bus',
        driverName = '',
        driverPhone = '',
        conductorName = '',
        conductorPhone = '',
        capacity = 35,
        routeName = '',
        insuranceExpiry,
        fitnessExpiry,
        monthlyFuelCost = 0,
      } = body;

      if (!vehicleNo) return apiError('Vehicle registration number is required', 400);

      const vehicleId = crypto.randomUUID();
      await pool.execute(
        `INSERT INTO school_vehicles
         (id, schoolId, vehicleNo, vehicleType, driverName, driverPhone, conductorName, conductorPhone, capacity, routeName, insuranceExpiry, fitnessExpiry, monthlyFuelCost)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          vehicleId,
          schoolId,
          vehicleNo.trim().toUpperCase(),
          vehicleType,
          driverName.trim(),
          driverPhone.trim(),
          conductorName.trim(),
          conductorPhone.trim(),
          Number(capacity) || 35,
          routeName.trim(),
          insuranceExpiry || null,
          fitnessExpiry || null,
          Number(monthlyFuelCost) || 0,
        ]
      );

      return apiSuccess({ message: `Vehicle ${vehicleNo} added successfully`, vehicleId });
    }

    if (action === 'update_vehicle') {
      const {
        id,
        vehicleNo,
        vehicleType = 'Bus',
        driverName = '',
        driverPhone = '',
        conductorName = '',
        conductorPhone = '',
        capacity = 35,
        routeName = '',
        insuranceExpiry,
        fitnessExpiry,
        monthlyFuelCost = 0,
      } = body;

      if (!id || !vehicleNo) return apiError('Vehicle ID and number are required', 400);

      await pool.execute(
        `UPDATE school_vehicles
         SET vehicleNo = ?, vehicleType = ?, driverName = ?, driverPhone = ?,
             conductorName = ?, conductorPhone = ?, capacity = ?, routeName = ?,
             insuranceExpiry = ?, fitnessExpiry = ?, monthlyFuelCost = ?
         WHERE schoolId = ? AND id = ?`,
        [
          vehicleNo.trim().toUpperCase(),
          vehicleType,
          driverName.trim(),
          driverPhone.trim(),
          conductorName.trim(),
          conductorPhone.trim(),
          Number(capacity) || 35,
          routeName.trim(),
          insuranceExpiry || null,
          fitnessExpiry || null,
          Number(monthlyFuelCost) || 0,
          schoolId,
          id,
        ]
      );

      return apiSuccess({ message: `Vehicle ${vehicleNo} updated successfully` });
    }

    if (action === 'delete_vehicle') {
      const { id } = body;
      if (!id) return apiError('Vehicle ID is required', 400);

      await pool.execute('UPDATE school_transport_routes SET vehicleId = NULL WHERE schoolId = ? AND vehicleId = ?', [schoolId, id]);
      await pool.execute('DELETE FROM school_vehicles WHERE schoolId = ? AND id = ?', [schoolId, id]);

      return apiSuccess({ message: 'Vehicle deleted successfully' });
    }

    // ----------------------------------------------------
    // ROUTE MANAGEMENT
    // ----------------------------------------------------
    if (action === 'add_route') {
      const {
        routeName,
        vehicleId = null,
        startPoint = '',
        endPoint = '',
        driverName = '',
        driverPhone = '',
        monthlyDefaultFare = 600,
      } = body;

      if (!routeName) return apiError('Route name is required', 400);

      const routeId = crypto.randomUUID();
      await pool.execute(
        `INSERT INTO school_transport_routes
         (id, schoolId, routeName, vehicleId, startPoint, endPoint, driverName, driverPhone, monthlyDefaultFare)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          routeId,
          schoolId,
          routeName.trim(),
          vehicleId || null,
          startPoint.trim(),
          endPoint.trim(),
          driverName.trim(),
          driverPhone.trim(),
          Number(monthlyDefaultFare) || 600,
        ]
      );

      return apiSuccess({ message: `Route '${routeName}' created successfully`, routeId });
    }

    if (action === 'update_route') {
      const {
        id,
        routeName,
        vehicleId = null,
        startPoint = '',
        endPoint = '',
        driverName = '',
        driverPhone = '',
        monthlyDefaultFare = 600,
      } = body;

      if (!id || !routeName) return apiError('Route ID and name are required', 400);

      await pool.execute(
        `UPDATE school_transport_routes
         SET routeName = ?, vehicleId = ?, startPoint = ?, endPoint = ?,
             driverName = ?, driverPhone = ?, monthlyDefaultFare = ?
         WHERE schoolId = ? AND id = ?`,
        [
          routeName.trim(),
          vehicleId || null,
          startPoint.trim(),
          endPoint.trim(),
          driverName.trim(),
          driverPhone.trim(),
          Number(monthlyDefaultFare) || 600,
          schoolId,
          id,
        ]
      );

      return apiSuccess({ message: `Route '${routeName}' updated successfully` });
    }

    if (action === 'delete_route') {
      const { id } = body;
      if (!id) return apiError('Route ID is required', 400);

      // Reset assigned students
      await pool.execute(
        `UPDATE school_students
         SET transportOpted = 0, transportRouteId = NULL, transportStopId = NULL, monthlyTransportFee = 0
         WHERE schoolId = ? AND transportRouteId = ?`,
        [schoolId, id]
      );

      // Delete stops on this route
      await pool.execute('DELETE FROM school_transport_stops WHERE schoolId = ? AND routeId = ?', [schoolId, id]);
      // Delete route
      await pool.execute('DELETE FROM school_transport_routes WHERE schoolId = ? AND id = ?', [schoolId, id]);

      return apiSuccess({ message: 'Route and its stops deleted successfully' });
    }

    // ----------------------------------------------------
    // STOP MANAGEMENT (PICKUP & DROP)
    // ----------------------------------------------------
    if (action === 'add_stop') {
      const {
        routeId,
        stopName,
        pickupTime = '07:30 AM',
        dropTime = '02:30 PM',
        monthlyFare = 600,
        orderIndex = 1,
      } = body;

      if (!routeId || !stopName) return apiError('Route and Stop name are required', 400);

      const stopId = crypto.randomUUID();
      await pool.execute(
        `INSERT INTO school_transport_stops
         (id, schoolId, routeId, stopName, pickupTime, dropTime, monthlyFare, orderIndex)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          stopId,
          schoolId,
          routeId,
          stopName.trim(),
          pickupTime.trim(),
          dropTime.trim(),
          Number(monthlyFare) || 600,
          Number(orderIndex) || 1,
        ]
      );

      return apiSuccess({ message: `Stop '${stopName}' added to route`, stopId });
    }

    if (action === 'update_stop') {
      const {
        id,
        stopName,
        pickupTime = '07:30 AM',
        dropTime = '02:30 PM',
        monthlyFare = 600,
        orderIndex = 1,
      } = body;

      if (!id || !stopName) return apiError('Stop ID and Stop name are required', 400);

      await pool.execute(
        `UPDATE school_transport_stops
         SET stopName = ?, pickupTime = ?, dropTime = ?, monthlyFare = ?, orderIndex = ?
         WHERE schoolId = ? AND id = ?`,
        [
          stopName.trim(),
          pickupTime.trim(),
          dropTime.trim(),
          Number(monthlyFare) || 600,
          Number(orderIndex) || 1,
          schoolId,
          id,
        ]
      );

      return apiSuccess({ message: `Stop '${stopName}' updated successfully` });
    }

    if (action === 'delete_stop') {
      const { id } = body;
      if (!id) return apiError('Stop ID is required', 400);

      await pool.execute(
        `UPDATE school_students
         SET transportStopId = NULL
         WHERE schoolId = ? AND transportStopId = ?`,
        [schoolId, id]
      );
      await pool.execute('DELETE FROM school_transport_stops WHERE schoolId = ? AND id = ?', [schoolId, id]);

      return apiSuccess({ message: 'Stop deleted successfully' });
    }

    // ----------------------------------------------------
    // STUDENT TRANSPORT ALLOCATION
    // ----------------------------------------------------
    if (action === 'assign_student') {
      const { studentId, routeId, stopId, monthlyFare } = body;

      if (!studentId || !routeId) {
        return apiError('Student and Route are required for allocation', 400);
      }

      let finalFare = Number(monthlyFare);

      // If fare wasn't explicitly supplied, check the stop or route default fare
      if (isNaN(finalFare) || finalFare <= 0) {
        if (stopId) {
          const [stopRows] = await pool.execute<RowDataPacket[]>(
            'SELECT monthlyFare FROM school_transport_stops WHERE schoolId = ? AND id = ? LIMIT 1',
            [schoolId, stopId]
          );
          if (stopRows.length > 0) {
            finalFare = Number(stopRows[0].monthlyFare) || 600;
          }
        }
        if (!finalFare || finalFare <= 0) {
          const [routeRows] = await pool.execute<RowDataPacket[]>(
            'SELECT monthlyDefaultFare FROM school_transport_routes WHERE schoolId = ? AND id = ? LIMIT 1',
            [schoolId, routeId]
          );
          finalFare = routeRows.length > 0 ? Number(routeRows[0].monthlyDefaultFare) || 600 : 600;
        }
      }

      await pool.execute(
        `UPDATE school_students
         SET transportOpted = 1,
             transportRouteId = ?,
             transportStopId = ?,
             monthlyTransportFee = ?
         WHERE schoolId = ? AND id = ?`,
        [routeId, stopId || null, finalFare, schoolId, studentId]
      );

      return apiSuccess({
        message: 'Student assigned to school transport route successfully',
        monthlyTransportFee: finalFare,
      });
    }

    if (action === 'remove_student') {
      const { studentId } = body;
      if (!studentId) return apiError('Student ID is required', 400);

      await pool.execute(
        `UPDATE school_students
         SET transportOpted = 0,
             transportRouteId = NULL,
             transportStopId = NULL,
             monthlyTransportFee = 0
         WHERE schoolId = ? AND id = ?`,
        [schoolId, studentId]
      );

      return apiSuccess({ message: 'Student removed from school transport' });
    }

    // ----------------------------------------------------
    // LOG VEHICLE DIESEL / FUEL / REPAIR EXPENSE
    // ----------------------------------------------------
    if (action === 'log_fuel_expense') {
      const { vehicleId, amount, title, date, notes = '' } = body;

      if (!amount || Number(amount) <= 0) {
        return apiError('Valid expense amount is required', 400);
      }

      const parsedAmount = Number(amount);
      const expenseDate = date || new Date().toISOString().split('T')[0];
      const expenseTitle = title || 'Bus Diesel & Fuel Refill';

      // Update vehicle fuel tracking if vehicle specified
      if (vehicleId) {
        await pool.execute(
          `UPDATE school_vehicles
           SET monthlyFuelCost = monthlyFuelCost + ?
           WHERE schoolId = ? AND id = ?`,
          [parsedAmount, schoolId, vehicleId]
        );
      }

      // Record in accounting cashbook
      await pool.execute(
        `INSERT INTO school_accounting (id, schoolId, type, category, title, amount, paymentMode, referenceNo, date, notes)
         VALUES (?, ?, 'expense', 'Transport & Fuel Expense', ?, ?, 'cash', ?, ?, ?)`,
        [
          crypto.randomUUID(),
          schoolId,
          expenseTitle,
          parsedAmount,
          vehicleId ? `VEH-${vehicleId.slice(0, 8)}` : 'TRANSPORT-EXP',
          expenseDate,
          notes,
        ]
      );

      return apiSuccess({ message: `Expense of ₹${parsedAmount} logged successfully` });
    }

    return apiError('Unknown action', 400);
  } catch (error: any) {
    console.error('Transport POST error:', error);
    return apiError(error.message || 'Operation failed', 500);
  }
}
