import React, { useState, useEffect, useRef } from 'react';
import api from '../api';
import Header from './Header';
import { Card, CardContent, Typography, Button, Box, Grid, Alert, TextField ,InputAdornment, Paper, List, ListItem, ListItemText, CircularProgress } from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers';
import { useAuth } from '../auth/AuthContext';
import Divider from '@mui/material/Divider';
import SearchIcon from '@mui/icons-material/Search';



const DoctorList = () => {
  const { user } = useAuth();
  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [selectedSlots, setSelectedSlots] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState([]);
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

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

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

  const handleSearch = async (e) => {
    const value = e.target.value;
    setSearchTerm(value);

    try {
      const res = await fetch(`/doctors?search=${encodeURIComponent(value)}`);
      const data = await res.json();
      setResults(data); // assume API returns an array of doctors
      setOpen(true);

    } catch (error) {
      console.error('Search error:', error);
    }
  };

  const handleSelect = (doctor) => {
    console.log('Selected doctor:', doctor.user);
    setSearchTerm(doctor.user.first_name);
    setOpen(false);
  };


  return (
    <Box sx={{ p: 3 }}>
    <div className='header'>
      <Header/>
      <br />
      <Divider />
      <br />
    </div>
      <TextField
        fullWidth
        label="Search doctors by name or specialization"
        variant="outlined"
        value={searchTerm}
        onChange={handleSearch}
        size="small"
        sx={{ width: '250px' }} 
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
        }}
        // onChange={(e) => setSearchTerm(e.target.value)}
        // sx={{ mb: 3 }}
      />

      {open && results.length > 0 && (
        <Paper
          elevation={3}
          sx={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            zIndex: 1,
            maxHeight: 200,
            overflowY: 'auto',
          }}
        >
          <List dense>
            {results.map((doctor) => (
              <ListItem
                button
                key={doctor.id}
                onClick={() => handleSelect(doctor)}
              >
              <ListItemText primary={doctor.first_name} secondary={doctor.specialty} />
              </ListItem>
            ))}
          </List>
        </Paper>
      )}

      <Typography variant="h5" gutterBottom>
        Your Appointments
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {loading && <Typography> <CircularProgress /> </Typography>}
      
      {appointments.length > 0 ? (
        appointments.map((appointment) => (
          <Box key={`appointment-${appointment.id}`} sx={{ mb: 2 }}>
            <Typography>
              Doctor: {appointment.doctor}
            </Typography>
            <Typography>
              Patient: {appointment.patient}
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

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {loading && <Typography> <CircularProgress /> </Typography>}

      {filteredDoctors.length === 0 && (
        <Typography>No doctors found.</Typography>
      )}
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