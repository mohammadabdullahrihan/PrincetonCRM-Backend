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
    // Connect to MongoDB
    await mongoose.connect(process.env.DATABASE, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ MongoDB connected to', process.env.DATABASE);

    // Load all models after successful connection
    const { getModel } = loadModels();
    
    // Verify critical models are loaded
    const requiredModels = ['Setting', 'Admin', 'User'];
    for (const modelName of requiredModels) {
      try {
        getModel(modelName);
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
    
    if (process.env.NODE_ENV !== 'production') {
      try {
        const { MongoMemoryServer } = require('mongodb-memory-server');
        const mongod = await MongoMemoryServer.create();
        const uri = mongod.getUri();
        
        await mongoose.connect(uri);
        console.log('✅ Connected to in-memory MongoDB');
        
        // Load models for in-memory DB
        loadModels();
        
        // Start the server
        const app = require('./app');
        const port = process.env.PORT || 3000;
        app.listen(port, () => {
          console.log(`🚀 Server running on port ${port} with in-memory DB`);
        });
        
      } catch (memError) {
        console.error('❌ Failed to start in-memory MongoDB:', memError);
        process.exit(1);
      }
    } else {
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
