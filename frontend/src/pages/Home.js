import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios'; 

// --- Import MUI components ---
import {
  Container,
  Typography,
  Button,
  Box,
  Paper,
  Grid, 
  Card,
  CardMedia,
  CardContent,
  CircularProgress,
  Divider, 
} from '@mui/material';

function Home() {
  const [user, setUser] = useState(null);
  const [clubs, setClubs] = useState([]); // State for club data
  const [loading, setLoading] = useState(true);

  // 1. Check if a user is logged in from localStorage
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error("Failed to parse user from localStorage:", error);
    }
  }, []);

  // 2. Fetch Clubs *only* if the user is logged out (for the preview)
  useEffect(() => {
    // Check if user state is null (Logged out)
    if (user === null) { 
        setLoading(true);
        const fetchClubs = async () => {
            try {
                // Fetch clubs from the backend API
                const response = await axios.get('http://localhost:5000/api/clubs');
                setClubs(response.data);
            } catch (error) {
                console.error("Error fetching clubs:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchClubs();
    } else {
        // If user is logged in, no need to load clubs for this page
        setLoading(false);
    }
  }, [user]); // This effect re-runs when the 'user' state changes

  const isCoordinator = user && (user.role === 'admin' || user.role === 'coordinator');

  // --- RENDER LOGGED-IN VIEW ---
  // This view is clean and does not have the background image.
  if (user) {
    return (
        <Container component="main" maxWidth="lg" sx={{ mt: 8, mb: 4 }}>
            <Box
                component={Paper}
                elevation={3}
                sx={{ p: 4, borderRadius: 2, boxShadow: 3, bgcolor: 'background.paper', textAlign: 'center' }}
            >
                <Typography variant="h3" component="h1" gutterBottom color="primary">
                    Welcome Back, {user.name.split(' ')[0]}!
                </Typography>
                <Typography variant="h6" component="h2" gutterBottom sx={{ mb: 4 }}>
                    Your campus activity hub.
                </Typography>
                
                {/* Quick action buttons for logged-in users */}
                <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
                    <Button variant="contained" color="primary" size="large" component={Link} to="/events">
                        Browse All Events
                    </Button>
                    <Button variant="outlined" color="secondary" size="large" component={Link} to="/clubs">
                        View Clubs Directory
                    </Button>
                    {isCoordinator && (
                        <Button variant="outlined" color="info" size="large" component={Link} to="/dashboard">
                            Go To Dashboard
                        </Button>
                    )}
                </Box>
            </Box>
        </Container>
    );
  }

  // --- RENDER LOGGED-OUT VIEW (Initial Visit) ---
  // This view will have the background image applied from index.css
  return (
    <Container component="main" maxWidth="lg">
      <Paper
        elevation={24} // Give it a strong shadow to "pop" off the background
        sx={{
          padding: { xs: 2, md: 4 },
          marginTop: 8,
          textAlign: 'center', 
          position: 'relative', // Needed for the overlay
          overflow: 'hidden', // Ensures overlay fits
          color: '#ffffff', // All text inside will be white
          
          // Make the Paper transparent so the body's background image shows through
          backgroundColor: 'transparent', 
          
          // The overlay is applied by the 'auth-background' class on the body,
          // but we add another subtle one here for text readability.
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.4)', // 40% black overlay
            zIndex: 1, 
          },
        }}
      >
        {/* Wrapper Box: All content goes inside here to be above the overlay */}
        <Box sx={{ position: 'relative', zIndex: 2 }}>
      
          <Typography variant="h3" component="h1" gutterBottom>
            Welcome to the IIT Jammu Fest Portal
          </Typography>
          <Typography variant="h6" paragraph>
            Explore the official clubs of IIT Jammu.
          </Typography>
          
          {/* Login/Register buttons */}
          <Box sx={{ mb: 4 }}>
              <Button component={Link} to="/login" variant="contained" size="large" sx={{ marginRight: 2 }}>
                Login
              </Button>
              <Button
                component={Link}
                to="/register"
                variant="outlined"
                size="large"
                sx={{ color: 'white', borderColor: 'white' }} // White outline button
              >
                Register
              </Button>
          </Box>
          
          <Divider sx={{ my: 4, backgroundColor: 'rgba(255, 255, 255, 0.5)' }} /> 

          {/* --- Club Preview Section --- */}
          <Typography variant="h4" component="h2" gutterBottom sx={{ mt: 4, mb: 3 }}>
              Official Campus Clubs
          </Typography>

          {loading ? (
              <CircularProgress sx={{ my: 4, color: 'white' }} />
          ) : (
              <Grid container spacing={3} justifyContent="center">
                  {clubs.length === 0 ? (
                      <Typography variant="subtitle1" sx={{ mt: 3, mb: 3 }}>
                          No clubs have been registered yet.
                      </Typography>
                  ) : (
                      // Show a preview of the first 3 clubs
                      clubs.slice(0, 3).map(club => ( 
                          <Grid item xs={12} sm={6} md={4} key={club.id}> 
                              {/* White card for each club */}
                              <Card 
                                  component={Link} 
                                  to={`/club/${club.id}`} 
                                  sx={{ 
                                      textDecoration: 'none', 
                                      transition: '0.3s',
                                      '&:hover': { transform: 'translateY(-5px)', boxShadow: 6 },
                                      backgroundColor: 'rgba(255, 255, 255, 0.95)', // Card background is light
                                      color: '#000000', // Card text is black
                                      height: '100%', 
                                      display: 'flex', 
                                      flexDirection: 'column',
                                  }}
                              >
                                  {/* --- Circular Logo Box --- */}
                                  <Box 
                                    sx={{ 
                                      height: 160, 
                                      width: 160,  
                                      borderRadius: '50%', 
                                      margin: '20px auto 10px auto', 
                                      border: '3px solid #f0f0f0', 
                                      backgroundImage: `url(${club.logoUrl || "https://res.cloudinary.com/demo/image/upload/v1600000000/placeholder.png"})`,
                                      backgroundSize: 'cover', 
                                      backgroundPosition: 'center', 
                                      backgroundColor: '#f9f9f9', 
                                    }}
                                  />
                                  
                                  <CardContent sx={{ flexGrow: 1, textAlign: 'center' }}>
                                      <Typography variant="h6" component="div">
                                          {club.name}
                                      </Typography>
                                      <Typography variant="body2" color="text.secondary">
                                          {club.description.substring(0, 50)}...
                                      </Typography>
                                  </CardContent>
                              </Card>
                          </Grid>
                      ))
                  )}
                  
                  {/* Link to view all clubs */}
                  {clubs.length > 0 && (
                       <Box sx={{ mt: 3, width: '100%' }}>
                          <Button 
                            variant="text" 
                            component={Link} 
                            to="/clubs"
                            sx={{ color: 'white', fontWeight: 'bold' }} // White link
                          >
                              View all {clubs.length} Clubs
                          </Button>
                       </Box>
                  )}
              </Grid>
          )}
        </Box> 
      </Paper>
    </Container>
  );
}

export default Home;