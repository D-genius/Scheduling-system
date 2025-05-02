// src/components/ProfileEdit.js
import React, { useState, useEffect } from 'react';
import { useAuth } from '../auth/AuthContext';
import api from '../api';
import { Box, TextField, Typography, Button, Alert } from '@mui/material';
import Settings from '@mui/icons-material/Settings';
import Header from './Header';
import { styled } from '@mui/system';
import Divider from '@mui/material/Divider';


const StyledContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  maxWidth: 400,
  margin: 'auto',
  marginTop: theme.spacing(8),
  padding: theme.spacing(3),
  boxShadow: theme.shadows[3],
  borderRadius: theme.shape.borderRadius,
}));

const ProfileEdit = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({});
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const endpoint = user.user_type === 'doctor' ? '/doctors/' : '/patients/';
        const response = await api.get(`${endpoint}?user=${user.id}`);
        setFormData(response.data[0]);
      } catch (err) {
        setError(err.message);
      }
    };
    fetchProfile();
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const endpoint = user.user_type === 'doctor' ? `/doctors/${formData.id}/` : `/patients/${formData.id}/`;
      await api.patch(endpoint, {
        phone : formData.phone,
        ...(user.user_type === 'doctor' && { specialization: formData.specialization ,hospital: formData.hospital  }),
        ...(user.user_type === 'patient' && { insurance_number: formData.insurance_number, address: formData.address  })
      });
      setSuccess('Profile updated successfully');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto', mt: 4 }}>
      <div className='header'> 
        <Header />
        <br />
        <Divider sx={{ mb: 5 }} />
      </div>
    <Box component="form" onSubmit={handleSubmit} sx={{ maxWidth: 600, mx: 'auto', mt: 4 }}>  
    <StyledContainer>
          <Settings color="primary" sx={{ fontSize: 40, mb: 2 }} />
          <Typography component="h1" variant="h5" gutterBottom>
            Edit User Profile
          </Typography>
    {/* <Box component="form" onSubmit={handleSubmit} sx={{ maxWidth: 600, mx: 'auto', mt: 4 }}>   */}
      <TextField fullWidth margin="normal" label="Contact Details" multiline
        value={formData.phone || ''}
        onChange={(e) => setFormData({...formData, phone: e.target.value})}
      />

      {user.user_type === 'doctor' && (
        <TextField fullWidth margin="normal" label="Specialization"
          value={formData.specialization || ''}
          onChange={(e) => setFormData({...formData, specialization: e.target.value})}
        />
      )}

      {user.user_type === 'doctor' && (
        <TextField fullWidth margin="normal" label="Hospital"
          value={formData.hospital || ''}
          onChange={(e) => setFormData({...formData, hospital: e.target.value})}
        />
      )}

      {user.user_type === 'patient' && (
        <TextField fullWidth margin="normal" label="Insurance Number"
          value={formData.insurance_number || ''}
          onChange={(e) => setFormData({...formData, insurance_number: e.target.value})}
        />
      )}

      {user.user_type === 'patient' && (
        <TextField fullWidth margin="normal" label="Address"
          value={formData.address || ''}
          onChange={(e) => setFormData({...formData, address: e.target.value})}
        />
      )}

      {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mt: 2 }}>{success}</Alert>}

      <Button type="submit" variant="contained" sx={{ mt: 2 }}>
        Update Profile
      </Button>
      </StyledContainer>
    </Box>
  </Box>
  );
};

export default ProfileEdit;