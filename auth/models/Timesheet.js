const mongoose = require('mongoose');

const entrySchema = new mongoose.Schema({
  date: { type: String },
  jobName: { type: String },
  workClass: { type: String },
  hours: { type: Number }
});

const timesheetSchema = new mongoose.Schema({
  employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  employeeName: { type: String },
  entries: [entrySchema],
  submittedAt: { type: Date, default: Date.now },
  approved: { type: Boolean, default: false }
});

module.exports = mongoose.model('Timesheet', timesheetSchema);
