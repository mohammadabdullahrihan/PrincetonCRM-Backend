const Joi = require('joi');
const schema = Joi.object({
  client: Joi.alternatives().try(Joi.string(), Joi.object()).required(),
  currency: Joi.string().optional(),
  number: Joi.number().required(),
  year: Joi.number().required(),
  status: Joi.string().required(),
  notes: Joi.string().allow(''),
  location: Joi.string().allow('').optional(),
  projectName: Joi.string().allow('').optional(),
  paymentPurpose: Joi.string().allow('').optional(),
  paymentMethod: Joi.string().allow('').optional(),
  bankName: Joi.string().allow('').optional(),
  bankBranch: Joi.string().allow('').optional(),
  chequeNo: Joi.string().allow('').optional(),
  expiredDate: Joi.date().required(),
  date: Joi.date().required(),
  total: Joi.number().min(0).required(),
  discount: Joi.number().min(0).optional(),
});

module.exports = schema;
