import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

// --- Import MUI components ---
import {
  Container,
  Paper,
  Box,
  Typography,
  TextField,
  Button,
  Alert,
  Grid,
  CircularProgress,
} from '@mui/material';

function CreateClub() {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });
  const [logoFile, setLogoFile] = useState(null); // State for the selected file
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  /**
   * @description Handles changes to the text input fields.
   */
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  /**
   * @description Handles the file input change.
   */
  const handleFileChange = (e) => {
    // Get the first file selected
    setLogoFile(e.target.files[0]);
  };

  /**
   * @description Handles the form submission to create a new club.
   * Uses FormData to package the text and image file together.
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    // 1. Create FormData object to send multipart data (text + file)
    const data = new FormData();
    data.append('name', formData.name);
    data.append('description', formData.description);
    
    // 2. Append the file *only if* one was selected
    if (logoFile) {
      // 'logo' is the field name the backend (logoUpload.js) expects
      data.append('logo', logoFile);
    }
    
    try {
      // 3. Get the token for authentication
      const token = localStorage.getItem('token');
      if (!token) {
        setError("You must be logged in to create a club.");
        setLoading(false);
        return;
      }

      // 4. Set the header (Authorization only, Content-Type is set by browser)
      const config = {
        headers: {
          'Authorization': `Bearer ${token}`,
          // 'Content-Type': 'multipart/form-data' is set automatically
          // by the browser when using FormData.
        },
      };

      // 5. Send the POST request to the /api/clubs endpoint
      await axios.post('http://localhost:5000/api/clubs', data, config);

      alert("Club successfully created!");
      
      // Redirect to the main club list page
      navigate('/clubs'); 

    } catch (err) {
      console.error("Create club failed:", err.response?.data);
      // Show specific error from backend (e.g., "You already own a club.")
      setError(err.response?.data?.message || "Failed to create club.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container component="main" maxWidth="md">
      <Paper 
        elevation={3}
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: 4,
          bgcolor: 'background.paper', // Solid white background
        }}
      >
        <Typography component="h1" variant="h4">
          Register Your Club
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1, mb: 3 }}>
          Each coordinator can register only one official club.
        </Typography>
        
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3, width: '100%' }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                id="name"
                label="Club Name (e.g., Music Club, Robotics Club)"
                name="name"
                value={formData.name}
                onChange={handleChange}
                autoFocus
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                id="description"
                label="Club Description (Mission, Activities, etc.)"
                name="description"
                multiline
                rows={5}
                value={formData.description}
                onChange={handleChange}
              />
            </Grid>
            
            {/* File Input for Logo */}
            <Grid item xs={12}>
              <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 500 }}>
                Club Logo (Optional)
              </Typography>
              <input
                type="file"
                name="logo"
                accept="image/png, image/jpeg, image/jpg"
                onChange={handleFileChange}
                style={{ 
                  width: '100%', 
                  padding: '10px', 
                  border: '1px solid #ccc', 
                  borderRadius: '4px',
                  boxSizing: 'border-box', // Ensures padding doesn't break layout
                }}
              />
              {logoFile && (
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                  Selected: {logoFile.name}
                </Typography>
              )}
            </Grid>
          </Grid>
          
          {/* Error display */}
          {error && (
            <Alert severity="error" sx={{ mt: 3, width: '100%' }}>
              {error}
            </Alert>
          )}

          <Button
            type="submit"
            fullWidth
            variant="contained"
            disabled={loading}
            sx={{ mt: 3, mb: 2 }}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : "Create Club"}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}

export default CreateClub;