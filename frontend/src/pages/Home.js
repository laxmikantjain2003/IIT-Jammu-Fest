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

  // 1. Check if a user is logged in
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  // 2. Fetch Clubs *only* if the user is logged out
  useEffect(() => {
    // Check if user state is null (Logged out)
    if (user === null) { 
        setLoading(true);
        const fetchClubs = async () => {
            try {
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
  }, [user]); // Reruns when user state changes (e.g., after login/logout)

  const isCoordinator = user && (user.role === 'admin' || user.role === 'coordinator');

  // --- RENDER LOGGED-IN VIEW ---
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
  return (
    <Container component="main" maxWidth="lg">
      <Paper elevation={3} 
        sx={{
            padding: 2, 
            marginTop: 4, 
            textAlign: 'center', 
            backgroundColor: 'rgba(255, 255, 255, 0.25)', 
            backdropFilter: 'blur(2px)', 
            border: '1px solid rgba(255, 255, 255, 0.2)', 
            color: 'white' }}>
        
        <Typography variant="h3" component="h1" gutterBottom>
          Welcome to the IIT Jammu Fest Portal
        </Typography>
        <Typography variant="h6" color="text.secondary" paragraph>
          Explore the official clubs of IIT Jammu.
        </Typography>
        
        {/* Login/Register buttons for new users */}
        <Box sx={{ mb: 4 }}>
            <Button component={Link} to="/login" variant="contained" size="large" sx={{ marginRight: 2 }}>
              Login
            </Button>
            <Button component={Link} to="/register" variant="outlined" size="large">
              Register
            </Button>
        </Box>
        
        <Divider sx={{ my: 4 }} /> 

        {/* --- Club Preview Section (Only for logged-out users) --- */}
        <Typography variant="h4" component="h2" gutterBottom sx={{ mt: 4, mb: 3 }}>
            Official Campus Clubs
        </Typography>

        {loading ? (
            <CircularProgress sx={{ my: 4 }} />
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
                            <Card 
                                component={Link} 
                                to={`/club/${club.id}`} // Links to ClubDetail page
                                sx={{ 
                                    textDecoration: 'none', 
                                    p: 2, 
                                    transition: '0.3s',
                                    '&:hover': { transform: 'translateY(-5px)', boxShadow: 6 },
                                }}
                            >
                                <CardMedia
                                    component="img"
                                    sx={{ 
                                        height: 120, 
                                        width: 120, 
                                        objectFit: 'cover', 
                                        margin: '0 auto', 
                                        borderRadius: '50%',
                                        border: '2px solid #eee', }}
                                    image={club.logoUrl || "https://res.cloudinary.com/demo/image/upload/v1600000000/placeholder.png"} 
                                    alt={club.name}
                                />
                                <CardContent>
                                    <Typography variant="h6" component="div">
                                        {club.name}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        {/* Show truncated description */}
                                        {club.description.substring(0, 50)}...
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))
                )}
                
                {/* Link to view all clubs if more than 3 exist */}
                {clubs.length > 3 && (
                     <Box sx={{ mt: 3, width: '100%' }}>
                        <Button variant="text" component={Link} to="/clubs">
                            View all {clubs.length} Clubs
                        </Button>
                     </Box>
                )}
            </Grid>
        )}
      </Paper>
    </Container>
  );
}

export default Home;