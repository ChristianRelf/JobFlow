import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import SupabaseStatus from './components/SupabaseStatus';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Home from './pages/Home';
import About from './pages/About';
import Apply from './pages/Apply';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Courses from './pages/Courses';
import CourseDetail from './pages/CourseDetail';
import CreateCourse from './pages/CreateCourse';
import EditCourse from './pages/EditCourse';
import Progress from './pages/Progress';
import Users from './pages/Users';
import Applications from './pages/Applications';
import ApplicationDetail from './pages/ApplicationDetail';
import AdminPanel from './pages/AdminPanel';
import Support from './pages/Support';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';
import VerifyCertificate from './pages/VerifyCertificate';

function App() {
  return (
    <AuthProvider>
      <SupabaseStatus />
      <Router>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/apply" element={<Apply />} />
          <Route path="/login" element={<Login />} />
          <Route path="/support" element={<Support />} />
          <Route path="/terms" element={<Terms />} />
         <Route path="/privacy" element={<Privacy />} />
          <Route path="/verify" element={<VerifyCertificate />} />
          <Route path="/verify/:id" element={<VerifyCertificate />} />
          
          {/* Protected routes */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/courses" element={
            <ProtectedRoute>
              <Layout>
                <Courses />
              </Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/courses/:id" element={
            <ProtectedRoute>
              <Layout>
                <CourseDetail />
              </Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/create-course" element={
            <ProtectedRoute allowedRoles={['staff', 'admin']}>
              <Layout>
                <CreateCourse />
              </Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/edit-course/:id" element={
            <ProtectedRoute requiredRole="admin">
              <Layout>
                <EditCourse />
              </Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/progress" element={
            <ProtectedRoute>
              <Layout>
                <Progress />
              </Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/users" element={
            <ProtectedRoute allowedRoles={['staff', 'admin']}>
              <Layout>
                <Users />
              </Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/applications" element={
            <ProtectedRoute allowedRoles={['staff', 'admin']}>
              <Layout>
                <Applications />
              </Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/applications/:id" element={
            <ProtectedRoute allowedRoles={['staff', 'admin']}>
              <Layout>
                <ApplicationDetail />
              </Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/admin" element={
            <ProtectedRoute requiredRole="admin">
              <Layout>
                <AdminPanel />
              </Layout>
            </ProtectedRoute>
          } />
          
          {/* Catch all route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;