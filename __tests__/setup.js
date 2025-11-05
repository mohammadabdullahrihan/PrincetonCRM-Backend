const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
const { generate: shortid } = require('shortid');
const { globSync } = require('glob');
const path = require('path');

// Import all models - use absolute path from project root
const modelsFiles = globSync('./src/models/**/*.js');
for (const filePath of modelsFiles) {
  require(path.resolve(filePath));
}

const Admin = require('../src/models/coreModels/Admin');
const AdminPassword = require('../src/models/coreModels/AdminPassword');

let mongod;

// Setup in-memory MongoDB for tests
beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();
  await mongoose.connect(uri);
});

// Clear database between tests
beforeEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany();
  }
});

// Create test admin user
beforeEach(async () => {
  try {
    // Clear existing data first
    await Admin.deleteMany({});
    await AdminPassword.deleteMany({});

    const salt = shortid();
    const adminPassword = new AdminPassword();
    const passwordHash = adminPassword.generateHash(salt, 'test123');

    const admin = await new Admin({
      email: 'test@test.com',
      name: 'Test',
      surname: 'Admin',
      enabled: true,
      role: 'owner',
    }).save();

    await new AdminPassword({
      password: passwordHash,
      emailVerified: true,
      salt: salt,
      user: admin._id,
      loggedSessions: [], // Initialize empty sessions array
    }).save();

    // Verify the user was created successfully
    const createdUser = await Admin.findById(admin._id);
    const createdPassword = await AdminPassword.findOne({ user: admin._id });

    if (!createdUser || !createdPassword) {
      throw new Error('Failed to create test user in database');
    }

    console.log('✅ Test user verification completed');

    console.log('✅ Test admin user created successfully');
  } catch (error) {
    console.error('❌ Failed to create test admin user:', error.message);
    throw error;
  }
});

// Cleanup after tests
afterAll(async () => {
  await mongoose.connection.close();
  if (mongod) {
    await mongod.stop();
  }
});
