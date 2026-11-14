import pool from '@/lib/db';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

declare global {
  // eslint-disable-next-line no-var
  var __schoolTablesInitialized: boolean | undefined;
}

async function addColumnIfNotExists(table: string, column: string, def: string) {
  try {
    await pool.execute(`ALTER TABLE ${table} ADD COLUMN ${column} ${def}`);
  } catch (err: any) {
    if (err?.errno !== 1060 && !String(err?.message).includes('Duplicate column name')) {
      // Column already exists or table not ready yet
    }
  }
}

export class SchoolService {
  /**
   * Ensures all School ERP database tables exist with proper indexes and default configurations.
   */
  static async ensureTables(): Promise<void> {
    if (global.__schoolTablesInitialized) return;

    // 1. Schools master table
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS schools (
        id VARCHAR(36) PRIMARY KEY,
        slug VARCHAR(255) NOT NULL UNIQUE,
        schoolCode VARCHAR(50) NOT NULL UNIQUE,
        name VARCHAR(255) NOT NULL,
        logoUrl VARCHAR(500) DEFAULT '',
        stampUrl VARCHAR(500) DEFAULT '',
        signatureUrl VARCHAR(500) DEFAULT '',
        affiliationBoard VARCHAR(100) DEFAULT 'CBSE',
        regNumber VARCHAR(100) DEFAULT '',
        address VARCHAR(500) DEFAULT '',
        city VARCHAR(100) DEFAULT '',
        state VARCHAR(100) DEFAULT '',
        pincode VARCHAR(20) DEFAULT '',
        phone VARCHAR(50) DEFAULT '',
        email VARCHAR(255) DEFAULT '',
        websiteUrl VARCHAR(255) DEFAULT '',
        principalName VARCHAR(255) DEFAULT '',
        estYear VARCHAR(10) DEFAULT '',
        currentSession VARCHAR(50) DEFAULT '2026-2027',
        schoolType VARCHAR(50) DEFAULT 'Co-Educational',
        medium VARCHAR(50) DEFAULT 'English',
        plan VARCHAR(50) DEFAULT 'free_trial',
        planExpiresAt DATETIME NULL,
        status VARCHAR(50) DEFAULT 'active',
        themePrimaryColor VARCHAR(30) DEFAULT '#4f46e5',
        themeAccentColor VARCHAR(30) DEFAULT '#06b6d4',
        marksheetDesign VARCHAR(50) DEFAULT 'classic',
        aboutSchool TEXT,
        principalMessage TEXT,
        facilitiesJson JSON,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_school_status (status),
        INDEX idx_school_slug (slug)
      )
    `);

    // 2. School Users (Admins, Principals, Teachers, Accountants, Students, Parents)
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS school_users (
        id VARCHAR(36) PRIMARY KEY,
        schoolId VARCHAR(36) NOT NULL,
        role VARCHAR(50) NOT NULL,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) DEFAULT '',
        phone VARCHAR(50) DEFAULT '',
        passwordHash VARCHAR(255) NOT NULL,
        refStudentId VARCHAR(36) DEFAULT NULL,
        refTeacherId VARCHAR(36) DEFAULT NULL,
        status VARCHAR(50) DEFAULT 'active',
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_school_user_lookup (schoolId, email, phone),
        INDEX idx_school_user_role (schoolId, role)
      )
    `);

