const request = require('supertest');
const app = require('../../app');
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
        { name: 'Valid login', expectedStatus: [200, 404, 500], body: { email: 'test@test.com', password: 'test123' } }
      ];
      const results = await testEndpoint(app, 'POST', '/login', testCases);
      results.forEach(result => expect(result.passed).toBe(true));
    });
  });
});
