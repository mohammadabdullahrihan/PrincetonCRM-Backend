const mongoose = require('mongoose');
const Entry = mongoose.model('Property');
const Visit = mongoose.model('Visit');
const CategoryConfig = mongoose.model('CategoryConfig');
const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

const summary = asyncHandler(async (req, res) => {
  try {
    const { category, subCategory } = req.query;

    const match = { removed: false };
    if (category) match.category = category;
    if (subCategory) match.subCategory = subCategory;

    // Load price ranges (if exists)
    let ranges = [];
    if (category && subCategory) {
      try {
        const cat = await CategoryConfig.findOne({ key: category }).lean();
        const sub = (cat?.subcategories || []).find((s) => s.key === subCategory);
        ranges = sub?.filters?.priceRanges || [];
      } catch (error) {
        console.log('CategoryConfig not available, using empty ranges');
      }
    }

    // Base aggregation with error handling
    let result = {
      perCategory: [],
      perSubCategory: [],
      vipStats: [{ vipCount: 0 }],
      priceRanges: [],
    };

    try {
      const pipeline = [
        { $match: match },
        {
          $facet: {
            // Category-wise count
            perCategory: [
              { $group: { _id: '$category', count: { $sum: 1 } } },
              { $project: { _id: 0, category: '$_id', count: 1 } },
            ],

            // Subcategory-wise count
            perSubCategory: [
              {
                $group: {
                  _id: { category: '$category', subCategory: '$subCategory' },
                  count: { $sum: 1 },
                },
              },
              {
                $project: {
                  _id: 0,
                  category: '$_id.category',
                  subCategory: '$_id.subCategory',
                  count: 1,
                },
              },
            ],

            // VIP count
            vipStats: [
              { $match: { isVIP: true } },
              { $group: { _id: null, vipCount: { $sum: 1 } } },
              { $project: { _id: 0, vipCount: 1 } },
            ],

            // Price range summary (optional)
            ...(ranges.length > 0
              ? {
                  priceRanges: [
                    {
                      $bucket: {
                        groupBy: '$budget',
                        boundaries: [
                          ...ranges.map((r) => r.min ?? 0),
                          ranges[ranges.length - 1].max ?? 999999999,
                        ],
                        default: 'Other',
                        output: { count: { $sum: 1 } },
                      },
                    },
                  ],
                }
              : {}),
          },
        },
      ];

      const aggregationResult = await Entry.aggregate(pipeline).catch(() => [result]);
      result = aggregationResult[0] || result;
    } catch (error) {
      console.log('Aggregation failed, using default result');
    }

    // Get recent visits with error handling
    let recentVisits = [];
    try {
      recentVisits = await Visit.find({})
        .sort({ createdAt: -1 })
        .limit(10)
        .populate({ path: 'entryId', select: 'category subCategory name location' })
        .lean()
        .catch(() => []);
    } catch (error) {
      console.log('Recent visits query failed');
    }

    res.json({
      success: true,
      totalPerCategory: result.perCategory || [],
      totalPerSubcategory: result.perSubCategory || [],
      vipStats: result.vipStats?.[0] || { vipCount: 0 },
      priceBuckets: result.priceRanges || [],
      recentVisits,
    });
  } catch (error) {
    console.error('Property summary error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error retrieving property summary',
      error: error.message,
    });
  }
});

module.exports = summary;