    // 3. Academic Sessions
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS school_sessions (
        id VARCHAR(36) PRIMARY KEY,
        schoolId VARCHAR(36) NOT NULL,
        name VARCHAR(50) NOT NULL,
        startDate DATE NULL,
        endDate DATE NULL,
        isCurrent BOOLEAN DEFAULT FALSE,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_school_sess (schoolId)
      )
    `);

    // 4. Classes
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS school_classes (
        id VARCHAR(36) PRIMARY KEY,
        schoolId VARCHAR(36) NOT NULL,
        name VARCHAR(100) NOT NULL,
        numericOrder INT DEFAULT 1,
        capacity INT DEFAULT 40,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_school_classes (schoolId)
      )
    `);

    // 5. Sections
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS school_sections (
        id VARCHAR(36) PRIMARY KEY,
        schoolId VARCHAR(36) NOT NULL,
        classId VARCHAR(36) NOT NULL,
        name VARCHAR(50) NOT NULL,
        classTeacherId VARCHAR(36) DEFAULT NULL,
        roomNo VARCHAR(50) DEFAULT '',
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_school_sec (schoolId, classId)
      )
    `);

    // 6. Subjects
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS school_subjects (
        id VARCHAR(36) PRIMARY KEY,
        schoolId VARCHAR(36) NOT NULL,
        classId VARCHAR(36) NOT NULL,
        name VARCHAR(100) NOT NULL,
        code VARCHAR(50) DEFAULT '',
        type VARCHAR(50) DEFAULT 'theory',
        maxTheoryMarks INT DEFAULT 80,
        maxPracticalMarks INT DEFAULT 20,
        passMarks INT DEFAULT 33,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_school_subj (schoolId, classId)
      )
    `);

    // 7. Students
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS school_students (
        id VARCHAR(36) PRIMARY KEY,
        schoolId VARCHAR(36) NOT NULL,
        admissionNo VARCHAR(50) NOT NULL,
        rollNo VARCHAR(50) DEFAULT '',
        firstName VARCHAR(100) NOT NULL,
        lastName VARCHAR(100) DEFAULT '',
        dob DATE NULL,
        gender VARCHAR(20) DEFAULT 'Male',
        bloodGroup VARCHAR(10) DEFAULT '',
        photoUrl VARCHAR(500) DEFAULT '',
        category VARCHAR(50) DEFAULT 'General',
        religion VARCHAR(50) DEFAULT '',
        nationality VARCHAR(50) DEFAULT 'Indian',
        fatherName VARCHAR(255) DEFAULT '',
        motherName VARCHAR(255) DEFAULT '',
        fatherPhone VARCHAR(50) DEFAULT '',
        motherPhone VARCHAR(50) DEFAULT '',
        address VARCHAR(500) DEFAULT '',
        city VARCHAR(100) DEFAULT '',
        state VARCHAR(100) DEFAULT '',
        pincode VARCHAR(20) DEFAULT '',
        classId VARCHAR(36) NOT NULL,
        sectionId VARCHAR(36) NOT NULL,
        sessionId VARCHAR(36) DEFAULT NULL,
        admissionDate DATE NULL,
        previousSchool VARCHAR(255) DEFAULT '',
        status VARCHAR(50) DEFAULT 'active',
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_school_std (schoolId, classId, sectionId),
        UNIQUE KEY uq_sch_std_adm (schoolId, admissionNo)
      )
    `);

    // 8. Teachers & Staff
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS school_teachers (
        id VARCHAR(36) PRIMARY KEY,
        schoolId VARCHAR(36) NOT NULL,
        empId VARCHAR(50) NOT NULL,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) DEFAULT '',
        phone VARCHAR(50) DEFAULT '',
        photoUrl VARCHAR(500) DEFAULT '',
        qualification VARCHAR(255) DEFAULT '',
        experience VARCHAR(100) DEFAULT '',
        designation VARCHAR(100) DEFAULT 'TGT Teacher',
        specialization VARCHAR(255) DEFAULT '',
        salary DECIMAL(10,2) DEFAULT 0,
        joiningDate DATE NULL,
        status VARCHAR(50) DEFAULT 'active',
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_school_tch (schoolId),
        UNIQUE KEY uq_sch_emp (schoolId, empId)
      )
    `);

    // 9. Fee Categories
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS school_fee_categories (
        id VARCHAR(36) PRIMARY KEY,
        schoolId VARCHAR(36) NOT NULL,
        name VARCHAR(100) NOT NULL,
        frequency VARCHAR(50) DEFAULT 'monthly',
        isOptional BOOLEAN DEFAULT FALSE,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_sch_fee_cat (schoolId)
      )
    `);

    // 10. Fee Structures (Class-wise)
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS school_fee_structures (
        id VARCHAR(36) PRIMARY KEY,
        schoolId VARCHAR(36) NOT NULL,
        classId VARCHAR(36) NOT NULL,
        categoryId VARCHAR(36) NOT NULL,
        amount DECIMAL(10,2) NOT NULL DEFAULT 0,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_sch_fee_struct (schoolId, classId)
      )
    `);

    // 11. Fee Invoices
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS school_fee_invoices (
        id VARCHAR(36) PRIMARY KEY,
        schoolId VARCHAR(36) NOT NULL,
        invoiceNo VARCHAR(64) NOT NULL,
        studentId VARCHAR(36) NOT NULL,
        classId VARCHAR(36) NOT NULL,
        sessionId VARCHAR(36) DEFAULT NULL,
        title VARCHAR(255) DEFAULT 'Monthly Fee',
        monthYear VARCHAR(50) DEFAULT '',
        subtotal DECIMAL(10,2) NOT NULL DEFAULT 0,
        discount DECIMAL(10,2) NOT NULL DEFAULT 0,
        fine DECIMAL(10,2) NOT NULL DEFAULT 0,
        totalAmount DECIMAL(10,2) NOT NULL DEFAULT 0,
        paidAmount DECIMAL(10,2) NOT NULL DEFAULT 0,
        status VARCHAR(50) DEFAULT 'unpaid',
        dueDate DATE NULL,
        itemsJson JSON NULL,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_sch_inv (schoolId, studentId, status),
        UNIQUE KEY uq_sch_inv_no (schoolId, invoiceNo)
      )
    `);

    // 12. Fee Payments & Receipts
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS school_fee_payments (
        id VARCHAR(36) PRIMARY KEY,
        schoolId VARCHAR(36) NOT NULL,
        invoiceId VARCHAR(36) NOT NULL,
        receiptNo VARCHAR(64) NOT NULL,
        studentId VARCHAR(36) NOT NULL,
        amount DECIMAL(10,2) NOT NULL,
        paymentMethod VARCHAR(50) DEFAULT 'cash',
        transactionRef VARCHAR(255) DEFAULT '',
        notes VARCHAR(500) DEFAULT '',
        paymentDate DATE NOT NULL,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_sch_pay (schoolId, studentId),
        UNIQUE KEY uq_sch_rec_no (schoolId, receiptNo)
      )
    `);

    // 13. Attendance
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS school_attendance (
        id VARCHAR(36) PRIMARY KEY,
        schoolId VARCHAR(36) NOT NULL,
        classId VARCHAR(36) NOT NULL,
        sectionId VARCHAR(36) NOT NULL,
        studentId VARCHAR(36) NOT NULL,
        date DATE NOT NULL,
        status VARCHAR(20) DEFAULT 'present',
        remarks VARCHAR(255) DEFAULT '',
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_sch_att (schoolId, classId, sectionId, date),
        UNIQUE KEY uq_sch_att_rec (schoolId, studentId, date)
      )
    `);

    // 14. Examinations
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS school_exams (
        id VARCHAR(36) PRIMARY KEY,
        schoolId VARCHAR(36) NOT NULL,
        sessionId VARCHAR(36) DEFAULT NULL,
        name VARCHAR(255) NOT NULL,
        examType VARCHAR(50) DEFAULT 'annual',
        startDate DATE NULL,
        endDate DATE NULL,
        isPublished BOOLEAN DEFAULT TRUE,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_sch_exam (schoolId)
      )
    `);

    // 15. Exam Marks
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS school_exam_marks (
        id VARCHAR(36) PRIMARY KEY,
        schoolId VARCHAR(36) NOT NULL,
        examId VARCHAR(36) NOT NULL,
        classId VARCHAR(36) NOT NULL,
        sectionId VARCHAR(36) NOT NULL,
        studentId VARCHAR(36) NOT NULL,
        subjectId VARCHAR(36) NOT NULL,
        theoryMarks DECIMAL(5,2) DEFAULT 0,
        practicalMarks DECIMAL(5,2) DEFAULT 0,
        totalMarks DECIMAL(5,2) DEFAULT 0,
        maxMarks DECIMAL(5,2) DEFAULT 100,
        isAbsent BOOLEAN DEFAULT FALSE,
        grade VARCHAR(10) DEFAULT '',
        remarks VARCHAR(255) DEFAULT '',
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_sch_mrk (schoolId, examId, studentId),
        UNIQUE KEY uq_sch_mrk (schoolId, examId, studentId, subjectId)
      )
    `);

    // 16. Generated Marksheets
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS school_marksheets (
        id VARCHAR(36) PRIMARY KEY,
        schoolId VARCHAR(36) NOT NULL,
        examId VARCHAR(36) NOT NULL,
        studentId VARCHAR(36) NOT NULL,
        classId VARCHAR(36) NOT NULL,
        sectionId VARCHAR(36) NOT NULL,
        totalMaxMarks DECIMAL(7,2) DEFAULT 500,
        totalObtained DECIMAL(7,2) DEFAULT 0,
        percentage DECIMAL(5,2) DEFAULT 0,
        grade VARCHAR(10) DEFAULT '',
        resultStatus VARCHAR(20) DEFAULT 'PASS',
        rankInClass INT DEFAULT 0,
        attendancePercent DECIMAL(5,2) DEFAULT 0,
        teacherRemarks VARCHAR(500) DEFAULT 'Hardworking and well-disciplined student.',
        templateDesign VARCHAR(50) DEFAULT 'classic',
        verificationCode VARCHAR(100) NOT NULL UNIQUE,
        generatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_sch_ms (schoolId, examId, studentId)
      )
    `);

    // 17. Certificates
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS school_certificates (
        id VARCHAR(36) PRIMARY KEY,
        schoolId VARCHAR(36) NOT NULL,
        certType VARCHAR(50) NOT NULL,
        certificateNo VARCHAR(64) NOT NULL UNIQUE,
        studentId VARCHAR(36) NOT NULL,
        issueDate DATE NOT NULL,
        reason VARCHAR(255) DEFAULT '',
        conductGrade VARCHAR(50) DEFAULT 'Good',
        contentJson JSON NULL,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_sch_cert (schoolId, studentId)
      )
    `);

    // 18. Timetables
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS school_timetables (
        id VARCHAR(36) PRIMARY KEY,
        schoolId VARCHAR(36) NOT NULL,
        classId VARCHAR(36) NOT NULL,
        sectionId VARCHAR(36) NOT NULL,
        dayOfWeek VARCHAR(20) NOT NULL,
        periodNo INT NOT NULL,
        subjectId VARCHAR(36) NOT NULL,
        teacherId VARCHAR(36) DEFAULT NULL,
        startTime VARCHAR(20) DEFAULT '08:30 AM',
        endTime VARCHAR(20) DEFAULT '09:15 AM',
        roomNo VARCHAR(50) DEFAULT '',
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_sch_tt (schoolId, classId, sectionId)
      )
    `);

    // 19. Homework
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS school_homework (
        id VARCHAR(36) PRIMARY KEY,
        schoolId VARCHAR(36) NOT NULL,
        classId VARCHAR(36) NOT NULL,
        sectionId VARCHAR(36) NOT NULL,
        subjectId VARCHAR(36) NOT NULL,
        teacherId VARCHAR(36) DEFAULT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        dueDate DATE NOT NULL,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_sch_hw (schoolId, classId, sectionId)
      )
    `);

    // 20. Library Books
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS school_library_books (
        id VARCHAR(36) PRIMARY KEY,
        schoolId VARCHAR(36) NOT NULL,
        title VARCHAR(255) NOT NULL,
        author VARCHAR(255) DEFAULT '',
        isbn VARCHAR(100) DEFAULT '',
        category VARCHAR(100) DEFAULT 'General',
        totalCopies INT DEFAULT 1,
        availableCopies INT DEFAULT 1,
        rackNo VARCHAR(50) DEFAULT '',
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_sch_lib (schoolId)
      )
    `);

    // 21. Book Circulation / Issues
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS school_book_issues (
        id VARCHAR(36) PRIMARY KEY,
        schoolId VARCHAR(36) NOT NULL,
        bookId VARCHAR(36) NOT NULL,
        studentId VARCHAR(36) NOT NULL,
        issueDate DATE NOT NULL,
        dueDate DATE NOT NULL,
        returnDate DATE NULL,
        fineAmount DECIMAL(10,2) DEFAULT 0,
        status VARCHAR(50) DEFAULT 'issued',
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_sch_bk_iss (schoolId, studentId)
      )
    `);

    // 22. Vehicles & Transport
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS school_vehicles (
        id VARCHAR(36) PRIMARY KEY,
        schoolId VARCHAR(36) NOT NULL,
        vehicleNo VARCHAR(50) NOT NULL,
        vehicleType VARCHAR(50) DEFAULT 'Bus',
        driverName VARCHAR(255) DEFAULT '',
        driverPhone VARCHAR(50) DEFAULT '',
        conductorName VARCHAR(255) DEFAULT '',
        conductorPhone VARCHAR(50) DEFAULT '',
        capacity INT DEFAULT 35,
        routeName VARCHAR(255) DEFAULT '',
        insuranceExpiry DATE NULL,
        fitnessExpiry DATE NULL,
        monthlyFuelCost DECIMAL(10,2) DEFAULT 0,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_sch_veh (schoolId)
      )
    `);

    // 22b. Transport Routes
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS school_transport_routes (
        id VARCHAR(36) PRIMARY KEY,
        schoolId VARCHAR(36) NOT NULL,
        routeName VARCHAR(255) NOT NULL,
        vehicleId VARCHAR(36) DEFAULT NULL,
        startPoint VARCHAR(255) DEFAULT '',
        endPoint VARCHAR(255) DEFAULT '',
        driverName VARCHAR(255) DEFAULT '',
        driverPhone VARCHAR(50) DEFAULT '',
        monthlyDefaultFare DECIMAL(10,2) DEFAULT 600,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_sch_tr_route (schoolId)
      )
    `);

    // 22c. Transport Pickup & Drop Stops
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS school_transport_stops (
        id VARCHAR(36) PRIMARY KEY,
        schoolId VARCHAR(36) NOT NULL,
        routeId VARCHAR(36) NOT NULL,
        stopName VARCHAR(255) NOT NULL,
        pickupTime VARCHAR(20) DEFAULT '07:30 AM',
        dropTime VARCHAR(20) DEFAULT '02:30 PM',
        monthlyFare DECIMAL(10,2) NOT NULL DEFAULT 600,
        orderIndex INT DEFAULT 1,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_sch_tr_stops (schoolId, routeId)
      )
    `);

    // Safe column migrations for existing tables
    await addColumnIfNotExists('school_students', 'transportOpted', 'BOOLEAN DEFAULT FALSE');
    await addColumnIfNotExists('school_students', 'transportRouteId', 'VARCHAR(36) DEFAULT NULL');
    await addColumnIfNotExists('school_students', 'transportStopId', 'VARCHAR(36) DEFAULT NULL');
    await addColumnIfNotExists('school_students', 'monthlyTransportFee', 'DECIMAL(10,2) DEFAULT 0');

    await addColumnIfNotExists('school_vehicles', 'conductorName', "VARCHAR(255) DEFAULT ''");
    await addColumnIfNotExists('school_vehicles', 'conductorPhone', "VARCHAR(50) DEFAULT ''");
    await addColumnIfNotExists('school_vehicles', 'insuranceExpiry', 'DATE NULL');
    await addColumnIfNotExists('school_vehicles', 'fitnessExpiry', 'DATE NULL');
    await addColumnIfNotExists('school_vehicles', 'monthlyFuelCost', 'DECIMAL(10,2) DEFAULT 0');

    // 23. Accounting & Cashbook
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS school_accounting (
        id VARCHAR(36) PRIMARY KEY,
        schoolId VARCHAR(36) NOT NULL,
        type VARCHAR(20) NOT NULL,
        category VARCHAR(100) NOT NULL,
        title VARCHAR(255) NOT NULL,
        amount DECIMAL(10,2) NOT NULL,
        paymentMode VARCHAR(50) DEFAULT 'cash',
        referenceNo VARCHAR(100) DEFAULT '',
        date DATE NOT NULL,
        notes VARCHAR(500) DEFAULT '',
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_sch_acc (schoolId, date)
      )
    `);

    // 24. Online Admissions & Enquiries
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS school_admissions (
        id VARCHAR(36) PRIMARY KEY,
        schoolId VARCHAR(36) NOT NULL,
        applicationNo VARCHAR(64) NOT NULL UNIQUE,
        studentName VARCHAR(255) NOT NULL,
        gender VARCHAR(20) DEFAULT 'Male',
        dob DATE NULL,
        applyingClass VARCHAR(100) NOT NULL,
        parentName VARCHAR(255) NOT NULL,
        parentPhone VARCHAR(50) NOT NULL,
        parentEmail VARCHAR(255) DEFAULT '',
        address VARCHAR(500) DEFAULT '',
        status VARCHAR(50) DEFAULT 'pending',
        notes VARCHAR(500) DEFAULT '',
        appliedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_sch_adm (schoolId, status)
      )
    `);

    // 25. Platform SaaS Plans
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS school_plans (
        id VARCHAR(36) PRIMARY KEY,
        code VARCHAR(50) NOT NULL UNIQUE,
        name VARCHAR(100) NOT NULL,
        maxStudents INT NOT NULL,
        maxTeachers INT NOT NULL,
        priceMonthly DECIMAL(10,2) NOT NULL,
        priceYearly DECIMAL(10,2) NOT NULL,
        featuresJson JSON NOT NULL,
        isPopular BOOLEAN DEFAULT FALSE,
        isActive BOOLEAN DEFAULT TRUE
      )
    `);

    // Seed default SaaS plans if none exist
    const [existingPlans] = await pool.execute<RowDataPacket[]>(
      'SELECT id FROM school_plans LIMIT 1'
    );
    if (existingPlans.length === 0) {
      await pool.execute(
        `INSERT INTO school_plans (id, code, name, maxStudents, maxTeachers, priceMonthly, priceYearly, featuresJson, isPopular, isActive)
         VALUES 
         (?, 'free_trial', '14-Day Free Trial', 100, 10, 0, 0, ?, 0, 1),
         (?, 'standard', 'Standard School Plan', 500, 30, 2499, 24999, ?, 0, 1),
         (?, 'pro', 'Pro Digital Campus', 1500, 75, 4999, 49999, ?, 1, 1),
         (?, 'enterprise', 'Enterprise Group of Schools', 5000, 250, 9999, 99999, ?, 0, 1)`,
        [
          crypto.randomUUID(),
          JSON.stringify(['100 Students', '10 Teachers', 'Fee Collection', '3 Marksheet Designs', 'Attendance & Reports']),
          crypto.randomUUID(),
          JSON.stringify(['500 Students', '30 Teachers', 'Complete Fees & Billing', 'Exam & Marksheet PDF', 'Parent Portal', 'SMS/WhatsApp Integration']),
          crypto.randomUUID(),
          JSON.stringify(['1500 Students', '75 Teachers', 'All Modules Unlocked', 'QR Verification', 'Library & Transport', 'Custom Domain & Website', 'Priority Support']),
          crypto.randomUUID(),
          JSON.stringify(['Unlimited Campuses', '5000+ Students', 'Dedicated Server Resource', 'Custom Marksheet Branding', 'White-labeled Mobile App Access', '24x7 Account Manager']),
        ]
      );
    }

    global.__schoolTablesInitialized = true;
  }

  /**
   * Helper: Calculates grade, percentage, and pass/fail from total marks.
   */
  static calculateGradeAndResult(totalObtained: number, totalMaxMarks: number) {
    if (totalMaxMarks <= 0) return { percentage: 0, grade: 'E', result: 'FAIL' };
    const percentage = Number(((totalObtained / totalMaxMarks) * 100).toFixed(2));

    let grade = 'E';
    if (percentage >= 91) grade = 'A1';
    else if (percentage >= 81) grade = 'A2';
    else if (percentage >= 71) grade = 'B1';
    else if (percentage >= 61) grade = 'B2';
    else if (percentage >= 51) grade = 'C1';
    else if (percentage >= 41) grade = 'C2';
    else if (percentage >= 33) grade = 'D';
    else grade = 'E';

    const result = percentage >= 33 ? 'PASS' : 'FAIL';
    return { percentage, grade, result };
  }

  /**
   * Initializes starter classes, subjects, fee categories, and session for a freshly registered school.
   */
  static async seedDefaultSchoolData(schoolId: string, currentSession: string = '2026-2027') {
    // 1. Session
    const sessionId = crypto.randomUUID();
    await pool.execute(
      `INSERT INTO school_sessions (id, schoolId, name, startDate, endDate, isCurrent)
       VALUES (?, ?, ?, '2026-04-01', '2027-03-31', 1)`,
      [sessionId, schoolId, currentSession]
    );

    // 2. Default Classes (Nursery, LKG, UKG, Class 1 to Class 10)
    const defaultClasses = [
      { name: 'Nursery', order: 1 },
      { name: 'LKG', order: 2 },
      { name: 'UKG', order: 3 },
      { name: 'Class 1', order: 4 },
      { name: 'Class 2', order: 5 },
      { name: 'Class 3', order: 6 },
      { name: 'Class 4', order: 7 },
      { name: 'Class 5', order: 8 },
      { name: 'Class 6', order: 9 },
      { name: 'Class 7', order: 10 },
      { name: 'Class 8', order: 11 },
      { name: 'Class 9', order: 12 },
      { name: 'Class 10', order: 13 },
    ];

    const classIdMap: Record<string, string> = {};

    for (const cls of defaultClasses) {
      const classId = crypto.randomUUID();
      classIdMap[cls.name] = classId;
      await pool.execute(
        `INSERT INTO school_classes (id, schoolId, name, numericOrder, capacity)
         VALUES (?, ?, ?, ?, 40)`,
        [classId, schoolId, cls.name, cls.order]
      );

      // Add default section 'A'
      await pool.execute(
        `INSERT INTO school_sections (id, schoolId, classId, name, roomNo)
         VALUES (?, ?, ?, 'A', ?)`,
        [crypto.randomUUID(), schoolId, classId, `Room-${cls.order}`]
      );
    }

    // 3. Add default subjects to Class 1 to 10
    const primarySubjects = [
      { name: 'English', code: 'ENG-101', theory: 80, practical: 20 },
      { name: 'Hindi', code: 'HIN-102', theory: 80, practical: 20 },
      { name: 'Mathematics', code: 'MAT-103', theory: 80, practical: 20 },
      { name: 'Science', code: 'SCI-104', theory: 70, practical: 30 },
      { name: 'Social Studies', code: 'SST-105', theory: 80, practical: 20 },
      { name: 'Computer Science', code: 'CS-106', theory: 50, practical: 50 },
    ];

    for (const [clsName, cId] of Object.entries(classIdMap)) {
      if (clsName.startsWith('Class')) {
        for (const sub of primarySubjects) {
          await pool.execute(
            `INSERT INTO school_subjects (id, schoolId, classId, name, code, type, maxTheoryMarks, maxPracticalMarks, passMarks)
             VALUES (?, ?, ?, ?, ?, 'both', ?, ?, 33)`,
            [crypto.randomUUID(), schoolId, cId, sub.name, sub.code, sub.theory, sub.practical]
          );
        }
      }
    }

    // 4. Default Fee Categories
    const feeCategories = [
      { name: 'Monthly Tuition Fee', frequency: 'monthly', isOptional: false },
      { name: 'Admission & Registration Fee', frequency: 'one_time', isOptional: false },
      { name: 'Annual Development Fee', frequency: 'yearly', isOptional: false },
      { name: 'Examination & Marksheet Fee', frequency: 'half_yearly', isOptional: false },
      { name: 'Computer & Smart Class Lab', frequency: 'monthly', isOptional: false },
      { name: 'School Bus & Transport Fee', frequency: 'monthly', isOptional: true },
    ];

    for (const cat of feeCategories) {
      const catId = crypto.randomUUID();
      await pool.execute(
        `INSERT INTO school_fee_categories (id, schoolId, name, frequency, isOptional)
         VALUES (?, ?, ?, ?, ?)`,
        [catId, schoolId, cat.name, cat.frequency, cat.isOptional ? 1 : 0]
      );

      // Default fee structure for Class 1 (Tuition fee: 2000, Computer fee: 300)
      if (cat.name === 'Monthly Tuition Fee' && classIdMap['Class 1']) {
        await pool.execute(
          `INSERT INTO school_fee_structures (id, schoolId, classId, categoryId, amount)
           VALUES (?, ?, ?, ?, 2000)`,
          [crypto.randomUUID(), schoolId, classIdMap['Class 1'], catId]
        );
      }
    }

    // 5. Default Annual Examination
    const examId = crypto.randomUUID();
    await pool.execute(
      `INSERT INTO school_exams (id, schoolId, sessionId, name, examType, startDate, endDate, isPublished)
       VALUES (?, ?, ?, 'Annual Term Examination', 'annual', '2027-02-15', '2027-03-10', 1)`,
      [examId, schoolId, sessionId]
    );

    return { sessionId, examId };
  }
}

