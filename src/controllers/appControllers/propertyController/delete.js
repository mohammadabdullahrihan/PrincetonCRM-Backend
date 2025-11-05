const mongoose = require('mongoose');
const Entry = mongoose.model('Property');
const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

const remove = asyncHandler(async (req, res) => {
  const e = await Entry.findById(req.params.id);
  if (!e) return res.status(404).json({ success: false, message: 'Not found' });
  if (typeof e.removed !== 'undefined') {
    e.removed = true;
    await e.save();
  } else {
    await Entry.deleteOne({ _id: e._id });
  }
  return res.json({ success: true, message: 'Deleted' });
});

module.exports = remove;
