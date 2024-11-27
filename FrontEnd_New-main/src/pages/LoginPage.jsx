import React from 'react';
import Avatar from '@mui/material/Avatar';
import CssBaseline from '@mui/material/CssBaseline';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Link from '@mui/material/Link';
import Box from '@mui/material/Box';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import axios from 'axios';
import apiConfig from '../apiConfig';
import { useNavigate } from 'react-router-dom';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import { basePath } from '../constants/ApiPaths';
import { toast } from 'react-toastify';
import Spinner from '../custom/Spinner';
import { useState, useEffect } from 'react';
import {
  TextField, Button,
  Grid, IconButton
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { useAuth } from '../context/AuthContext';

function Copyright(props) {
  return (
    <Typography variant="body2" color="text.secondary" align="center" {...props}>
      {'Copyright © '}
      <Link color="inherit" href="/">
        Medimind
      </Link>{' '}
      {new Date().getFullYear()}
      {'.'}
    </Typography>
  );
}


const defaultTheme = createTheme();

function LoginPage() {
  const [open, setOpen] = React.useState(false);
  const [loggedIn, setLoggedIn] = React.useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  })
  const [formErrors, setFormErrors] = useState({});

  const { loginInfo, login } = useAuth()
  const navigate = useNavigate()

  // useEffect(() => {
  //   if (loginInfo.isLoggedIn) {
  //     const role = loginInfo?.user?.role
  //     if (role === 'admin' || role === 'doctor') {
  //       navigate("/dashboard")
  //     }
  //     if (role === 'pharmacist') {
  //       navigate("/pharmacist")
  //     }
  //   }
  // }, [])

  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }

    setOpen(false);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    let errors = {}
    Object.entries(formData).forEach(([key, value]) => {
      if (value.trim() === '') {
        errors[key] = 'This field is required';
      }
    })

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      setIsLoading(true)
      const response = await axios.post(`${basePath}/api/token/`, {
        username: formData.username,
        password: formData.password
      });

      setLoggedIn(true);
      login(response.data)
      if (response.data.role === 'admin' || response.data.role === 'doctor') {
        navigate("/dashboard")
      }
      if (response.data.role === 'pharmacist') {
        navigate("/pharmacist")
      }




    } catch (error) {
      console.error('Login error:', error);
      if (error.response.status === 401) {
        toast.error(error.response.data.detail)
      }
      if (error.response.status === 400) {
        const errorObject = error.response.data
        let errorOccured = false

        Object.keys(errorObject).forEach((key) => {
          if (!errorOccured) {
            toast.error(errorObject[key][0])
            errorOccured = true
            return
          }
        })
      }
    } finally {
      setIsLoading(false)
    }
  };

  const handleChange = (event) => {
    const { name, value } = event.target

    if (formErrors[name]) {
      setFormErrors({ ...formErrors, [name]: "" })
    }
    setFormData({ ...formData, [name]: value })
  }

  return (
    <ThemeProvider theme={defaultTheme}>
      {isLoading && <Spinner />}
      <Container component="main" maxWidth="xs" className='p-1 rounded-lg shadow-lg bg-[#ffffff]'>
        {/* <CssBaseline /> */}
        <Box
          sx={{
            marginTop: 8,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
            <LockOutlinedIcon />
          </Avatar>
          <Typography component="h1" variant="h5">
            Sign in
          </Typography>
          <div className='flex flex-col w-full gap-5 mt-5'>

            <TextField
              label="UserName"
              fullWidth
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              error={!!formErrors.username}
              helperText={formErrors.username}
              required
            />

            <TextField
              label="Password"
              fullWidth
              type={showPassword ? 'text' : 'password'}
              name="password"
              value={formData.password}
              onChange={handleChange}
              InputProps={{
                endAdornment: (
                  <IconButton onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <VisibilityIcon /> : <VisibilityOffIcon />}
                  </IconButton>
                )
              }}
              error={!!formErrors.password}
              helperText={formErrors.password}
              required

            />
          </div>

          <div className='w-full mt-4'>
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              onClick={handleSubmit}
            >
              Sign In
            </Button>
            <Grid container>
              <Grid item xs>
                <Link href="#" variant="body2">
                  Forgot password?
                </Link>
              </Grid>
              {/* <Grid item>
                <Link href="#" variant="body2">
                  {"Don't have an account? Sign Up"}
                </Link>
              </Grid> */}
            </Grid>
          </div>

        </Box>
        <Copyright sx={{ mt: 8, mb: 4 }} />
      </Container>
    </ThemeProvider>
  );
}

export default LoginPage;