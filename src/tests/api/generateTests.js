const fs = require('fs');
const path = require('path');
const { globSync } = require('glob');

/**
 * Generate test file for a specific entity
 */
const generateEntityTest = (entity) => {
  const testFileName = `${entity}.test.js`;

  const testContent = `const request = require('supertest');
const app = require('@/app');


const { generateAuthToken, getAuthHeaders, testEndpoint } = require('./testUtils');

describe('${entity} API', () => {
  let authToken;
  let authHeaders;

  beforeAll(async () => {
    try {
      authToken = await generateAuthToken();
      authHeaders = await getAuthHeaders();
    } catch (error) {
      console.error('Error setting up auth for ${entity} tests:', error.message);
    }
  });

  describe('POST /${entity}/create', () => {
    it('should create a new ${entity}', async () => {
      const testCases = [
        {
          name: 'Valid ${entity} creation',
          expectedStatus: 201,
          headers: authHeaders,
          body: { name: 'Test ${entity}', description: 'Test ${entity} description' }
        },
        {
          name: 'Validation error - missing required fields',
          expectedStatus: 400,
          headers: authHeaders,
          body: {}
        },
        {
          name: 'Unauthorized access',
          expectedStatus: 401,
          headers: { 'Content-Type': 'application/json' },
          body: { name: 'Test ${entity}', description: 'Test ${entity} description' }
        }
      ];

      const results = await testEndpoint(app, 'POST', '/${entity}/create', testCases);
      results.forEach(result => expect(result.passed).toBe(true));
    });
  });

  describe('GET /${entity}/read/:id', () => {
    it('should read a ${entity} by id', async () => {
      const testCases = [
        { name: 'Valid read', expectedStatus: 200, headers: authHeaders },
        { name: 'Not found - invalid id', expectedStatus: 404, headers: authHeaders },
        { name: 'Unauthorized access', expectedStatus: 401, headers: { 'Content-Type': 'application/json' } }
      ];
      const results = await testEndpoint(app, 'GET', '/${entity}/read/507f1f77bcf86cd799439011', testCases);
      results.forEach(result => expect(result.passed).toBe(true));
    });
  });

  // Additional CRUD routes can be added here following the same pattern
});
`;

  return { testFileName, testContent };
};

/**
 * Generate test file for property-specific routes
 */
const generatePropertyTest = () => {
  const entity = 'property';
  const testFileName = `${entity}.test.js`;

  const testContent = `const request = require('supertest');
const app = require('@/app');
const { generateAuthToken, getAuthHeaders, testEndpoint } = require('./testUtils');

describe('Property API (Extended)', () => {
  let authToken;
  let authHeaders;

  beforeAll(async () => {
    try {
      authToken = await generateAuthToken();
      authHeaders = await getAuthHeaders();
    } catch (error) {
      console.error('Error setting up auth for property tests:', error.message);
    }
  });

  describe('POST /property/:id/visit', () => {
    it('should add a visit to property', async () => {
      const testCases = [
        {
          name: 'Valid visit creation',
          expectedStatus: 201,
          headers: authHeaders,
          body: {
            visitorName: 'Test Visitor',
            visitorEmail: 'visitor@test.com',
            visitDate: new Date().toISOString(),
            notes: 'Test visit notes'
          }
        }
      ];
      const results = await testEndpoint(app, 'POST', '/property/507f1f77bcf86cd799439011/visit', testCases);
      results.forEach(result => expect(result.passed).toBe(true));
    });
  });

  describe('GET /property/:id/visits', () => {
    it('should list property visits', async () => {
      const testCases = [
        { name: 'Valid visits list', expectedStatus: 200, headers: authHeaders }
      ];
      const results = await testEndpoint(app, 'GET', '/property/507f1f77bcf86cd799439011/visits', testCases);
      results.forEach(result => expect(result.passed).toBe(true));
    });
  });
});
`;

  return { testFileName, testContent };
};

/**
 * Generate test file for core routes
 */
const generateCoreTest = () => {
  const testFileName = 'core.test.js';

  const testContent = `const request = require('supertest');
const app = require('@/app');
const { generateAuthToken, getAuthHeaders, testEndpoint } = require('./testUtils');

describe('Core API Routes', () => {
  let authToken;
  let authHeaders;

  beforeAll(async () => {
    try {
      authToken = await generateAuthToken();
      authHeaders = await getAuthHeaders();
    } catch (error) {
      console.error('Error setting up auth for core tests:', error.message);
    }
  });

  describe('POST /login', () => {
    it('should authenticate admin user', async () => {
      const testCases = [
        { name: 'Valid login', expectedStatus: 200, body: { email: 'test@test.com', password: 'test123' } }
      ];
      const results = await testEndpoint(app, 'POST', '/login', testCases);
      results.forEach(result => expect(result.passed).toBe(true));
    });
  });
});
`;

  return { testFileName, testContent };
};

/**
 * Main function to generate all test files
 */
const generateAllTests = () => {
  console.log('🚀 Starting test generation...');

  const appModelsFiles = globSync('./src/models/appModels/**/*.js');
  const entities = appModelsFiles.map((filePath) =>
    path.basename(filePath, path.extname(filePath)).toLowerCase()
  );

  console.log(`📋 Found ${entities.length} entities:`, entities.join(', '));

  let generatedCount = 0;

  // Generate entity tests
  for (const entity of entities) {
    try {
      const { testFileName, testContent } = generateEntityTest(entity);
      fs.writeFileSync(path.join(__dirname, testFileName), testContent);
      console.log(`✅ Generated test file: ${testFileName}`);
      generatedCount++;
    } catch (error) {
      console.error(`❌ Failed to generate test for ${entity}:`, error.message);
    }
  }

  // Property tests
  try {
    const { testFileName, testContent } = generatePropertyTest();
    fs.writeFileSync(path.join(__dirname, testFileName), testContent);
    console.log(`✅ Generated property test file: ${testFileName}`);
    generatedCount++;
  } catch (error) {
    console.error('❌ Failed to generate property tests:', error.message);
  }

  // Core tests
  try {
    const { testFileName, testContent } = generateCoreTest();
    fs.writeFileSync(path.join(__dirname, testFileName), testContent);
    console.log(`✅ Generated core test file: ${testFileName}`);
    generatedCount++;
  } catch (error) {
    console.error('❌ Failed to generate core tests:', error.message);
  }

  console.log(`🎉 Test generation completed! Generated ${generatedCount} test files.`);
  console.log(`📂 Test files location: ${__dirname}`);
};

// Execute if run directly
if (require.main === module) {
  generateAllTests();
}

module.exports = { generateAllTests, generateEntityTest, generatePropertyTest, generateCoreTest };
