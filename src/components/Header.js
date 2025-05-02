import React, { useState } from 'react';
import { AppBar, Toolbar, Button, Menu, MenuItem, Typography, Avatar} from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import PersonIcon from '@mui/icons-material/Person';

const Header = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
    handleMenuClose();
  };

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          Healthcare System
        </Typography>

        <Button color="inherit" component={Link} to="/">
          Home
        </Button>
        
        {user?.user_type === 'doctor' && (
          <Button color="inherit" component={Link} to="/doctor-availability" borderRadius={50} hoverEffect="true">
            Availability
          </Button>
        )}
        
        {user?.user_type === 'doctor' && (
        <Button color="inherit" component={Link} to="/appointments">
          Appointments
        </Button>
        )}

        {user?.user_type === 'patient' && (
          <Button color="inherit" component={Link} to="/doctors">
            Doctors
          </Button>
        )}

        <Button 
          color="inherit" 
          onClick={handleMenuOpen}
          aria-controls="profile-menu" 
          aria-haspopup="true"
        >
        <span>Welcome , {user?.user_type}</span>

        <Avatar sx={{ ml: 1 }}>
          {user?.first_name}{user?.last_name}
        <PersonIcon sx={{ ml: 1 }} />
        </Avatar>

        </Button>
        
        <Menu
          id="profile-menu"
          anchorEl={anchorEl}
          keepMounted
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
        >
          <MenuItem component={Link} to="/profile" onClick={handleMenuClose}>
            Edit Profile
          </MenuItem>
          <MenuItem onClick={handleLogout}>Logout</MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
};

export default Header;