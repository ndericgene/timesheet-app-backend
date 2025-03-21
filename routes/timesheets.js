const express = require('express');
const router = express.Router();

// Sample POST handler
router.post('/', (req, res) => {
  const timesheetData = req.body;
  console.log('Received timesheet:', timesheetData);
  res.status(201).json({ message: 'Timesheet submitted successfully' });
});

module.exports = router;
