exports.geminiChat = async (req, res) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({
      success: false,
      result: null,
      message: 'Gemini API key not configured',
      error: 'Missing GEMINI_API_KEY',
    });
  }

  const { prompt, history, model: reqModel } = req.body || {};
  if (!prompt || typeof prompt !== 'string') {
    return res.status(400).json({
      success: false,
      result: null,
      message: 'Prompt is required',
      error: 'Invalid prompt',
    });
  }

  const model = reqModel || process.env.GEMINI_MODEL || 'gemini-2.0-flash';
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const contents = [];
  // optional history formatting: alternating role turns
  if (Array.isArray(history)) {
    for (const h of history) {
      if (h && h.author && h.text) {
        contents.push({
          role: h.author === 'me' ? 'user' : 'model',
          parts: [{ text: h.text }],
        });
      }
    }
  }
  contents.push({ role: 'user', parts: [{ text: prompt }] });

  const body = { contents };

  const resp = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Goog-Api-Key': apiKey },
    body: JSON.stringify(body),
  });

  const data = await resp.json();

  if (!resp.ok) {
    return res.status(resp.status).json({
      success: false,
      result: null,
      message: data.error?.message || 'Gemini API error',
      error: data.error || data,
    });
  }

  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';

  return res.status(200).json({
    success: true,
    result: { text },
    message: 'OK',
  });
};

