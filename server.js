const express = require('express');
const cors = require('cors');
const path = require('path');
const imagesAPI = require('./api/images');
const uploadAPI = require('./api/upload');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Serve static files (uploaded images)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Route for uploading images
app.post('/api/upload', uploadAPI);

// Routes for managing images (GET, PUT, DELETE)
app.get('/api/images', imagesAPI);
app.put('/api/images/:id', imagesAPI);
app.delete('/api/images/:id', imagesAPI);

// Start the local server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

