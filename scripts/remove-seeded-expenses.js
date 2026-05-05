require('dotenv').config({ path: '.env' });
require('dotenv').config({ path: '.env.local' });

const mongoose = require('mongoose');

require('../src/models/appModels/ProjectExpense');
const ProjectExpense = mongoose.model('ProjectExpense');

async function removeSeeded() {
  try {
    await mongoose.connect(process.env.DATABASE);
    console.log('✅ Connected to MongoDB');

    const result = await ProjectExpense.deleteMany({ remarks: /^Auto-seeded/ });
    console.log(`🗑️  Removed ${result.deletedCount} seeded expense entries`);

  } catch (err) {
    console.error('❌ Remove failed:', err);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected');
  }
}

removeSeeded();
