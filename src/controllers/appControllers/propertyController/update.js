const mongoose = require('mongoose');
const Entry = mongoose.model('Property');
const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

const update = asyncHandler(async (req, res) => {
  const { fields, isVIP } = req.body;
  const e = await Entry.findById(req.params.id);
  if (!e) return res.status(404).json({ success: false, message: 'Not found' });

  if (fields) {
    e.fields = { ...(e.fields || {}), ...fields };
    if (fields.Budget) e.budget = Number(fields.Budget);
    if (fields.Location) e.location = fields.Location;
  }
  if (typeof isVIP !== 'undefined') e.isVIP = !!isVIP;
  if (req.body.category) e.category = req.body.category;
  if (req.body.subCategory) e.subCategory = req.body.subCategory;
  e.updated = new Date();
  await e.save();
  return res.json({ success: true, entry: e });
});

module.exports = update;
