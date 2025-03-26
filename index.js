const express = require('express');
const cors = require('cors');

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

// Test route
app.get('/api/test', (req, res) => {
  res.json({ success: true });
});
=======

// Health check
app.get('/', (req, res) => {
  res.send('API is running');
});


// Use plain HTTP server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ HTTP Server running on port ${PORT}`);
});
