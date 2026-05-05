require('dotenv').config({ path: '.env' });
require('dotenv').config({ path: '.env.local' });

const mongoose = require('mongoose');

require('../src/models/appModels/ProjectExpense');
const ProjectExpense = mongoose.model('ProjectExpense');

const CATEGORIES = ['Office Rent', 'Salary', 'Utility Bill', 'Marketing', 'Maintenance', 'Travel', 'Others'];
const METHODS = ['Cash', 'Bank Transfer', 'Mobile Banking', 'Cheque', 'Others'];

const REF_NAMES = [
  'Princeton Office', 'HR Department', 'IT Team', 'Marketing Dept',
  'Admin Office', 'Operations', 'Finance Dept', 'Management',
  'Vendor Payment', 'Client Project',
];

const MAINTENANCE_LABELS = {
  'Office Rent':   ['Monthly Office Rent', 'Branch Rent', 'Storage Space Rent'],
  'Salary':        ['Monthly Salary', 'Bonus Payment', 'Overtime Pay', 'Freelancer Payment'],
  'Utility Bill':  ['Electricity Bill', 'Internet Bill', 'Water Bill', 'Gas Bill'],
  'Marketing':     ['Social Media Ads', 'SEO Campaign', 'Print Marketing', 'Event Sponsorship'],
  'Maintenance':   ['Server Maintenance', 'Office Repair', 'Equipment Servicing', 'AC Maintenance'],
  'Travel':        ['Client Visit', 'Business Trip', 'Team Outing', 'Conference Travel'],
  'Others':        ['Miscellaneous', 'Office Supplies', 'Tea & Snacks', 'Petty Cash'],
};

// Base monthly amounts per category (BDT) — grows ~3% per year
const BASE_AMOUNTS = {
  'Office Rent':   45000,
  'Salary':        180000,
  'Utility Bill':  12000,
  'Marketing':     25000,
  'Maintenance':   8000,
  'Travel':        15000,
  'Others':        7000,
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
    const growthFactor = Math.pow(1.03, yearsSince2020); // 3% YoY growth

    const maxMonth = year === END_YEAR ? 5 : 12; // up to May 2026

    for (let month = 0; month < maxMonth; month++) {
      // 3–6 expense entries per month
      const entryCount = randomBetween(3, 6);
      const usedCategories = new Set();

      // Always include Office Rent and Salary first
      const mustHave = ['Office Rent', 'Salary'];
      for (const cat of mustHave) {
        const base = BASE_AMOUNTS[cat] * growthFactor;
        const amount = jitter(base, 0.05);
        const mainLabels = MAINTENANCE_LABELS[cat];
        const day = randomBetween(1, 5); // rent/salary paid early in month
        entries.push({
          date: new Date(year, month, day),
          refName: pick(REF_NAMES),
          expenseCategory: cat,
          maintenance: pick(mainLabels),
          paymentMethod: cat === 'Salary' ? pick(['Bank Transfer', 'Cheque']) : pick(METHODS),
          amount,
          remarks: `Auto-seeded — ${cat} ${year}/${String(month + 1).padStart(2, '0')}`,
          category: 'ClientUniversal',
          subCategory: 'project-expense',
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
        const amount = jitter(base, 0.25);
        const mainLabels = MAINTENANCE_LABELS[cat];
        const day = randomBetween(5, 28);
        entries.push({
          date: new Date(year, month, day),
          refName: pick(REF_NAMES),
          expenseCategory: cat,
          maintenance: pick(mainLabels),
          paymentMethod: pick(METHODS),
          amount,
          remarks: `Auto-seeded — ${cat} ${year}/${String(month + 1).padStart(2, '0')}`,
          category: 'ClientUniversal',
          subCategory: 'project-expense',
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
    const deleted = await ProjectExpense.deleteMany({ remarks: /^Auto-seeded/ });
    if (deleted.deletedCount > 0) {
      console.log(`🗑️  Removed ${deleted.deletedCount} previously seeded entries`);
    }

    const result = await ProjectExpense.insertMany(entries);
    console.log(`\n🎉 Seeded ${result.length} expense entries`);

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
