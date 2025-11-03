import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

// --- Import MUI components ---
import {
  Container,
  Paper,
  Box,
  Typography,
  TextField,
  Button,
  Alert,
  Grid,
  CircularProgress,
} from '@mui/material';

function CreateEvent() {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    venue: '',
    eventDate: '',
    clubName: ''
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
   * @description Handles the form submission to create a new event.
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // 1. Get the token from localStorage
      const token = localStorage.getItem('token');
      if (!token) {
        setError("You must be logged in to create an event.");
        setLoading(false);
        return;
      }

      // 2. Create the authorization header
      const config = {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      };

      // 3. Send the POST request with form data and the auth header
      // Note: The backend route is '/api/events' (POST)
      await axios.post('http://localhost:5000/api/events', formData, config);
      
      // 4. Navigate to the main events page on success
      alert("Event created successfully! All users have been notified.");
      navigate('/events');

    } catch (err) {
      // Handle errors (e.g., authorization failed, validation failed)
      console.error("Create event failed:", err.response.data);
      setError(err.response.data.message || "Failed to create event.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container component="main" maxWidth="md">
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
          Create a New Event
        </Typography>
        <Typography variant="body2" sx={{ mt: 1, mb: 3 }}>
          Fill in the details below. An email notification will be sent to all verified users.
        </Typography>
        
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3, width: '100%' }}>
          <Grid container spacing={2}>
            {/* Grid layout for the form fields */}
            <Grid item xs={12} sm={6}>
              <TextField
                name="title"
                required
                fullWidth
                id="title"
                label="Event Title"
                autoFocus
                value={formData.title}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                id="clubName"
                label="Club / Organizing Body Name"
                name="clubName"
                value={formData.clubName}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                id="venue"
                label="Venue (e.g., Admin Block, OAT)"
                name="venue"
                value={formData.venue}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                name="eventDate"
                label="Event Date and Time"
                type="datetime-local" // HTML5 datetime picker
                id="eventDate"
                value={formData.eventDate}
                onChange={handleChange}
                InputLabelProps={{
                  shrink: true, // Keeps the label from overlapping
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                id="description"
                label="Event Description"
                name="description"
                multiline
                rows={5}
                value={formData.description}
                onChange={handleChange}
              />
            </Grid>
          </Grid>
          
          {/* Error display */}
          {error && (
            <Alert severity="error" sx={{ mt: 3, width: '100%' }}>
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
            {loading ? <CircularProgress size={24} color="inherit" /> : "Create Event & Notify Users"}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}

export default CreateEvent;