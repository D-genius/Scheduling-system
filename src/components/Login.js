// src/components/Login.js
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import api from '../api';
import {
  Box,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  Grid,
  Link as MuiLink,
  InputAdornment,
  IconButton,
} from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { styled } from '@mui/system';
import { Visibility, VisibilityOff } from '@mui/icons-material';

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

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login, error } = useAuth();
  const [er, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const authResponse = await api.post(
        '/o/token/',
        new URLSearchParams({
          grant_type: 'password',
          username: formData.email,
          password: formData.password,
          client_id: process.env.REACT_APP_CLIENT_ID,
          client_secret: process.env.REACT_APP_CLIENT_SECRET,
        })
      );
      const userResponse = await api.get('/me/', {
        headers: {
          Authorization: `Bearer ${authResponse.data.access_token}`,
        },
      });
      localStorage.setItem('access_token', authResponse.data.access_token);
      await login(formData.email, formData.password);

      if (userResponse.data.user_type === 'patient') {
        navigate('/doctors');
      } else if (userResponse.data.user_type === 'doctor') {
        navigate('/appointments');
      }
    } catch (err) {
      setError(err.response?.data?.error_description || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <StyledContainer>
      <LockOutlinedIcon color="primary" sx={{ fontSize: 40, mb: 2 }} />
      <Typography component="h1" variant="h5" gutterBottom>
        Sign in to Healthcare System
      </Typography>

      <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%', mt: 3 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <TextField
          variant="outlined"
          margin="normal"
          required
          fullWidth
          id="email"
          label="Email Address"
          name="email"
          autoComplete="email"
          autoFocus
          value={formData.email}
          onChange={handleChange}
        />

        <TextField
          variant="outlined"
          margin="normal"
          required
          fullWidth
          name="password"
          label="Password"
          type={showPassword ? 'text' : 'password'}
          id="password"
          autoComplete="current-password"
          value={formData.password}
          onChange={handleChange}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  aria-label="toggle password visibility"
                  onClick={handleClickShowPassword}
                  edge="end"
                  sx={{ color: 'text.secondary' }}
                >
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />

        <Button
          type="submit"
          fullWidth
          variant="contained"
          color="primary"
          sx={{ mt: 3, mb: 2 }}
          disabled={loading}
        >
          {er && <Alert severity="error">{er}</Alert>}
          {loading ? <CircularProgress size={24} /> : 'Sign In'}
        </Button>

        <Grid container justifyContent="flex-end">
          <Grid>
            <MuiLink component={Link} to="/signup" variant="body2">
              Don't have an account? Sign Up
            </MuiLink>
          </Grid>
        </Grid>

        <Grid container justifyContent="space-between" sx={{ mt: 2 }}>
          <Grid>
            <MuiLink component={Link} to="/forgot-password" variant="body2">
              Forgot password?
            </MuiLink>
          </Grid>
          <Grid>
            <MuiLink component={Link} to="/help" variant="body2">
              Need help?
            </MuiLink>
          </Grid>
        </Grid>
      </Box>

      <Box sx={{ mt: 4, textAlign: 'center' }}>
        <Typography variant="body2" color="textSecondary">
          Secure login powered by OAuth
        </Typography>
      </Box>
    </StyledContainer>
  );
};

export default Login;