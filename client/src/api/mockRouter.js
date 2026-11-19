import {
  mockPrograms,
  mockUsers,
  mockStudentProfile,
  mockApplications,
  mockAnalytics,
} from './mockService';

// Default initial notifications
const defaultNotifications = [
  {
    _id: 'notif-default-1',
    title: 'Admissions Open',
    message: 'Fall 2026 academic admissions are officially open across all degree programs.',
    link: '/admin/programs',
    isRead: false,
    createdAt: new Date().toISOString(),
  },
];

// Persistent localStorage state for demo mode
const getStoredState = (key, fallback) => {
  try {
    const val = localStorage.getItem(`iem_${key}`);
    return val ? JSON.parse(val) : fallback;
  } catch (e) {
    return fallback;
  }
};

const setStoredState = (key, data) => {
  try {
    localStorage.setItem(`iem_${key}`, JSON.stringify(data));
  } catch (e) {}
};

// Helper to get all combined users (seeded + newly registered)
const getAllUsers = () => {
  const customUsers = getStoredState('registered_users', []);
  const baseUsers = [
    { ...mockUsers.admin, createdAt: '2026-10-01T00:00:00.000Z' },
    { ...mockUsers.faculty, createdAt: '2026-10-05T00:00:00.000Z' },
    { ...mockUsers.student, createdAt: '2026-10-10T00:00:00.000Z' },
  ];

  // Merge, avoiding duplicates by email
  const userMap = new Map();
  baseUsers.forEach((u) => userMap.set(u.email.toLowerCase(), u));
  customUsers.forEach((u) => userMap.set(u.email.toLowerCase(), u));

  return Array.from(userMap.values());
};

// Normalize application object to guarantee both personalInfo & personalDetails,
// academicInfo & academicDetails, documents array, timeline, and valid evaluation scores
const normalizeApplication = (app) => {
  if (!app) return null;
  const student = app.student || mockUsers.student;
  const studentName = app.studentName || student.name || 'Applicant';
  const program = app.program || mockPrograms[0];
  const programName = app.programName || program.name || 'Academic Degree Program';

  // Personal Info Normalization
  const personal = app.personalInfo || app.personalDetails || {};
  const normalizedPersonalInfo = {
    fullName: personal.fullName || studentName,
    email: personal.email || student.email || 'applicant@iem.edu.in',
    phone: personal.phone || student.phone || '+91 98200 98200',
    dateOfBirth: personal.dateOfBirth || '2004-06-15',
    gender: personal.gender || 'Male',
    nationality: personal.nationality || 'Indian',
    address: {
      street: personal.address?.street || personal.street || 'Sector V, Salt Lake City',
      city: personal.address?.city || personal.city || 'Kolkata',
      state: personal.address?.state || personal.state || 'West Bengal',
      country: personal.address?.country || personal.country || 'India',
      zipCode: personal.address?.zipCode || personal.zipCode || '700091',
    },
    emergencyContact: {
      name:
        personal.emergencyContact?.name ||
        personal.emergencyName ||
        'Rajesh Sharma',
      relation:
        personal.emergencyContact?.relation ||
        personal.emergencyContact?.relationship ||
        personal.emergencyRelation ||
        'Father',
      phone:
        personal.emergencyContact?.phone ||
        personal.emergencyPhone ||
        '+91 98200 98201',
    },
  };

  // Academic Info Normalization
  const academic = app.academicInfo || app.academicDetails || {};
  const normalizedAcademicInfo = {
    highestQualification:
      academic.highestQualification ||
      academic.highestDegree ||
      'Senior Secondary (12th Grade)',
    institution:
      academic.institution || 'St. Xavier Collegiate School, Kolkata',
    boardOrUniversity:
      academic.boardOrUniversity || 'CBSE Board of Secondary Education',
    graduationYear: Number(
      academic.graduationYear || academic.passingYear || 2024
    ),
    cgpaOrPercentage:
      academic.cgpaOrPercentage || academic.percentageOrGpa || '92.4%',
    majorSubject: academic.majorSubject || 'Science (PCM)',
    standardizedTest: {
      name:
        academic.standardizedTest?.name ||
        academic.testName ||
        'WBJEE / JEE Main',
      score:
        academic.standardizedTest?.score ||
        academic.testScore ||
        'Rank 1420 (98.4 Percentile)',
    },
    statementOfPurpose:
      academic.statementOfPurpose ||
      'I am committed to advancing computer systems research, neural algorithms, and building software that solves high-impact problems at IEM Kolkata.',
  };

  // Documents Normalization
  let docs = Array.isArray(app.documents) ? app.documents : [];
  if (docs.length === 0 && app.status !== 'Draft') {
    docs = [
      {
        _id: 'doc-' + (app._id || 'demo') + '-1',
        title: 'Senior Secondary (10+2) Marksheet.pdf',
        originalName: 'Senior_Secondary_Marksheet.pdf',
        documentType: 'high_school_marksheet',
        fileUrl:
          'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        mimeType: 'application/pdf',
        fileSize: 1024 * 512,
        status:
          app.status === 'Approved' || app.status === 'Verified'
            ? 'verified'
            : 'pending',
        verificationNotes:
          app.status === 'Approved' || app.status === 'Verified'
            ? 'Verified against council portal. Aggregate score confirmed.'
            : '',
        uploadedAt: app.submittedAt || new Date().toISOString(),
      },
      {
        _id: 'doc-' + (app._id || 'demo') + '-2',
        title: 'Government Identity Proof (Aadhaar / Passport).pdf',
        originalName: 'Govt_ID_Proof.pdf',
        documentType: 'id_proof',
        fileUrl:
          'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        mimeType: 'application/pdf',
        fileSize: 1024 * 320,
        status:
          app.status === 'Approved' || app.status === 'Verified'
            ? 'verified'
            : 'pending',
        verificationNotes:
          app.status === 'Approved' || app.status === 'Verified'
            ? 'Official identity card verified.'
            : '',
        uploadedAt: app.submittedAt || new Date().toISOString(),
      },
    ];
  }

  // Evaluation Normalization
  let evaluation = app.evaluation || null;
  if (evaluation) {
    const acScore = Number(evaluation.academicScore || 88);
    const intScore = Number(evaluation.interviewScore || 85);
    const stScore = Number(evaluation.statementScore || 88);
    const compScore = Math.round((acScore + intScore + stScore) / 3);
    evaluation = {
      ...evaluation,
      academicScore: acScore,
      interviewScore: intScore,
      statementScore: stScore,
      totalScore: evaluation.totalScore || compScore,
      compositeScore: evaluation.compositeScore || compScore,
      recommendation: evaluation.recommendation || 'recommend',
      comments:
        evaluation.comments ||
        'Candidate evaluated and recommended by the faculty admissions board.',
      evaluatedAt: evaluation.evaluatedAt || new Date().toISOString(),
    };
  }

  // Timeline Normalization
  const timeline =
    Array.isArray(app.timeline) && app.timeline.length > 0
      ? app.timeline
      : [
          {
            step: 'Draft Started',
            date: app.createdAt || new Date().toISOString(),
            note: 'Application initiated by applicant',
          },
          ...(app.isSubmitted
            ? [
                {
                  step: 'Submitted',
                  date: app.submittedAt || new Date().toISOString(),
                  note: 'Application fee clearance verified & package submitted',
                },
              ]
            : []),
          ...(app.status === 'Under Review'
            ? [
                {
                  step: 'Under Review',
                  date: new Date().toISOString(),
                  note: 'Assigned to Faculty Review Committee',
                },
              ]
            : []),
          ...(app.status === 'Verified'
            ? [
                {
                  step: 'Verified',
                  date: new Date().toISOString(),
                  note: 'Transcripts, identity, and qualifying exams verified',
                },
              ]
            : []),
          ...(app.status === 'Approved'
            ? [
                {
                  step: 'Approved',
                  date: app.decisionDate || new Date().toISOString(),
                  note: 'Admissions Committee issued Official Letter of Admission',
                },
              ]
            : []),
        ];

  return {
    ...app,
    student,
    studentName,
    program,
    programName,
    personalInfo: normalizedPersonalInfo,
    personalDetails: normalizedPersonalInfo,
    academicInfo: normalizedAcademicInfo,
    academicDetails: normalizedAcademicInfo,
    documents: docs,
    evaluation,
    timeline,
    paymentStatus: app.paymentStatus || (app.isSubmitted ? 'paid' : 'unpaid'),
    intakeTerm: app.intakeTerm || 'Fall 2026',
    status: app.status || 'Draft',
  };
};

