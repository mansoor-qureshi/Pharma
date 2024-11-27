import React, { useState } from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import logo from '../assets/medimind.png';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import apiConfig from '../apiConfig';
import { getLoggedInUser } from '../common/businesslogic';
import { useAuth } from '../context/AuthContext';

const TopBar = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const navigate = useNavigate()
  const loggedInUser = getLoggedInUser()
  const { logout } = useAuth()


  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleProfileClick = () => {
    // Implement profile click logic
    handleMenuClose();
  };

  const handleLogoutClick = async () => {
    // Implement logout click logic
    try {
      // const response = await axios.post(`${apiConfig.baseURL}/user/api/logout/`, {
      // });
      // console.log(response)
      // window.location.href = '/';
      navigate('/')
      logout()
    } catch (error) {
      console.error('Login error:', error);
      // Handle login error, e.g., display error message
    }
    handleMenuClose();

  };

  return (
    <AppBar position="fixed" style={{ backgroundColor: "white" }}>
      <Toolbar>
        <div style={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
          <img src={logo} alt="Logo" style={{ height: '40px', width: '40px', marginRight: 10, borderRadius: '50%', objectFit: 'cover' }} />
          <Typography variant="h6" component="div" sx={{ color: 'black' }}>
            MediMind
          </Typography>
        </div>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Typography variant="h8" component="div" sx={{ color: 'black' }}>
            {loggedInUser?.username ?? ''}
          </Typography>
          <IconButton
            size="large"
            aria-label="account of current user"
            aria-controls="menu-appbar"
            aria-haspopup="true"
            onClick={handleMenuOpen}
            color="inherit"
            sx={{ color: "black" }} // Set the color to black

          >
            <AccountCircleIcon />
          </IconButton>
          <Menu
            id="menu-appbar"
            anchorEl={anchorEl}
            anchorOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            keepMounted
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
          >
            <MenuItem onClick={handleProfileClick}>{loggedInUser?.username} ({loggedInUser?.role})</MenuItem>
            <MenuItem onClick={handleLogoutClick}>Logout</MenuItem>
          </Menu>
        </div>
      </Toolbar>
    </AppBar>
  );
}

export default TopBar;
