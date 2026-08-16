import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import DietitianDashboard from './pages/DietitianDashboard';
import ClientDashboard from './pages/ClientDashboard';
import AssessmentPage from './pages/AssessmentPage';
import DietPlannerPage from './pages/DietPlannerPage';
import FoodDatabase from './pages/FoodDatabase';

// Protected Route wrapper component
function ProtectedRoute({ children, allowedRole }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading authentication session...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRole && user.role !== allowedRole) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

// Route handler for /dashboard to redirect based on user role
function DashboardRedirect() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading dashboard...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role === 'dietitian') {
    return <DietitianDashboard />;
  }

  return <ClientDashboard />;
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app-container">
          <Navbar />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <DashboardRedirect />
                </ProtectedRoute>
              } />

              <Route path="/assessment/:patientId" element={
                <ProtectedRoute allowedRole="dietitian">
                  <AssessmentPage />
                </ProtectedRoute>
              } />

              <Route path="/diet-planner/:patientId" element={
                <ProtectedRoute allowedRole="dietitian">
                  <DietPlannerPage />
                </ProtectedRoute>
              } />


              <Route path="/foods" element={
                <ProtectedRoute>
                  <FoodDatabase />
                </ProtectedRoute>
              } />

              {/* Catch all redirect to home */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
}
