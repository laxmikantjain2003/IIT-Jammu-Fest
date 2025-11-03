import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate, Link } from 'react-router-dom';

// --- Import MUI components ---
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  CircularProgress,
  Alert,
  CardMedia,
  Divider,
  Button,
  ImageList, // For the gallery layout
  ImageListItem, // For each gallery item
  ImageListItemBar, // For the photo caption
  IconButton, // For the delete button
  TextField, // For the upload form
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete'; // Delete Icon

// --- UploadPhotoForm Component ---
// This is a helper component nested inside ClubDetail
// It only renders if the user is the club owner.
const UploadPhotoForm = ({ clubId, onUploadSuccess }) => {
    const [file, setFile] = useState(null);
    const [caption, setCaption] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    /**
     * @description Handles submission of the photo upload form.
     */
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        if (!file) {
            setError("Please select an image file to upload.");
            return;
        }
        setLoading(true);

        // We must use FormData to send files
        const data = new FormData();
        data.append('file', file); // 'file' is the key expected by photoUpload.js
        data.append('caption', caption);

        try {
            const token = localStorage.getItem('token');
            const config = {
                headers: {
                    // 'Content-Type': 'multipart/form-data' is set automatically by browser with FormData
                    'Authorization': `Bearer ${token}`,
                },
            };
            
            await axios.post(`http://localhost:5000/api/photos/${clubId}`, data, config);
            
            onUploadSuccess(); // Trigger parent component to refetch photos
            setFile(null);
            setCaption('');
            if(document.getElementById('photo-upload-input')) {
              document.getElementById('photo-upload-input').value = null;
            }
            
        } catch (err) {
            console.error("Photo upload failed:", err.response.data);
            setError(err.response.data.message || "Upload failed. Image might be too large or invalid (Max 1MB).");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={{ mt: 3, p: 3, border: '1px dashed #ccc', borderRadius: 2 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>Upload New Function Photo</Typography>
            <Box component="form" onSubmit={handleSubmit}>
                <TextField 
                    fullWidth
                    label="Caption (e.g., Holi Fest 2024)"
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    sx={{ mb: 2 }}
                />
                <input
                    type="file"
                    id="photo-upload-input"
                    name="file"
                    accept="image/*"
                    onChange={(e) => setFile(e.target.files[0])}
                    required
                    style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }}
                />
                {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
                <Button
                    type="submit"
                    variant="contained"
                    disabled={loading}
                    sx={{ mt: 2 }}
                >
                    {loading ? <CircularProgress size={24} color="inherit" /> : "Upload Photo"}
                </Button>
            </Box>
        </Box>
    );
};


// --- Main ClubDetail Component ---
function ClubDetail() {
  const [club, setClub] = useState(null);
  const [user, setUser] = useState(null); 
  const [photos, setPhotos] = useState([]); // State for the photo gallery
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { id } = useParams(); // Get the club ID from the URL

  /**
   * @description Fetches all data for the club (details and photos).
   */
  const fetchClubData = async () => {
    try {
        // Fetch Club Details (e.g., name, description, coordinator)
        const clubResponse = await axios.get(`http://localhost:5000/api/clubs/${id}`);
        setClub(clubResponse.data);

        // Fetch Photos for this club's gallery
        const photoResponse = await axios.get(`http://localhost:5000/api/photos/${id}`);
        setPhotos(photoResponse.data);

    } catch (err) {
        console.error("Error fetching club data:", err);
        setError("Failed to load club and photo details.");
    } finally {
        setLoading(false);
    }
  };

  // 1. Fetch data on component load
  useEffect(() => {
    // Check who is logged in from localStorage
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
        setUser(JSON.parse(storedUser));
    }
    setLoading(true);
    fetchClubData(); 
  }, [id]); // Re-run if the club ID in the URL changes

  /**
   * @description Handles the deletion of a photo from the gallery.
   */
  const handleDeletePhoto = async (photoId) => {
      if (!window.confirm("Are you sure you want to delete this photo? This cannot be undone.")) {
          return;
      }
      try {
          const token = localStorage.getItem('token');
          const config = {
              headers: {
                  'Authorization': `Bearer ${token}`,
              },
          };
          
          await axios.delete(`http://localhost:5000/api/photos/delete/${photoId}`, config);
          
          alert("Photo deleted successfully!");
          // Refresh the gallery by refetching all photos
          const photoResponse = await axios.get(`http://localhost:5000/api/photos/${id}`);
          setPhotos(photoResponse.data);

      } catch (err) {
          console.error("Photo deletion failed:", err.response.data);
          alert(err.response.data.message || "Failed to delete photo. Check authorization.");
      }
  };

  // Check if the current user is the owner of the club
  const isClubOwner = user && club && (user.id === club.coordinatorId || user.role === 'admin');

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

  if (!club) {
    return <Alert severity="warning">Club not found.</Alert>;
  }

  return (
    <Container component="main" maxWidth="lg">
      <Paper elevation={3} sx={{ padding: { xs: 2, md: 4 }, mt: 4 }}>
        
        {/* --- Header Section (Logo, Name, Coordinator) --- */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3, flexWrap: 'wrap' }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <CardMedia
                    component="img"
                    sx={{ 
                        height: 120, 
                        width: 120, 
                        objectFit: 'contain', 
                        borderRadius: '50%',
                        mr: 3, 
                    }}
                    image={club.logoUrl || "https://res.cloudinary.com/demo/image/upload/v1600000000/placeholder.png"} 
                    alt={club.name}
                />
                <Box>
                    <Typography variant="h3" component="h1" gutterBottom>
                        {club.name}
                    </Typography>
                    <Typography variant="h6" color="text.secondary">
                        Coordinator: {club.User ? club.User.name : 'N/A'}
                    </Typography>
                </Box>
            </Box>

            {/* --- Edit Button (Owner Only) --- */}
            {isClubOwner && (
                <Button 
                    component={Link} 
                    to={`/edit-club/${club.id}`} 
                    variant="contained" 
                    color="primary"
                    sx={{ mt: { xs: 2, sm: 0 } }} // Add margin on small screens
                >
                    Edit Club Info
                </Button>
            )}
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* --- Description --- */}
        <Typography variant="h5" component="h2" sx={{ mb: 2 }}>
          About the Club
        </Typography>
        <Typography variant="body1" paragraph sx={{ whiteSpace: 'pre-wrap' }}>
          {/* pre-wrap preserves line breaks from the description */}
          {club.description}
        </Typography>

        <Divider sx={{ my: 3 }} />

        {/* --- Photo Gallery Section --- */}
        <Typography variant="h5" component="h2" sx={{ mb: 2 }}>
          Function Photo Gallery
        </Typography>

        {/* --- UPLOAD FORM (Owner Only) --- */}
        {isClubOwner && (
            <UploadPhotoForm clubId={club.id} onUploadSuccess={fetchClubData} />
        )}
        
        {/* --- GALLERY DISPLAY (Public) --- */}
        {photos.length === 0 ? (
            <Alert severity="info" sx={{ mt: 3 }}>
                No photos have been uploaded for this club yet.
            </Alert>
        ) : (
            <Box sx={{ mt: 3 }}>
                <ImageList variant="masonry" cols={5} gap={8}>
                    {photos.map((item) => (
                        <ImageListItem key={item.id} sx={{ '&:hover .delete-button-bar': { opacity: 1 } }}>
                            <img
                                srcSet={`${item.imageUrl}?w=248&fit=crop&auto=format&dpr=2 2x`}
                                src={`${item.imageUrl}?w=248&fit=crop&auto=format`}
                                alt={item.caption}
                                loading="lazy"
                                style={{ borderRadius: '8px', border: '1px solid #eee' }}
                            />
                            {/* --- Delete Button (Owner Only) --- */}
                            {isClubOwner && (
                                <ImageListItemBar
                                    className="delete-button-bar" // For hover effect
                                    sx={{ 
                                        backgroundColor: 'rgba(0, 0, 0, 0.4)',
                                        transition: 'opacity 0.3s',
                                        opacity: 0, // Hidden by default
                                    }}
                                    position="top"
                                    actionIcon={
                                        <IconButton
                                            sx={{ color: 'white' }}
                                            onClick={() => handleDeletePhoto(item.id)}
                                        >
                                            <DeleteIcon />
                                        </IconButton>
                                    }
                                />
                            )}
                            {/* --- Caption (Public) --- */}
                            <ImageListItemBar
                                title={item.caption}
                                subtitle={`Uploaded: ${new Date(item.createdAt).toLocaleDateString()}`}
                                position="bottom"
                            />
                        </ImageListItem>
                    ))}
                </ImageList>
            </Box>
        )}

      </Paper>
    </Container>
  );
}

export default ClubDetail;