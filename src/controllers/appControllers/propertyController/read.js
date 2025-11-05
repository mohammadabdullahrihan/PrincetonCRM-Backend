const mongoose = require('mongoose');
const Entry = mongoose.model('Property');
const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

const read = asyncHandler(async (req, res) => {
  const e = await Entry.findById(req.params.id).lean();
  if (!e) return res.status(404).json({ success: false, message: 'Not found' });
  return res.json({ success: true, entry: e });
});

module.exports = read;
