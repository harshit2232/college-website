import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastProvider } from './context/ToastContext';
import { AuthProvider } from './context/AuthContext';

// Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';

// Public Pages
import LandingPage from './pages/LandingPage';
import ProgramsPage from './pages/ProgramsPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

// Student Pages
import StudentDashboard from './pages/student/StudentDashboard';
import ApplicationWizard from './pages/student/ApplicationWizard';
import MyApplications from './pages/student/MyApplications';
import ApplicationDetail from './pages/student/ApplicationDetail';
import StudentDocuments from './pages/student/StudentDocuments';
import StudentProfilePage from './pages/student/StudentProfilePage';

// Faculty Pages
import FacultyDashboard from './pages/faculty/FacultyDashboard';
import FacultyReviewPage from './pages/faculty/FacultyReviewPage';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import ProgramManagement from './pages/admin/ProgramManagement';
import UserManagement from './pages/admin/UserManagement';
import AllApplications from './pages/admin/AllApplications';
import ReportsPage from './pages/admin/ReportsPage';

export const App = () => {
  return (
    <ToastProvider>
      <AuthProvider>
        <Router>
          <div className="min-h-screen flex flex-col bg-slate-50 font-sans text-slate-900 selection:bg-brand-500 selection:text-white">
            <Navbar />
            <main className="flex-1">
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<LandingPage />} />
                <Route path="/programs" element={<ProgramsPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />

                {/* Student Protected Routes */}
                <Route
                  path="/student/dashboard"
                  element={
                    <ProtectedRoute allowedRoles={['student']}>
                      <StudentDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/student/apply"
                  element={
                    <ProtectedRoute allowedRoles={['student']}>
                      <ApplicationWizard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/student/applications"
                  element={
                    <ProtectedRoute allowedRoles={['student']}>
                      <MyApplications />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/student/applications/:id"
                  element={
                    <ProtectedRoute allowedRoles={['student', 'faculty', 'admin']}>
                      <ApplicationDetail />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/student/documents"
                  element={
                    <ProtectedRoute allowedRoles={['student']}>
                      <StudentDocuments />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/student/profile"
                  element={
                    <ProtectedRoute allowedRoles={['student']}>
                      <StudentProfilePage />
                    </ProtectedRoute>
                  }
                />

                {/* Faculty Protected Routes */}
                <Route
                  path="/faculty/queue"
                  element={
                    <ProtectedRoute allowedRoles={['faculty', 'admin']}>
                      <FacultyDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/faculty/review/:id"
                  element={
                    <ProtectedRoute allowedRoles={['faculty', 'admin']}>
                      <FacultyReviewPage />
                    </ProtectedRoute>
                  }
                />

                {/* Admin Protected Routes */}
                <Route
                  path="/admin/dashboard"
                  element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <AdminDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/programs"
                  element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <ProgramManagement />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/users"
                  element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <UserManagement />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/applications"
                  element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <AllApplications />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/reports"
                  element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <ReportsPage />
                    </ProtectedRoute>
                  }
                />

                {/* Catch-all */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </Router>
      </AuthProvider>
    </ToastProvider>
  );
};

export default App;
