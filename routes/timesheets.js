// Submit timesheet
// routes/timesheets.js
const express = require('express');
const router = express.Router();
const pool = require('../db');
const { verifyToken } = require('../auth/auth'); // use existing token middlewar

const { Parser } = require('json2csv');

// Submit a new timesheet
router.post('/', verifyToken, async (req, res) => {
  try {
    const {
      user_id,
      week_ending,
      job_name,
      work_class,
      monday_hours,
      tuesday_hours,
      wednesday_hours,
      thursday_hours,
      friday_hours,
      saturday_hours,
      sunday_hours,
      total_hours,
      status
    } = req.body;

    const result = await pool.query(
      `INSERT INTO timesheets (
        user_id, week_ending, job_name, work_class,
        monday_hours, tuesday_hours, wednesday_hours, thursday_hours,
        friday_hours, saturday_hours, sunday_hours,
        total_hours, status
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13) RETURNING *`,
      [
        user_id,
        week_ending,
        job_name,
        work_class,
        monday_hours,
        tuesday_hours,
        wednesday_hours,
        thursday_hours,
        friday_hours,
        saturday_hours,
        sunday_hours,
        total_hours,
        status
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error submitting timesheet:', error);
    res.status(500).json({ message: 'Server error' });
  }
});


// Get all timesheets
router.get('/', verifyToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM timesheets ORDER BY date DESC');
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching timesheets:', err);
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
    console.error('Failed to export CSV:', err);
    res.status(500).json({ error: 'Failed to export CSV' });
  }
});

module.exports = router;
