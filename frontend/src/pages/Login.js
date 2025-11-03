import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom'; // Import Link

// --- Import MUI components ---
import {
  Container,
  Paper,
  Box,
  Typography,
  TextField,
  Button,
  Alert,
  Grid, // For the "Forgot Password" link
  CircularProgress,
} from '@mui/material';

function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  /**
   * @description Handles changes to the form input fields.
   */
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  /**
   * @description Handles the form submission.
   * Sends login credentials to the backend.
   * On success, saves user data and token to localStorage.
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Send a POST request to the backend /login endpoint
      const response = await axios.post('http://localhost:5000/api/auth/login', formData);

      // --- Login Successful ---
      // 1. Save the token and user info to localStorage
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));

      console.log("Login successful:", response.data);
      
      // 2. Navigate to the home page
      navigate('/');
      
      // 3. Force a window reload. This is the simplest way to
      // ensure all components (like the Navbar) re-check localStorage
      // and update to show the user's logged-in state.
      window.location.reload(); 

    } catch (err) {
      // Handle errors (e.g., user not found, wrong password)
      console.error("Login failed:", err.response ? err.response.data : err.message);
      setError(
        err.response?.data?.message || "Login failed. Please check your credentials."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Paper 
        elevation={3} // Adds a nice shadow
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: 4, // Adds internal spacing
        }}
      >
        <Typography component="h1" variant="h5">
          Login
        </Typography>
        
        {/* 'Box' is used as the <form> element */}
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
          <TextField
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
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type="password"
            id="password"
            autoComplete="current-password"
            value={formData.password}
            onChange={handleChange}
          />

          {/* Display error message if login fails */}
          {error && (
            <Alert severity="error" sx={{ mt: 2, width: '100%' }}>
              {error}
            </Alert>
          )}

          <Button
            type="submit"
            fullWidth
            variant="contained" // Gives it the blue background
            disabled={loading}
            sx={{ mt: 3, mb: 2 }} // Adds margin top and bottom
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : "Sign In"}
          </Button>

          {/* Links to Register and Forgot Password */}
          <Grid container>
            <Grid item xs>
              <Button component={Link} to="/forgot-password" size="small">
                Forgot password?
              </Button>
            </Grid>
            <Grid item>
              <Button component={Link} to="/register" size="small">
                {"Don't have an account? Register"}
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Container>
  );
}

export default Login;