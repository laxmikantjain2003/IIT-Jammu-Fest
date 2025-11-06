import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams, Link } from 'react-router-dom';

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

function EditEvent() {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    venue: '',
    eventDate: '',
    clubName: ''
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true); // Start true to fetch data
  const navigate = useNavigate();
  const { id } = useParams(); // URL se event ID lene ke liye

  // 1. Fetch existing event data on load
  useEffect(() => {
    const fetchEvent = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`http://localhost:5000/api/events/${id}`);
        const event = response.data;

        // Datetime-local format ke liye date ko format karein
        const formattedDate = new Date(event.eventDate).toISOString().slice(0, 16);
        
        // Form ko purane data se bharein
        setFormData({
          title: event.title,
          description: event.description,
          venue: event.venue,
          eventDate: formattedDate,
          clubName: event.clubName,
        });
      } catch (err) {
        setError("Failed to load event data for editing.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
  }, [id]);

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
   * @description Handles the form submission to update the event.
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // 1. Get token and config
      const token = localStorage.getItem('token');
      if (!token) {
        setError("Authorization failed. Please log in again.");
        setLoading(false);
        return;
      }
      
      const config = {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      };

      // 2. Send a PUT request to update
      await axios.put(`http://localhost:5000/api/events/${id}`, formData, config);

      alert("Event details updated successfully!");
      
      // Navigate back to the event details page to see changes
      navigate(`/events/${id}`); 

    } catch (err) {
      console.error("Update event failed:", err.response?.data);
      setError(err.response?.data?.message || "Failed to update event. Check authorization.");
    } finally {
      setLoading(false);
    }
  };

  // --- Render Logic ---
  if (loading && !formData.title) { 
      return (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}>
              <CircularProgress />
          </Box>
      );
  }

  if (error && !formData.title) {
    return <Alert severity="error" sx={{ mt: 4 }}>{error}</Alert>;
  }

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
          bgcolor: 'background.paper',
        }}
      >
        <Typography component="h1" variant="h5">
          Edit Event: {formData.title}
        </Typography>
        
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3, width: '100%' }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                name="title"
                required
                fullWidth
                id="title"
                label="Event Title"
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
                type="datetime-local"
                id="eventDate"
                value={formData.eventDate}
                onChange={handleChange}
                InputLabelProps={{
                  shrink: true, 
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
            {loading ? <CircularProgress size={24} color="inherit" /> : "Save Changes"}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}

export default EditEvent;