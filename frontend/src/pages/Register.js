import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

// --- Import MUI components ---
import {
  Container,
  Paper,
  Box,
  Typography,
  TextField,
  Button,
  Alert,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid,
  CircularProgress,
  Divider,
} from '@mui/material';

function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    mobile: '', 
    role: 'student', 
  });
  const [otp, setOtp] = useState('');
  
  // 1: Name/Email, 2: OTP Sent, 3: Verified (Ready for Final Submit)
  const [stage, setStage] = useState(1); 
  
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate(); 

  /**
   * @description Handles changes for all form fields.
   */
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  /**
   * @description STAGE 1 SUBMIT: Sends Name and Email to the backend to request an OTP.
   */
  const handleSendOTP = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    if (!formData.name || !formData.email) {
      setError("Please enter your name and email address.");
      setLoading(false);
      return;
    }
    
    try {
      // Call the 'send-otp' endpoint
      const response = await axios.post('http://localhost:5000/api/auth/send-otp', {
        email: formData.email,
        name: formData.name
      });

      setSuccess(response.data.message + " Please enter the code below.");
      setStage(2); // Move to OTP verification stage
    } catch (err) {
      console.error("Send OTP failed:", err.response.data);
      setError(err.response.data.message || "Failed to send OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  /**
   * @description STAGE 2 SUBMIT: Verifies the OTP with the backend.
   */
  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      // Call the 'verify-email-otp' endpoint
      await axios.post('http://localhost:5000/api/auth/verify-email-otp', {
        email: formData.email,
        otp: otp
      });

      setSuccess("Email verified successfully! You can now complete your registration.");
      setStage(3); // Move to the Final Submission stage
      setError(null); 
    } catch (err) {
      console.error("OTP verification failed:", err.response.data);
      setError(err.response.data.message || "Verification failed. Check your OTP.");
    } finally {
      setLoading(false);
    }
  };

  /**
   * @description STAGE 3 SUBMIT: Sends all data (including password, mobile) to create the user.
   */
  const handleFinalRegistration = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long.");
      setLoading(false);
      return;
    }

    try {
      // Call the final 'register' endpoint
      await axios.post('http://localhost:5000/api/auth/register', formData);

      alert("Account created successfully! You can now log in.");
      
      // Redirect to login page
      navigate('/login');

    } catch (err) {
      console.error("Final registration failed:", err.response.data);
      setError(err.response.data.message || "Final registration failed. Please try again.");
    } finally {
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
        <Typography component="h1" variant="h5" sx={{mb: 2}}>
          Account Registration
        </Typography>

        {/* --- Global Error/Success Messages --- */}
        {error && (
            <Alert severity="error" sx={{ mb: 2, width: '100%' }}>{error}</Alert>
        )}
        {success && (
            <Alert severity="success" sx={{ mb: 2, width: '100%' }}>{success}</Alert>
        )}
        
        {/* --- MAIN FORM --- */}
        {/* The submit handler changes based on the current stage */}
        <Box 
          component="form" 
          onSubmit={
            stage === 1 ? handleSendOTP : 
            stage === 2 ? handleVerifyOTP : 
            handleFinalRegistration
          } 
          sx={{ mt: 1, width: '100%' }}
        >
            <Grid container spacing={2}>
                {/* --- STAGE 1: NAME AND EMAIL --- */}
                <Grid item xs={12}>
                    <TextField 
                      required 
                      fullWidth 
                      label="Full Name" 
                      name="name" 
                      value={formData.name} 
                      onChange={handleChange} 
                      autoFocus
                      disabled={stage > 1} // Disable after Stage 1
                    />
                </Grid>
                
                <Grid item xs={12}>
                    <TextField 
                      required 
                      fullWidth 
                      label="Email Address" 
                      name="email" 
                      value={formData.email} 
                      onChange={handleChange} 
                      disabled={stage > 1} // Disable after Stage 1
                    />
                </Grid>

                {/* --- STAGE 1 BUTTON --- */}
                {stage === 1 && (
                    <Grid item xs={12}>
                        <Button 
                            type="submit" 
                            fullWidth 
                            variant="contained" 
                            disabled={loading} 
                            sx={{ mt: 1 }}
                        >
                            {loading ? <CircularProgress size={24} color="inherit" /> : "Send Verification Code"}
                        </Button>
                    </Grid>
                )}
                
                {/* --- STAGE 2: OTP VERIFICATION --- */}
                {/* This section appears in Stage 2 */}
                {stage >= 2 && (
                    <Grid item xs={12} sx={{ py: 1 }}>
                        <Divider sx={{ mb: 2 }}>
                          <Typography variant="caption">Verify Email</Typography>
                        </Divider>
                        <TextField 
                            required 
                            fullWidth 
                            label="6-Digit Verification Code" 
                            name="otp" 
                            value={otp} 
                            onChange={(e) => setOtp(e.target.value)} 
                            inputProps={{ maxLength: 6 }}
                            disabled={stage > 2} // Disable after Stage 2
                        />
                        {/* Show Verify button only in Stage 2 */}
                        {stage === 2 && (
                          <Button 
                              type="submit"
                              fullWidth 
                              variant="outlined" 
                              disabled={loading}
                              sx={{ mt: 1 }}
                          >
                              {loading ? <CircularProgress size={24} /> : "Verify Code"}
                          </Button>
                        )}
                        <Divider sx={{ mt: 2 }} />
                    </Grid>
                )}

                {/* --- STAGE 3: FINAL DETAILS --- */}
                {/* These fields are visible but disabled until Stage 3 */}
                <Grid item xs={12}>
                    <TextField 
                        required 
                        fullWidth 
                        label="Password" 
                        name="password" 
                        type="password" 
                        value={formData.password} 
                        onChange={handleChange}
                        // disabled={stage < 3} // Enabled only after verification
                    />
                </Grid>

                <Grid item xs={12}>
                    <TextField 
                        fullWidth 
                        label="Mobile Number (Optional)" 
                        name="mobile" 
                        value={formData.mobile} 
                        onChange={handleChange} 
                        // disabled={stage < 3}
                    />
                </Grid>

                <Grid item xs={12}>
                    <FormControl fullWidth disabled={stage < 3}>
                        <InputLabel id="role-select-label">Register as</InputLabel>
                        <Select
                            labelId="role-select-label"
                            name="role"
                            value={formData.role}
                            label="Register as"
                            onChange={handleChange}
                        >
                            <MenuItem value="student">Student</MenuItem>
                            <MenuItem value="coordinator">Club Coordinator</MenuItem>
                        </Select>
                    </FormControl>
                </Grid>
                
                {/* --- FINAL REGISTER BUTTON (Visible in Stage 3) --- */}
                {stage === 3 && (
                    <Grid item xs={12}>
                         <Button 
                            type="submit" 
                            fullWidth 
                            variant="contained" 
                            disabled={loading} 
                            sx={{ mt: 2 }}
                        >
                            {loading ? <CircularProgress size={24} color="inherit" /> : "Complete Registration"}
                        </Button>
                    </Grid>
                )}
            </Grid>
            
            <Grid container justifyContent="flex-end" sx={{ mt: 2 }}>
                <Grid item>
                    <Button component={Link} to="/login" size="small">
                        Already have an account? Login
                    </Button>
                </Grid>
            </Grid>
        </Box>
      </Paper>
    </Container>
  );
}

export default Register;