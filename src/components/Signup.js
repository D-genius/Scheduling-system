// src/components/Signup.js
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api';
import { Box, TextField, Button, Select, MenuItem, FormControl, InputLabel, Alert, Typography, Grid, Link as MuiLink } from '@mui/material';
import LocalHospital from '@mui/icons-material/LocalHospital';
import { styled } from '@mui/system';

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

const Signup = () => {
  const [userType, setUserType] = useState('patient');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    first_name: '',
    last_name: '',
    phone: '',
    specialization: '',
    hospital:'',
    insurance_number: '',
    id_number: '',
    address: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const endpoint = userType === 'doctor' ? '/doctors/' : '/patients/';
      await api.post(endpoint, {
        user: {
          email: formData.email,
          password: formData.password,
          first_name: formData.first_name,
          last_name: formData.last_name,
          user_type: userType
        },
        ...(userType === 'doctor' && {
          phone: formData.phone,
          specialization: formData.specialization,
          hospital: formData.hospital
        }),
        ...(userType === 'patient' && {
          phone: formData.phone,
          insurance_number: formData.insurance_number,
          id_number: formData.id_number,
          address: formData.address

        }),
        auth: {
          username: process.env.REACT_APP_CLIENT_ID,
          password: process.env.REACT_APP_CLIENT_SECRET,
        }
      });
      navigate('/login');
      setSuccess(`${userType} added successfully`);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
  <StyledContainer>
          <LocalHospital color="primary" sx={{ fontSize: 40, mb: 2 }} />
          <Typography component="h1" variant="h5" gutterBottom>
            Sign up to Healthcare System
          </Typography>

    <Box component="form" onSubmit={handleSubmit} sx={{ maxWidth: 400, mx: 'auto', mt: 4 }}>
      <FormControl fullWidth margin="normal">
        <InputLabel>Account Type</InputLabel>
        <Select
          value={userType}
          onChange={(e) => setUserType(e.target.value)}
          label="Account Type"
        >
          <MenuItem value="patient">Patient</MenuItem>
          <MenuItem value="doctor">Doctor</MenuItem>
        </Select>
      </FormControl>

      <TextField fullWidth margin="normal" label="Email" type="email" required
        value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />

      <TextField fullWidth margin="normal" label="Password" type="password" required
        value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} />

      <TextField fullWidth margin="normal" label="First Name" required
        value={formData.first_name} onChange={(e) => setFormData({...formData, first_name: e.target.value})} />

      <TextField fullWidth margin="normal" label="Last Name" required
        value={formData.last_name} onChange={(e) => setFormData({...formData, last_name: e.target.value})} />

      {userType === 'doctor' && (
        <TextField fullWidth margin="normal" label="Specialization" required
          value={formData.specialization} onChange={(e) => setFormData({...formData, specialization: e.target.value})} />
      )}

      {userType === 'doctor' && (
        <TextField fullWidth margin="normal" label="Hospital" required
          value={formData.hospital} onChange={(e) => setFormData({...formData, hospital: e.target.value})} />
      )}  

      {userType === 'patient' && (
        <TextField fullWidth margin="normal" label="Insurance Number" required
          value={formData.insurance_number} onChange={(e) => setFormData({...formData, insurance_number: e.target.value})} />
      )}

      {userType === 'patient' && (
        <TextField fullWidth margin="normal" label="ID Number" required
          value={formData.id_number} onChange={(e) => setFormData({...formData, id_number: e.target.value})} />
      )}

      {userType === 'patient' && (
        <TextField fullWidth margin="normal" label="Address" required
          value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} />
      )}

      <TextField fullWidth margin="normal" label="Contact Details" required multiline
        value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} />

      {success && <Alert severity="success" sx={{ mt: 2 }}>{success}</Alert>}
      {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}

      <Button type="submit" variant="contained" fullWidth sx={{ mt: 3 }}>
        Sign Up
      </Button>
      <Grid container justifyContent="flex-end">
        <Grid>
          <MuiLink component={Link} to="/login" variant="body2">
            Have an account? Sign In
          </MuiLink>
        </Grid>
      </Grid>
    </Box>
  </StyledContainer>
  );
};

export default Signup;