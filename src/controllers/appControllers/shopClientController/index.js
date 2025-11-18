const mongoose = require('mongoose');
const createCRUDController = require('../../middlewaresControllers/createCRUDController');

function modelController() {
  const Model = mongoose.model('ShopClient');
  const methods = createCRUDController('ShopClient');

  return methods;
}

module.exports = modelController();
