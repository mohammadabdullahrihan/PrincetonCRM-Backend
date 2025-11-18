const mongoose = require('mongoose');
const createCRUDController = require('../../middlewaresControllers/createCRUDController');

function modelController() {
  const Model = mongoose.model('LandClient');
  const methods = createCRUDController('LandClient');

  return methods;
}

module.exports = modelController();
