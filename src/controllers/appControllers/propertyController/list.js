const mongoose = require('mongoose');
const Entry = mongoose.model('Property');
const Visit = mongoose.model('Visit');
const { getRangeFromKey } = require('./helpers');
const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

const list = asyncHandler(async (req, res) => {
  try {
    const {
      category,
      subCategory,
      priceRange,
      location,
      isVIP,
      q,
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      sortDir = 'desc',
      employee,
    } = req.query;

    const filter = { removed: false };
    if (category) filter.category = category;
    if (subCategory) filter.subCategory = subCategory;
    if (isVIP === 'true' || isVIP === true) filter.isVIP = true;
    if (location) filter.location = { $regex: location, $options: 'i' };

    // Price range
    if (priceRange) {
      const range = await getRangeFromKey(category, subCategory, priceRange);
      if (range) {
        filter.budget = {};
        if (range.min != null) filter.budget.$gte = Number(range.min);
        if (range.max != null) filter.budget.$lte = Number(range.max);
      }
    }

    // Search text
    if (q) {
      const re = new RegExp(q, 'i');
      filter.$or = [{ name: re }, { location: re }, { remark: re }];
    }

    // Filter by employee visit
    if (employee) {
      const visits = await Visit.find({ employeeId: new mongoose.Types.ObjectId(employee) })
        .select('entryId')
        .lean();
      const ids = visits.map((v) => v.entryId).filter((id) => id);
      if (ids.length === 0) return res.json({ success: true, total: 0, entries: [] });
      filter._id = { $in: ids };
    }

    const skip = (Math.max(1, Number(page)) - 1) * Number(limit);
    const sortObj = { [sortBy]: sortDir === 'desc' ? -1 : 1 };

    const [total, entries] = await Promise.all([
      Entry.countDocuments(filter).catch(() => 0),
      Entry.find(filter)
        .sort(sortObj)
        .skip(skip)
        .limit(Number(limit))
        .lean()
        .catch(() => []),
    ]);

    return res.json({ success: true, total, page: Number(page), entries });
  } catch (error) {
    console.error('Property list error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error retrieving properties',
      error: error.message,
    });
  }
});

module.exports = list;
