const mongoose = require('mongoose');

const priceRangeSchema = new mongoose.Schema(
  {
    key: String,
    label: String,
    min: Number,
    max: Number,
  },
  { _id: false }
);

const subcategorySchema = new mongoose.Schema(
  {
    key: String,
    label: String,
    filters: {
      priceRanges: [priceRangeSchema],
    },
  },
  { _id: false }
);

const categoryConfigSchema = new mongoose.Schema({
  key: { type: String, required: true },
  label: { type: String, required: true },
  subcategories: [subcategorySchema],
});

module.exports = mongoose.model('CategoryConfig', categoryConfigSchema);
