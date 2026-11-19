import {
  mockPrograms,
  mockUsers,
  mockStudentProfile,
  mockApplications,
  mockAnalytics,
} from './mockService';

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

export const handleMockRequest = async (config) => {
  // Normalize URL by removing domain, /api prefix, and query parameters
  const rawUrl = (config.url || '').replace(/^https?:\/\/[^\/]+/, '').replace(/^\/api/, '');
  const [path, queryString] = rawUrl.split('?');
  const method = (config.method || 'get').toLowerCase();
  let body = {};

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
  await new Promise((r) => setTimeout(r, 80));

  // --- 1. AUTH ROUTES ---
  if (path === '/auth/login' && method === 'post') {
    const email = (body.email || '').toLowerCase().trim();
    const password = (body.password || '').trim();

    // Admin login
    if (
      (email === 'rajh36073@gmail.com' || email === 'rahj36073@gmail.com') &&
      password.toLowerCase() === 'harshit@500'
    ) {
      const user = mockUsers.admin;
      const token = 'mock-jwt-token-admin';
      setStoredState('current_user', user);
      return {
        success: true,
        message: 'Logged in successfully',
        token,
        user,
      };
    }

    // Faculty login
    if (
      (email === 'faculty@iem.edu.in' || email === 'faculty@nexis.edu') &&
      password.toLowerCase() === 'faculty@500'
    ) {
      const user = mockUsers.faculty;
      const token = 'mock-jwt-token-faculty';
      setStoredState('current_user', user);
      return {
        success: true,
        message: 'Logged in successfully',
        token,
        user,
      };
    }

    // Student login
    if (
      (email === 'student@iem.edu.in' || email === 'student@nexis.edu') &&
      password.toLowerCase() === 'student@500'
    ) {
      const user = mockUsers.student;
      const token = 'mock-jwt-token-student';
      setStoredState('current_user', user);
      return {
        success: true,
        message: 'Logged in successfully',
        token,
        user,
      };
    }

    // Custom registered user
    const registered = getStoredState('registered_users', []);
    const found = registered.find(
      (u) => u.email.toLowerCase() === email && u.password === password
    );
    if (found) {
      const user = {
        _id: found._id,
        name: found.name,
        email: found.email,
        role: found.role || 'student',
        status: 'active',
      };
      setStoredState('current_user', user);
      return {
        success: true,
        message: 'Logged in successfully',
        token: 'mock-jwt-token-' + user._id,
        user,
      };
    }

    throw new Error('Invalid email or password.');
  }

  if (path === '/auth/register' && method === 'post') {
    const newUser = {
      _id: 'user-' + Date.now(),
      name: body.name || 'New Student',
      email: (body.email || '').toLowerCase().trim(),
      password: body.password || '',
      role: body.role || 'student',
      status: 'active',
    };
    const registered = getStoredState('registered_users', []);
    registered.push(newUser);
    setStoredState('registered_users', registered);
    setStoredState('current_user', newUser);

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

  // --- 2. PROGRAMS ROUTES ---
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

  // --- 3. ANALYTICS & REPORTS ---
  if (path === '/reports/analytics') {
    return mockAnalytics;
  }

  // --- 4. APPLICATIONS ROUTES ---
  if (path === '/applications/my-applications' || path === '/applications') {
    const apps = getStoredState('applications', mockApplications);
    return { success: true, count: apps.length, applications: apps };
  }

  if (path.startsWith('/applications/') && method === 'get') {
    const id = path.split('/applications/')[1];
    const apps = getStoredState('applications', mockApplications);
    const found = apps.find((a) => a._id === id || a.applicationNumber === id) || apps[0];
    return { success: true, application: found };
  }

  if (path === '/applications' && method === 'post') {
    const apps = getStoredState('applications', mockApplications);
    const prog = mockPrograms.find((p) => p._id === body.programId) || mockPrograms[0];
    const currentUser = getStoredState('current_user', mockUsers.student);

    const newApp = {
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
        { step: 'Draft Started', date: new Date().toISOString(), note: 'Application initiated' },
      ],
      personalDetails: {},
      academicDetails: {},
      createdAt: new Date().toISOString(),
    };
    apps.unshift(newApp);
    setStoredState('applications', apps);
    return { success: true, message: 'Application draft created', application: newApp };
  }

  if (path.includes('/step') && method === 'put') {
    const id = path.split('/applications/')[1].split('/step')[0];
    const apps = getStoredState('applications', mockApplications);
    const app = apps.find((a) => a._id === id) || apps[0];
    if (app) {
      if (body.currentStep) app.currentStep = body.currentStep;
      if (body.personalDetails) app.personalDetails = { ...app.personalDetails, ...body.personalDetails };
      if (body.academicDetails) app.academicDetails = { ...app.academicDetails, ...body.academicDetails };
      setStoredState('applications', apps);
    }
    return { success: true, message: 'Application step saved', application: app };
  }

  if (path.includes('/submit') && method === 'post') {
    const id = path.split('/applications/')[1].split('/submit')[0];
    const apps = getStoredState('applications', mockApplications);
    const app = apps.find((a) => a._id === id) || apps[0];
    if (app) {
      app.status = 'Submitted';
      app.isSubmitted = true;
      app.submittedAt = new Date().toISOString();
      app.paymentStatus = 'paid';
      app.timeline.push({
        step: 'Submitted',
        date: new Date().toISOString(),
        note: 'Submitted with fee clearance',
      });
      setStoredState('applications', apps);
    }
    return { success: true, message: 'Application submitted successfully', application: app };
  }

  // --- 5. FACULTY EVALUATION QUEUE ---
  if (path.startsWith('/faculty/queue')) {
    const apps = getStoredState('applications', mockApplications);
    return { success: true, count: apps.length, applications: apps };
  }

  if (path.includes('/faculty/evaluate')) {
    const id = path.split('/faculty/evaluate/')[1];
    const apps = getStoredState('applications', mockApplications);
    const app = apps.find((a) => a._id === id) || apps[0];
    if (app) {
      app.status = body.status || 'Verified';
      app.evaluation = {
        evaluator: mockUsers.faculty,
        academicScore: body.academicScore || 90,
        interviewScore: body.interviewScore || 85,
        sopScore: body.sopScore || 88,
        compositeScore: 87.6,
        recommendation: body.recommendation || 'recommend',
        comments: body.comments || 'Evaluated successfully.',
        evaluatedAt: new Date().toISOString(),
      };
      app.timeline.push({
        step: app.status,
        date: new Date().toISOString(),
        note: `Admissions review: ${app.status}`,
      });
      setStoredState('applications', apps);
    }
    return { success: true, message: 'Evaluation submitted successfully', application: app };
  }

  // --- 6. PAYMENTS & DOCUMENTS ---
  if (path === '/payments/simulate' && method === 'post') {
    return {
      success: true,
      message: 'Payment simulated successfully',
      payment: {
        _id: 'pay-' + Date.now(),
        transactionId: 'TXN-IEM-' + Math.floor(10000000 + Math.random() * 90000000),
        receiptNumber: 'RCP-2026-' + Math.floor(100000 + Math.random() * 900000),
        amount: body.amount || 1200,
        currency: 'INR',
        status: 'success',
        paymentMethod: 'card_simulator',
        paidAt: new Date().toISOString(),
      },
    };
  }

  if (path.startsWith('/payments/application/')) {
    return {
      success: true,
      payment: {
        _id: 'pay-demo-1',
        transactionId: 'TXN-IEM-99482103',
        receiptNumber: 'RCP-2026-004812',
        amount: 1200,
        currency: 'INR',
        status: 'success',
        paymentMethod: 'card_simulator',
        paidAt: '2026-10-25T14:30:00.000Z',
      },
    };
  }

  if (path === '/documents/upload' && method === 'post') {
    return {
      success: true,
      message: 'Document uploaded successfully',
      document: {
        _id: 'doc-' + Date.now(),
        documentType: 'transcript',
        fileName: 'academic_transcript.pdf',
        fileUrl: '#',
        status: 'pending',
        uploadedAt: new Date().toISOString(),
      },
    };
  }

  if (path === '/documents/my-documents') {
    return {
      success: true,
      documents: [
        {
          _id: 'doc-1',
          documentType: 'marksheet_12th',
          fileName: '12th_grade_marksheet.pdf',
          status: 'verified',
          feedback: 'Verified against council records.',
        },
        {
          _id: 'doc-2',
          documentType: 'id_proof',
          fileName: 'aadhaar_card.pdf',
          status: 'verified',
        },
      ],
    };
  }

  if (path.startsWith('/documents/application/')) {
    return {
      success: true,
      documents: [
        {
          _id: 'doc-1',
          documentType: 'marksheet_12th',
          fileName: '12th_grade_marksheet.pdf',
          status: 'verified',
        },
        {
          _id: 'doc-2',
          documentType: 'id_proof',
          fileName: 'aadhaar_card.pdf',
          status: 'verified',
        },
      ],
    };
  }

  if (path === '/admin/users') {
    return {
      success: true,
      users: [mockUsers.admin, mockUsers.faculty, mockUsers.student],
    };
  }

  if (path === '/notifications' || path === '/notifications/read-all') {
    return {
      success: true,
      unreadCount: 1,
      notifications: [
        {
          _id: 'notif-1',
          title: 'Admissions Open',
          message: 'Fall 2026 regular applications now active.',
          isRead: false,
          createdAt: new Date().toISOString(),
        },
      ],
    };
  }

  // Default fallback response
  return { success: true, data: [] };
};
