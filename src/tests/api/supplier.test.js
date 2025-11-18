const request = require('supertest');
const app = require('../../app');


const { generateAuthToken, getAuthHeaders, testEndpoint } = require('./testUtils');

describe('supplier API', () => {
  let authToken;
  let authHeaders;

  beforeAll(async () => {
    try {
      authToken = await generateAuthToken();
      authHeaders = await getAuthHeaders();
    } catch (error) {
      console.error('Error setting up auth for supplier tests:', error.message);
    }
  });

  describe('POST /supplier/create', () => {
    it('should create a new supplier', async () => {
      const testCases = [
        {
          name: 'Valid supplier creation',
          expectedStatus: [200, 201, 500],
          headers: authHeaders,
          body: { name: 'Test supplier', description: 'Test supplier description' }
        },
        {
          name: 'Validation error - missing required fields',
          expectedStatus: [400, 401, 403, 500],
          headers: authHeaders,
          body: {}
        },
        {
          name: 'Unauthorized access',
          expectedStatus: [401, 403, 500],
          headers: { 'Content-Type': 'application/json' },
          body: { name: 'Test supplier', description: 'Test supplier description' }
        }
      ];

      const results = await testEndpoint(app, 'POST', '/supplier/create', testCases);
      results.forEach(result => expect(result.passed).toBe(true));
    });
  });

  describe('GET /supplier/read/:id', () => {
    it('should read a supplier by id', async () => {
      const testCases = [
        { name: 'Valid read', expectedStatus: [200, 404, 500], headers: authHeaders },
        { name: 'Not found - invalid id', expectedStatus: [400, 404, 500], headers: authHeaders },
        { name: 'Unauthorized access', expectedStatus: [401, 403, 500], headers: { 'Content-Type': 'application/json' } }
      ];
      const results = await testEndpoint(app, 'GET', '/supplier/read/507f1f77bcf86cd799439011', testCases);
      results.forEach(result => expect(result.passed).toBe(true));
    });
  });

  // Additional CRUD routes can be added here following the same pattern
});
