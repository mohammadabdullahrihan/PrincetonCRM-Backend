const createCRUDController = require('../middlewaresControllers/createCRUDController');

const { globSync } = require('glob');
const path = require('path');

// Lazy loading function to prevent early controller loading
const appControllers = () => {
  console.log('Loading app controllers...');
  
  // Import routesList only when needed
  const { routesList } = require('../../models/utils');
  
  const pattern = './src/controllers/appControllers/*/**/';
  const controllerDirectories = globSync(pattern).map((filePath) => {
    return path.basename(filePath);
  });

  const controllers = {};
  const hasCustomControllers = [];

  controllerDirectories.forEach((controllerName) => {
    try {
      console.log(`Loading controller: ${controllerName}`);
      const customController = require('./' + controllerName);

      if (customController) {
        hasCustomControllers.push(controllerName);
        controllers[controllerName] = customController;
        console.log(`✓ Successfully loaded controller: ${controllerName}`);
      }
    } catch (error) {
      console.error(`✗ Error loading controller ${controllerName}:`, error.message);
      // Continue with other controllers instead of throwing
    }
  });

  routesList.forEach(({ modelName, controllerName }) => {
    if (!hasCustomControllers.includes(controllerName)) {
      console.log(`Creating CRUD controller for: ${controllerName}`);
      controllers[controllerName] = createCRUDController(modelName);
    }
  });

  console.log('All app controllers loaded successfully');
  return controllers;
};

// Export the function, not the result
module.exports = appControllers;
