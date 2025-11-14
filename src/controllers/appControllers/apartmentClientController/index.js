const mongoose = require('mongoose');
const createCRUDController = require('../../middlewaresControllers/createCRUDController');

function modelController() {
  const Model = mongoose.model('ApartmentClient');
  const methods = createCRUDController('ApartmentClient');

  return methods;
}

module.exports = modelController();
