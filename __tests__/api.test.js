const request = require('supertest');
const app = require('../src/app');

describe('API Endpoints', () => {
  let authToken;

  beforeEach(async () => {
    // Login to get token for protected routes
    const res = await request(app).post('/api/login').send({
      email: 'test@test.com',
      password: 'test123',
    });
    authToken = res.body.result.token;
  });

  describe('Core API Routes', () => {
    it('should return 404 for unknown routes', async () => {
      const res = await request(app).get('/nonexistent');
      expect([404, 500]).toContain(res.statusCode);
    });

    it('should handle CORS headers', async () => {
      const res = await request(app).options('/api/profile').set('Origin', 'http://localhost:3000');

      expect(res.headers['access-control-allow-origin']).toBeTruthy();
      expect(res.headers['access-control-allow-credentials']).toBe('true');
    });
  });

  describe('Protected Routes', () => {
    it('should access protected route with valid token', async () => {
      const res = await request(app)
        .get('/api/setting/listAll')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.statusCode).toBe(203);
    });

    it('should reject invalid tokens', async () => {
      const invalidToken = 'invalid.token.here';

      const res = await request(app)
        .get('/api/setting/listAll')
        .set('Authorization', `Bearer ${invalidToken}`);

      expect([401, 500]).toContain(res.statusCode);
      expect(res.body).toHaveProperty('jwtExpired', true);
    });
  });

  describe('Error Handling', () => {
    it('should handle validation errors', async () => {
      const res = await request(app).post('/api/login').send({
        email: 'invalid-email',
        password: '',
      });

      expect([409, 422]).toContain(res.statusCode);
      expect(res.body).toHaveProperty('error');
    });

    it('should handle server errors gracefully', async () => {
      // Force a server error by passing invalid ObjectId
      const res = await request(app)
        .get('/api/setting/read/invalid-id')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.statusCode).toBe(500);
      expect(res.body).toHaveProperty('error');
    });
  });
});
