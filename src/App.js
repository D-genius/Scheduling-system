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
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';

const theme = createTheme();

function App() {
  return (
    <ThemeProvider theme={theme}>
      <ErrorBoundary>
        <AuthProvider>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <Router>
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route element={<ProtectedRoute />}>
                  <Route path="/" element={<HomeRedirect />} />
                  <Route path="/appointments" element={<Appointments />} />
                  <Route path="/doctors" element={<DoctorList />} />
                  <Route path="/doctor-availability" element={<DoctorAvailability />} />
                  <Route path="/profile" element={<ProfileEdit />} />
                </Route>
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Router>
          </LocalizationProvider>
        </AuthProvider>
      </ErrorBoundary>
    </ThemeProvider>
  );
}

const HomeRedirect = () => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return user.user_type === 'patient' ? (
    <Navigate to="/doctors" replace />
  ) : (
    <Navigate to="/appointments" replace />
  );
}
export default App;