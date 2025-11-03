import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

// --- Import MUI components ---
import {
  Container,
  Typography,
  Grid,
  Card,
  CardMedia,
  CardContent,
  Box,
  CircularProgress,
  Alert,
  Paper, // <-- YEH IMPORT ADD KIYA GAYA HAI
} from '@mui/material';

function ClubList() {
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 1. Fetch all clubs on component load
  useEffect(() => {
    const fetchClubs = async () => {
      try {
        setLoading(true);
        const response = await axios.get('http://localhost:5000/api/clubs');
        setClubs(response.data);
      } catch (err) {
        console.error("Error fetching clubs:", err);
        setError("Failed to fetch the list of clubs.");
      } finally {
        setLoading(false);
      }
    };
    fetchClubs();
  }, []); // Empty dependency array means this runs once on load

  // --- Render Logic ---
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}>
        {/* Loading spinner ko safed (white) kar diya */}
        <CircularProgress sx={{ color: 'white' }} />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error" sx={{ mt: 4 }}>{error}</Alert>;
  }

  return (
    // Container (Wrapper) jo background image par hai
    <Container component="main" maxWidth="lg" sx={{ padding: { xs: 2, md: 4 }, mt: 4, mb: 4 }}>
      <Typography 
        variant="h3" 
        component="h1" 
        gutterBottom 
        align="center" 
        sx={{ 
          mb: 4,
          color: 'white' // Title ko safed (white) kar diya
        }}
      >
        Official Clubs Directory
      </Typography>
      
      {clubs.length === 0 ? (
        // Paper component ko yahaan add kiya gaya hai taaki Alert saaf dikhe
        <Paper sx={{p: 3, textAlign: 'center'}}>
          <Alert severity="info" sx={{justifyContent: 'center'}}>
            No clubs have been registered yet. A coordinator can add one!
          </Alert>
        </Paper>
      ) : (
        <Grid container spacing={4}>
          {clubs.map((club) => (
            <Grid item xs={12} sm={6} md={4} key={club.id}>
              {/* Individual club cards (safed background ke saath) */}
              <Card 
                component={Link} 
                to={`/club/${club.id}`} 
                sx={{ 
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column',
                  textDecoration: 'none',
                  transition: '0.3s',
                  '&:hover': {
                    boxShadow: 6, 
                    transform: 'translateY(-5px)' 
                  }
                }}
              >
                {/* --- IMAGE CONTAINER BOX (FIX) --- */}
                {/* Yeh Box logo ke liye ek fixed size (160px height) ka frame banata hai */}
                <Box 
                  sx={{ 
                    height: 160, // Fixed height for the circular container
                    width: 160,  // Fixed width for the circular container
                    borderRadius: '50%', // Circle banaega
                    overflow: 'hidden', // Extra image ko hide karega
                    margin: '16px auto 0 auto', // Center karega aur upar se space dega
                    border: '3px solid #f0f0f0', // Halka border
                    display: 'flex', // Center the image inside the circle
                    justifyContent: 'center',
                    alignItems: 'center',
                    backgroundColor: '#f9f9f9', // Background color for empty space inside the circle
                  }}
                >
                  <CardMedia
                    component="img"
                    sx={{
                      height: '50%', // Image ko Box ki poori height lene dega
                      width: '50%',  // Image ko Box ki poori width lene dega
                      objectFit: 'cover', // Image ko crop karke Box ko poora fill karega
                    }}
                
                    image={club.logoUrl || "https://res.cloudinary.com/demo/image/upload/v1600000000/placeholder.png"} 
                    alt={`${club.name} logo`}
                  />
                </Box>
                {/* --- END IMAGE CONTAINER BOX --- */}

                <CardContent sx={{ flexGrow: 1, textAlign: 'center' }}>
                  <Typography gutterBottom variant="h5" component="h2">
                    {club.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {/* Truncated description */}
                    {club.description.substring(0, 100)}...
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
}

export default ClubList;