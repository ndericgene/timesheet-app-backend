const express = require('express');
const router = express.Router();
const Timesheet = require('../models/Timesheet');
const { Parser } = require('json2csv');

// Create timesheet
router.post('/', async (req, res) => {
  try {
    const timesheet = new Timesheet(req.body);
    await timesheet.save();
    res.status(201).json(timesheet);
  } catch (err) {
    res.status(400).json({ error: 'Failed to submit timesheet' });
  }
});

// Get all timesheets (manager)
router.get('/', async (req, res) => {
  try {
    const timesheets = await Timesheet.find().sort({ createdAt: -1 });
    res.json(timesheets);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch timesheets' });
  }
});

// Weekly export as CSV
router.get('/export/weekly', async (req, res) => {
  try {
    const lastWeek = new Date();
    lastWeek.setDate(lastWeek.getDate() - 7);
    const timesheets = await Timesheet.find({ createdAt: { $gte: lastWeek } });

    const fields = ['employeeName', 'jobName', 'workClass', 'hours', 'notes', 'date'];
    const json2csv = new Parser({ fields });
    const csv = json2csv.parse(timesheets);

    res.header('Content-Type', 'text/csv');
    res.attachment('weekly_timesheets.csv');
    return res.send(csv);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to export CSV' });
  }
});

module.exports = router;