const mongoose = require('mongoose');
exports.executeCommand = async (req, res) => {
  const { command, args } = req.body || {};
  if (!command || typeof command !== 'string') {
    return res.status(400).json({ success: false, result: null, message: 'Invalid command' });
  }
  const cmd = command.toLowerCase().trim();
  if (cmd.startsWith('import sheet')) {
    const sheetId = (args && args.sheetId) || process.env.GOOGLE_SHEET_ID;
    if (!sheetId) {
      return res.status(400).json({ success: false, result: null, message: 'Missing sheet id' });
    }
    const url = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv`;
    const resp = await fetch(url);
    if (!resp.ok) {
      return res.status(resp.status).json({ success: false, result: null, message: 'Failed to fetch sheet' });
    }
    const csv = await resp.text();
    const lines = csv.split(/\r?\n/).filter((l) => l.trim().length > 0);
    if (lines.length < 2) {
      return res.status(400).json({ success: false, result: null, message: 'No data rows found' });
    }
    const headers = lines[0].split(',').map((h) => h.trim().toLowerCase());
    const idx = (name) => headers.indexOf(name);
    const dataRows = lines.slice(1);

    const normalize = (v) => {
      const t = (v || '').toString().trim();
      return t === '' ? '-' : t;
    };
    const toKey = (v) => normalize(v).toLowerCase();
    const getModelFor = (category, sub) => {
      const c = toKey(category);
      const s = toKey(sub);
      if (c === 'apartment') {
        if (s === 'all') return { model: 'Apartment', category: 'Apartment', subCategory: 'all' };
        if (s === 'sale') return { model: 'ApartmentBuyer', category: 'Apartment', subCategory: 'sale' };
        if (s === 'owner') return { model: 'Apartment', category: 'Apartment', subCategory: 'owner' };
        if (s === 'client') return { model: 'ApartmentClient', category: 'Apartment', subCategory: 'client' };
        if (s === 'vip') return { model: 'ApartmentVIP', category: 'Apartment', subCategory: 'vip' };
        if (s === 'vip-client') return { model: 'ApartmentVIP', category: 'Apartment', subCategory: 'vip-client' };
        if (s === 'visit') return { model: 'ApartmentVisit', category: 'Apartment', subCategory: 'visit' };
        return { model: 'ClientUniversal', category: 'ClientUniversal', subCategory: 'ClientAll' };
      }
      if (c === 'land') {
        if (s === 'all') return { model: 'Land', category: 'Land', subCategory: 'all' };
        if (s === 'sale') return { model: 'LandBuyer', category: 'Land', subCategory: 'sale' };
        if (s === 'owner') return { model: 'Land', category: 'Land', subCategory: 'owner' };
        if (s === 'client') return { model: 'LandClient', category: 'Land', subCategory: 'client' };
        if (s === 'vip-client') return { model: 'LandVIP', category: 'Land', subCategory: 'vip-client' };
        if (s === 'visit') return { model: 'LandVisit', category: 'Land', subCategory: 'visit' };
        return { model: 'ClientUniversal', category: 'ClientUniversal', subCategory: 'ClientAll' };
      }
      if (c === 'shop') {
        if (s === 'all') return { model: 'Shop', category: 'Shop', subCategory: 'all' };
        if (s === 'sale') return { model: 'ShopBuyer', category: 'Shop', subCategory: 'sale' };
        if (s === 'owner') return { model: 'Shop', category: 'Shop', subCategory: 'owner' };
        if (s === 'client') return { model: 'ShopClient', category: 'Shop', subCategory: 'client' };
        if (s === 'visit') return { model: 'ShopVisit', category: 'Shop', subCategory: 'visit' };
        return { model: 'ClientUniversal', category: 'ClientUniversal', subCategory: 'ClientAll' };
      }
      if (c === 'commercial' || c === 'commercialspace') {
        if (s === 'all') return { model: 'Commercial', category: 'CommercialSpace', subCategory: 'all' };
        if (s === 'sale') return { model: 'CommercialBuyer', category: 'CommercialSpace', subCategory: 'sale' };
        if (s === 'owner') return { model: 'Commercial', category: 'CommercialSpace', subCategory: 'owner' };
        if (s === 'client') return { model: 'CommercialClient', category: 'CommercialSpace', subCategory: 'client' };
        if (s === 'visit') return { model: 'CommercialVisit', category: 'CommercialSpace', subCategory: 'visit' };
        return { model: 'ClientUniversal', category: 'ClientUniversal', subCategory: 'ClientAll' };
      }
      if (c === 'jointventure' || c === 'joint venture') {
        if (s === 'all') return { model: 'JointVenture', category: 'JointVenture', subCategory: 'all' };
        if (s === 'owner') return { model: 'JointVenture', category: 'JointVenture', subCategory: 'owner' };
        if (s === 'owner-proposal') return { model: 'JointVenture', category: 'JointVenture', subCategory: 'owner-proposal' };
        if (s === 'visit') return { model: 'JointVenture', category: 'JointVenture', subCategory: 'visit' };
        return { model: 'ClientUniversal', category: 'ClientUniversal', subCategory: 'ClientAll' };
      }
      if (c === 'investor') {
        if (s === 'all') return { model: 'Investor', category: 'Investor', subCategory: 'all' };
        return { model: 'ClientUniversal', category: 'ClientUniversal', subCategory: 'ClientAll' };
      }
      if (c === 'client' || c === 'clientuniversal') {
        if (s === 'all') return { model: 'ClientUniversal', category: 'ClientUniversal', subCategory: 'ClientAll' };
        if (s === 'vip') return { model: 'ClientUniversal', category: 'ClientUniversal', subCategory: 'ClientVIP' };
        return { model: 'ClientUniversal', category: 'ClientUniversal', subCategory: 'ClientAll' };
      }
      return { model: 'ClientUniversal', category: 'ClientUniversal', subCategory: 'ClientAll' };
    };

    const grouped = new Map();
    const breakdown = {};
    let hadMissingAny = false;
    const labelCategory = (cat) => {
      const k = (cat || '').toString();
      const lower = k.toLowerCase();
      if (lower === 'clientuniversal') return 'Client-Universal';
      if (lower === 'commercialspace') return 'Commercial';
      return k;
    };
    for (const row of dataRows) {
      const cols = row.split(',');
      for (let i = 0; i < headers.length; i++) {
        const raw = cols[i];
        if (!(raw && raw.toString().trim())) hadMissingAny = true;
      }
      let category = cols[idx('category')];
      let subCategory = cols[idx('sub_category')] || cols[idx('subcategory')];
      const hasCategory = !!(category && category.trim());
      const hasSub = !!(subCategory && subCategory.trim());
      if (!hasCategory || !hasSub) {
        category = 'ClientUniversal';
        subCategory = 'ClientAll';
      }
      category = normalize(category);
      subCategory = normalize(subCategory);
      const mapped = getModelFor(category, subCategory);
      const modelName = mapped.model;
      const doc = {
        category: mapped.category,
        subCategory: mapped.subCategory,
        slNo: normalize(cols[idx('slno')]),
        date: cols[idx('date')] && cols[idx('date')].trim() ? new Date(cols[idx('date')]) : undefined,
        name: normalize(cols[idx('name')]),
        number: normalize(cols[idx('number')]),
        budget: normalize(cols[idx('budget')]),
        location: normalize(cols[idx('location')]),
        expectedLocation: normalize(cols[idx('expected_location')]),
        remark: normalize(cols[idx('remark')]),
        status: normalize(cols[idx('status')]),
        ref: normalize(cols[idx('ref')]),
        refNo: normalize(cols[idx('refno')]),
        refName: normalize(cols[idx('refname')]),
        developer: normalize(cols[idx('developer')]),
        ownerName: normalize(cols[idx('owner_name')]),
        ownerNumber: normalize(cols[idx('owner_number')]),
        visitedLocation: normalize(cols[idx('visited_location')]),
        whoVisited: normalize(cols[idx('who_visited')]),
        size: normalize(cols[idx('size')]),
        facilities: normalize(cols[idx('facilities')]),
        unit: normalize(cols[idx('unit')]),
        duration: normalize(cols[idx('duration')]),
        price: normalize(cols[idx('price')]),
        customFields: {},
      };
      for (let i = 0; i < headers.length; i++) {
        const key = headers[i];
        const val = normalize(cols[i]);
        doc.customFields[key] = val;
      }
      const label = labelCategory(mapped.category) + (labelCategory(mapped.category) === 'Client-Universal' ? '' : `-${mapped.subCategory}`);
      breakdown[label] = (breakdown[label] || 0) + 1;
      if (!grouped.has(modelName)) grouped.set(modelName, []);
      grouped.get(modelName).push(doc);
    }
    const summary = {};
    let total = 0;
    for (const [modelName, docs] of grouped.entries()) {
      try {
        const Model = mongoose.model(modelName);
        if (docs.length) {
          const result = await Model.insertMany(docs, { ordered: false });
          summary[modelName] = result.length;
          total += result.length;
        }
      } catch (e) {
        summary[modelName] = 0;
      }
    }
    const note = hadMissingAny ? "Missing fields were replaced with '-'" : undefined;
    return res.status(200).json({ success: true, result: { summary, total, breakdown, note }, message: 'Sheet imported' });
  }
  if (cmd.startsWith('import csv')) {
    const csv = args && args.csvText;
    if (!csv || typeof csv !== 'string') {
      return res.status(400).json({ success: false, result: null, message: 'Missing csvText' });
    }
    const lines = csv.split(/\r?\n/).filter((l) => l.trim().length > 0);
    if (lines.length < 2) {
      return res.status(400).json({ success: false, result: null, message: 'No data rows found' });
    }
    const headers = lines[0].split(',').map((h) => h.trim().toLowerCase());
    const idx = (name) => headers.indexOf(name);
    const dataRows = lines.slice(1);

    const normalize = (v) => {
      const t = (v || '').toString().trim();
      return t === '' ? '-' : t;
    };
    const toKey = (v) => normalize(v).toLowerCase();
    const getModelFor = (category, sub) => {
      const c = toKey(category);
      const s = toKey(sub);
      if (c === 'apartment') {
        if (s === 'all') return { model: 'Apartment', category: 'Apartment', subCategory: 'all' };
        if (s === 'sale') return { model: 'ApartmentBuyer', category: 'Apartment', subCategory: 'sale' };
        if (s === 'owner') return { model: 'Apartment', category: 'Apartment', subCategory: 'owner' };
        if (s === 'client') return { model: 'ApartmentClient', category: 'Apartment', subCategory: 'client' };
        if (s === 'vip') return { model: 'ApartmentVIP', category: 'Apartment', subCategory: 'vip' };
        if (s === 'vip-client') return { model: 'ApartmentVIP', category: 'Apartment', subCategory: 'vip-client' };
        if (s === 'visit') return { model: 'ApartmentVisit', category: 'Apartment', subCategory: 'visit' };
        return { model: 'ClientUniversal', category: 'ClientUniversal', subCategory: 'ClientAll' };
      }
      if (c === 'land') {
        if (s === 'all') return { model: 'Land', category: 'Land', subCategory: 'all' };
        if (s === 'sale') return { model: 'LandBuyer', category: 'Land', subCategory: 'sale' };
        if (s === 'owner') return { model: 'Land', category: 'Land', subCategory: 'owner' };
        if (s === 'client') return { model: 'LandClient', category: 'Land', subCategory: 'client' };
        if (s === 'vip-client') return { model: 'LandVIP', category: 'Land', subCategory: 'vip-client' };
        if (s === 'visit') return { model: 'LandVisit', category: 'Land', subCategory: 'visit' };
        return { model: 'ClientUniversal', category: 'ClientUniversal', subCategory: 'ClientAll' };
      }
      if (c === 'shop') {
        if (s === 'all') return { model: 'Shop', category: 'Shop', subCategory: 'all' };
        if (s === 'sale') return { model: 'ShopBuyer', category: 'Shop', subCategory: 'sale' };
        if (s === 'owner') return { model: 'Shop', category: 'Shop', subCategory: 'owner' };
        if (s === 'client') return { model: 'ShopClient', category: 'Shop', subCategory: 'client' };
        if (s === 'visit') return { model: 'ShopVisit', category: 'Shop', subCategory: 'visit' };
        return { model: 'ClientUniversal', category: 'ClientUniversal', subCategory: 'ClientAll' };
      }
      if (c === 'commercial' || c === 'commercialspace') {
        if (s === 'all') return { model: 'Commercial', category: 'CommercialSpace', subCategory: 'all' };
        if (s === 'sale') return { model: 'CommercialBuyer', category: 'CommercialSpace', subCategory: 'sale' };
        if (s === 'owner') return { model: 'Commercial', category: 'CommercialSpace', subCategory: 'owner' };
        if (s === 'client') return { model: 'CommercialClient', category: 'CommercialSpace', subCategory: 'client' };
        if (s === 'visit') return { model: 'CommercialVisit', category: 'CommercialSpace', subCategory: 'visit' };
        return { model: 'ClientUniversal', category: 'ClientUniversal', subCategory: 'ClientAll' };
      }
      if (c === 'jointventure' || c === 'joint venture') {
        if (s === 'all') return { model: 'JointVenture', category: 'JointVenture', subCategory: 'all' };
        if (s === 'owner') return { model: 'JointVenture', category: 'JointVenture', subCategory: 'owner' };
        if (s === 'owner-proposal') return { model: 'JointVenture', category: 'JointVenture', subCategory: 'owner-proposal' };
        if (s === 'visit') return { model: 'JointVenture', category: 'JointVenture', subCategory: 'visit' };
        return { model: 'ClientUniversal', category: 'ClientUniversal', subCategory: 'ClientAll' };
      }
      if (c === 'investor') {
        if (s === 'all') return { model: 'Investor', category: 'Investor', subCategory: 'all' };
        return { model: 'ClientUniversal', category: 'ClientUniversal', subCategory: 'ClientAll' };
      }
      if (c === 'client' || c === 'clientuniversal') {
        if (s === 'all') return { model: 'ClientUniversal', category: 'ClientUniversal', subCategory: 'ClientAll' };
        if (s === 'vip') return { model: 'ClientUniversal', category: 'ClientUniversal', subCategory: 'ClientVIP' };
        return { model: 'ClientUniversal', category: 'ClientUniversal', subCategory: 'ClientAll' };
      }
      return { model: 'ClientUniversal', category: 'ClientUniversal', subCategory: 'ClientAll' };
    };

    const grouped = new Map();
    const breakdown = {};
    let hadMissingAny = false;
    const labelCategory = (cat) => {
      const k = (cat || '').toString();
      const lower = k.toLowerCase();
      if (lower === 'clientuniversal') return 'Client-Universal';
      if (lower === 'commercialspace') return 'Commercial';
      return k;
    };
    for (const row of dataRows) {
      const cols = row.split(',');
      for (let i = 0; i < headers.length; i++) {
        const raw = cols[i];
        if (!(raw && raw.toString().trim())) hadMissingAny = true;
      }
      let category = cols[idx('category')];
      let subCategory = cols[idx('sub_category')] || cols[idx('subcategory')];
      const hasCategory = !!(category && category.trim());
      const hasSub = !!(subCategory && subCategory.trim());
      if (!hasCategory || !hasSub) {
        category = 'ClientUniversal';
        subCategory = 'ClientAll';
      }
      category = normalize(category);
      subCategory = normalize(subCategory);
      const mapped = getModelFor(category, subCategory);
      const modelName = mapped.model;
      const doc = {
        category: mapped.category,
        subCategory: mapped.subCategory,
        slNo: normalize(cols[idx('slno')]),
        date: cols[idx('date')] && cols[idx('date')].trim() ? new Date(cols[idx('date')]) : undefined,
        name: normalize(cols[idx('name')]),
        number: normalize(cols[idx('number')]),
        budget: normalize(cols[idx('budget')]),
        location: normalize(cols[idx('location')]),
        expectedLocation: normalize(cols[idx('expected_location')]),
        remark: normalize(cols[idx('remark')]),
        status: normalize(cols[idx('status')]),
        ref: normalize(cols[idx('ref')]),
        refNo: normalize(cols[idx('refno')]),
        refName: normalize(cols[idx('refname')]),
        developer: normalize(cols[idx('developer')]),
        ownerName: normalize(cols[idx('owner_name')]),
        ownerNumber: normalize(cols[idx('owner_number')]),
        visitedLocation: normalize(cols[idx('visited_location')]),
        whoVisited: normalize(cols[idx('who_visited')]),
        size: normalize(cols[idx('size')]),
        facilities: normalize(cols[idx('facilities')]),
        unit: normalize(cols[idx('unit')]),
        duration: normalize(cols[idx('duration')]),
        price: normalize(cols[idx('price')]),
        customFields: {},
      };
      for (let i = 0; i < headers.length; i++) {
        const key = headers[i];
        const val = normalize(cols[i]);
        doc.customFields[key] = val;
      }
      const label = labelCategory(mapped.category) + (labelCategory(mapped.category) === 'Client-Universal' ? '' : `-${mapped.subCategory}`);
      breakdown[label] = (breakdown[label] || 0) + 1;
      if (!grouped.has(modelName)) grouped.set(modelName, []);
      grouped.get(modelName).push(doc);
    }
    const summary = {};
    let total = 0;
    for (const [modelName, docs] of grouped.entries()) {
      try {
        const Model = mongoose.model(modelName);
        if (docs.length) {
          const result = await Model.insertMany(docs, { ordered: false });
          summary[modelName] = result.length;
          total += result.length;
        }
      } catch (e) {
        summary[modelName] = 0;
      }
    }
    const note = hadMissingAny ? "Missing fields were replaced with '-'" : undefined;
    return res.status(200).json({ success: true, result: { summary, total, breakdown, note }, message: 'CSV imported' });
  }
  if (cmd.startsWith('search') || cmd.startsWith('filter')) {
    const q = (args && args.query) || command;
    const limit = (args && args.limit) || 25;
    const page = (args && args.page) || 1;
    const skip = (page - 1) * limit;

    const normalizeStr = (v) => {
      const t = (v || '').toString().trim();
      return t === '' ? '-' : t;
    };

    const parseFilters = (text) => {
      const filters = {};
      const pairs = text.match(/(\w+)\s*:\s*([^\s,;]+)/g) || [];
      for (const p of pairs) {
        const [key, value] = p.split(':').map((x) => x.trim());
        filters[key.toLowerCase()] = value;
      }
      return filters;
    };

    const filters = parseFilters(q);
    const baseQuery = { removed: false };
    if (filters.category) baseQuery.category = new RegExp(filters.category, 'i');
    if (filters.sub_category || filters.subcategory) baseQuery.subCategory = new RegExp(filters.sub_category || filters.subcategory, 'i');
    if (filters.name) baseQuery.name = new RegExp(filters.name, 'i');
    if (filters.phone || filters.number) baseQuery.number = new RegExp(filters.phone || filters.number, 'i');
    if (filters.location) baseQuery.location = new RegExp(filters.location, 'i');
    if (filters.ref || filters.refno) baseQuery.$or = [{ ref: new RegExp(filters.ref || filters.refno, 'i') }, { refNo: new RegExp(filters.ref || filters.refno, 'i') }];

    if (Object.keys(filters).length === 0) {
      const text = q.replace(/^search\s*/i, '').replace(/^filter\s*/i, '').trim();
      if (text) {
        const re = new RegExp(text, 'i');
        baseQuery.$or = [
          { name: re },
          { number: re },
          { location: re },
          { ref: re },
          { refNo: re },
          { budget: re }
        ];
      }
    }

    const modelsToSearch = ['Lead', 'ClientUniversal', 'ApartmentClient', 'LandClient', 'ShopClient', 'CommercialClient'];
    const items = [];
    let total = 0;
    for (const m of modelsToSearch) {
      try {
        const Model = mongoose.model(m);
        const results = await Model.find(baseQuery).sort({ updated: -1, created: -1 }).skip(skip).limit(limit).lean();
        total += await Model.countDocuments(baseQuery);
        for (const r of results) {
          items.push({
            id: r._id,
            model: m,
            category: r.category,
            subCategory: r.subCategory,
            name: normalizeStr(r.name),
            number: normalizeStr(r.number),
            location: normalizeStr(r.location),
            budget: normalizeStr(r.budget),
            updated: r.updated || r.created,
          });
        }
      } catch (e) {}
    }
    items.sort((a, b) => new Date(b.updated) - new Date(a.updated));
    return res.status(200).json({ success: true, result: { items, total, page, limit }, message: 'Search results' });
  }
  // UPDATE: find lead/customer by name/phone/ref/id and update mentioned fields only
  if (cmd.startsWith('update leads')) {
    const Lead = mongoose.model('Lead');
    const filter = { removed: false };
    const update = {};
    if (args && args.location) update.location = args.location;
    if (args && args.budget) update.budget = args.budget;
    const r = await Lead.updateMany(filter, { $set: update });
    return res.status(200).json({ success: true, result: { matched: r.matchedCount, modified: r.modifiedCount }, message: 'Leads updated' });
  }
  if (cmd.startsWith('update')) {
    const payload = args || {};
    const identify = payload.identify || {};
    const updates = payload.updates || {};
    const normalizeStr = (v) => {
      const t = (v || '').toString().trim();
      return t === '' ? '-' : t;
    };
    for (const k of Object.keys(updates)) {
      updates[k] = normalizeStr(updates[k]);
    }
    const buildIdQuery = () => {
      const q = { removed: false };
      if (identify.id) q._id = identify.id;
      if (identify.name) q.name = new RegExp(identify.name, 'i');
      if (identify.phone || identify.number) q.number = new RegExp(identify.phone || identify.number, 'i');
      if (identify.ref || identify.refNo) q.$or = [{ ref: new RegExp(identify.ref || identify.refNo, 'i') }, { refNo: new RegExp(identify.ref || identify.refNo, 'i') }];
      return q;
    };
    const query = buildIdQuery();
    const targets = ['Lead', 'ClientUniversal', 'ApartmentClient', 'LandClient', 'ShopClient', 'CommercialClient'];
    let modified = 0;
    let matched = 0;
    for (const m of targets) {
      try {
        const Model = mongoose.model(m);
        const r = await Model.updateMany(query, { $set: updates });
        matched += r.matchedCount || 0;
        modified += r.modifiedCount || 0;
      } catch (e) {
        // skip
      }
    }
    return res.status(200).json({ success: true, result: { matched, modified }, message: 'Update completed' });
  }
  // NOTIFY: create a follow-up Task and send a notification
  if (cmd.startsWith('notify') || cmd.includes('follow-up') || cmd.includes('remind')) {
    try {
      const Task = mongoose.model('Task');
      const now = new Date();
      const dueDate = (args && args.dueDate) ? new Date(args.dueDate) : new Date(now.getTime() + 24 * 60 * 60 * 1000);
      const name = (args && args.name) || 'Follow-up';
      const createdBy = req.admin?._id;
      const task = await Task.create({
        category: 'ClientUniversal',
        subCategory: 'FollowUp',
        date: dueDate,
        name,
        remark: (args && args.remark) || 'Follow-up reminder',
        customFields: {},
        createdBy,
      });
      try {
        const { createNotification } = require('@/helpers/notificationHelper');
        await createNotification({
          userId: createdBy,
          type: 'task',
          title: 'Follow-up Reminder',
          message: `${name} due on ${dueDate.toDateString()}`,
          link: `/task/${task._id}`,
          createdBy,
          metadata: { taskId: task._id, dueDate },
        });
      } catch (e) {
        // ignore notification errors
      }
      return res.status(200).json({ success: true, result: { taskId: task._id, dueDate }, message: 'Reminder created' });
    } catch (e) {
      return res.status(500).json({ success: false, result: null, message: 'Failed to create reminder', error: e.message });
    }
  }
  return res.status(400).json({ success: false, result: null, message: 'Unknown command' });
};