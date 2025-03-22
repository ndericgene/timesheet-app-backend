// routes/timesheets.js
const express = require('express');
const router = express.Router();
const pool = require('../db');
const { verifyToken } = require('../auth/auth');
const { Parser } = require('json2csv');

// Submit timesheet
router.post('/', verifyToken, async (req, res) => {
  try {
    const { employeeName, records } = req.body;

    for (const record of records) {
      const { jobName, workClass, hours, date } = record;
      if (!jobName || !workClass || !hours || !date) continue;

      await pool.query(
        'INSERT INTO timesheets (employeeName, jobName, workClass, hours, date) VALUES ($1, $2, $3, $4, $5)',
        [employeeName, jobName, workClass, hours, date]
      );
    }

    res.status(201).json({ message: 'Timesheet submitted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error submitting timesheet' });
  }
});

// Get all timesheets
router.get('/', verifyToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM timesheets ORDER BY date DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Error fetching timesheets' });
  }
});

// Export weekly CSV
router.get('/export/weekly', verifyToken, async (req, res) => {
  try {
    const lastWeek = new Date();
    lastWeek.setDate(lastWeek.getDate() - 7);
    const result = await pool.query(
      'SELECT employeeName, jobName, workClass, hours, date FROM timesheets WHERE date >= $1',
      [lastWeek]
    );

    const fields = ['employeeName', 'jobName', 'workClass', 'hours', 'date'];
    const parser = new Parser({ fields });
    const csv = parser.parse(result.rows);

    res.header('Content-Type', 'text/csv');
    res.attachment('weekly_timesheets.csv');
    return res.send(csv);
  } catch (err) {
    res.status(500).json({ error: 'Failed to export CSV' });
  }
});

module.exports = router;
