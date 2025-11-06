import React, { useState, useEffect } from 'react';
import axios from 'axios';
// --- Link import karein ---
import { useNavigate, Link } from 'react-router-dom';

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
  Paper, // Paper ko import karein
  CardActionArea, // <-- NEW: Clickable area ke liye
} from '@mui/material';

function Events() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null); 
  const [registeredEventIds, setRegisteredEventIds] = useState(new Set()); 
  const navigate = useNavigate();

  // (useEffect hook... unchanged)
  useEffect(() => {
    let storedUser = null;
    try {
      const userString = localStorage.getItem('user');
      if (userString) { storedUser = JSON.parse(userString); setUser(storedUser); }
    } catch (e) { console.error("Failed to parse user", e); localStorage.clear(); }

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
      if (storedUser) { 
        try {
          const token = localStorage.getItem('token');
          const config = { headers: { 'Authorization': `Bearer ${token}` } };
          const response = await axios.get('http://localhost:5000/api/users/me/my-registrations', config);
          setRegisteredEventIds(new Set(response.data));
        } catch (err) { console.error("Error fetching my registrations:", err); }
      }
    };
    const loadData = async () => {
        setLoading(true);
        await Promise.all([ fetchEvents(), fetchMyRegistrations() ]);
        setLoading(false);
    };
    loadData();
  }, []); 

  // (handleRegister function... UPDATED to stop propagation)
  const handleRegister = async (eventId, e) => {
    // --- NEW: Stop click from bubbling to the Card's Link ---
    e.stopPropagation(); // Click ko card tak jaane se rokta hai
    e.preventDefault(); // Default link behaviour ko rokta hai

    try {
      const token = localStorage.getItem('token');
      if (!token) { navigate('/login'); return; }
      const config = { headers: { 'Authorization': `Bearer ${token}` } };
      const response = await axios.post(
        `http://localhost:5000/api/events/${eventId}/register`, 
        {}, 
        config
      );
      setRegisteredEventIds(prevIds => new Set(prevIds).add(eventId));
      alert(response.data.message); 
    } catch (err) {
      console.error("Registration error:", err.response?.data);
      alert(err.response?.data?.message || "Registration failed.");
    }
  };

  // --- (Render Logic - unchanged) ---
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}>
        <CircularProgress sx={{ color: 'white' }} />
      </Box>
    );
  }
  if (error) { return <Alert severity="error">{error}</Alert>; }

  return (
    <Container>
      <Typography 
        variant="h4" 
        component="h1" 
        gutterBottom 
        align="center" 
        sx={{ mb: 4, color: 'white', fontWeight: 'bold' }}
      >
        Upcoming Events
      </Typography>
      
      {events.length === 0 ? (
        <Paper sx={{p: 3, textAlign: 'center', backgroundColor: 'rgba(255, 255, 255, 0.9)'}}>
          <Alert severity="info" sx={{justifyContent: 'center'}}>
            There are no upcoming events scheduled at this time.
          </Alert>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {events.map(event => {
            
            const isCoordinatorOfThisEvent = user && (user.id === event.coordinatorId);
            const canRegister = user && (user.role === 'student' || !isCoordinatorOfThisEvent);
            const isRegistered = registeredEventIds.has(event.id);

            return (
              <Grid item xs={12} md={6} lg={4} key={event.id}>
                {/* Card ab solid white background use karega */}
                <Card 
                  sx={{ 
                    height: '100%', 
                    display: 'flex', 
                    flexDirection: 'column',
                    bgcolor: 'background.paper', // Solid white
                    transition: '0.3s',
                    '&:hover': { transform: 'translateY(-5px)', boxShadow: 6 }
                  }}
                >
                  {/* --- CARDACTIONAREA WRAPPER --- */}
                  {/* Yeh CardContent ko clickable banata hai */}
                  <CardActionArea 
                    component={Link} 
                    to={`/events/${event.id}`} // <-- NEW: Link to detail page
                    sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}
                  >
                    <CardContent sx={{ flexGrow: 1, width: '100%' }}>
                      <Typography variant="h5" component="h2" gutterBottom>
                        {event.title}
                      </Typography>
                      <Typography color="text.secondary" sx={{ mb: 1.5 }}>
                        <strong>Club:</strong> {event.clubName}
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        <strong>When:</strong> {new Date(event.eventDate).toLocaleString()}
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        <strong>Where:</strong> {event.venue}
                      </Typography>
                      <Typography variant="body2" paragraph sx={{
                          // Description ko 2 lines tak seemit rakha
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                      }}>
                        {event.description}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Posted by: {event.User ? event.User.name : 'Admin'}
                      </Typography>
                    </CardContent>
                  </CardActionArea>

                  {/* CardActions link ke bahar hai taaki register button alag se click ho sake */}
                  <CardActions>
                    {user && (
                      <>
                        {isRegistered ? (
                          <Button size="small" variant="outlined" disabled>
                            Registered
                          </Button>
                        ) : (
                          canRegister && (
                            <Button 
                              size="small" 
                              variant="contained" 
                              onClick={(e) => handleRegister(event.id, e)} // 'e' pass karna zaroori hai
                            >
                              Register for this Event
                            </Button>
                          )
                        )}
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