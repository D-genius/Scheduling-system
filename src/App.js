import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './auth/AuthContext';
import ErrorBoundary from './ErrorBoundary';
import Login from './components/Login';
import Appointments from './components/Appointments';
import DoctorList from './components/DoctorList';
import DoctorAvailability from './components/DoctorAvailability';
import ProfileEdit from './components/ProfileEdit';
import ProtectedRoute from './components/ProtectedRoute';
import Signup from './components/Signup';
import { ThemeProvider, createTheme } from '@mui/material/styles';

const theme = createTheme();

function App() {
  return (
    <ThemeProvider theme={theme}>
      <ErrorBoundary>
        <AuthProvider>
          <Router>
            <Routes>
              {/* Public routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />

              {/* Protected routes */}
              <Route element={<ProtectedRoute />}>
                <Route path="/" element={<HomeRedirect />} />
                <Route path="/appointments" element={<Appointments />} />
                <Route path="/doctors" element={<DoctorList />} /> {/* For patients */}
                <Route path="/doctor-availability" element={<DoctorAvailability />} /> {/* For doctors */}
                <Route path="/profile" element={<ProfileEdit />} /> {/* For all */}
              </Route>

              {/* Catch-all route */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Router>
        </AuthProvider>
      </ErrorBoundary>
    </ThemeProvider>
  );
}

// Helper component for home redirection
const HomeRedirect = () => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return user.user_type === 'patient' ? (
    <Navigate to="/doctors" replace />
  ) : (
    <Navigate to="/appointments" replace />
  );
};

export default App;