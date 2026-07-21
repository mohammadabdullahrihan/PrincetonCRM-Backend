const mongoose = require('mongoose');

const Model = mongoose.model('Invoice');

const { calculate } = require('../../../helpers');
const { increaseBySettingKey } = require('../../../middlewares/settings');
const schema = require('./schemaValidate');

const create = async (req, res, next) => {
  try {
    const body = req.body;

    const { error, value } = schema.validate(body);
    if (error) {
      const { details } = error;
      return res.status(400).json({
        success: false,
        result: null,
        message: details[0]?.message,
      });
    }

    if (!req.admin?._id) {
      return res.status(401).json({
        success: false,
        result: null,
        message: 'No authenticated admin on request, authorization denied.',
      });
    }

    const { total = 0, discount = 0 } = value;

    const paymentStatus = calculate.sub(total, discount) === 0 ? 'paid' : 'unpaid';

    // Merge onto the Joi-validated `value` (not the raw `body`) so `number`/`year`/
    // `total` are guaranteed to be actual numbers matching the schema, and spread
    // it first so the fields below always win regardless of what was in the request.
    const result = await new Model({
      ...body,
      ...value,
      total,
      paymentStatus,
      createdBy: req.admin._id,
    }).save();
    const fileId = 'invoice-' + result._id + '.pdf';
    const updateResult = await Model.findOneAndUpdate(
      { _id: result._id },
      { pdf: fileId },
      {
        new: true,
      }
    ).exec();

    increaseBySettingKey({
      settingKey: 'last_invoice_number',
    });

    // Returning successfull response
    return res.status(201).json({
      success: true,
      result: updateResult,
      message: 'Invoice created successfully',
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = create;
