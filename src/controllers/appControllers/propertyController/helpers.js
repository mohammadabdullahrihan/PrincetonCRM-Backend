const mongoose = require('mongoose');
const CategoryConfig = mongoose.model('CategoryConfig');

async function getRangeFromKey(categoryKey, subKey, rangeKey) {
  if (!categoryKey || !subKey || !rangeKey) return null;
  const cat = await CategoryConfig.findOne({ key: categoryKey }).lean();
  if (!cat) return null;
  const sub = (cat.subcategories || []).find((s) => s.key === subKey);
  if (!sub || !sub.filters?.priceRanges) return null;
  return sub.filters.priceRanges.find((r) => r.key === rangeKey) || null;
}

module.exports = { getRangeFromKey };
