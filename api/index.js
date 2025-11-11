const path = require('path');
const mongoose = require('mongoose');
const { globSync } = require('glob');

// Setup module aliases manually for serverless
require('module-alias').addAliases({
  '@': path.join(__dirname, '..', 'src')
});

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

// MongoDB connection with caching for serverless
let cachedDb = null;

async function connectToDatabase() {
  if (cachedDb && mongoose.connection.readyState === 1) {
    console.log('Using cached database connection');
    return cachedDb;
  }

  try {
    await mongoose.connect(process.env.DATABASE, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 10000,
    });
    
    cachedDb = mongoose.connection;
    console.log('MongoDB connected successfully');
    return cachedDb;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
}

// Load all models before starting the app
const modelsPath = path.join(__dirname, '..', 'src', 'models', '**', '*.js');
const modelsFiles = globSync(modelsPath);

for (const filePath of modelsFiles) {
  require(path.resolve(filePath));
}

// Import the Express app
const app = require('../src/app');

// Serverless function handler
module.exports = async (req, res) => {
  try {
    // Ensure database is connected
    await connectToDatabase();
    
    // Handle the request with Express
    return app(req, res);
  } catch (error) {
    console.error('Serverless function error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Server error'
    });
  }
};
