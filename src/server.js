require('dotenv').config({ path: '.env' });
require('dotenv').config({ path: '.env.local' });

const mongoose = require('mongoose');

// Make sure we are running node 20+
const [major] = process.versions.node.split('.').map(parseFloat);
if (major < 20) {
  console.log('Please upgrade your Node.js version to 20 or greater. 👌\n');
  process.exit(1);
}

// Load models before anything else
const loadModels = require('./utils/loadModels');

async function connectWithFallback() {
  try {
    // Remove deprecated options and add recommended ones
    const options = {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      maxPoolSize: 10,
      family: 4, // Use IPv4, skip trying IPv6
    };

    await mongoose.connect(process.env.DATABASE, options);
    console.log('✅ MongoDB connected to', process.env.DATABASE.split('@')[1] || process.env.DATABASE);

    // Load all models after successful connection
    const { getModel } = loadModels();
    
    // Verify critical models are loaded
    const requiredModels = ['Setting', 'Admin', 'User'];
    for (const modelName of requiredModels) {
      try {
        const model = getModel(modelName);
        console.log(`✅ Model loaded: ${modelName}`);
      } catch (err) {
        console.error(`❌ Error loading model ${modelName}:`, err.message);
      }
    }

    // Start the server after models are loaded
    const app = require('./app');
    const port = process.env.PORT || 3000;
    const server = app.listen(port, () => {
      console.log(`🚀 Server running on port ${port}`);
    });

    // Handle shutdown gracefully
    process.on('SIGTERM', () => {
      console.log('SIGTERM received. Shutting down gracefully...');
      server.close(() => {
        console.log('Server closed');
        process.exit(0);
      });
    });

  } catch (error) {
    console.error('❌ Failed to connect to MongoDB:', error.message);
    console.log('Falling back to in-memory database for development...');
    
    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      const mongod = await MongoMemoryServer.create({
        instance: {
          storageEngine: 'wiredTiger',
          dbPath: '/tmp/mongodb' // Use /tmp which is writable in most environments
        }
      });
      const uri = mongod.getUri();
      await mongoose.connect(uri);
      console.log('✅ Connected to in-memory MongoDB');
      
      // Load models again for in-memory DB
      const { getModel } = loadModels();
      console.log('✅ In-memory database initialized');
    } catch (memErr) {
      console.error('❌ Failed to start in-memory MongoDB:', memErr);
      process.exit(1);
    }
  }
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
  // Close server & exit process
  process.exit(1);
});

// Start the application
connectWithFallback();
