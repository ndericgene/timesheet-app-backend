const express = require('express');
const cors = require('cors');
const fs = require('fs');
const https = require('https');
require('dotenv').config();

const app = express();

// Routes
const authRoutes = require('./routes/auth');
const timesheetRoutes = require('./routes/timesheets');
const userRoutes = require('./routes/user');

// Middleware
app.use(cors());
app.use(express.json());

// Route bindings
app.use('/api/auth', authRoutes);
app.use('/api/timesheets', timesheetRoutes);
app.use('/api/users', userRoutes);

// Health check
app.get('/', (req, res) => {
  res.send('API is running');
});

// Load HTTPS certificates
const privateKey = fs.readFileSync('/etc/letsencrypt/live/centralmechanical.org/privkey.pem', 'utf8');
const certificate = fs.readFileSync('/etc/letsencrypt/live/centralmechanical.org/cert.pem', 'utf8');
const ca = fs.readFileSync('/etc/letsencrypt/live/centralmechanical.org/chain.pem', 'utf8');

const credentials = {
  key: privateKey,
  cert: certificate,
  ca: ca
};

// Create HTTPS server
const PORT = process.env.PORT || 5000;
https.createServer(credentials, app).listen(PORT, () => {
  console.log(`✅ HTTPS Server running on port ${PORT}`);
});
