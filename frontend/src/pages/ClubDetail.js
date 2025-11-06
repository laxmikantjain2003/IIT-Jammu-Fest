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
// Yeh ek helper component hai jo ClubDetail page ke andar nested hai
// Yeh sirf tab dikhta hai jab user club ka owner hota hai.
const UploadPhotoForm = ({ clubId, onUploadSuccess }) => {
    const [file, setFile] = useState(null);
    const [caption, setCaption] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    /**
     * @description Photo upload form ko handle karta hai.
     */
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        if (!file) {
            setError("Please select an image file to upload.");
            return;
        }
        setLoading(true);

        // Files bhejne ke liye FormData zaroori hai
        const data = new FormData();
        data.append('file', file); // 'file' woh key hai jise photoUpload.js dhoondh raha hai
        data.append('caption', caption);

        try {
            const token = localStorage.getItem('token');
            const config = {
                headers: {
                    // FormData ke liye 'Content-Type' browser khud set karta hai
                    'Authorization': `Bearer ${token}`,
                },
            };
            
            await axios.post(`http://localhost:5000/api/photos/${clubId}`, data, config);
            
            onUploadSuccess(); // Parent component ko photos refresh karne ke liye trigger karta hai
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
  const [photos, setPhotos] = useState([]); // Photo gallery ke liye state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { id } = useParams(); // URL se club ID (/club/:id) lene ke liye

  /**
   * @description Club ki details aur photos, donon ko fetch karta hai.
   */
  const fetchClubData = async () => {
    try {
        // Club Details (name, description, coordinator) fetch karein
        const clubResponse = await axios.get(`http://localhost:5000/api/clubs/${id}`);
        setClub(clubResponse.data);

        // Is club ki gallery ke liye photos fetch karein
        const photoResponse = await axios.get(`http://localhost:5000/api/photos/${id}`);
        setPhotos(photoResponse.data);

    } catch (err) {
        console.error("Error fetching club data:", err);
        setError("Failed to load club and photo details.");
    } finally {
        setLoading(false);
    }
  };

  // 1. Page load hone par data fetch karein
  useEffect(() => {
    // localStorage se check karein ki kaun logged-in hai
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
        setUser(JSON.parse(storedUser));
    }
    setLoading(true);
    fetchClubData(); 
  }, [id]); // Agar URL mein ID badalti hai toh dobara fetch karein

  /**
   * @description Gallery se photo delete karne ka function.
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
          // Delete karne ke baad gallery ko refresh karein
          const photoResponse = await axios.get(`http://localhost:5000/api/photos/${id}`);
          setPhotos(photoResponse.data);

      } catch (err) {
          console.error("Photo deletion failed:", err.response.data);
          alert(err.response.data.message || "Failed to delete photo. Check authorization.");
      }
  };

  // Check karein ki current user is club ka owner hai ya admin
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
      {/* Paper component (jo white background deta hai) yahaan zaroori hai 
          kyunki yeh page internal hai, auth page nahi. */}
      <Paper elevation={3} sx={{ padding: { xs: 2, md: 4 }, mt: 4, bgcolor: 'background.paper' }}>
        
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
                        border: '2px solid #eee'
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

            {/* --- Edit Button (Sirf Owner ko dikhega) --- */}
            {isClubOwner && (
                <Button 
                    component={Link} 
                    to={`/edit-club/${club.id}`} 
                    variant="contained" 
                    color="primary"
                    sx={{ mt: { xs: 2, sm: 0 } }} // Chhoti screen par margin
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
          {/* pre-wrap description mein line breaks ko banaye rakhta hai */}
          {club.description}
        </Typography>

        <Divider sx={{ my: 3 }} />

        {/* --- Photo Gallery Section --- */}
        <Typography variant="h5" component="h2" sx={{ mb: 2 }}>
          Function Photo Gallery
        </Typography>

        {/* --- UPLOAD FORM (Sirf Owner ko dikhega) --- */}
        {isClubOwner && (
            <UploadPhotoForm clubId={club.id} onUploadSuccess={fetchClubData} />
        )}
        
        {/* --- GALLERY DISPLAY (Sabko dikhega) --- */}
        {photos.length === 0 ? (
            <Alert severity="info" sx={{ mt: 3 }}>
                No photos have been uploaded for this club yet.
            </Alert>
        ) : (
            <Box sx={{ mt: 3 }}>
                {/* Responsive ImageList */}
                <ImageList 
                  variant="masonry" 
                  cols={{ xs: 1, sm: 2, md: 3, lg: 4 }} 
                  gap={8}
                >
                    {photos.map((item) => (
                        <ImageListItem key={item.id} sx={{ '&:hover .delete-button-bar': { opacity: 1 } }}>
                            <img
                                srcSet={`${item.imageUrl}?w=248&fit=crop&auto=format&dpr=2 2x`}
                                src={`${item.imageUrl}?w=248&fit=crop&auto=format`}
                                alt={item.caption}
                                loading="lazy"
                                style={{ borderRadius: '8px', border: '1px solid #eee' }}
                            />
                            {/* --- Delete Button (Sirf Owner ko dikhega) --- */}
                            {isClubOwner && (
                                <ImageListItemBar
                                    className="delete-button-bar" // Hover effect ke liye
                                    sx={{ 
                                        backgroundColor: 'rgba(0, 0, 0, 0.4)',
                                        transition: 'opacity 0.3s',
                                        opacity: 0, // Default mein hidden
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
                            {/* --- Caption (Sabko dikhega) --- */}
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