import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from './components/layout/DashboardLayout';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Dashboard from './pages/dashboard/Dashboard';
import Sessions from './pages/dashboard/Sessions';
import Students from './pages/dashboard/Students';
import Earnings from './pages/dashboard/Earnings';
import Settings from './pages/dashboard/Settings';
import Resources from './pages/dashboard/Resources';
import VideoCall from './pages/dashboard/VideoCall';
import Notifications from './pages/dashboard/Notifications';
import AuthRoute from './components/auth/AuthRoute';
import UnauthRoute from './components/auth/UnauthRoute';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route
          path="/login"
          element={
            <UnauthRoute>
              <Login />
            </UnauthRoute>
          }
        />
        <Route
          path="/register"
          element={
            <UnauthRoute>
              <Register />
            </UnauthRoute>
          }
        />
        
        {/* Protected dashboard routes */}
        <Route
          path="/dashboard"
          element={
            <AuthRoute>
              <DashboardLayout />
            </AuthRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="sessions" element={<Sessions />} />
          <Route path="students" element={<Students />} />
          <Route path="earnings" element={<Earnings />} />
          <Route path="settings" element={<Settings />} />
          <Route path="resources" element={<Resources />} />
          <Route path="video-call" element={<VideoCall />} />
          <Route path="notifications" element={<Notifications />} />
        </Route>
        
        {/* Redirect root to dashboard if authenticated, otherwise to login */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        
        {/* Catch all - redirect to dashboard */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;