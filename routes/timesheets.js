// routes/timesheets.js
const express = require("express");
const router = express.Router();
const pool = require("../db");
const authenticate = require("../middleware/authenticate");

// Create or update a timesheet
router.post("/", authenticate, async (req, res) => {
  const { user_id, week_start, times } = req.body;

  try {
    for (const entry of times) {
      const { day, job_name, work_class, hours } = entry;

      if (!day || !job_name || !work_class || hours === undefined) continue;

      await pool.query(
        `INSERT INTO timesheets (user_id, week_start, day, job_name, work_class, hours)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [user_id, week_start, day, job_name, work_class, hours]
      );
    }

    res.status(201).json({ message: "Timesheet submitted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Manager: view all submitted timesheets
router.get("/pending", authenticate, async (req, res) => {
  if (req.user.role !== "manager") {
    return res.status(403).json({ error: "Access denied" });
  }

  try {
    const result = await pool.query(
      "SELECT * FROM timesheets WHERE approved IS NULL ORDER BY week_start DESC"
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Approve a timesheet
router.put("/:id/approve", authenticate, async (req, res) => {
  if (req.user.role !== "manager") {
    return res.status(403).json({ error: "Access denied" });
  }

  try {
    await pool.query("UPDATE timesheets SET approved = TRUE WHERE id = $1", [
      req.params.id,
    ]);
    res.json({ message: "Timesheet approved" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Export all timesheets as CSV
const { Parser } = require("json2csv");
router.get("/export", authenticate, async (req, res) => {
  if (req.user.role !== "manager") {
    return res.status(403).json({ error: "Access denied" });
  }

  try {
    const result = await pool.query("SELECT * FROM timesheets ORDER BY week_start DESC");

    const fields = ["user_id", "week_start", "day", "job_name", "work_class", "hours"];
    const parser = new Parser({ fields });
    const csv = parser.parse(result.rows);

    res.header("Content-Type", "text/csv");
    res.attachment("timesheets.csv");
    return res.send(csv);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error generating CSV" });
  }
});
// Get all pending timesheets
router.get('/pending', async (req, res) => {
  try {
    const pending = await Timesheet.find({ status: 'pending' });
    res.json(pending);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Approve a timesheet
router.post('/:id/approve', async (req, res) => {
  try {
    const updated = await Timesheet.findByIdAndUpdate(req.params.id, { status: 'approved' }, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Approval failed' });
  }
});

module.exports = router;
