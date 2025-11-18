require('dotenv').config({ path: '.env' });
require('dotenv').config({ path: '.env.local' });

const mongoose = require('mongoose');

// Set temp directory for in-memory DB
process.env.TMPDIR = '/tmp';

// Make sure we are running node 20+
const [major] = process.versions.node.split('.').map(parseFloat);
if (major < 20) {
  console.log('Please upgrade your Node.js version to 20 or greater. 👌\n');
  process.exit(1);
}

// Load models before anything else
const loadModels = require('./utils/loadModels');

async function startInMemoryMongoDB() {
  try {
    console.log('🚀 Starting in-memory MongoDB...');
    const { MongoMemoryServer } = require('mongodb-memory-server');
    
    const mongod = await MongoMemoryServer.create({
      instance: {
        storageEngine: 'wiredTiger',
        dbPath: '/tmp/mongodb'
      }
    });
    
    const uri = mongod.getUri();
    await mongoose.connect(uri);
    console.log('✅ Connected to in-memory MongoDB');
    return mongod;
  } catch (error) {
    console.error('❌ Failed to start in-memory MongoDB:', error);
    throw error;
  }
}

async function connectToMongoDB() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    const options = {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      maxPoolSize: 10,
      family: 4,
    };

    await mongoose.connect(process.env.DATABASE, options);
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ Failed to connect to MongoDB:', error.message);
    throw error;
  }
}

async function verifyModels() {
  const { getModel } = loadModels();
  const requiredModels = ['Setting', 'Admin', 'User'];
  let allModelsLoaded = true;

  for (const modelName of requiredModels) {
    try {
      getModel(modelName); // Remove unused 'model' variable
      console.log(`✅ Verified model: ${modelName}`);
    } catch (err) {
      console.error(`❌ Error loading model ${modelName}:`, err.message);
      allModelsLoaded = false;
    }
  }

  return allModelsLoaded;
}

async function startServer() {
  try {
    // Try to connect to the main MongoDB
    try {
      await connectToMongoDB();
    } catch (error) {
      console.log('Falling back to in-memory database...');
      await startInMemoryMongoDB();
    }

    // Verify all required models are loaded
    const modelsVerified = await verifyModels();
    if (!modelsVerified) {
      console.warn('⚠️ Some models failed to load. The application may not work as expected.');
    }

    // Load the app after successful connection
    const app = require('./app');
    const port = process.env.PORT || 3000;
    
    const server = app.listen(port, () => {
      console.log(`🚀 Server running on port ${port}`);
      console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
    });

    // Handle graceful shutdown
    process.on('SIGTERM', () => {
      console.log('SIGTERM received. Shutting down gracefully...');
      server.close(() => {
        console.log('Server closed');
        mongoose.connection.close(false, () => {
          console.log('MongoDB connection closed');
          process.exit(0);
        });
      });
    });

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Start the server
startServer();

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

// The server is started by startServer() call on line 121
