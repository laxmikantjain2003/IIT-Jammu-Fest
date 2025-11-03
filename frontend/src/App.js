import React, { useState, useEffect } from 'react';
// --- NEW: Import useLocation ---
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
  Avatar, 
  Box,
} from '@mui/material';

// --- Import All Page Components ---
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

// (Helper function to truncate names)
const truncateName = (name, maxLength = 10) => {
  if (!name) return 'User';
  const firstName = name.split(' ')[0];
  if (firstName.length <= maxLength) {
    return firstName;
  }
  return name.length > maxLength ? name.substring(0, maxLength) + '...' : name;
};


function App() {
  const [user, setUser] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null); 
  const navigate = useNavigate();
  
  // --- NEW: Get current location ---
  const location = useLocation(); // Gets the current URL path

  // 1. Check localStorage for user
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  // --- NEW: useEffect to manage background image ---
  useEffect(() => {
    // List of routes that should have the background image
    const authRoutes = ['/login', '/register', '/forgot-password', '/reset-password', '/events', '/clubs'];
    
    // Check if user is logged out AND on the home page
    const isLoggedOutHome = !user && location.pathname === '/';
    
    // Check if the current path is one of the auth routes
    const isAuthPage = authRoutes.some(route => location.pathname.startsWith(route));

    if (isLoggedOutHome || isAuthPage) {
      // Add the background class to the <body> tag
      document.body.classList.add('auth-background');
    } else {
      // Remove the background class for all other pages
      document.body.classList.remove('auth-background');
    }

    // Cleanup function: Remove class when component unmounts or changes
    return () => {
      document.body.classList.remove('auth-background');
    };
  }, [location.pathname, user]); // Re-run this effect when the URL or user state changes
  // --- END NEW useEffect ---


  // --- (Logout, Menu Handlers, etc. - unchanged) ---
  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setUser(null);
    handleMenuClose(); 
    navigate('/login');
  };
  const isCoordinator = user && (user.role === 'admin' || user.role === 'coordinator');
  const handleMenuClick = (event) => { setAnchorEl(event.currentTarget); };
  const handleMenuClose = () => { setAnchorEl(null); };
  const handleMenuItemClick = (path) => {
    handleMenuClose();
    navigate(path);
  };
  const displayName = user ? truncateName(user.name) : '';
  const profilePicUrl = user ? user.profilePicUrl : null;

  return (
    <div className="App">
      {/* --- Main Navigation Bar (Unchanged) --- */}
      <AppBar position="static">
        <Toolbar>
          <Typography
            variant="h6"
            component={Link}
            to="/"
            sx={{ 
                flexGrow: 1, 
                color: 'inherit', 
                textDecoration: 'none',
                fontSize: { xs: '0.9rem', sm: '1.25rem' } 
            }}
          >
            IIT Jammu Fest
          </Typography>

          {/* ... (Navbar buttons - Unchanged) ... */}
          <Button color="inherit" component={Link} to="/">HOME</Button>
          <Button color="inherit" component={Link} to="/events">EVENTS</Button>
          <Button color="inherit" component={Link} to="/clubs">CLUBS</Button>
          {user ? (
            <>
              {isCoordinator && (
                <>
                  <Button 
                    color="inherit" 
                    onClick={handleMenuClick}
                    sx={{ whiteSpace: 'nowrap' }} 
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
                    {displayName ? displayName[0] : ''} 
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
            <>
              <Button color="inherit" component={Link} to="/login">LOGIN</Button>
              <Button color="inherit" component={Link} to="/register">REGISTER</Button>
            </>
          )}
        </Toolbar>
      </AppBar>

      {/* --- Page Content Container (Unchanged) --- */}
      <Container component="main" sx={{ mt: 4, mb: 4 }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path="/events" element={<Events />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/clubs" element={<ClubList />} />
          <Route path="/club/:id" element={<ClubDetail />} />
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