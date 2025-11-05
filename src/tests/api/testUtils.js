const request = require('supertest');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

// Models will be imported dynamically in functions to handle cases where they're not available

/**
 * Generate JWT token for authenticated requests
 */
const generateAuthToken = async () => {
  try {
    // Check if models are available (in Jest environment)
    let Admin, AdminPassword;
    try {
      Admin = mongoose.model('Admin');
      AdminPassword = mongoose.model('AdminPassword');
    } catch (error) {
      console.warn('Models not available, using fallback token');
      return 'fallback-token';
    }

    const admin = await Admin.findOne({ email: 'test@test.com' });
    if (!admin) {
      console.warn('Test admin user not found, using fallback token');
      return 'fallback-token';
    }

    const adminPassword = await AdminPassword.findOne({ user: admin._id });
    if (!adminPassword) {
      console.warn('Test admin password not found, using fallback token');
      return 'fallback-token';
    }

    const token = jwt.sign(
      {
        id: admin._id,
        email: admin.email,
        role: admin.role,
        name: admin.name,
        surname: admin.surname,
      },
      process.env.JWT_SECRET || 'your_private_jwt_secret_key',
      { expiresIn: '1h' }
    );

    return token;
  } catch (error) {
    console.warn('Error generating auth token, using fallback:', error.message);
    return 'fallback-token';
  }
};

/**
 * Create authenticated request headers
 */
const getAuthHeaders = async () => {
  const token = await generateAuthToken();
  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
};

/**
 * Create test data for a given model
 */
const createTestData = async (modelName, data = {}) => {
  try {
    const Model = mongoose.model(modelName);
    const testData = {
      ...data,
      // Add common fields that most models have
      enabled: data.enabled !== undefined ? data.enabled : true,
      ...data,
    };

    const instance = new Model(testData);
    return await instance.save();
  } catch (error) {
    console.error(`Error creating test data for ${modelName}:`, error.message);
    throw error;
  }
};

/**
 * Test endpoint with all required status codes
 */
const testEndpoint = async (app, method, endpoint, testCases) => {
  const results = [];

  for (const testCase of testCases) {
    try {
      let requestBuilder = request(app)[method.toLowerCase()](endpoint);

      // Add headers if provided
      if (testCase.headers) {
        Object.entries(testCase.headers).forEach(([key, value]) => {
          requestBuilder = requestBuilder.set(key, value);
        });
      }

      // Add body if provided
      if (testCase.body) {
        requestBuilder = requestBuilder.send(testCase.body);
      }

      // Add query parameters if provided
      if (testCase.query) {
        Object.entries(testCase.query).forEach(([key, value]) => {
          requestBuilder = requestBuilder.query({ [key]: value });
        });
      }

      const response = await requestBuilder;

      // More flexible status code matching
      const isExpectedStatus = Array.isArray(testCase.expectedStatus) 
        ? testCase.expectedStatus.includes(response.status)
        : response.status === testCase.expectedStatus;

      results.push({
        name: testCase.name,
        expectedStatus: testCase.expectedStatus,
        actualStatus: response.status,
        passed: isExpectedStatus,
        response: response.body,
      });
    } catch (error) {
      results.push({
        name: testCase.name,
        expectedStatus: testCase.expectedStatus,
        actualStatus: error.status || 500,
        passed: false,
        error: error.message,
      });
    }
  }

  return results;
};

/**
 * Generate standard test cases for CRUD endpoints
 */
const generateCRUDTestCases = (entity, requiresAuth = true) => {
  const testCases = [];

  // Success case (200)
  testCases.push({
    name: 'Success case',
    expectedStatus: 200,
    headers: requiresAuth ? {} : undefined, // Will be filled with auth headers
    body: getDefaultTestData(entity),
  });

  // Validation error (400)
  testCases.push({
    name: 'Validation error',
    expectedStatus: 400,
    headers: requiresAuth ? {} : undefined,
    body: {}, // Empty body should trigger validation errors
  });

  // Not found (404)
  testCases.push({
    name: 'Not found',
    expectedStatus: 404,
    headers: requiresAuth ? {} : undefined,
    body: { id: '507f1f77bcf86cd799439011' }, // Non-existent ID
  });

  // Server error (500) - Invalid data that should cause server error
  testCases.push({
    name: 'Server error',
    expectedStatus: 500,
    headers: requiresAuth ? {} : undefined,
    body: { invalidField: 'invalidValue' },
  });

  return testCases;
};

/**
 * Get default test data for different entities
 */
const getDefaultTestData = (entity) => {
  const defaultData = {
    client: {
      name: 'Test Client',
      email: 'test@example.com',
      phone: '+1234567890',
    },
    invoice: {
      client: new mongoose.Types.ObjectId(),
      items: [
        {
          name: 'Test Item',
          quantity: 1,
          price: 100,
        },
      ],
      tax: 10,
      discount: 0,
    },
    property: {
      title: 'Test Property',
      description: 'Test property description',
      price: 100000,
      location: 'Test Location',
    },
    quote: {
      client: new mongoose.Types.ObjectId(),
      items: [
        {
          name: 'Test Quote Item',
          quantity: 1,
          price: 150,
        },
      ],
      validUntil: new Date(),
    },
    payment: {
      amount: 100,
      method: 'cash',
      invoice: new mongoose.Types.ObjectId(),
    },
  };

  return (
    defaultData[entity] || {
      name: `Test ${entity}`,
      description: `Test ${entity} description`,
    }
  );
};

module.exports = {
  generateAuthToken,
  getAuthHeaders,
  createTestData,
  testEndpoint,
  generateCRUDTestCases,
  getDefaultTestData,
};
