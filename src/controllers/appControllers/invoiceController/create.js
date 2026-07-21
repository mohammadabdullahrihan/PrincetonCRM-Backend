const mongoose = require('mongoose');

const Model = mongoose.model('Invoice');

const { calculate } = require('../../../helpers');
const { increaseBySettingKey } = require('../../../middlewares/settings');
const schema = require('./schemaValidate');

const create = async (req, res, next) => {
  try {
    let body = req.body;

    const { error, value } = schema.validate(body);
    if (error) {
      const { details } = error;
      return res.status(400).json({
        success: false,
        result: null,
        message: details[0]?.message,
      });
    }

    const { total = 0, discount = 0 } = value;

    body['total'] = total;

    let paymentStatus = calculate.sub(total, discount) === 0 ? 'paid' : 'unpaid';

    body['paymentStatus'] = paymentStatus;
    body['createdBy'] = req.admin._id;

    // Creating a new document in the collection
    const result = await new Model(body).save();
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
