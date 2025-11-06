import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

// --- Import MUI components ---
import {
  Container,
  Paper,
  Typography,
  Accordion, // Used to show/hide student lists
  AccordionSummary,
  AccordionDetails,
  Box,
  CircularProgress,
  Alert,
  List,
  ListItem,
  ListItemText,
  Divider,
  Button,
  Grid,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'; // Icon for accordion

function Dashboard() {
  const [myEvents, setMyEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  /**
   * @description Fetches the coordinator's specific events and participant lists.
   */
  const fetchMyEvents = async () => {
    try {
      setLoading(true);
      // 1. Get the token from localStorage
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login'); // If no token, redirect to login
        return;
      }

      // 2. Create the authorization header
      const config = {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      };

      // 3. Send the GET request to the 'my-events' endpoint
      const response = await axios.get('http://localhost:5000/api/events/my-events', config);
      
      setMyEvents(response.data);

    } catch (err) {
      console.error("Error fetching dashboard data:", err.response?.data);
      setError("Failed to load dashboard data. You may not be a coordinator.");
    } finally {
      setLoading(false);
    }
  };

  // 1. Fetch data on component load
  useEffect(() => {
    let storedUser = null;
    try {
      const userString = localStorage.getItem('user');
      if (userString) {
        storedUser = JSON.parse(userString);
        setUser(storedUser);
      } else {
        navigate('/login'); // Redirect if not logged in
        return;
      }
    } catch (e) {
      console.error("Error parsing user, redirecting to login.", e);
      localStorage.clear();
      navigate('/login');
      return;
    }
    
    fetchMyEvents();
  }, [navigate]); // Add navigate as a dependency

  /**
   * @description Handles the CSV export for a specific event.
   */
  const handleExport = async (eventId, eventTitle) => {
    try {
      // 1. Get the token
      const token = localStorage.getItem('token');
      if (!token) {
        alert("Please log in again.");
        return;
      }

      // 2. Create auth header and set response type to 'blob' (for files)
      const config = {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        responseType: 'blob' 
      };

      // 3. Call the export API
      const response = await axios.get(
        `http://localhost:5000/api/events/${eventId}/export`,
        config
      );

      // 4. Create a hidden link to trigger the file download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${eventTitle}-registrations.csv`); // Set filename
      document.body.appendChild(link);
      link.click();
      
      // 5. Clean up
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);

    } catch (err) {
      console.error("Export error:", err);
      alert("Failed to export data.");
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
    <Container component="main" maxWidth="lg">
      <Paper 
        elevation={3}
        sx={{
          marginTop: 8,
          padding: { xs: 2, md: 4 },
          bgcolor: 'background.paper', // Solid white background
        }}
      >
        <Typography component="h1" variant="h4" gutterBottom align="center">
          Coordinator Dashboard
        </Typography>
        <Typography align="center" variant="h6" color="text.secondary" sx={{ mb: 2 }}>
          Welcome, {user ? user.name : 'Coordinator'}.
        </Typography>
        <Typography align="center" variant="body1" sx={{ mb: 4 }}>
          Here you can manage your events and see who has registered.
        </Typography>
        
        {/* Quick Actions */}
        <Grid container spacing={2} justifyContent="center" sx={{ mb: 4 }}>
            <Grid item>
                <Button variant="contained" component={Link} to="/create-event">
                    Create New Event
                </Button>
            </Grid>
            <Grid item>
                <Button variant="contained" component={Link} to="/create-club">
                    Create/Manage Club
                </Button>
            </Grid>
        </Grid>

        <Divider sx={{ mb: 4 }} />

        {/* --- Event List Accordion --- */}
        <Typography variant="h5" component="h2" sx={{ mb: 2 }}>
          My Events
        </Typography>

        {myEvents.length === 0 ? (
          <Alert severity="info">
            You have not created any events yet. Click "Create New Event" to get started.
          </Alert>
        ) : (
          <Box sx={{ width: '100%', mt: 3 }}>
            {myEvents.map((event) => (
              <Accordion key={event.id} sx={{ mb: 1 }}>
                {/* Accordion Header: Event Title + Participant Count */}
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="h6" sx={{ flexGrow: 1 }}>
                    {event.title}
                  </Typography>
                  <Typography sx={{ color: 'text.secondary', alignSelf: 'center', mr: 2 }}>
                    {event.RegisteredStudents.length} Registered
                  </Typography>
                </AccordionSummary>
                
                {/* Accordion Content: Student List + Export Button */}
                <AccordionDetails>
                  {event.RegisteredStudents.length === 0 ? (
                    <Typography>
                      No students have registered for this event yet.
                    </Typography>
                  ) : (
                    <Box>
                      <Typography variant="subtitle1" gutterBottom>
                        Registered Students ({event.RegisteredStudents.length}):
                      </Typography>
                      
                      {/* Export Button */}
                      <Button
                        variant="outlined"
                        size="small"
                        sx={{ mb: 2 }}
                        onClick={() => handleExport(event.id, event.title)}
                      >
                        Export List to Excel (CSV)
                      </Button>
                      
                      {/* Student List */}
                      <List dense component={Paper} variant="outlined">
                        {event.RegisteredStudents.map((student, index) => (
                          <React.Fragment key={student.email}>
                            {index > 0 && <Divider />}
                            <ListItem>
                              <ListItemText 
                                primary={student.name}
                                secondary={student.email} 
                              />
                            </ListItem>
                          </React.Fragment>
                        ))}
                      </List>
                    </Box>
                  )}
                </AccordionDetails>
              </Accordion>
            ))}
          </Box>
        )}
      </Paper>
    </Container>
  );
}

export default Dashboard;