const Joi = require('joi');
const schema = Joi.object({
  client: Joi.alternatives().try(Joi.string(), Joi.object()).optional(),
  currency: Joi.string().optional(),
  number: Joi.number().optional(),
  year: Joi.number().optional(),
  status: Joi.string().optional(),
  notes: Joi.string().allow(''),
  location: Joi.string().allow('').optional(),
  projectName: Joi.string().allow('').optional(),
  paymentPurpose: Joi.string().allow('').optional(),
  paymentMethod: Joi.string().allow('').optional(),
  bankName: Joi.string().allow('').optional(),
  bankBranch: Joi.string().allow('').optional(),
  chequeNo: Joi.string().allow('').optional(),
  expiredDate: Joi.date().optional(),
  date: Joi.date().optional(),
  total: Joi.number().min(0).optional(),
  discount: Joi.number().min(0).optional(),
});

module.exports = schema;
