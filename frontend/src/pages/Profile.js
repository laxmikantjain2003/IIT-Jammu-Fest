import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

// --- Import MUI components ---
import {
  Container,
  Paper,
  Box,
  Typography,
  Button,
  Alert,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  TextField,
  Divider,
  CircularProgress,
  Avatar, // For profile picture
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'; 
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import DeleteIcon from '@mui/icons-material/Delete';

function Profile() {
  const [user, setUser] = useState(null); 
  const [error, setError] = useState(null); // For general errors (like delete)
  const [open, setOpen] = useState(false); // For Delete Account dialog
  
  // --- States for Profile Picture ---
  const [picFile, setPicFile] = useState(null); 
  const [picLoading, setPicLoading] = useState(false); 
  const [picError, setPicError] = useState(null); // Specific error for pic upload
  
  // --- States for Password Change ---
  const [passwordData, setPasswordData] = useState({
    oldPassword: '',
    newPassword: '',
  });
  const [passwordError, setPasswordError] = useState(null);
  const [passwordSuccess, setPasswordSuccess] = useState(null);
  const [passwordLoading, setPasswordLoading] = useState(false);

  const navigate = useNavigate();

  // Load user data from localStorage when component mounts
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    } else {
      // If no user is found, redirect to login
      navigate('/login');
    }
  }, [navigate]);

  // --- Profile Picture Handlers ---

  /**
   * @description Handles the submission of a new profile picture.
   */
  const handlePicUpload = async (e) => {
    e.preventDefault();
    if (!picFile) { 
      setPicError("Please select an image file first."); 
      return; 
    }
    setPicLoading(true);
    setPicError(null); 
    
    const data = new FormData();
    data.append('file', picFile); // 'file' is the field name expected by profilePicUpload

    try {
        const token = localStorage.getItem('token');
        const config = { 
          headers: { 
            'Content-Type': 'multipart/form-data', 
            'Authorization': `Bearer ${token}`, 
          }, 
        };
        
        const response = await axios.put('http://localhost:5000/api/users/profile-pic', data, config);
        
        // CRITICAL: Update localStorage with the new user data (which includes the new pic URL)
        localStorage.setItem('user', JSON.stringify(response.data.user)); 
        setUser(response.data.user); // Update state to re-render avatar
        
        alert("Profile picture updated successfully!");
        setPicFile(null); // Clear the file input state

    } catch (err) {
        console.error("Pic upload failed:", err.response.data);
        setPicError(err.response.data.message || "Failed to update profile picture. Check file size (Max 1MB).");
    } finally {
        setPicLoading(false);
        if(document.getElementById('profile-pic-input')) {
          document.getElementById('profile-pic-input').value = null; // Clear file input
        }
    }
  };

  /**
   * @description Handles the removal of the user's profile picture.
   */
  const handlePicRemove = async () => {
    if (!window.confirm("Are you sure you want to remove your profile picture?")) return;
    setPicLoading(true);
    setPicError(null);

    try {
        const token = localStorage.getItem('token');
        const config = { headers: { 'Authorization': `Bearer ${token}` }, };
        
        const response = await axios.delete('http://localhost:5000/api/users/profile-pic', config);
        
        // CRITICAL: Update localStorage with the user data (now with null profilePicUrl)
        localStorage.setItem('user', JSON.stringify(response.data.user)); 
        setUser(response.data.user); 
        
        alert("Profile picture removed successfully!");

    } catch (err) {
        console.error("Pic removal failed:", err.response.data);
        setPicError(err.response.data.message || "Failed to remove profile picture.");
    } finally {
        setPicLoading(false);
    }
  };

  // --- Password Change Handlers ---

  const handlePasswordChange = (e) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value, });
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(null);
    setPasswordLoading(true);

    if (passwordData.newPassword.length < 6) { 
      setPasswordError("New password must be at least 6 characters long."); 
      setPasswordLoading(false); 
      return; 
    }

    try {
      const token = localStorage.getItem('token');
      const config = { headers: { 'Authorization': `Bearer ${token}` } };
      
      const response = await axios.put( 'http://localhost:5000/api/users/me/password', passwordData, config );

      setPasswordSuccess(response.data.message);
      setPasswordData({ oldPassword: '', newPassword: '' }); // Clear form
    
    } catch (err) {
      console.error("Password update failed:", err.response.data);
      setPasswordError(err.response.data.message || "Failed to update password.");
    } finally {
        setPasswordLoading(false); 
    }
  };

  // --- Delete Account Handlers ---
  
  const handleClickOpen = () => { setOpen(true); };
  const handleClose = () => { setOpen(false); };

  const handleDeleteAccount = async () => {
    setError(null);
    handleClose(); 

    try {
      const token = localStorage.getItem('token');
      if (!token) { 
        setError("Authentication token not found. Please log in again."); 
        return; 
      }
      const config = { headers: { 'Authorization': `Bearer ${token}` } };
      await axios.delete('http://localhost:5000/api/users/me', config);

      // CRITICAL: Log user out completely
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      
      alert("Your account has been deleted successfully.");
      
      navigate('/'); // Go to home page
      window.location.reload(); // Force app reload to update navbar

    } catch (err) {
      console.error("Delete account failed:", err.response.data);
      setError(err.response.data.message || "Failed to delete account.");
    }
  };

  // --- Conditional Render (Loading Spinner) ---
  if (!user) {
    return (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}><CircularProgress /></Box>
    );
  }

  // --- Main Render ---
  return (
    <Container component="main" maxWidth="sm">
      <Paper 
        elevation={3}
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: 4,
        }}
      >
        <Typography component="h1" variant="h5">
          My Profile
        </Typography>
        
        {/* --- PROFILE PICTURE SECTION --- */}
        <Box component="form" onSubmit={handlePicUpload} sx={{ mt: 3, mb: 3, textAlign: 'center', width: '100%' }}>
            <Avatar 
                src={user.profilePicUrl} 
                sx={{ width: 100, height: 100, mx: 'auto', border: '3px solid #1976d2', mb: 1 }}
            >
                {/* Fallback to first letter of name */}
                {user.name ? user.name[0].toUpperCase() : 'U'}
            </Avatar>

            {/* Hidden file input */}
            <input
                accept="image/*"
                style={{ display: 'none' }}
                id="profile-pic-input"
                type="file"
                onChange={(e) => setPicFile(e.target.files[0])}
            />
            <label htmlFor="profile-pic-input">
                <Button 
                    variant="outlined" 
                    component="span" 
                    startIcon={<PhotoCameraIcon />}
                    disabled={picLoading}
                    size="small"
                >
                    {picFile ? 'File Selected' : 'Select Photo'}
                </Button>
            </label>
            
            {/* Upload and Remove Buttons */}
            <Box sx={{ mt: 1 }}>
                {picFile && (
                    <Button 
                        variant="contained" 
                        color="primary" 
                        type="submit" 
                        size="small"
                        disabled={picLoading}
                        sx={{ mr: 1 }}
                    >
                        {picLoading ? <CircularProgress size={20} color="inherit" /> : 'Upload/Save'}
                    </Button>
                )}
                
                {user.profilePicUrl && !picFile && (
                    <Button 
                        variant="outlined" 
                        color="error"
                        onClick={handlePicRemove}
                        startIcon={<DeleteIcon />}
                        disabled={picLoading}
                        size="small"
                    >
                        {picLoading ? <CircularProgress size={20} /> : 'Remove'}
                    </Button>
                )}
                {picFile && <Typography variant="caption" display="block" sx={{ mt: 1 }}>{picFile.name}</Typography>}
            </Box>

            {/* Profile Picture Error Display */}
            {picError && (
                <Alert severity="error" sx={{ mt: 2, width: '100%' }}>
                    {picError}
                </Alert>
            )}
        </Box>
        {/* --- End Profile Picture Section --- */}

        <Box sx={{ width: '100%', textAlign: 'left' }}>
          <Typography variant="h6">Full Name:</Typography>
          <Typography paragraph>{user.name}</Typography>

          <Typography variant="h6">Email:</Typography>
          <Typography paragraph>{user.email}</Typography>

          <Typography variant="h6">Role:</Typography>
          <Typography paragraph sx={{ textTransform: 'capitalize' }}>
            {user.role}
          </Typography>
        </Box>

        {/* --- Change Password Accordion --- */}
        <Accordion sx={{ width: '100%', mt: 2 }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography>Change Password</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Box component="form" onSubmit={handleChangePassword} sx={{ width: '100%' }}>
              <TextField
                margin="normal"
                required
                fullWidth
                name="oldPassword"
                label="Old Password"
                type="password"
                value={passwordData.oldPassword} 
                onChange={handlePasswordChange}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                name="newPassword"
                label="New Password"
                type="password"
                value={passwordData.newPassword}
                onChange={handlePasswordChange}
              />
              {passwordError && (
                <Alert severity="error" sx={{ mt: 2 }}>{passwordError}</Alert>
              )}
              {passwordSuccess && (
                <Alert severity="success" sx={{ mt: 2 }}>{passwordSuccess}</Alert>
              )}
              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={passwordLoading}
                sx={{ mt: 3, mb: 2 }}
              >
                {passwordLoading ? <CircularProgress size={24} color="inherit" /> : "Update Password"}
              </Button>
            </Box>
          </AccordionDetails>
        </Accordion>

        {/* --- Delete Account Section --- */}
        <Divider sx={{ width: '100%', mt: 4, mb: 2 }} />

        {/* General error display (for delete account) */}
        {error && (
          <Alert severity="error" sx={{ mt: 2, width: '100%' }}>
            {error}
          </Alert>
        )}

        <Button
          fullWidth
          variant="contained"
          color="error"
          sx={{ mt: 2, mb: 1 }}
          onClick={handleClickOpen}
        >
          Delete My Account
        </Button>
        <Typography variant="caption" display="block" align="center">
          This action is permanent and cannot be undone.
        </Typography>
      </Paper>

      {/* --- Delete Confirmation Dialog --- */}
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Are you absolutely sure?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            This will permanently delete your account, along with all your 
            event registrations and any clubs or events you have created. 
            This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleDeleteAccount} color="error">
            Delete My Account
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default Profile;