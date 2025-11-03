import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, useParams, Link } from 'react-router-dom'; // useParams to read the token from the URL

// --- Import MUI components ---
import {
  Container,
  Paper,
  Box,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Grid,
} from '@mui/material';

function ResetPassword() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);

  const { token } = useParams(); // Get the token from the URL (e.g., /reset-password/THIS_TOKEN)
  const navigate = useNavigate();

  /**
   * @description Handles the submission of the new password.
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // Frontend validation
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    setLoading(true);

    try {
      // Send a PUT request to the backend /reset-password endpoint
      const response = await axios.put(
        `http://localhost:5000/api/auth/reset-password/${token}`, 
        { password } // Send the new password in the body
      );

      // Show success message
      setSuccess(response.data.message + " You can now log in.");
      setError(null);
      setLoading(false);
      
      // Redirect to login page after a few seconds
      setTimeout(() => {
        navigate('/login');
      }, 3000);

    } catch (err) {
      // Handle errors (e.g., invalid token, expired token)
      console.error("Reset password failed:", err.response.data);
      setError(err.response.data.message || "Error resetting password.");
      setSuccess(null);
      setLoading(false);
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Paper 
        elevation={3}
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: 4,
        }}
      >
        <Typography component="h1" variant="h5">
          Reset Password
        </Typography>
        <Typography variant="body2" sx={{ mt: 2, textAlign: 'center' }}>
          Enter your new password below.
        </Typography>
        
        {/* We only show the form if the password hasn't been successfully reset yet */}
        {!success ? (
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1, width: '100%' }}>
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="New Password"
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoFocus
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="confirmPassword"
              label="Confirm New Password"
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />

            {/* Show error message */}
            {error && (
              <Alert severity="error" sx={{ mt: 2, width: '100%' }}>
                {error}
              </Alert>
            )}

            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={loading}
              sx={{ mt: 3, mb: 2 }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : "Reset Password"}
            </Button>
          </Box>
        ) : (
          // Show success message and link to login
          <>
            <Alert severity="success" sx={{ mt: 3, width: '100%' }}>
              {success}
            </Alert>
            <Grid container justifyContent="flex-end" sx={{ mt: 2 }}>
                <Grid item>
                <Button component={Link} to="/login" size="small">
                    Back to Login
                </Button>
                </Grid>
            </Grid>
          </>
        )}
      </Paper>
    </Container>
  );
}

export default ResetPassword;