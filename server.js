// server.js
const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

// For local development
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
} else {
  // In production, you might want to use a different port or process
  app.listen(process.env.PORT || 3000, () => {
    console.log(`Server running in production on port ${process.env.PORT || 3000}`);
  });
}

module.exports = app;
