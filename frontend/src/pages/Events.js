import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

// --- Import MUI components ---
import {
  Container,
  Grid,
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Box,
} from '@mui/material';

function Events() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null); 
  
  // --- NEW STATE: To store the IDs of events the user is registered for ---
  const [registeredEventIds, setRegisteredEventIds] = useState(new Set()); // Use a Set for fast lookups

  const navigate = useNavigate();

  // 1. Fetch all events AND user's registrations on component load
  useEffect(() => {
    let storedUser = null;
    try {
      const userString = localStorage.getItem('user');
      if (userString) {
        storedUser = JSON.parse(userString);
        setUser(storedUser);
      }
    } catch (e) {
      console.error("Failed to parse user from localStorage", e);
      localStorage.clear(); // Clear corrupted data
    }

    const fetchEvents = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/events');
        setEvents(response.data);
      } catch (err) {
        console.error("Error fetching events:", err);
        setError("Failed to load events. Please try again later.");
      }
    };

    const fetchMyRegistrations = async () => {
      if (storedUser) { // Only fetch if user is logged in
        try {
          const token = localStorage.getItem('token');
          const config = { headers: { 'Authorization': `Bearer ${token}` } };
          const response = await axios.get('http://localhost:5000/api/users/me/my-registrations', config);
          
          // Create a Set of event IDs for fast checking (e.g., [1, 5, 12])
          setRegisteredEventIds(new Set(response.data));

        } catch (err) {
          console.error("Error fetching my registrations:", err);
          // Don't block loading if this fails, just won't show "Registered"
        }
      }
    };

    // Run all fetches in parallel
    const loadData = async () => {
        setLoading(true);
        await Promise.all([
            fetchEvents(),
            fetchMyRegistrations()
        ]);
        setLoading(false);
    };

    loadData();
  }, []); // The empty array [] means this effect runs only once

  /**
   * @description Handles registration and updates the button state.
   */
  const handleRegister = async (eventId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }
      const config = { headers: { 'Authorization': `Bearer ${token}` } };

      const response = await axios.post(
        `http://localhost:5000/api/events/${eventId}/register`, 
        {}, 
        config
      );

      // --- NEW: Update state locally ---
      // Add this eventId to our Set to instantly change the button to "Registered"
      setRegisteredEventIds(prevIds => new Set(prevIds).add(eventId));

      alert(response.data.message); // Show "Registered successfully! A confirmation email has been sent."
      
    } catch (err) {
      console.error("Registration error:", err.response?.data);
      alert(err.response?.data?.message || "Registration failed.");
    }
  };


  // --- Render Logic ---
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  return (
    <Container>
      <Typography variant="h4" component="h1" gutterBottom align="center" sx={{ mb: 4, color: 'white' }}>
        Upcoming Events
      </Typography>
      
      {events.length === 0 ? (
        <Alert severity="info" sx={{ mt: 5 }}>
          There are no upcoming events scheduled at this time.
        </Alert>
      ) : (
        <Grid container spacing={3}>
          {events.map(event => {
            
            // --- UPDATED UI LOGIC ---
            // 1. Check if user is the coordinator
            const isCoordinatorOfThisEvent = user && (user.id === event.coordinatorId);
            
            // 2. Check if user is allowed to register
            const canRegister = user && (user.role === 'student' || !isCoordinatorOfThisEvent);
            
            // 3. Check if user is *already* registered
            const isRegistered = registeredEventIds.has(event.id);

            return (
              <Grid item xs={12} md={6} lg={4} key={event.id}>
                <Card sx={{ 
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column',
                
                  backgroundColor: 'rgba(255, 255, 255, 0.25)', 
                  backdropFilter: 'blur(25px)', 
                  border: '1px solid rgba(255, 255, 255, 0.2)', 
                  color: 'white' 
                  
                }}>
                  <CardContent sx={{ flexGrow: 1 }}>
                    {/* ... (Unchanged Typography for title, club, when, where) ... */}
                    <Typography variant="h5" component="h2" gutterBottom>
                      {event.title}
                    </Typography>
                    <Typography color="text.secondary" sx={{ mb: 1.5, color: 'black' }}>
                      <strong>Club:</strong> {event.clubName}
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      <strong>When:</strong> {new Date(event.eventDate).toLocaleString()}
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      <strong>Where:</strong> {event.venue}
                    </Typography>
                    <Typography variant="body2" paragraph>
                      {event.description}
                    </Typography>
                    <Typography variant="caption" color="black" fontSize={15}>
                      Posted by: {event.User ? event.User.name : 'Admin'}
                    </Typography>
                  </CardContent>

                  {/* --- UPDATED BUTTON RENDER CONDITION --- */}
                  <CardActions>
                    {/* Only show button if user is logged in */}
                    {user && (
                      <>
                        {isRegistered ? (
                          // 1. If already registered
                          <Button 
                            size="small" 
                            variant="outlined" 
                            disabled 
                          >
                            Registered
                          </Button>
                        ) : (
                          // 2. If not registered, check if they *can* register
                          canRegister && (
                            <Button 
                              size="small" 
                              variant="contained" 
                              onClick={() => handleRegister(event.id)}
                            >
                              Register for this Event
                            </Button>
                          )
                        )}
                        {/* 3. If they are the coordinator of this event (and not registered) */}
                        {isCoordinatorOfThisEvent && !isRegistered && (
                            <Button size="small" variant="text" disabled>
                                (Your Event)
                            </Button>
                        )}
                      </>
                    )}
                  </CardActions>
                </Card>
              </Grid>
            ); 
          })} 
        </Grid> 
      )} 
    </Container>
  ); 
}

export default Events;