// Helper to get normalized stored applications
const getStoredApplications = () => {
  const stored = getStoredState('applications', null);
  if (!stored || !Array.isArray(stored) || stored.length === 0) {
    const seeded = mockApplications.map(normalizeApplication);
    setStoredState('applications', seeded);
    return seeded;
  }
  return stored.map(normalizeApplication);
};

// Helper to get payment records
const getStoredPayments = () => {
  return getStoredState('payments', {
    'app-demo-101': {
      _id: 'pay-demo-101',
      transactionId: 'TXN-IEM-99482103',
      receiptNumber: 'RCP-2026-004812',
      applicationId: 'app-demo-101',
      amount: 1200,
      currency: 'INR',
      status: 'success',
      paymentMethod: 'IEM Gateway Simulator (Card ending 4242)',
      billingDetails: {
        name: 'Aarav Sharma',
        email: 'student@iem.edu.in',
        last4: '4242',
        bankName: 'HDFC Bank Gateway',
      },
      paymentDate: '2026-10-25T14:30:00.000Z',
      paidAt: '2026-10-25T14:30:00.000Z',
      createdAt: '2026-10-25T14:30:00.000Z',
    },
    'app-demo-102': {
      _id: 'pay-demo-102',
      transactionId: 'TXN-IEM-99482218',
      receiptNumber: 'RCP-2026-004813',
      applicationId: 'app-demo-102',
      amount: 1500,
      currency: 'INR',
      status: 'success',
      paymentMethod: 'IEM Gateway Simulator (Card ending 4242)',
      billingDetails: {
        name: 'Priya Sen',
        email: 'priya.sen@example.com',
        last4: '4242',
        bankName: 'State Bank of India',
      },
      paymentDate: '2026-11-03T11:20:00.000Z',
      paidAt: '2026-11-03T11:20:00.000Z',
      createdAt: '2026-11-03T11:20:00.000Z',
    },
    'app-demo-103': {
      _id: 'pay-demo-103',
      transactionId: 'TXN-IEM-99482341',
      receiptNumber: 'RCP-2026-004814',
      applicationId: 'app-demo-103',
      amount: 2000,
      currency: 'INR',
      status: 'success',
      paymentMethod: 'IEM Gateway Simulator (Card ending 4242)',
      billingDetails: {
        name: 'Rohan Banerjee',
        email: 'rohan.b@example.com',
        last4: '4242',
        bankName: 'ICICI Bank Gateway',
      },
      paymentDate: '2026-11-04T14:10:00.000Z',
      paidAt: '2026-11-04T14:10:00.000Z',
      createdAt: '2026-11-04T14:10:00.000Z',
    },
    'app-demo-104': {
      _id: 'pay-demo-104',
      transactionId: 'TXN-IEM-99482490',
      receiptNumber: 'RCP-2026-004815',
      applicationId: 'app-demo-104',
      amount: 1200,
      currency: 'INR',
      status: 'success',
      paymentMethod: 'IEM Gateway Simulator (Card ending 4242)',
      billingDetails: {
        name: 'Ananya Mukherjee',
        email: 'ananya.m@example.com',
        last4: '4242',
        bankName: 'Axis Bank Gateway',
      },
      paymentDate: '2026-11-05T09:40:00.000Z',
      paidAt: '2026-11-05T09:40:00.000Z',
      createdAt: '2026-11-05T09:40:00.000Z',
    },
  });
};

