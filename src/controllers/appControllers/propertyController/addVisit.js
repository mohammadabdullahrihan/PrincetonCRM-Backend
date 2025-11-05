const mongoose = require('mongoose');
const Entry = mongoose.model('Property');
const Visit = mongoose.model('Visit');
const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

const addVisit = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { employeeId, date, note } = req.body;
  const e = await Entry.findById(id);
  if (!e) return res.status(404).json({ success: false, message: 'Entry not found' });
  const v = new Visit({
    entryId: e._id,
    employeeId: employeeId ? new mongoose.Types.ObjectId(employeeId) : null,
    date: date ? new Date(date) : new Date(),
    note,
  });
  await v.save();
  return res.status(201).json({ success: true, visit: v });
});

module.exports = addVisit;
