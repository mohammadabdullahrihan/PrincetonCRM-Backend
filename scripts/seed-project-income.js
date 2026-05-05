require('dotenv').config({ path: '.env' });
require('dotenv').config({ path: '.env.local' });

const mongoose = require('mongoose');

require('../src/models/appModels/ProjectIncome');
const ProjectIncome = mongoose.model('ProjectIncome');

const CATEGORIES = ['Project Sale', 'Token Money', 'Installment', 'Registration Fee', 'Service Charge', 'Rental Income', 'Others'];
const METHODS = ['Cash', 'Bank Transfer', 'Mobile Banking', 'Cheque', 'Others'];

const REF_NAMES = [
  'Apex Construction', 'Delta Builders', 'Metro Developers', 'Skyline Projects',
  'Urban Estates', 'Prime Properties', 'Golden Key Ltd', 'Silver Homes',
  'Royal Developers', 'Cityscape Inc',
];

const DESCRIPTIONS = {
  'Project Sale': ['Apartment Sale - Block A', 'Commercial Space Sale', 'Penthouse Sale', 'Office Unit Sale', 'Retail Shop Sale'],
  'Token Money': ['Booking Token - Plot 12B', 'Advance Token - Unit 45', 'Reservation Fee - Block C', 'Down Payment Token', 'Priority Booking Token'],
  'Installment': ['Monthly Installment - Q1', 'Quarterly Payment', 'Installment - Phase 2', 'Scheduled Payment', 'EMI Payment'],
  'Registration Fee': ['Flat Registration', 'Land Registration Fee', 'Title Transfer Fee', 'Legal Registration', 'Deed Registration'],
  'Service Charge': ['Maintenance Service Charge', 'Facility Management Fee', 'Security Service Charge', 'Cleaning Service Fee', 'Management Fee'],
  'Rental Income': ['Office Space Rent', 'Commercial Property Rent', 'Parking Space Rent', 'Storage Unit Rent', 'Billboard Rent'],
  'Others': ['Consultation Fee', 'Late Payment Charge', 'Cancellation Fee', 'Miscellaneous Income', 'Penalty Income'],
};

// Base monthly amounts per category (BDT) — grows ~5% per year
const BASE_AMOUNTS = {
  'Project Sale': 450000,
  'Token Money': 150000,
  'Installment': 280000,
  'Registration Fee': 35000,
  'Service Charge': 85000,
  'Rental Income': 120000,
  'Others': 25000,
};

function randomBetween(min, max) {
  return Math.round(min + Math.random() * (max - min));
}

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function jitter(base, pct = 0.15) {
  const delta = base * pct;
  return Math.round(base + randomBetween(-delta, delta));
}

// Build entries for Jan 2020 – Dec 2025 (72 months) + Jan–May 2026 (5 months) = 77 months
function buildEntries() {
  const entries = [];
  const START_YEAR = 2020;
  const END_YEAR = 2026;

  for (let year = START_YEAR; year <= END_YEAR; year++) {
    const yearsSince2020 = year - START_YEAR;
    const growthFactor = Math.pow(1.05, yearsSince2020); // 5% YoY growth

    const maxMonth = year === END_YEAR ? 5 : 12; // up to May 2026

    for (let month = 0; month < maxMonth; month++) {
      // 4–7 income entries per month
      const entryCount = randomBetween(4, 7);
      const usedCategories = new Set();

      // Always include Project Sale and Installment first
      const mustHave = ['Project Sale', 'Installment'];
      for (const cat of mustHave) {
        const base = BASE_AMOUNTS[cat] * growthFactor;
        const amount = jitter(base, 0.08);
        const descs = DESCRIPTIONS[cat];
        const day = randomBetween(1, 25);
        entries.push({
          date: new Date(year, month, day),
          refName: pick(REF_NAMES),
          incomeCategory: cat,
          description: pick(descs),
          paymentMethod: pick(['Bank Transfer', 'Cheque', 'Mobile Banking']),
          amount,
          remarks: `Auto-seeded — ${cat} ${year}/${String(month + 1).padStart(2, '0')}`,
          category: 'ClientUniversal',
          subCategory: 'project-income',
          removed: false,
          enabled: true,
        });
        usedCategories.add(cat);
      }

      // Fill remaining slots with random categories
      const remaining = entryCount - mustHave.length;
      const otherCats = CATEGORIES.filter(c => !usedCategories.has(c));

      for (let i = 0; i < remaining; i++) {
        const cat = pick(otherCats);
        const base = BASE_AMOUNTS[cat] * growthFactor;
        const amount = jitter(base, 0.20);
        const descs = DESCRIPTIONS[cat];
        const day = randomBetween(1, 28);
        entries.push({
          date: new Date(year, month, day),
          refName: pick(REF_NAMES),
          incomeCategory: cat,
          description: pick(descs),
          paymentMethod: pick(METHODS),
          amount,
          remarks: `Auto-seeded — ${cat} ${year}/${String(month + 1).padStart(2, '0')}`,
          category: 'ClientUniversal',
          subCategory: 'project-income',
          removed: false,
          enabled: true,
        });
      }
    }
  }

  return entries;
}

async function seed() {
  try {
    await mongoose.connect(process.env.DATABASE);
    console.log('✅ Connected to MongoDB');

    const entries = buildEntries();

    // Remove previously seeded entries to avoid duplicates
    const deleted = await ProjectIncome.deleteMany({ remarks: /^Auto-seeded/ });
    if (deleted.deletedCount > 0) {
      console.log(`🗑️  Removed ${deleted.deletedCount} previously seeded entries`);
    }

    const result = await ProjectIncome.insertMany(entries);
    console.log(`\n🎉 Seeded ${result.length} income entries`);

    // Print summary per year
    const summary = {};
    for (const e of result) {
      const y = new Date(e.date).getFullYear();
      if (!summary[y]) summary[y] = { count: 0, total: 0 };
      summary[y].count++;
      summary[y].total += e.amount;
    }
    console.log('\n📊 Year-wise Summary:');
    console.log('─'.repeat(40));
    let grandTotal = 0;
    for (const [yr, s] of Object.entries(summary).sort()) {
      console.log(`  ${yr}  →  ${s.count} entries  |  ৳${s.total.toLocaleString('en-BD')}`);
      grandTotal += s.total;
    }
    console.log('─'.repeat(40));
    console.log(`  TOTAL  →  ৳${grandTotal.toLocaleString('en-BD')}`);
    console.log('');

  } catch (err) {
    console.error('❌ Seed failed:', err);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected');
  }
}

seed();
