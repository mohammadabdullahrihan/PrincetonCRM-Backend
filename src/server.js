require('module-alias/register');
const mongoose = require('mongoose');
const { globSync } = require('glob');
const path = require('path');

// Make sure we are running node 7.6+
const [major, minor] = process.versions.node.split('.').map(parseFloat);
if (major < 20) {
  console.log('Please upgrade your node.js version at least 20 or greater. 👌\n ');
  process.exit();
}

// import environmental variables from our variables.env file
require('dotenv').config({ path: '.env' });
require('dotenv').config({ path: '.env.local' });

async function connectWithFallback() {
  try {
    await mongoose.connect(process.env.DATABASE);
    console.log('MongoDB connected to', process.env.DATABASE);
  } catch (error) {
    console.log(
      `1. 🔥 Common Error caused issue → : check your .env file first and add your mongodb url`
    );
    console.error(`2. 🚫 Error → : ${error.message}`);

    if (process.env.NODE_ENV !== 'production') {
      try {
        const { MongoMemoryServer } = require('mongodb-memory-server');
        const mongod = await MongoMemoryServer.create();
        const uri = mongod.getUri();
        await mongoose.connect(uri);
        console.log('Started in-memory MongoDB for development at', uri);
      } catch (memErr) {
        console.error('Failed to start in-memory MongoDB:', memErr);
        throw memErr;
      }
    } else {
      throw error;
    }
  }
}

connectWithFallback();
mongoose.connection.on('error', (error) => {
  console.log(
    `1. 🔥 Common Error caused issue → : check your .env file first and add your mongodb url`
  );
  console.error(`2. 🚫 Error → : ${error.message}`);
});

// Models are loaded in api/index.js for serverless deployment
// Uncomment below lines for local development if needed
// const modelsFiles = globSync('./src/models/**/*.js');
// for (const filePath of modelsFiles) {
//   require(path.resolve(filePath));
// }

// Start our app!
const app = require('./app');
app.set('port', process.env.PORT || 5000);
const server = app.listen(app.get('port'), () => {
  console.log(`Express running → On PORT : ${server.address().port}`);
});
