// src/components/DoctorAvailability.js
import React, { useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import api from '../api';
import { DateTimePicker } from '@mui/x-date-pickers';
import { Button, Box, Alert, Stack } from '@mui/material';

const DoctorAvailability = () => {
  const { user } = useAuth();
  const [availability, setAvailability] = useState({
    start_datetime: null,
    end_datetime: null
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/availability/', {
        doctor: user.doctor.id,
        ...availability
      });
      setSuccess('Availability added successfully');
      setAvailability({ start_datetime: null, end_datetime: null });
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ maxWidth: 600, mx: 'auto', mt: 4 }}>
      <Stack spacing={3}>
        <DateTimePicker
          label="Start Time"
          value={availability.start_datetime}
          onChange={(newValue) => setAvailability({...availability, start_datetime: newValue})}
        />

        <DateTimePicker
          label="End Time"
          value={availability.end_datetime}
          onChange={(newValue) => setAvailability({...availability, end_datetime: newValue})}
          minDateTime={availability.end_datetime}
        />

        {error && <Alert severity="error">{error}</Alert>}
        {success && <Alert severity="success">{success}</Alert>}

        <Button type="submit" variant="contained" size="large">
          Add Availability
        </Button>
      </Stack>
    </Box>
  );
};

export default DoctorAvailability;