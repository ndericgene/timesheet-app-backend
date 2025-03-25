const express = require('express');
const cors = require('cors');
const fs = require('fs');
const https = require('https');
const app = express();
const authRoutes = require('./routes/auth');
const timesheetRoutes = require('./routes/timesheets');
const userRoutes = require('./routes/user');

require('dotenv').config();

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

const PORT = process.env.PORT || 5000;

// Load SSL certificates
const privateKey = fs.readFileSync('/path/to/your/private.key', 'utf8');
const certificate = fs.readFileSync('/path/to/your/certificate.crt', 'utf8');
const ca = fs.readFileSync('/path/to/your/ca_bundle.crt', 'utf8');

const credentials = {
  key: privateKey,
  cert: certificate,
  ca: ca
};

// Create HTTPS server
const httpsServer = https.createServer(credentials, app);

httpsServer.listen(PORT, () => {
  console.log(`HTTPS Server running on port ${PORT}`);
});
