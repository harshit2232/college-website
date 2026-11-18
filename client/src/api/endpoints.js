import api from './client';

// Auth Endpoints
export const authApi = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  logout: () => api.post('/auth/logout'),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
  updateStudentProfile: (data) => api.put('/auth/student-profile', data),
};

// Programs Endpoints
export const programApi = {
  getPrograms: (params) => api.get('/programs', { params }),
  getProgramById: (id) => api.get(`/programs/${id}`),
  createProgram: (data) => api.post('/programs', data),
  updateProgram: (id, data) => api.put(`/programs/${id}`, data),
  deleteProgram: (id) => api.delete(`/programs/${id}`),
};

// Applications Endpoints
export const applicationApi = {
  getMyApplications: () => api.get('/applications/my-applications'),
  getApplicationById: (id) => api.get(`/applications/${id}`),
  createApplication: (data) => api.post('/applications', data),
  updateStep: (id, data) => api.put(`/applications/${id}/step`, data),
  submitApplication: (id) => api.post(`/applications/${id}/submit`),
  getAllApplications: (params) => api.get('/applications', { params }),
  updateStatus: (id, data) => api.put(`/applications/${id}/status`, data),
};

// Documents Endpoints
export const documentApi = {
  uploadDocument: (formData) =>
    api.post('/documents/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  getMyDocuments: () => api.get('/documents/my-documents'),
  getApplicationDocuments: (appId) => api.get(`/documents/application/${appId}`),
  verifyDocument: (id, data) => api.put(`/documents/${id}/verify`, data),
  deleteDocument: (id) => api.delete(`/documents/${id}`),
};

// Payments Endpoints
export const paymentApi = {
  simulatePayment: (data) => api.post('/payments/simulate', data),
  getPaymentByApp: (appId) => api.get(`/payments/application/${appId}`),
  getAllPayments: () => api.get('/payments'),
};

// Faculty Endpoints
export const facultyApi = {
  getEvaluationQueue: (params) => api.get('/faculty/queue', { params }),
  submitEvaluation: (id, data) => api.post(`/faculty/evaluate/${id}`, data),
};

// Admin Endpoints
export const adminApi = {
  getUsers: (params) => api.get('/admin/users', { params }),
  createUser: (data) => api.post('/admin/users', data),
  updateUser: (id, data) => api.put(`/admin/users/${id}`, data),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
};

// Reports Endpoints
export const reportApi = {
  getAnalytics: () => api.get('/reports/analytics'),
  getExportCSVUrl: () => '/api/reports/export-csv',
};

// Notifications Endpoints
export const notificationApi = {
  getNotifications: () => api.get('/notifications'),
  markAsRead: (id) => api.put(`/notifications/${id}/read`),
  markAllAsRead: () => api.put('/notifications/read-all'),
};
