import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';

// Pages
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import StudentDashboard from './pages/StudentDashboard';
import TeacherDashboard from './pages/TeacherDashboard';
import AdminDashboard from './pages/AdminDashboard';
import AssignmentDetail from './pages/AssignmentDetail';
import SubmitAssignment from './pages/SubmitAssignment';
import GradeSubmission from './pages/GradeSubmission';
import MySubmissions from './pages/MySubmissions';
import Layout from './components/Layout';

// Protected Route wrapper
const ProtectedRoute = ({ children, roles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="animate-spin w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/dashboard" replace />;
  return children;
};

// Role-based dashboard redirect
const DashboardRouter = () => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;
  if (user.role === 'admin') return <Navigate to="/admin" />;
  if (user.role === 'teacher') return <Navigate to="/teacher" />;
  return <Navigate to="/student" />;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster
          position="top-right"
          toastOptions={{
            style: { background: '#1e1b4b', color: '#e0e7ff', border: '1px solid #4338ca' },
            success: { iconTheme: { primary: '#6366f1', secondary: '#fff' } },
          }}
        />
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/" element={<Navigate to="/dashboard" />} />
          <Route path="/dashboard" element={<ProtectedRoute><DashboardRouter /></ProtectedRoute>} />

          {/* Student routes */}
          <Route path="/student" element={
            <ProtectedRoute roles={['student']}>
              <Layout><StudentDashboard /></Layout>
            </ProtectedRoute>
          } />
          <Route path="/assignments/:id" element={
            <ProtectedRoute>
              <Layout><AssignmentDetail /></Layout>
            </ProtectedRoute>
          } />
          <Route path="/assignments/:id/submit" element={
            <ProtectedRoute roles={['student']}>
              <Layout><SubmitAssignment /></Layout>
            </ProtectedRoute>
          } />
          <Route path="/my-submissions" element={
            <ProtectedRoute roles={['student']}>
              <Layout><MySubmissions /></Layout>
            </ProtectedRoute>
          } />

          {/* Teacher routes */}
          <Route path="/teacher" element={
            <ProtectedRoute roles={['teacher']}>
              <Layout><TeacherDashboard /></Layout>
            </ProtectedRoute>
          } />
          <Route path="/submissions/:id/grade" element={
            <ProtectedRoute roles={['teacher', 'admin']}>
              <Layout><GradeSubmission /></Layout>
            </ProtectedRoute>
          } />

          {/* Admin routes */}
          <Route path="/admin" element={
            <ProtectedRoute roles={['admin']}>
              <Layout><AdminDashboard /></Layout>
            </ProtectedRoute>
          } />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;