import React, { useState, useEffect } from 'react';
import api from '../api';
import { Card, CardContent, Typography, Button, Box, Grid, Alert, TextField } from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers';
import { useAuth } from '../auth/AuthContext';

const DoctorList = () => {
  const { user } = useAuth();
  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [selectedSlots, setSelectedSlots] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        setLoading(true);
        const response = await api.get('/doctors/');
        console.log('Doctors:', response.data); // Debug API response
        setDoctors(response.data);
      } catch (err) {
        setError(err.message || 'Failed to fetch doctors');
      } finally {
        setLoading(false);
      }
    };

    const fetchAppointments = async () => {
      try {
        const response = await api.get('/appointments/');
        console.log('Appointments:', response.data); // Debug API response
        setAppointments(response.data);
      } catch (err) {
        setError(err.message || 'Failed to fetch appointments');
      }
    };

    if (user) {
      fetchAppointments();
      fetchDoctors();
    }
  }, [user]);

  const bookAppointment = async (doctorId) => {
    const selectedSlot = selectedSlots[doctorId];
    if (!selectedSlot) {
      setError('Please select an appointment time');
      return;
    }

    try {
      await api.post('/appointments/', {
        doctor: doctorId,
        patient: user.id,
        scheduled_datetime: selectedSlot,
        status: 'booked',
      });
      setError('');
      alert('Appointment booked successfully!');
      const response = await api.get('/appointments/');
      setAppointments(response.data);
      setSelectedSlots((prev) => ({ ...prev, [doctorId]: null }));
    } catch (err) {
      setError(err.message || 'Failed to book appointment');
    }
  };

  const filteredDoctors = doctors.filter((doctor) =>
    doctor.specialization.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doctor.user.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doctor.user.last_name.toLowerCase()
  );

  return (
    <Box sx={{ p: 3 }}>
      <TextField
        fullWidth
        label="Search doctors by name or specialization"
        variant="outlined"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        sx={{ mb: 3 }}
      />

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {loading && <Typography>Loading...</Typography>}

      <Typography variant="h5" gutterBottom>
        Your Appointments
      </Typography>
      {appointments.length > 0 ? (
        appointments.map((appointment) => (
          <Box key={`appointment-${appointment.id}`} sx={{ mb: 2 }}>
            <Typography>
              Doctor: {appointment.doctor_name || appointment.doctor}
            </Typography>
            <Typography>
              Date: {new Date(appointment.scheduled_datetime).toLocaleString()}
            </Typography>
            <Typography>
              Status: {appointment.status}
            </Typography>
          </Box>
        ))
      ) : (
        <Typography>No appointments found.</Typography>
      )}

      <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>
        Available Doctors
      </Typography>
      <Grid container spacing={3}>
        {filteredDoctors.map((doctor) => (
          <Grid item xs={12} sm={6} md={4} key={`doctor-${doctor.id}`}>
            <Card>
              <CardContent>
                <Typography variant="h6">
                  Dr. {doctor.user.first_name} {doctor.user.last_name}
                </Typography>
                <Typography color="textSecondary">
                  {doctor.specialization}
                </Typography>
                <Typography variant="body2" sx={{ mt: 2 }}>
                  {doctor.user.email}
                </Typography>
                <Typography variant="body2" sx={{ mt: 2 }}>
                  {doctor.phone}
                </Typography>
                <Typography variant="body2" sx={{ mt: 1 }}>
                  {doctor.hospital}
                </Typography>

                <DateTimePicker
                  key={`picker-${doctor.id}`}
                  label="Select Appointment Time"
                  value={selectedSlots[doctor.id] || null}
                  onChange={(newValue) =>
                    setSelectedSlots((prev) => ({
                      ...prev,
                      [doctor.id]: newValue,
                    }))
                  }
                  sx={{ mt: 2, width: '100%' }}
                />

                <Button
                  variant="contained"
                  fullWidth
                  sx={{ mt: 2 }}
                  onClick={() => bookAppointment(doctor.id)}
                  disabled={!selectedSlots[doctor.id]}
                >
                  Book Appointment
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default DoctorList;