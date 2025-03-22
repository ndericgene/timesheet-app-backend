const express = require('express');
const cors = require('cors');
const app = express();
const authRoutes = require('./routes/auth');
const timesheetRoutes = require('./routes/timesheets');
//const userRoutes = require('./routes/users');

require('dotenv').config();

app.use(cors());
app.use(express.json());

// Route bindings
app.use('/api/auth', authRoutes);
app.use('/api/timesheets', timesheetRoutes);
//app.use('/api/users', userRoutes);

// Health check
app.get('/', (req, res) => {
  res.send('API is running');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
