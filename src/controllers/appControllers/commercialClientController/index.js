const mongoose = require('mongoose');
const createCRUDController = require('@/controllers/middlewaresControllers/createCRUDController');

function modelController() {
  const Model = mongoose.model('CommercialClient');
  const methods = createCRUDController('CommercialClient');

  return methods;
}

module.exports = modelController();