export const handleMockRequest = async (config) => {
  // Normalize URL by removing domain, /api prefix, and query parameters
  const rawUrl = (config.url || '').replace(/^https?:\/\/[^\/]+/, '').replace(/^\/api/, '');
  const [path, queryString] = rawUrl.split('?');
  const method = (config.method || 'get').toLowerCase();
  let body = {};

  // Parse query params if any
  const queryParams = new URLSearchParams(queryString || '');
  const params = config.params || {};
  const getParam = (key) => queryParams.get(key) || params[key] || '';

  try {
    if (typeof config.data === 'string') {
      body = JSON.parse(config.data);
    } else if (config.data) {
      body = config.data;
    }
  } catch (e) {
    body = {};
  }

  // Small delay for natural UX
  await new Promise((r) => setTimeout(r, 60));

  // ========================================================
  // 1. AUTH ROUTES
  // ========================================================
  if (path === '/auth/login' && method === 'post') {
    const email = (body.email || '').toLowerCase().trim();
    const password = (body.password || '').trim();

    // Check all users (admin, faculty, student, custom registered)
    const allUsers = getAllUsers();

    // Admin check
    if (
      (email === 'rajh36073@gmail.com' || email === 'rahj36073@gmail.com') &&
      password.toLowerCase() === 'harshit@500'
    ) {
      const user = mockUsers.admin;
      setStoredState('current_user', user);
      return {
        success: true,
        message: 'Logged in successfully',
        token: 'mock-jwt-token-admin',
        user,
      };
    }

    // Faculty check
    if (
      (email === 'faculty@iem.edu.in' || email === 'faculty@nexis.edu') &&
      password.toLowerCase() === 'faculty@500'
    ) {
      const user = mockUsers.faculty;
      setStoredState('current_user', user);
      return {
        success: true,
        message: 'Logged in successfully',
        token: 'mock-jwt-token-faculty',
        user,
      };
    }

    // Default student check
    if (
      (email === 'student@iem.edu.in' || email === 'student@nexis.edu') &&
      password.toLowerCase() === 'student@500'
    ) {
      const user = mockUsers.student;
      setStoredState('current_user', user);
      return {
        success: true,
        message: 'Logged in successfully',
        token: 'mock-jwt-token-student',
        user,
      };
    }

    // Custom registered user check
    const found = allUsers.find(
      (u) =>
        u.email.toLowerCase() === email &&
        (u.password === password || !u.password || u.password.toLowerCase() === password.toLowerCase())
    );
    if (found) {
      setStoredState('current_user', found);
      return {
        success: true,
        message: 'Logged in successfully',
        token: 'mock-jwt-token-' + found._id,
        user: found,
      };
    }

    throw new Error('Invalid email or password. Please verify your credentials or select a 1-click demo role.');
  }

  if (path === '/auth/register' && method === 'post') {
    const newUser = {
      _id: 'user-' + Date.now(),
      name: body.name || 'New Student',
      email: (body.email || '').toLowerCase().trim(),
      password: body.password || '',
      role: body.role || 'student',
      department: body.department || 'Undergraduate Admissions',
      phone: body.phone || '',
      status: 'active',
      createdAt: new Date().toISOString(),
    };

    // Save user to registered_users list
    const registered = getStoredState('registered_users', []);
    const existingIndex = registered.findIndex((u) => u.email.toLowerCase() === newUser.email);
    if (existingIndex >= 0) {
      registered[existingIndex] = newUser;
    } else {
      registered.unshift(newUser);
    }
    setStoredState('registered_users', registered);
    setStoredState('current_user', newUser);

    // Create notification for admin
    const notifications = getStoredState('notifications', defaultNotifications);
    notifications.unshift({
      _id: 'notif-' + Date.now(),
      title: '🎓 New Student Registration',
      message: `${newUser.name} (${newUser.email}) just created an applicant portal account.`,
      link: '/admin/users',
      isRead: false,
      createdAt: new Date().toISOString(),
    });
    setStoredState('notifications', notifications);

    return {
      success: true,
      message: 'Account registered successfully',
      token: 'mock-jwt-token-' + newUser._id,
      user: newUser,
    };
  }

  if (path === '/auth/me' && method === 'get') {
    const currentUser = getStoredState('current_user', mockUsers.admin);
    return {
      success: true,
      user: currentUser,
      studentProfile: mockStudentProfile,
    };
  }

  if (path === '/auth/logout') {
    localStorage.removeItem('iem_current_user');
    return { success: true, message: 'Logged out successfully' };
  }

  if (path === '/auth/student-profile' && method === 'put') {
    return {
      success: true,
      message: 'Profile updated successfully',
      profile: { ...mockStudentProfile, ...body, profileCompletion: 100 },
    };
  }

  if (path === '/auth/profile' && method === 'put') {
    const currentUser = getStoredState('current_user', mockUsers.admin);
    const updated = { ...currentUser, ...body };
    setStoredState('current_user', updated);
    return { success: true, message: 'Profile updated successfully', user: updated };
  }

  // ========================================================
  // 2. ADMIN USER MANAGEMENT & DIRECTORY
  // ========================================================
  if (path === '/admin/users' && method === 'get') {
    let users = getAllUsers();
    const roleFilter = getParam('role');
    const searchFilter = getParam('search').toLowerCase();

    if (roleFilter && roleFilter !== 'All') {
      users = users.filter((u) => u.role?.toLowerCase() === roleFilter.toLowerCase());
    }

    if (searchFilter) {
      users = users.filter(
        (u) =>
          u.name?.toLowerCase().includes(searchFilter) ||
          u.email?.toLowerCase().includes(searchFilter) ||
          u.department?.toLowerCase().includes(searchFilter)
      );
    }

    return {
      success: true,
      count: users.length,
      users,
    };
  }

  if (path === '/admin/users' && method === 'post') {
    const created = {
      _id: 'user-' + Date.now(),
      name: body.name || 'New Staff',
      email: (body.email || '').toLowerCase().trim(),
      password: body.password || 'password123',
      role: body.role || 'faculty',
      department: body.department || 'Computer Science',
      phone: body.phone || '',
      status: 'active',
      createdAt: new Date().toISOString(),
    };
    const registered = getStoredState('registered_users', []);
    registered.unshift(created);
    setStoredState('registered_users', registered);

    return {
      success: true,
      message: `Account for ${created.name} created successfully.`,
      user: created,
    };
  }

  if (path.startsWith('/admin/users/') && method === 'put') {
    const id = path.split('/admin/users/')[1];
    const registered = getStoredState('registered_users', []);
    const idx = registered.findIndex((u) => u._id === id);
    if (idx >= 0) {
      registered[idx] = { ...registered[idx], ...body };
      setStoredState('registered_users', registered);
    }
    return { success: true, message: 'User updated successfully' };
  }

  if (path.startsWith('/admin/users/') && method === 'delete') {
    const id = path.split('/admin/users/')[1];
    let registered = getStoredState('registered_users', []);
    registered = registered.filter((u) => u._id !== id);
    setStoredState('registered_users', registered);
    return { success: true, message: 'User deleted successfully' };
  }

  // ========================================================
  // 3. NOTIFICATIONS
  // ========================================================
  if (path === '/notifications' && method === 'get') {
    const notifications = getStoredState('notifications', defaultNotifications);
    const unreadCount = notifications.filter((n) => !n.isRead).length;
    return {
      success: true,
      unreadCount,
      notifications,
    };
  }

  if (path === '/notifications/read-all' && method === 'put') {
    const notifications = getStoredState('notifications', defaultNotifications);
    const updated = notifications.map((n) => ({ ...n, isRead: true }));
    setStoredState('notifications', updated);
    return { success: true, message: 'All notifications marked as read' };
  }

  if (path.startsWith('/notifications/') && path.endsWith('/read') && method === 'put') {
    const id = path.split('/notifications/')[1].split('/read')[0];
    const notifications = getStoredState('notifications', defaultNotifications);
    const updated = notifications.map((n) => (n._id === id ? { ...n, isRead: true } : n));
    setStoredState('notifications', updated);
    return { success: true, message: 'Notification marked as read' };
  }

  // ========================================================
  // 4. PROGRAMS ROUTES
  // ========================================================
  if (path === '/programs' && method === 'get') {
    return {
      success: true,
      count: mockPrograms.length,
      programs: mockPrograms,
      departments: ['Computer Science', 'Business & Management', 'Electrical Engineering', 'Biotechnology'],
      degrees: ['B.Tech', 'M.Sc', 'MBA', 'M.Tech', 'B.Sc'],
    };
  }

  if (path.startsWith('/programs/') && method === 'get') {
    const id = path.split('/programs/')[1];
    const program = mockPrograms.find((p) => p._id === id || p.code === id) || mockPrograms[0];
    return { success: true, program };
  }

  // ========================================================
  // 5. ANALYTICS & REPORTS
  // ========================================================
  if (path === '/reports/analytics') {
    const allUsers = getAllUsers();
    const studentCount = allUsers.filter((u) => u.role === 'student').length;
    const facultyCount = allUsers.filter((u) => u.role === 'faculty').length;
    const apps = getStoredApplications();

    return {
      ...mockAnalytics,
      metrics: {
        ...mockAnalytics.metrics,
        totalApplications: apps.length + 147,
        totalStudents: 136 + studentCount - 1,
        facultyCount: 14 + facultyCount - 1,
      },
      recentApplications: apps.slice(0, 5),
    };
  }

  if (path === '/reports/export-csv') {
    const apps = getStoredApplications();
    const csvContent = [
      'Application Number,Student Name,Email,Program,Degree,Department,Term,Status,Payment Status,Submitted Date',
      ...apps.map(
        (a) =>
          `"${a.applicationNumber}","${a.studentName}","${a.student?.email}","${a.programName}","${a.program?.degree}","${a.program?.department}","${a.intakeTerm}","${a.status}","${a.paymentStatus}","${a.submittedAt || a.createdAt}"`
      ),
    ].join('\n');

    return {
      success: true,
      data: csvContent,
      headers: { 'Content-Type': 'text/csv' },
    };
  }

  // ========================================================
  // 6. APPLICATIONS ROUTES
  // ========================================================
  if (path === '/applications/my-applications') {
    const apps = getStoredApplications();
    const currentUser = getStoredState('current_user', mockUsers.student);

    // If student is logged in, show their applications. If Aarav Sharma, show full demo set
    let studentApps = apps;
    if (currentUser.role === 'student' && currentUser.email !== 'student@iem.edu.in') {
      studentApps = apps.filter(
        (a) =>
          a.student?._id === currentUser._id ||
          a.student?.email?.toLowerCase() === currentUser.email?.toLowerCase()
      );
      // If newly registered student has no apps yet, return empty array cleanly
    }

    return { success: true, count: studentApps.length, applications: studentApps };
  }

  if (path === '/applications' && method === 'get') {
    let apps = getStoredApplications();
    const statusFilter = getParam('status');
    const programFilter = getParam('program');
    const searchFilter = getParam('search').toLowerCase();

    if (statusFilter && statusFilter !== 'All') {
      apps = apps.filter((a) => a.status?.toLowerCase() === statusFilter.toLowerCase());
    }

    if (programFilter && programFilter !== 'All') {
      apps = apps.filter(
        (a) => a.program?._id === programFilter || a.program?.code === programFilter
      );
    }

    if (searchFilter) {
      apps = apps.filter(
        (a) =>
          a.studentName?.toLowerCase().includes(searchFilter) ||
          a.student?.email?.toLowerCase().includes(searchFilter) ||
          a.applicationNumber?.toLowerCase().includes(searchFilter) ||
          a.programName?.toLowerCase().includes(searchFilter)
      );
    }

    return { success: true, count: apps.length, applications: apps };
  }

  if (path.startsWith('/applications/') && method === 'get') {
    const id = path.split('/applications/')[1];
    const apps = getStoredApplications();
    const found =
      apps.find((a) => a._id === id || a.applicationNumber === id) || apps[0];
    return { success: true, application: normalizeApplication(found) };
  }

  if (path === '/applications' && method === 'post') {
    const apps = getStoredApplications();
    const prog = mockPrograms.find((p) => p._id === body.programId) || mockPrograms[0];
    const currentUser = getStoredState('current_user', mockUsers.student);

    const newAppRaw = {
      _id: 'app-' + Date.now(),
      applicationNumber: 'APP-2026-' + Math.floor(100000 + Math.random() * 900000),
      student: currentUser,
      studentName: currentUser.name || 'Applicant',
      program: prog,
      programName: prog.name,
      intakeTerm: body.intakeTerm || 'Fall 2026',
      status: 'Draft',
      currentStep: 1,
      isSubmitted: false,
      paymentStatus: 'unpaid',
      timeline: [
        {
          step: 'Draft Started',
          date: new Date().toISOString(),
          note: `Application draft initiated for ${prog.name}.`,
        },
      ],
      personalInfo: {
        fullName: currentUser.name || '',
        email: currentUser.email || '',
        phone: currentUser.phone || '',
        dateOfBirth: '2004-06-15',
        gender: 'Male',
        nationality: 'Indian',
        address: {
          street: 'Sector V, Salt Lake City',
          city: 'Kolkata',
          state: 'West Bengal',
          country: 'India',
          zipCode: '700091',
        },
        emergencyContact: {
          name: 'Guardian Contact',
          relation: 'Parent',
          phone: '+91 98200 98201',
        },
      },
      academicInfo: {
        highestQualification: 'Senior Secondary (12th Grade)',
        institution: 'St. Xavier Collegiate School, Kolkata',
        boardOrUniversity: 'CBSE',
        graduationYear: 2024,
        cgpaOrPercentage: '92.4%',
        majorSubject: 'Science (PCM)',
        standardizedTest: {
          name: 'WBJEE / JEE Main',
          score: 'Rank 1420',
        },
        statementOfPurpose: 'Eager to pursue my degree at IEM Kolkata.',
      },
      documents: [],
      createdAt: new Date().toISOString(),
    };

    const newApp = normalizeApplication(newAppRaw);
    apps.unshift(newApp);
    setStoredState('applications', apps);

    // Create notification for admin
    const notifications = getStoredState('notifications', defaultNotifications);
    notifications.unshift({
      _id: 'notif-' + Date.now(),
      title: '📝 New Application Started',
      message: `${currentUser.name} started draft application for ${prog.name}.`,
      link: '/admin/applications',
      isRead: false,
      createdAt: new Date().toISOString(),
    });
    setStoredState('notifications', notifications);

    return { success: true, message: 'Application draft created', application: newApp };
  }

  // Update Application Step (Personal info, Academic info, etc.)
  if (path.includes('/step') && method === 'put') {
    const id = path.split('/applications/')[1].split('/step')[0];
    const apps = getStoredApplications();
    const idx = apps.findIndex((a) => a._id === id);
    let app = idx >= 0 ? apps[idx] : apps[0];

    if (app) {
      if (body.step || body.currentStep) {
        app.currentStep = Math.max(app.currentStep || 1, body.step || body.currentStep);
      }

      // Handle personal info
      if (body.personalInfo || body.personalDetails) {
        const incomingPersonal = body.personalInfo || body.personalDetails;
        app.personalInfo = {
          ...(app.personalInfo || {}),
          ...incomingPersonal,
          address: {
            ...(app.personalInfo?.address || {}),
            ...(incomingPersonal.address || {}),
          },
          emergencyContact: {
            ...(app.personalInfo?.emergencyContact || {}),
            ...(incomingPersonal.emergencyContact || {}),
          },
        };
        app.personalDetails = app.personalInfo;
        if (incomingPersonal.fullName) {
          app.studentName = incomingPersonal.fullName;
        }
      }

      // Handle academic info
      if (body.academicInfo || body.academicDetails) {
        const incomingAcademic = body.academicInfo || body.academicDetails;
        app.academicInfo = {
          ...(app.academicInfo || {}),
          ...incomingAcademic,
          standardizedTest: {
            ...(app.academicInfo?.standardizedTest || {}),
            ...(incomingAcademic.standardizedTest || {}),
          },
        };
        app.academicDetails = app.academicInfo;
      }

      app = normalizeApplication(app);
      if (idx >= 0) {
        apps[idx] = app;
      } else {
        apps[0] = app;
      }
      setStoredState('applications', apps);
    }
    return { success: true, message: 'Application step saved successfully', application: app };
  }

  // Submit Final Application
  if (path.includes('/submit') && method === 'post') {
    const id = path.split('/applications/')[1].split('/submit')[0];
    const apps = getStoredApplications();
    const idx = apps.findIndex((a) => a._id === id);
    let app = idx >= 0 ? apps[idx] : apps[0];

    if (app) {
      app.status = 'Submitted';
      app.isSubmitted = true;
      app.submittedAt = new Date().toISOString();
      app.paymentStatus = 'paid';
      app.timeline.push({
        step: 'Submitted',
        date: new Date().toISOString(),
        note: 'Submitted with fee clearance. Application locked for faculty committee review.',
      });

      app = normalizeApplication(app);
      if (idx >= 0) {
        apps[idx] = app;
      } else {
        apps[0] = app;
      }
      setStoredState('applications', apps);

      // Create notification for admin & faculty
      const notifications = getStoredState('notifications', defaultNotifications);
      notifications.unshift({
        _id: 'notif-' + Date.now(),
        title: '📬 New Application Submitted',
        message: `${app.studentName} submitted application ${app.applicationNumber} for ${app.programName}.`,
        link: '/faculty/queue',
        isRead: false,
        createdAt: new Date().toISOString(),
      });
      setStoredState('notifications', notifications);
    }
    return { success: true, message: 'Application submitted successfully', application: app };
  }

  // Admin Override Application Status
  if (path.includes('/status') && method === 'put') {
    const id = path.split('/applications/')[1].split('/status')[0];
    const apps = getStoredApplications();
    const idx = apps.findIndex((a) => a._id === id);
    let app = idx >= 0 ? apps[idx] : apps[0];

    if (app) {
      app.status = body.status || app.status;
      if (app.status === 'Approved') {
        app.decisionDate = new Date().toISOString();
      }
      app.timeline.push({
        step: app.status,
        date: new Date().toISOString(),
        note: body.note || `Admissions Committee updated status to ${app.status}`,
      });

      app = normalizeApplication(app);
      if (idx >= 0) {
        apps[idx] = app;
      } else {
        apps[0] = app;
      }
      setStoredState('applications', apps);

      // Create notification for student
      const notifications = getStoredState('notifications', defaultNotifications);
      notifications.unshift({
        _id: 'notif-' + Date.now(),
        title: `📢 Status Update: ${app.status}`,
        message: `Your application (${app.applicationNumber}) for ${app.programName} has been updated to "${app.status}".`,
        link: `/student/applications/${app._id}`,
        isRead: false,
        createdAt: new Date().toISOString(),
      });
      setStoredState('notifications', notifications);
    }
    return { success: true, message: 'Application status updated successfully', application: app };
  }

  // ========================================================
  // 7. FACULTY EVALUATION & QUEUE
  // ========================================================
  if (path === '/faculty/queue' || path.startsWith('/faculty/queue')) {
    let apps = getStoredApplications();
    const statusFilter = getParam('status');
    const programFilter = getParam('program');
    const searchFilter = getParam('search').toLowerCase();
    const onlyMyDept = getParam('onlyMyDept') === 'true';

    if (statusFilter && statusFilter !== 'All') {
      apps = apps.filter((a) => a.status?.toLowerCase() === statusFilter.toLowerCase());
    }

    if (programFilter && programFilter !== 'All') {
      apps = apps.filter(
        (a) => a.program?._id === programFilter || a.program?.code === programFilter
      );
    }

    if (searchFilter) {
      apps = apps.filter(
        (a) =>
          a.studentName?.toLowerCase().includes(searchFilter) ||
          a.student?.email?.toLowerCase().includes(searchFilter) ||
          a.applicationNumber?.toLowerCase().includes(searchFilter) ||
          a.programName?.toLowerCase().includes(searchFilter)
      );
    }

    if (onlyMyDept) {
      apps = apps.filter((a) => a.program?.department === 'Computer Science');
    }

    return { success: true, count: apps.length, applications: apps };
  }

  // Faculty Submit Candidate Evaluation
  if (path.includes('/faculty/evaluate')) {
    const id = path.split('/faculty/evaluate/')[1];
    const apps = getStoredApplications();
    const idx = apps.findIndex((a) => a._id === id);
    let app = idx >= 0 ? apps[idx] : apps[0];

    if (app) {
      const acScore = Number(body.academicScore || 85);
      const intScore = Number(body.interviewScore || 80);
      const stScore = Number(body.statementScore || 85);
      const totalScore = Math.round((acScore + intScore + stScore) / 3);
      const recommendation = body.recommendation || 'recommend';
      const newStatus = body.newStatus || (recommendation === 'recommend' ? 'Approved' : 'Verified');

      app.status = newStatus;
      if (newStatus === 'Approved') {
        app.decisionDate = new Date().toISOString();
      }

      app.evaluation = {
        evaluator: mockUsers.faculty,
        academicScore: acScore,
        interviewScore: intScore,
        statementScore: stScore,
        totalScore,
        compositeScore: totalScore,
        recommendation,
        interviewNotes: body.interviewNotes || '',
        comments: body.comments || 'Evaluated and scored by admissions reviewer.',
        evaluatedAt: new Date().toISOString(),
      };

      app.timeline.push({
        step: newStatus,
        date: new Date().toISOString(),
        note: `Faculty evaluation completed: ${recommendation.toUpperCase()} (Composite score: ${totalScore}/100)`,
      });

      app = normalizeApplication(app);
      if (idx >= 0) {
        apps[idx] = app;
      } else {
        apps[0] = app;
      }
      setStoredState('applications', apps);

      // Create notification for student
      const notifications = getStoredState('notifications', defaultNotifications);
      notifications.unshift({
        _id: 'notif-' + Date.now(),
        title: `🎓 Faculty Review: ${newStatus}`,
        message: `Your application (${app.applicationNumber}) has been evaluated with a score of ${totalScore}/100. Status: ${newStatus}.`,
        link: `/student/applications/${app._id}`,
        isRead: false,
        createdAt: new Date().toISOString(),
      });
      setStoredState('notifications', notifications);
    }
    return { success: true, message: 'Evaluation submitted successfully', application: app };
  }

  // ========================================================
  // 8. DOCUMENTS VERIFICATION & MANAGEMENT
  // ========================================================
  // Upload document
  if (path === '/documents/upload' && method === 'post') {
    let docTitle = 'Official Document.pdf';
    let docType = 'Senior Secondary Marksheet';
    let appId = null;

    if (config.data && typeof config.data.get === 'function') {
      const file = config.data.get('file');
      docTitle = config.data.get('title') || (file && file.name) || docTitle;
      docType = config.data.get('documentType') || docType;
      appId = config.data.get('applicationId') || null;
    } else if (body) {
      docTitle = body.title || body.fileName || docTitle;
      docType = body.documentType || docType;
      appId = body.applicationId || null;
    }

    const newDoc = {
      _id: 'doc-' + Date.now(),
      title: docTitle,
      originalName: docTitle,
      documentType: docType,
      fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      mimeType: 'application/pdf',
      fileSize: 1024 * 480,
      status: 'pending',
      verificationNotes: '',
      uploadedAt: new Date().toISOString(),
    };

    // If attached to application, push to application documents
    if (appId) {
      const apps = getStoredApplications();
      const idx = apps.findIndex((a) => a._id === appId);
      if (idx >= 0) {
        if (!Array.isArray(apps[idx].documents)) apps[idx].documents = [];
        apps[idx].documents.push(newDoc);
        setStoredState('applications', apps);
      }
    }

    // Save in user's document locker
    const userDocs = getStoredState('user_documents', []);
    userDocs.unshift(newDoc);
    setStoredState('user_documents', userDocs);

    return {
      success: true,
      message: 'Document uploaded successfully',
      document: newDoc,
    };
  }

  // Faculty Verify / Reject Document
  if (path.startsWith('/documents/') && path.includes('/verify') && method === 'put') {
    const docId = path.split('/documents/')[1].split('/verify')[0];
    const newStatus = body.status || 'verified';
    const notes = body.verificationNotes || '';

    const apps = getStoredApplications();
    let updatedDoc = null;

    apps.forEach((app) => {
      if (Array.isArray(app.documents)) {
        app.documents.forEach((d) => {
          if (d._id === docId) {
            d.status = newStatus;
            d.verificationNotes = notes;
            updatedDoc = { ...d };
          }
        });
      }
    });

    if (updatedDoc) {
      setStoredState('applications', apps);
    } else {
      updatedDoc = {
        _id: docId,
        status: newStatus,
        verificationNotes: notes,
      };
    }

    // Also update in user_documents
    const userDocs = getStoredState('user_documents', []);
    userDocs.forEach((d) => {
      if (d._id === docId) {
        d.status = newStatus;
        d.verificationNotes = notes;
      }
    });
    setStoredState('user_documents', userDocs);

    return {
      success: true,
      message: `Document marked as ${newStatus.toUpperCase()}`,
      document: updatedDoc,
    };
  }

  // Delete Document
  if (path.startsWith('/documents/') && method === 'delete') {
    const docId = path.split('/documents/')[1];

    // Remove from application documents
    const apps = getStoredApplications();
    apps.forEach((app) => {
      if (Array.isArray(app.documents)) {
        app.documents = app.documents.filter((d) => d._id !== docId);
      }
    });
    setStoredState('applications', apps);

    // Remove from user_documents
    let userDocs = getStoredState('user_documents', []);
    userDocs = userDocs.filter((d) => d._id !== docId);
    setStoredState('user_documents', userDocs);

    return { success: true, message: 'Document deleted successfully' };
  }

  // Get My Documents
  if (path === '/documents/my-documents') {
    const userDocs = getStoredState('user_documents', null);
    if (userDocs && userDocs.length > 0) {
      return { success: true, documents: userDocs };
    }

    // Return sample student documents
    const defaultDocs = [
      {
        _id: 'doc-101-1',
        title: 'Senior Secondary (10+2) Marksheet.pdf',
        documentType: 'high_school_marksheet',
        originalName: 'Senior_Secondary_Marksheet_Aarav.pdf',
        fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        mimeType: 'application/pdf',
        fileSize: 1024 * 512,
        status: 'verified',
        verificationNotes: 'Verified against CBSE digital portal. 94.2% aggregate confirmed.',
        uploadedAt: '2026-10-21T11:00:00.000Z',
      },
      {
        _id: 'doc-101-2',
        title: 'Government Identity Proof (Aadhaar Card).pdf',
        documentType: 'id_proof',
        originalName: 'Aadhaar_Card_Aarav.pdf',
        fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        mimeType: 'application/pdf',
        fileSize: 1024 * 320,
        status: 'verified',
        verificationNotes: 'Official Government ID verified and photo matched.',
        uploadedAt: '2026-10-21T11:05:00.000Z',
      },
      {
        _id: 'doc-101-3',
        title: 'WBJEE Entrance Examination Rank Card.pdf',
        documentType: 'transcript',
        originalName: 'WBJEE_Rankcard_2024.pdf',
        fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        mimeType: 'application/pdf',
        fileSize: 1024 * 440,
        status: 'verified',
        verificationNotes: 'Rank 1420 verified on WBJEE board database.',
        uploadedAt: '2026-10-21T11:10:00.000Z',
      },
    ];
    return { success: true, documents: defaultDocs };
  }

  // Get Documents for Application
  if (path.startsWith('/documents/application/')) {
    const appId = path.split('/documents/application/')[1];
    const apps = getStoredApplications();
    const app = apps.find((a) => a._id === appId);
    return {
      success: true,
      documents: app?.documents || [],
    };
  }

  // ========================================================
  // 9. PAYMENTS ROUTES
  // ========================================================
  if (path === '/payments/simulate' && method === 'post') {
    const appId = body.applicationId || 'app-demo-101';
    const amount = Number(body.amount || 1200);
    const newPayment = {
      _id: 'pay-' + Date.now(),
      transactionId: 'TXN-IEM-' + Math.floor(10000000 + Math.random() * 90000000),
      receiptNumber: 'RCP-2026-' + Math.floor(100000 + Math.random() * 900000),
      applicationId: appId,
      amount,
      currency: 'INR',
      status: 'success',
      paymentMethod: body.paymentMethod || 'IEM Gateway Simulator (Card ending 4242)',
      billingDetails: body.billingDetails || {
        name: 'Aarav Sharma',
        email: 'student@iem.edu.in',
        last4: '4242',
        bankName: 'IEM Gateway Secure Simulator',
      },
      paymentDate: new Date().toISOString(),
      paidAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };

    // Store in payments map
    const payments = getStoredPayments();
    payments[appId] = newPayment;
    setStoredState('payments', payments);

    // Update application paymentStatus
    const apps = getStoredApplications();
    const idx = apps.findIndex((a) => a._id === appId);
    if (idx >= 0) {
      apps[idx].paymentStatus = 'paid';
      apps[idx].timeline.push({
        step: 'Fee Paid',
        date: new Date().toISOString(),
        note: `Application fee ₹${amount} received. Receipt #${newPayment.receiptNumber}`,
      });
      setStoredState('applications', apps);
    }

    return {
      success: true,
      message: 'Fee payment processed successfully! Receipt generated.',
      payment: newPayment,
    };
  }

  if (path.startsWith('/payments/application/')) {
    const appId = path.split('/payments/application/')[1];
    const payments = getStoredPayments();
    let payment = payments[appId];

    if (!payment) {
      // Generate standard fallback receipt for paid applications
      payment = {
        _id: 'pay-' + appId,
        transactionId: 'TXN-IEM-99482103',
        receiptNumber: 'RCP-2026-004812',
        applicationId: appId,
        amount: 1200,
        currency: 'INR',
        status: 'success',
        paymentMethod: 'IEM Gateway Simulator (Card ending 4242)',
        billingDetails: {
          name: 'Applicant Candidate',
          email: 'student@iem.edu.in',
          last4: '4242',
          bankName: 'IEM Gateway Simulator',
        },
        paymentDate: '2026-10-25T14:30:00.000Z',
        paidAt: '2026-10-25T14:30:00.000Z',
        createdAt: '2026-10-25T14:30:00.000Z',
      };
    }

    return {
      success: true,
      payment,
    };
  }

  if (path === '/payments') {
    const payments = getStoredPayments();
    return {
      success: true,
      payments: Object.values(payments),
    };
  }

  // Default fallback response
  return { success: true, data: [] };
};
