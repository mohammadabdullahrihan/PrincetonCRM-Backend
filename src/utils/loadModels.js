const mongoose = require('mongoose');
const path = require('path');
const { globSync } = require('glob');

function loadModels() {
  // Get all model files
  const modelFiles = globSync(path.join(__dirname, '../models/**/*.js'));
  
  // Load each model file
  modelFiles.forEach((file) => {
    // Skip test files
    if (file.endsWith('.test.js')) return;
    require(file);
  });

  // Return a function to get models by name
  return {
    getModel: (modelName) => {
      if (!mongoose.modelNames().includes(modelName)) {
        throw new Error(`Model ${modelName} not found. Make sure it's properly exported from its file.`);
      }
      return mongoose.model(modelName);
    }
  };
}

module.exports = loadModels;
