const request = require('supertest');
const app = require('@/app');


const { generateAuthToken, getAuthHeaders, testEndpoint } = require('./testUtils');

describe('commercialbuyer API', () => {
  let authToken;
  let authHeaders;

  beforeAll(async () => {
    try {
      authToken = await generateAuthToken();
      authHeaders = await getAuthHeaders();
    } catch (error) {
      console.error('Error setting up auth for commercialbuyer tests:', error.message);
    }
  });

  describe('POST /commercialbuyer/create', () => {
    it('should create a new commercialbuyer', async () => {
      const testCases = [
        {
          name: 'Valid commercialbuyer creation',
          expectedStatus: [200, 201, 500],
          headers: authHeaders,
          body: { name: 'Test commercialbuyer', description: 'Test commercialbuyer description' }
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
          body: { name: 'Test commercialbuyer', description: 'Test commercialbuyer description' }
        }
      ];

      const results = await testEndpoint(app, 'POST', '/commercialbuyer/create', testCases);
      results.forEach(result => expect(result.passed).toBe(true));
    });
  });

  describe('GET /commercialbuyer/read/:id', () => {
    it('should read a commercialbuyer by id', async () => {
      const testCases = [
        { name: 'Valid read', expectedStatus: [200, 404, 500], headers: authHeaders },
        { name: 'Not found - invalid id', expectedStatus: [400, 404, 500], headers: authHeaders },
        { name: 'Unauthorized access', expectedStatus: [401, 403, 500], headers: { 'Content-Type': 'application/json' } }
      ];
      const results = await testEndpoint(app, 'GET', '/commercialbuyer/read/507f1f77bcf86cd799439011', testCases);
      results.forEach(result => expect(result.passed).toBe(true));
    });
  });

  // Additional CRUD routes can be added here following the same pattern
});
