import React, { useState, useEffect } from 'react';
// Import routing components
import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';

// --- Import MUI Components ---
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Container,
  Menu,
  MenuItem,
  Avatar, // For the profile button
  Box,
} from '@mui/material';

// --- Import All Page Components ---
// These will be created in the following steps
import Home from './pages/Home';
import Register from './pages/Register';
import Login from './pages/Login';
import Events from './pages/Events';
import CreateEvent from './pages/CreateEvent';
import Profile from './pages/Profile';
import Dashboard from './pages/Dashboard';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import CreateClub from './pages/CreateClub';
import ClubDetail from './pages/ClubDetail';
import EditClub from './pages/EditClub';
import ClubList from './pages/ClubList';

/**
 * @description Helper function to truncate long names for the navbar.
 * @param {string} name - The user's full name.
 * @param {number} maxLength - The max length before truncating.
 * @returns {string} - The truncated name.
 */
const truncateName = (name, maxLength = 10) => {
  if (!name) return 'User';
  // Use the first name if available
  const firstName = name.split(' ')[0];
  if (firstName.length <= maxLength) {
    return firstName;
  }
  // Otherwise, truncate the full name
  return name.length > maxLength ? name.substring(0, maxLength) + '...' : name;
};

function App() {
  const [user, setUser] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null); // State for the "Tools" Menu
  const navigate = useNavigate();
  const location = useLocation(); // Gets the current URL path

  // On app load, check localStorage for a logged-in user
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error("Failed to parse user from localStorage:", error);
      // Clear corrupted data
      localStorage.removeItem('user');
      localStorage.removeItem('token');
    }
  }, []);

  // --- useEffect to manage background image ---
  // This hook adds/removes the 'auth-background' class to the <body>
  // based on the current page and login state.
  useEffect(() => {
    // List of routes that should ALWAYS have the background image
    const backgroundRoutes = [
      '/login', 
      '/register', 
      '/forgot-password', 
      '/reset-password',
      '/events', // As requested
      '/clubs',  // As requested
      '/club/'   // As requested (for all detail pages)
    ];
    
    // Check if user is logged out AND on the home page
    const isLoggedOutHome = !user && location.pathname === '/';
    
    // Check if the current path is one of the designated background routes
    const isBackgroundPage = backgroundRoutes.some(route => location.pathname.startsWith(route));

    if (isLoggedOutHome || isBackgroundPage) {
      // Add the background class to the <body> tag
      document.body.classList.add('auth-background');
    } else {
      // Remove the background class for all other pages (Dashboard, Profile, etc.)
      document.body.classList.remove('auth-background');
    }

    // Cleanup function: Remove class when component unmounts
    return () => {
      document.body.classList.remove('auth-background');
    };
  }, [location.pathname, user]); // Re-run this effect when the URL or user state changes

  // --- Navigation Handlers ---

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setUser(null);
    handleMenuClose(); // Close any open menus
    navigate('/login');
    window.location.reload(); // Force reload to clear all states
  };
  
  const isCoordinator = user && (user.role === 'admin' || user.role === 'coordinator');

  // Handlers for the "Tools" dropdown menu
  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleMenuClose = () => {
    setAnchorEl(null);
  };
  const handleMenuItemClick = (path) => {
    handleMenuClose();
    navigate(path);
  };
  
  // Get the display name and profile pic for the navbar
  const displayName = user ? truncateName(user.name) : '';
  const profilePicUrl = user ? user.profilePicUrl : null;

  return (
    <div className="App">
      {/* --- Main Navigation Bar --- */}
      <AppBar position="static">
        <Toolbar>
          {/* --- Logo/Title --- */}
          <Typography
            variant="h6"
            component={Link}
            to="/"
            sx={{ 
                flexGrow: 1, 
                color: 'inherit', 
                textDecoration: 'none',
                fontSize: { xs: '0.9rem', sm: '1.25rem' } // Responsive font size
            }}
          >
            IIT Jammu Fest
          </Typography>

          {/* --- Navigation Links --- */}
          <Button color="inherit" component={Link} to="/">HOME</Button>
          <Button color="inherit" component={Link} to="/events">EVENTS</Button>
          <Button color="inherit" component={Link} to="/clubs">CLUBS</Button>

          {user ? (
            // --- Logged-In User Links ---
            <>
              {/* --- Coordinator "Tools" Menu --- */}
              {isCoordinator && (
                <>
                  <Button 
                    color="inherit" 
                    onClick={handleMenuClick}
                    sx={{ whiteSpace: 'nowrap' }} // Prevents wrapping on small screens
                  >
                    TOOLS
                  </Button>
                  <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={handleMenuClose}
                  >
                    <MenuItem onClick={() => handleMenuItemClick('/dashboard')}>Dashboard</MenuItem>
                    <MenuItem onClick={() => handleMenuItemClick('/create-event')}>Create Event</MenuItem>
                    <MenuItem onClick={() => handleMenuItemClick('/create-club')}>Create Club</MenuItem>
                  </Menu>
                </>
              )}
              
              {/* --- Profile Button (with Pic) --- */}
              <Button 
                color="inherit" 
                component={Link} 
                to="/profile" 
                sx={{ whiteSpace: 'nowrap', textTransform: 'uppercase' }}
                startIcon={
                  <Avatar 
                    src={profilePicUrl} 
                    sx={{ width: 24, height: 24, bgcolor: 'secondary.main' }}
                  >
                    {displayName ? displayName[0].toUpperCase() : ''} 
                  </Avatar>
                }
              >
                {displayName}
              </Button>
              
              <Button color="inherit" onClick={handleLogout}>
                LOGOUT
              </Button>
            </>
          ) : (
            // --- Logged-Out User Links ---
            <>
              <Button color="inherit" component={Link} to="/login">LOGIN</Button>
              <Button color="inherit" component={Link} to="/register">REGISTER</Button>
            </>
          )}
        </Toolbar>
      </AppBar>

      {/* --- Page Content Container --- */}
      {/* This Container centers all page content and adds padding */}
      <Container component="main" sx={{ mt: 4, mb: 4 }}>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          
          {/* App Routes */}
          <Route path="/events" element={<Events />} />
          <Route path="/clubs" element={<ClubList />} />
          <Route path="/club/:id" element={<ClubDetail />} />
          
          {/* Private Logged-in Routes */}
          <Route path="/profile" element={<Profile />} />
          
          {/* Coordinator-Only Routes */}
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/create-event" element={<CreateEvent />} />
          <Route path="/create-club" element={<CreateClub />} /> 
          <Route path="/edit-club/:id" element={<EditClub />} /> 
        </Routes>
      </Container>
    </div>
  );
}

export default App;