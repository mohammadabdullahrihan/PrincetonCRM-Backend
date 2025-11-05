const mongoose = require('mongoose');
const Admin = require('../src/models/coreModels/Admin');
const AdminPassword = require('../src/models/coreModels/AdminPassword');
const { generate: shortid } = require('shortid');

describe('Database Models', () => {
  describe('Admin Model', () => {
    it('should create & save admin successfully', async () => {
      const validAdmin = new Admin({
        email: 'test-model@test.com',
        name: 'Test',
        surname: 'User',
        enabled: true,
        role: 'owner',
      });
      const savedAdmin = await validAdmin.save();

      expect(savedAdmin._id).toBeDefined();
      expect(savedAdmin.email).toBe(validAdmin.email);
      expect(savedAdmin.name).toBe(validAdmin.name);
    });

    it('should fail to save admin with missing required fields', async () => {
      const invalidAdmin = new Admin({
        surname: 'User',
        enabled: true,
        role: 'owner',
      });

      await expect(invalidAdmin.save()).rejects.toThrow(mongoose.Error.ValidationError);
    });
  });

  describe('AdminPassword Model', () => {
    let admin;

    beforeEach(async () => {
      admin = await new Admin({
        email: 'test-pwd@test.com',
        name: 'Test',
        surname: 'User',
        enabled: true,
        role: 'owner',
      }).save();
    });

    it('should create & save password successfully', async () => {
      const salt = shortid();
      const adminPassword = new AdminPassword();
      const passwordHash = adminPassword.generateHash(salt, 'test123');

      const validPassword = new AdminPassword({
        password: passwordHash,
        emailVerified: true,
        salt: salt,
        user: admin._id,
      });

      const savedPassword = await validPassword.save();
      expect(savedPassword._id).toBeDefined();
      expect(savedPassword.user.toString()).toBe(admin._id.toString());
    });

    it('should verify password correctly', async () => {
      const salt = shortid();
      const adminPassword = new AdminPassword();
      const passwordHash = adminPassword.generateHash(salt, 'test123');

      // Save password
      const savedPassword = await new AdminPassword({
        password: passwordHash,
        emailVerified: true,
        salt: salt,
        user: admin._id,
      }).save();

      // Verify using saved salt
      const isValid = savedPassword.validPassword(salt, 'test123');
      expect(isValid).toBe(true);
    });

    it('should fail to verify wrong password', async () => {
      const salt = shortid();
      const adminPassword = new AdminPassword();
      const passwordHash = adminPassword.generateHash(salt, 'test123');

      const savedPassword = await new AdminPassword({
        password: passwordHash,
        emailVerified: true,
        salt: salt,
        user: admin._id,
      }).save();

      const isValid = savedPassword.validPassword(salt, 'wrongpass');
      expect(isValid).toBe(false);
    });
  });
});
