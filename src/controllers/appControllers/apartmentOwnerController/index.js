const mongoose = require('mongoose');
const createCRUDController = require('../../middlewaresControllers/createCRUDController');

function modelController() {
  const Model = mongoose.model('ApartmentOwner');
  const methods = createCRUDController('ApartmentOwner');

  return methods;
}

module.exports = modelController();
