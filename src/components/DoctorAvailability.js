import React, { useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import api from '../api';
import Header from './Header';
import { DateTimePicker } from '@mui/x-date-pickers';
import { Button, Box, Alert, Stack, Typography, CircularProgress } from '@mui/material';
import Divider from '@mui/material/Divider';

const DoctorAvailability = () => {
  const { user } = useAuth();
  const [availability, setAvailability] = useState({
    start_datetime: null,
    end_datetime: null,
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    if (!availability.start_datetime || !availability.end_datetime) {
      setError('Please select both start and end times');
      return;
    }
    try {
      setLoading(true);
      const accessToken = localStorage.getItem('access_token');
      if (!accessToken) throw new Error('No access token found. Please log in.');
      
    // Use ISO string format for datetime and validate time order
    const start = new Date(availability.start_datetime).toISOString();
    const end = new Date(availability.end_datetime).toISOString();
    
    if (start >= end) {
      throw new Error('End time must be after start time');
    }
      await api.post('/availability/',
        {
          doctor: user.doctor_id,
          start_datetime: start,
          end_datetime: end,
          status: 'available',
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      setSuccess('Availability added successfully');
      setError('');
      setAvailability({ start_datetime: null, end_datetime: null });
    } catch (err) {
      setError(err.message || 'Failed to add availability');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto', mt: 4 }}>
      <div className='header'>
        <Header />
        <br />
        <Divider />
      </div>

      <Typography variant="h4" gutterBottom>
        Set Doctor Availability
      </Typography>
      <Box component="form" onSubmit={handleSubmit}>
        <Stack spacing={3}>
          <DateTimePicker
            label="Start Time"
            value={availability.start_datetime}
            onChange={(newValue) =>
              setAvailability({ ...availability, start_datetime: newValue })
            }
            sx={{ width: '100%' }}
          />
          <DateTimePicker
            label="End Time"
            value={availability.end_datetime}
            onChange={(newValue) =>
              setAvailability({ ...availability, end_datetime: newValue })
            }
            minDateTime={availability.start_datetime} // Fixed to use start_datetime
            sx={{ width: '100%' }}
          />
          {error && (
            <Alert severity="error" onClose={() => setError('')}>
              {error}
            </Alert>
          )}
          {success && (
            <Alert severity="success" onClose={() => setSuccess('')}>
              {success}
            </Alert>
          )}
          <Button
            type="submit"
            variant="contained"
            size="large"
            disabled={loading || !availability.start_datetime || !availability.end_datetime}
          >
            {loading ? <CircularProgress size={24} /> : 'Add Availability'}
          </Button>
        </Stack>
      </Box>
    </Box>
  );
};

export default DoctorAvailability;