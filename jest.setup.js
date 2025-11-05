// Set NODE_ENV to test for Jest runs
process.env.NODE_ENV = 'test';

// Set JWT secret for testing
if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = 'test-jwt-secret-key-for-testing-only';
}
