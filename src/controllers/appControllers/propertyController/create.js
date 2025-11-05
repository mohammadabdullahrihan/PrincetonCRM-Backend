const mongoose = require('mongoose');
const Entry = mongoose.model('Property');
const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

const create = asyncHandler(async (req, res) => {
  try {
    const {
      category,
      subCategory,
      fields = {},
      isVIP,
      name,
      location,
      budget,
      remark,
      number,
      ref,
    } = req.body;

    // Validate required fields
    if (!category || !subCategory) {
      return res.status(400).json({
        success: false,
        message: 'category and subCategory are required',
      });
    }

    // Validate category and subCategory values
    const validCategories = [
      'Apartment',
      'Land',
      'Shop',
      'CommercialSpace',
      'JointVenture',
      'Investor',
      'ClientUniversal',
    ];

    if (!validCategories.includes(category)) {
      return res.status(400).json({
        success: false,
        message: `Invalid category. Must be one of: ${validCategories.join(', ')}`,
      });
    }

    // Support both fields object and direct field formats
    const finalFields = {
      ...(fields || {}),
      ...(name && { Name: name }),
      ...(location && { Location: location }),
      ...(budget && { Budget: budget }),
      ...(remark && { Remark: remark }),
      ...(number && { Number: number }),
      ...(ref && { Ref: ref }),
    };

    const budgetValue = fields?.Budget
      ? Number(fields.Budget)
      : budget
        ? Number(budget)
        : req.body.budget
          ? Number(req.body.budget)
          : null;

    const e = new Entry({
      category,
      subCategory,
      fields: finalFields,
      budget: budgetValue,
      location: fields?.Location || location || req.body.location,
      isVIP: !!isVIP,
      createdBy: req.user?.id,
      name: fields?.Name || name || req.body.name,
      remark: fields?.Remark || remark || req.body.remark,
      number: fields?.Number || number || req.body.number,
      ref: fields?.Ref || ref || req.body.ref,
    });

    await e.save();
    return res.status(201).json({ success: true, result: e });
  } catch (error) {
    console.error('Property creation error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error creating property',
      error: error.message,
    });
  }
});

module.exports = create;
