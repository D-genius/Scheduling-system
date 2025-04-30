import React, { useState, useEffect } from 'react';
import api from '../api';
import { Card, CardContent, Typography, Button, Box, Grid, Alert, TextField } from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers';
import { useAuth } from '../auth/AuthContext';

const DoctorList = () => {
  const { user } = useAuth();
  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch doctors
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        setLoading(true);
        const response = await api.get('/doctors/');
        setDoctors(response.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    // Fetch user's appointments
    const fetchAppointments = async () => {
      try {
        const response = await api.get('/appointments/');
        setAppointments(response.data);
      } catch (err) {
        setError(err.message);
      }
    };

    if (user){
      fetchAppointments();
      fetchDoctors();
    }
  }, [user]);

  const bookAppointment = async (doctorId) => {
    try {
      await api.post('/appointments/', {
        doctor: doctorId,
        patient: user.id, // Assuming user.id is the patient ID
        scheduled_datetime: selectedSlot,
        status: 'booked',
      });
      setError('');
      alert('Appointment booked successfully!');
      const response = await api.get('/appointments/');
      setAppointments(response.data);
    } catch (err) {
      setError(err.message);
    }
  };

  const filteredDoctors = doctors.filter((doctor) =>
      doctor.specialization.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doctor.user.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doctor.user.last_name.toLowerCase().includes(searchTerm.toLowerCase())
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

      <Typography variant="h5" gutterBottom>
        Your Appointments
      </Typography>
      {appointments.length > 0 ? (
        appointments.map((appointment) => (
          <Box key={appointment.id} sx={{ mb: 2 }}>
            <Typography>
              Doctor: {appointment.doctor_name || appointment.doctor}
            </Typography>
            <Typography>
              Date: {new Date(appointment.scheduled_datetime).toLocaleString()}
            </Typography>
            <Typography>Status: {appointment.status}</Typography>
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
          <Grid item xs={12} sm={6} md={4} key={doctor.id}>
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
                  label="Select Appointment Time"
                  value={selectedSlot}
                  onChange={(newValue) => setSelectedSlot(newValue)}
                  sx={{ mt: 2, width: '100%' }}
                />

                <Button
                  variant="contained"
                  fullWidth
                  sx={{ mt: 2 }}
                  onClick={() => bookAppointment(doctor.id)}
                  disabled={!selectedSlot}
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