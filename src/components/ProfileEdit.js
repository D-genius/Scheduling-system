// src/components/ProfileEdit.js
import React, { useState, useEffect } from 'react';
import { useAuth } from '../auth/AuthContext';
import api from '../api';
import { Box, TextField, Button, Alert } from '@mui/material';

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
        contact_details: formData.contact_details,
        ...(user.user_type === 'doctor' && { specialization: formData.specialization }),
        ...(user.user_type === 'patient' && { insurance_number: formData.insurance_number })
      });
      setSuccess('Profile updated successfully');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ maxWidth: 600, mx: 'auto', mt: 4 }}>
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

      {user.user_type === 'patient' && (
        <TextField fullWidth margin="normal" label="Insurance Number"
          value={formData.insurance_number || ''}
          onChange={(e) => setFormData({...formData, insurance_number: e.target.value})}
        />
      )}

      {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mt: 2 }}>{success}</Alert>}

      <Button type="submit" variant="contained" sx={{ mt: 2 }}>
        Update Profile
      </Button>
    </Box>
  );
};

export default ProfileEdit;