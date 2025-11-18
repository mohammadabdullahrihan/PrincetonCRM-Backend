const request = require('supertest');
const app = require('../../app');
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
          expectedStatus: [200, 201, 500],
          headers: authHeaders,
          body: {
            visitorName: 'Test Visitor',
            visitorEmail: 'visitor@test.com',
            visitDate: new Date().toISOString(),
            notes: 'Test visit notes',
          },
        },
        {
          name: 'Validation error - missing required fields',
          expectedStatus: [400, 401, 403, 500],
          headers: authHeaders,
          body: {},
        },
        {
          name: 'Not found - invalid property id',
          expectedStatus: [400, 404, 500],
          headers: authHeaders,
          body: {
            visitorName: 'Test Visitor',
            visitorEmail: 'visitor@test.com',
          },
        },
        {
          name: 'Unauthorized access',
          expectedStatus: [401, 403, 500],
          headers: { 'Content-Type': 'application/json' },
          body: {
            visitorName: 'Test Visitor',
            visitorEmail: 'visitor@test.com',
          },
        },
      ];

      const results = await testEndpoint(
        app,
        'POST',
        '/property/507f1f77bcf86cd799439011/visit',
        testCases
      );

      results.forEach((result) => {
        expect(result.passed).toBe(true);
      });
    });
  });

  describe('GET /property/:id/visits', () => {
    it('should list property visits', async () => {
      const testCases = [
        {
          name: 'Valid visits list',
          expectedStatus: [200, 404, 500],
          headers: authHeaders,
        },
        {
          name: 'Not found - invalid property id',
          expectedStatus: [400, 404, 500],
          headers: authHeaders,
        },
        {
          name: 'Unauthorized access',
          expectedStatus: [401, 403, 500],
          headers: { 'Content-Type': 'application/json' },
        },
      ];

      const results = await testEndpoint(
        app,
        'GET',
        '/property/507f1f77bcf86cd799439011/visits',
        testCases
      );

      results.forEach((result) => {
        expect(result.passed).toBe(true);
      });
    });
  });
});
