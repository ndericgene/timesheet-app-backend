const express = require('express');
const cors = require('cors');
const authRoutes = require('./auth/auth.js');

require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/timesheets', require('./routes/timesheets'));

const timesheetRoutes = require("./routes/timesheets");
app.use("/api/timesheets", timesheetRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
