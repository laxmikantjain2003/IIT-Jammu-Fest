import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams, Link } from 'react-router-dom';

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
  Divider,
  CardMedia,
} from '@mui/material';

function EditClub() {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });
  const [logoFile, setLogoFile] = useState(null); // State for the *new* logo file
  const [currentLogo, setCurrentLogo] = useState(''); // URL of the *existing* logo
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true); // Start loading true to fetch data
  const navigate = useNavigate();
  const { id } = useParams(); // Get the Club ID from the URL

  /**
   * @description Fetch existing club data when the component loads.
   */
  useEffect(() => {
    const fetchClub = async () => {
      try {
        setLoading(true);
        // We need the token to fetch, in case this page is restricted
        // Although, for an edit page, the primary auth is on the 'PUT' request.
        // Let's assume the GET is public for now.
        const response = await axios.get(`http://localhost:5000/api/clubs/${id}`);
        const club = response.data;
        
        // Populate the form with existing data
        setFormData({
          name: club.name,
          description: club.description,
        });
        setCurrentLogo(club.logoUrl); // Set the current logo URL to display it
      } catch (err) {
        setError("Failed to load club data for editing.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchClub();
  }, [id]); // Rerun if the ID in the URL changes

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
    setLogoFile(e.target.files[0]);
  };

  /**
   * @description Handles the form submission to update the club.
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    // 1. Create FormData object
    const data = new FormData();
    data.append('name', formData.name);
    data.append('description', formData.description);
    
    // 2. Append the new file *only if* one was selected
    if (logoFile) {
      data.append('logo', logoFile); // 'logo' is the field name backend expects
    }
    
    try {
      // 3. Get token and config
      const token = localStorage.getItem('token');
      if (!token) {
        setError("Authorization failed. Please log in again.");
        setLoading(false);
        return;
      }
      
      const config = {
        headers: {
          'Authorization': `Bearer ${token}`,
          // 'Content-Type' is set automatically by the browser for FormData
        },
      };

      // 4. Send a PUT request to update
      await axios.put(`http://localhost:5000/api/clubs/${id}`, data, config);

      alert("Club details updated successfully!");
      
      // Navigate back to the club details page to see changes
      navigate(`/club/${id}`); 

    } catch (err) {
      console.error("Update club failed:", err.response?.data);
      setError(err.response?.data?.message || "Failed to update club. Check authorization.");
    } finally {
      setLoading(false);
    }
  };

  // --- Render Logic ---
  if (loading && !formData.name) { // Show full page loader only on initial load
      return (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}>
              <CircularProgress />
          </Box>
      );
  }

  if (error && !formData.name) { // Show full page error if initial load fails
    return <Alert severity="error" sx={{ mt: 4 }}>{error}</Alert>;
  }

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
          bgcolor: 'background.paper',
        }}
      >
        <Typography component="h1" variant="h4">
          Edit Club: {formData.name}
        </Typography>
        
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3, width: '100%' }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                id="name"
                label="Club Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                id="description"
                label="Club Description"
                name="description"
                multiline
                rows={5}
                value={formData.description}
                onChange={handleChange}
              />
            </Grid>
            
            {/* Logo Update Section */}
            <Grid item xs={12}>
                <Divider sx={{ my: 2 }}>Change Logo (Optional)</Divider>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, p: 2, border: '1px solid #eee', borderRadius: 1 }}>
                    <CardMedia
                      component="img"
                      image={currentLogo || "https://res.cloudinary.com/demo/image/upload/v1600000000/placeholder.png"} 
                      alt="Current Logo" 
                      sx={{ 
                        width: 80, 
                        height: 80, 
                        objectFit: 'contain', 
                        mr: 2, 
                        borderRadius: '50%',
                        bgcolor: '#f9f9f9'
                      }} 
                    />
                    <Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                          Current Logo
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                          Upload a new file below to replace this logo.
                      </Typography>
                    </Box>
                </Box>
                
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
                      boxSizing: 'border-box',
                    }}
                />
                {logoFile && (
                    <Alert severity="info" sx={{ mt: 1 }}>
                        New file selected: {logoFile.name} (This will replace the current logo on save)
                    </Alert>
                )}
            </Grid>
          </Grid>
          
          {/* Form-wide error display */}
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
            {loading ? <CircularProgress size={24} color="inherit" /> : "Save Changes"}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}

export default EditClub;