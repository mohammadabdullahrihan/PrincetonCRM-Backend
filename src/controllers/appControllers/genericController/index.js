const createCRUDController = require('../../middlewaresControllers/createCRUDController');
const { remove, modelMap } = require('./delete');

function modelController() {
  // Create a generic CRUD controller
  // This can be used as a base for any model
  const methods = createCRUDController('Client'); // Default model
  
  // Add custom delete method
  methods.remove = remove;
  methods.modelMap = modelMap;
  
  return methods;
}

module.exports = modelController();
