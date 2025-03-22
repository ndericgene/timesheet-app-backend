const express = require('express');
const router = express.Router();
const pool = require('../db');
const { verifyToken } = require('../auth/auth');

// Submit a timesheet
router.post('/', verifyToken, async (req, res) => {
  const { employeeName, entries } = req.body;

  try {
    for (let entry of entries) {
      const { jobName, workClass, hours, date } = entry;
      await pool.query(
        `INSERT INTO timesheets (employee_name, job_name, work_class, hours, date_submitted, user_id)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [employeeName, jobName, workClass, hours, date, req.user.userId]
      );
    }

    res.status(201).json({ message: 'Timesheet submitted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to submit timesheet' });
  }
});

// Get all timesheets (manager use)
router.get('/', verifyToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM timesheets ORDER BY date_submitted DESC'
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch timesheets' });
  }
});

// Weekly CSV export
const { Parser } = require('json2csv');
router.get('/export/weekly', verifyToken, async (req, res) => {
  try {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const result = await pool.query(
      'SELECT employee_name, job_name, work_class, hours, date_submitted FROM timesheets WHERE date_submitted >= $1',
      [oneWeekAgo]
    );

    const parser = new Parser({ fields: ['employee_name', 'job_name', 'work_class', 'hours', 'date_submitted'] });
    const csv = parser.parse(result.rows);

    res.header('Content-Type', 'text/csv');
    res.attachment('weekly_timesheets.csv');
    res.send(csv);
  } catch (err) {
    res.status(500).json({ error: 'Failed to export CSV' });
  }
});

module.exports = router;
