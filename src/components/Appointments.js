import React, { useState, useEffect } from 'react';
import api from '../api';
import { useAuth } from '../auth/AuthContext';
import { Button, CircularProgress, Alert, Box, Typography } from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers';

const Appointments = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [editAppointment, setEditAppointment] = useState(null); // For editing an appointment
  const [newScheduleDate, setNewScheduleDate] = useState(null); // For creating/updating scheduled_datetime
  const [newFollowDate, setNewFollowDate] = useState(null); // For creating/updating follow_up_datetime
  
  useEffect(() => {
    //Fetch appointments
    const fetchAppointments = async () => {
      try {
        setLoading(true);
        const accessToken = localStorage.getItem('access_token');
        const response = await api.get('/appointments/',{
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },  
        });
        setAppointments(response.data);
        console.log ("Appointment list:", response.data)
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    //Fetch appointments
    if (user) {
      fetchAppointments();
    }
  }, [user]);

  // Create a new appointment (Create - POST /appointments/)
  const bookAppointment = async (doctorId, scheduleDate,followDate ) => {
    try {
      setLoading(true);
      const payload = {
        doctor: doctorId,
        patient: user.user_type === 'patient' ? user.id : null, // Assuming user.id is the patient ID
        scheduled_datetime: scheduleDate,
        follow_up_datetime: followDate,
        status: 'booked', // Default status
      };
      await api.post('/appointments/', payload);
      setSuccess('Appointment booked successfully!');
      const response = await api.get('/appointments/');
      setAppointments(response.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Update an appointment (Update - PATCH /appointments/{id}/)
  const updateAppointment = async (appointmentId) => {
    try {
      setLoading(true);
      const payload = {
        scheduled_datetime: newScheduleDate,
        follow_up_datetime: newFollowDate,
        status: 'booked', // You can add a status field in the UI if needed
      };
      await api.patch(`/appointments/${appointmentId}/`, payload);
      setSuccess('Appointment updated successfully!');
      setEditAppointment(null);
      setNewScheduleDate(null);
      setNewFollowDate(null);

      const response = await api.get('/appointments/');
      setAppointments(response.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Delete an appointment (Delete - DELETE /appointments/{id}/)
  const deleteAppointment = async (appointmentId) => {
    try {
      setLoading(true);
      await api.delete(`/appointments/${appointmentId}/`);
      setSuccess('Appointment deleted successfully!');
      const response = await api.get('/appointments/');
      setAppointments(response.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Book Appointments
      </Typography>

      {error && (
        <Alert severity="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      )}

      {loading ? (
        <CircularProgress />
      ) : (
        <div className="appointments-list">
          {appointments.map((appointment) => (
            <Box
              key={appointment.id}
              sx={{
                border: '1px solid #ccc',
                p: 2,
                mb: 2,
                borderRadius: 2,
              }}
            >
              <Typography variant="h6">
                Doctor: {appointment.doctor}
              </Typography>
              <Typography>
                Date: {new Date(appointment.scheduled_datetime).toLocaleString()}
              </Typography>
              <Typography>
                Follow up: {new Date(appointment.follow_up_datetime).toLocaleDateString()}
              </Typography>
              <Typography>Status: {appointment.status}</Typography>

              {/* Edit Appointment */}
              {editAppointment === appointment.id ? (
                <Box sx={{ mt: 2 }}>
                  <DateTimePicker
                    label="Update Appointment Time"
                    value={newScheduleDate}
                    onChange={(newValue) => setNewScheduleDate(newValue)}
                    sx={{ mb: 2, width: '100%' }}
                  />
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => updateAppointment(appointment.id)}
                    sx={{ mr: 1 }}
                  >
                    Save
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={() => setEditAppointment(null)}
                  >
                    Cancel
                  </Button>
                </Box>
              ) : (
                <Box sx={{ mt: 2 }}>
                  {/* Book Button (for available slots) */}
                  {appointment.status === 'available' && (
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() =>
                        bookAppointment(appointment.doctor, appointment.scheduled_datetime, appointment.follow_up_datetime)
                      }
                      sx={{ mr: 1 }}
                    >
                      Book Now
                    </Button>
                  )}
                  {/* Edit Button */}
                  <Button
                    variant="outlined"
                    color="secondary"
                    onClick={() => {
                      setEditAppointment(appointment.id);
                      setNewScheduleDate(new Date(appointment.scheduled_datetime));
                    }}
                    sx={{ mr: 1 }}
                  >
                    Edit
                  </Button>
                  {/* Delete Button */}
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
          ))}
        </div>
      )}
    </Box>
  );
};

export default Appointments;