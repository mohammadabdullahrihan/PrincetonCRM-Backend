const path = require('path');
const fs = require('fs');

function registerModels() {
  console.log('🔍 Registering models...');
  const modelsPath = path.join(__dirname, '../models');
  
  // Load all model files
  fs.readdirSync(modelsPath).forEach(file => {
    if (file.endsWith('.js')) {
      try {
        require(path.join(modelsPath, file));
        console.log(`✅ Registered model: ${file}`);
      } catch (err) {
        console.error(`❌ Error registering model ${file}:`, err.message);
      }
    }
  });
}

module.exports = registerModels;
