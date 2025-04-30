import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate for navigation
import api from '../api';
import { useAuth } from '../auth/AuthContext';
import { Button, CircularProgress, Alert, Box, Typography } from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers';

const Appointments = () => {
  const { user } = useAuth();
  const navigate = useNavigate(); // Hook for navigation
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [editAppointment, setEditAppointment] = useState(null);
  const [newScheduleDate, setNewScheduleDate] = useState(null);
  const [newFollowDate, setNewFollowDate] = useState(null);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        setLoading(true);
        const accessToken = localStorage.getItem('access_token');
        if (!accessToken) throw new Error('No access token found. Please log in.');
        const response = await api.get('/appointments/', {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
        setAppointments(response.data);
        console.log('Appointment list:', response.data);
      } catch (err) {
        setError(err.message || 'Failed to fetch appointments');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchAppointments();
    }
  }, [user]);

  const bookAppointment = async (doctorId, scheduleDate, followDate) => {
    try {
      setLoading(true);
      const payload = {
        doctor: doctorId,
        patient: user.user_type === 'patient' ? user.id : null,
        scheduled_datetime: scheduleDate,
        follow_up_datetime: followDate,
        status: 'booked',
      };
      await api.post('/appointments/', payload);
      setSuccess('Appointment booked successfully!');
      setError(null);
      const response = await api.get('/appointments/');
      setAppointments(response.data);
    } catch (err) {
      setError(err.message || 'Failed to book appointment');
    } finally {
      setLoading(false);
    }
  };

  const updateAppointment = async (appointmentId) => {
    try {
      setLoading(true);
      if (!newScheduleDate || !newFollowDate) {
        throw new Error('Please select both schedule and follow-up dates');
      }
      const payload = {
        scheduled_datetime: newScheduleDate,
        follow_up_datetime: newFollowDate,
        status: 'booked',
      };
      await api.patch(`/appointments/${appointmentId}/`, payload);
      setSuccess('Appointment updated successfully!');
      setError(null);
      setEditAppointment(null);
      setNewScheduleDate(null);
      setNewFollowDate(null);
      const response = await api.get('/appointments/');
      setAppointments(response.data);
    } catch (err) {
      setError(err.message || 'Failed to update appointment');
    } finally {
      setLoading(false);
    }
  };

  const deleteAppointment = async (appointmentId) => {
    try {
      setLoading(true);
      await api.delete(`/appointments/${appointmentId}/`);
      setSuccess('Appointment deleted successfully!');
      setError(null);
      const response = await api.get('/appointments/');
      setAppointments(response.data);
    } catch (err) {
      setError(err.message || 'Failed to delete appointment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4">
          Book Appointments
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" onClose={() => setSuccess(null)} sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}

      {loading ? (
        <CircularProgress />
      ) : (
        <div className="appointments-list">
          {user?.user_type === 'doctor' && (
            <Button
              variant="contained"
              color="secondary"
              onClick={() => navigate('/doctor-availability')}
              sx={{ mb: 2 }}
            >
              Create Doctor Availability
            </Button>
          )}
          {appointments.length === 0 ? (
            <Typography>No appointments found.</Typography>
          ) : (
            appointments.map((appointment) => (
              <Box
                key={`appointment-${appointment.id}`}
                sx={{
                  border: '1px solid #ccc',
                  p: 2,
                  mb: 2,
                  borderRadius: 2,
                }}
              >
                <Typography variant="h6">
                  Doctor: {appointment.doctor_name || appointment.doctor}
                </Typography>
                <Typography variant="h6">
                  Patient: {appointment.patient_name || appointment.patient}
                </Typography>
                <Typography>
                  Date: {new Date(appointment.scheduled_datetime).toLocaleString()}
                </Typography>
                <Typography>
                  Follow-up: {new Date(appointment.follow_up_datetime).toLocaleString()}
                </Typography>
                <Typography>Status: {appointment.status}</Typography>

                {editAppointment === appointment.id ? (
                  <Box sx={{ mt: 2 }}>
                    <DateTimePicker
                      label="Update Appointment Time"
                      value={newScheduleDate}
                      onChange={(newValue) => setNewScheduleDate(newValue)}
                      sx={{ mb: 2, width: '100%' }}
                    />
                    <DateTimePicker
                      label="Update Follow-Up Time"
                      value={newFollowDate}
                      onChange={(newValue) => setNewFollowDate(newValue)}
                      sx={{ mb: 2, width: '100%' }}
                    />
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() => updateAppointment(appointment.id)}
                      sx={{ mr: 1 }}
                      disabled={!newScheduleDate || !newFollowDate}
                    >
                      Save
                    </Button>
                    <Button
                      variant="outlined"
                      onClick={() => {
                        setEditAppointment(null);
                        setNewScheduleDate(null);
                        setNewFollowDate(null);
                      }}
                    >
                      Cancel
                    </Button>
                  </Box>
                ) : (
                  <Box sx={{ mt: 2 }}>
                    {appointment.status === 'available' && (
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={() =>
                          bookAppointment(
                            appointment.doctor,
                            appointment.scheduled_datetime,
                            appointment.follow_up_datetime
                          )
                        }
                        sx={{ mr: 1 }}
                      >
                        Book Now
                      </Button>
                    )}
                    <Button
                      variant="outlined"
                      color="secondary"
                      onClick={() => {
                        setEditAppointment(appointment.id);
                        setNewScheduleDate(new Date(appointment.scheduled_datetime));
                        setNewFollowDate(new Date(appointment.follow_up_datetime));
                      }}
                      sx={{ mr: 1 }}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="outlined"
                      color="error"
                      onClick={() => deleteAppointment(appointment.id)}
                    >
                      Delete
                    </Button>
                  </Box>
                )}
              </Box>
            ))
          )}
        </div>
      )}
    </Box>
  );
};

export default Appointments;