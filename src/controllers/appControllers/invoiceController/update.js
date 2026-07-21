const mongoose = require('mongoose');

const Model = mongoose.model('Invoice');

const custom = require('../../pdfController');

const { calculate } = require('../../../helpers');
const schema = require('./schemaValidate');

const update = async (req, res, next) => {
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

    const previousInvoice = await Model.findOne({
      _id: req.params.id,
      removed: false,
    });

    const { credit } = previousInvoice;

    const { total = 0, discount = 0 } = req.body;

    body['total'] = total;
    body['pdf'] = 'invoice-' + req.params.id + '.pdf';
    if (body.hasOwnProperty('currency')) {
      delete body.currency;
    }

    // Find document by id and updates with the required fields

    let paymentStatus =
      calculate.sub(total, discount) === credit ? 'paid' : credit > 0 ? 'partially' : 'unpaid';
    body['paymentStatus'] = paymentStatus;

    const result = await Model.findOneAndUpdate({ _id: req.params.id, removed: false }, body, {
      new: true, // return the new result instead of the old one
    }).exec();

    // Returning successfull response

    return res.status(200).json({
      success: true,
      result,
      message: 'we update this document ',
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = update;
