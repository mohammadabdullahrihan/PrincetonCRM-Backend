require('dotenv').config({ path: '.env' });
require('dotenv').config({ path: '.env.local' });

const mongoose = require('mongoose');

require('../src/models/appModels/ProjectIncome');
const ProjectIncome = mongoose.model('ProjectIncome');

async function removeSeeded() {
  try {
    await mongoose.connect(process.env.DATABASE);
    console.log('✅ Connected to MongoDB');

    const result = await ProjectIncome.deleteMany({ remarks: /^Auto-seeded/ });
    console.log(`🗑️  Removed ${result.deletedCount} seeded income entries`);

  } catch (err) {
    console.error('❌ Remove failed:', err);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected');
  }
}

removeSeeded();
