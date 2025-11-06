import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate, Link } from 'react-router-dom';

// --- Import MUI components ---
import {
  Container,
  Typography,
  Box,
  Paper,
  CircularProgress,
  Alert,
  Divider,
  Button,
  Grid,
} from '@mui/material';
import EventIcon from '@mui/icons-material/Event';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import GroupsIcon from '@mui/icons-material/Groups';
import PersonIcon from '@mui/icons-material/Person';

function EventDetail() {
  const [event, setEvent] = useState(null);
  const [user, setUser] = useState(null); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { id } = useParams(); // URL se event ID lene ke liye
  const navigate = useNavigate();

  // 1. Fetch event details on component load
  useEffect(() => {
    // Check who is logged in
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
        setUser(JSON.parse(storedUser));
    }
    
    const fetchEvent = async () => {
      try {
        setLoading(true);
        // Naya API route call karein
        const response = await axios.get(`http://localhost:5000/api/events/${id}`);
        setEvent(response.data);
      } catch (err) {
        console.error("Error fetching event details:", err);
        setError("Failed to load event details.");
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
  }, [id]); 

  // Check if the current user is the owner of the event
  const isEventOwner = user && event && (user.id === event.coordinatorId || user.role === 'admin');

  // --- Render Logic ---
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}>
        <CircularProgress sx={{ color: 'white' }} />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  if (!event) {
    return <Alert severity="warning">Event not found.</Alert>;
  }

  return (
    <Container component="main" maxWidth="md">
      {/* Yeh page solid white background use karega */}
      <Paper elevation={3} sx={{ padding: { xs: 2, md: 4 }, mt: 4, bgcolor: 'background.paper' }}>
        
        {/* --- Header Section (Title and Edit Button) --- */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2, flexWrap: 'wrap' }}>
            <Typography variant="h3" component="h1" gutterBottom>
                {event.title}
            </Typography>
            {/* --- Edit Button (Sirf Owner ko dikhega) --- */}
            {isEventOwner && (
                <Button 
                    component={Link} 
                    to={`/edit-event/${event.id}`} 
                    variant="contained" 
                    color="primary"
                >
                    Edit Event
                </Button>
            )}
        </Box>
        
        <Divider sx={{ mb: 3 }} />

        {/* --- Details Grid --- */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6} sx={{ display: 'flex', alignItems: 'center' }}>
                <GroupsIcon color="action" sx={{ mr: 1.5 }} />
                <Typography variant="h6" color="text.secondary">
                    Organized by: <strong>{event.clubName}</strong>
                </Typography>
            </Grid>
            <Grid item xs={12} sm={6} sx={{ display: 'flex', alignItems: 'center' }}>
                <PersonIcon color="action" sx={{ mr: 1.5 }} />
                <Typography variant="h6" color="text.secondary">
                    Coordinator: {event.User ? event.User.name : 'N/A'}
                </Typography>
            </Grid>
            <Grid item xs={12} sm={6} sx={{ display: 'flex', alignItems: 'center' }}>
                <EventIcon color="action" sx={{ mr: 1.5 }} />
                <Typography variant="h6" color="text.secondary">
                    {new Date(event.eventDate).toLocaleString()}
                </Typography>
            </Grid>
            <Grid item xs={12} sm={6} sx={{ display: 'flex', alignItems: 'center' }}>
                <LocationOnIcon color="action" sx={{ mr: 1.5 }} />
                <Typography variant="h6" color="text.secondary">
                    {event.venue}
                </Typography>
            </Grid>
        </Grid>
        
        <Divider sx={{ my: 3 }} />

        {/* --- Full Description --- */}
        <Typography variant="h5" component="h2" sx={{ mb: 2 }}>
          Event Details
        </Typography>
        <Typography variant="body1" paragraph sx={{ whiteSpace: 'pre-wrap' }}>
          {/* pre-wrap description mein line breaks ko banaye rakhta hai */}
          {event.description}
        </Typography>

        {/* --- Register Button Placeholder --- */}
        {/* Humne yeh button Events.js mein rakha hai, lekin aap ise yahaan bhi add kar sakte hain */}
        <Box sx={{ mt: 4, textAlign: 'center' }}>
            <Button 
              variant="contained" 
              size="large" 
              onClick={() => alert('Registration logic yahaan bhi add kar sakte hain!')}
            >
              Register for this Event
            </Button>
        </Box>

      </Paper>
    </Container>
  );
}

export default EventDetail;