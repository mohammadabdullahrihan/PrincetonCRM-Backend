const mongoose = require('mongoose');
const Visit = mongoose.model('Visit');
const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

const listVisits = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const visits = await Visit.find({ entryId: id }).sort({ createdAt: -1 }).lean();
  return res.json({ success: true, visits });
});

module.exports = listVisits;
