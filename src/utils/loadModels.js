const mongoose = require('mongoose');
const path = require('path');
const { globSync } = require('glob');

function loadModels() {
  console.log('🔍 Loading models...');
  
  // Get all model files
  const modelFiles = globSync(path.join(__dirname, '../models/**/*.js'));
  console.log(`📁 Found ${modelFiles.length} model files`);
  
  // Load each model file
  modelFiles.forEach((file) => {
    // Skip test files
    if (file.endsWith('.test.js')) return;
    
    try {
      require(file);
      console.log(`✅ Loaded model from ${path.basename(file)}`);
    } catch (err) {
      console.error(`❌ Error loading model from ${file}:`, err.message);
    }
  });

  // Log all registered model names
  console.log('📋 Registered models:', mongoose.modelNames());
  
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
