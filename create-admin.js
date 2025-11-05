require('module-alias/register');
require('dotenv').config({ path: '.env' });
require('dotenv').config({ path: '.env.local' });

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Import models
require('./src/models/coreModels/Admin');
require('./src/models/coreModels/AdminPassword');

const Admin = mongoose.model('Admin');
const AdminPassword = mongoose.model('AdminPassword');

async function createAdmin() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.DATABASE);
    console.log('✅ Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email: 'admin@princeton.com' });
    
    if (existingAdmin) {
      console.log('ℹ️  Admin user already exists with email: admin@princeton.com');
      
      // Update password if needed
      const salt = await bcrypt.genSalt(12);
      const hashedPassword = await bcrypt.hash(salt + 'admin123', 12);
      await AdminPassword.findOneAndUpdate(
        { user: existingAdmin._id },
        { 
          password: hashedPassword,
          salt: salt,
          emailVerified: true
        },
        { upsert: true }
      );
      
      console.log('✅ Admin password updated');
      process.exit(0);
    }

    // Create new admin user
    const adminData = {
      email: 'admin@princeton.com',
      name: 'Princeton',
      surname: 'Admin',
      enabled: true,
      removed: false,
      role: 'owner'
    };

    const admin = new Admin(adminData);
    await admin.save();

    console.log('✅ Admin user created:', admin.email);

    // Create password with salt
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(salt + 'admin123', 12);
    
    const adminPassword = new AdminPassword({
      user: admin._id,
      password: hashedPassword,
      salt: salt,
      removed: false,
      emailVerified: true
    });

    await adminPassword.save();
    console.log('✅ Admin password set');

    console.log('\n🎉 Admin user created successfully!');
    console.log('📧 Email: admin@princeton.com');
    console.log('🔑 Password: admin123');
    console.log('\nYou can now login with these credentials.');

  } catch (error) {
    console.error('❌ Error creating admin:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

createAdmin();
