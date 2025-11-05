const request = require('supertest');
const app = require('../src/app');

describe('Authentication', () => {
  let authToken;

  describe('POST /api/login', () => {
    it('should login with valid credentials', async () => {
      const res = await request(app).post('/api/login').send({
        email: 'test@test.com',
        password: 'test123',
      });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.result).toHaveProperty('token');
      expect(res.body.result).toHaveProperty('email', 'test@test.com');
    });

    it('should fail with invalid credentials', async () => {
      const res = await request(app).post('/api/login').send({
        email: 'test@test.com',
        password: 'wrongpass',
      });

      expect([403, 409]).toContain(res.statusCode);
      expect(res.body.success).toBe(false);
    });
  });

  describe('Protected Routes', () => {
    it('should reject requests without token', async () => {
      const res = await request(app).get('/api/profile');
      expect(res.statusCode).toBe(401);
    });

    it('should accept requests with valid token', async () => {
      const login = await request(app).post('/api/login').send({
        email: 'test@test.com',
        password: 'test123',
      });

      const res = await request(app)
        .get('/api/setting/listAll')
        .set('Authorization', `Bearer ${login.body.result.token}`);

      expect(res.statusCode).toBe(203);
    });
  });

  describe('POST /api/logout', () => {
    it('should logout successfully', async () => {
      const login = await request(app).post('/api/login').send({
        email: 'test@test.com',
        password: 'test123',
      });

      const res = await request(app)
        .post('/api/logout')
        .set('Authorization', `Bearer ${login.body.result.token}`);

      expect(res.statusCode).toBe(200);
    });
  });
});
