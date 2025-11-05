const mongoose = require('mongoose');
const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

// Model name mapping for different endpoints
const modelMap = {
  'apartment': 'Apartment',
  'apartmentclient': 'ApartmentClient',
  'apartmentvip': 'ApartmentVIP',
  'apartmentbuyer': 'ApartmentBuyer',
  'apartmentvisit': 'ApartmentVisit',
  
  'land': 'Land',
  'landclient': 'LandClient',
  'landvip': 'LandVIP',
  'landbuyer': 'LandBuyer',
  'landvisit': 'LandVisit',
  
  'shop': 'Shop',
  'shopclient': 'ShopClient',
  'shopvip': 'ShopVIP',
  'shopbuyer': 'ShopBuyer',
  'shopvisit': 'ShopVisit',
  
  'commercial': 'Commercial',
  'commercialclient': 'CommercialClient',
  'commercialvip': 'CommercialVIP',
  'commercialbuyer': 'CommercialBuyer',
  'commercialvisit': 'CommercialVisit',
  
  'jointventure': 'JointVenture',
  'investor': 'Investor',
  'investorvip': 'InvestorVIP',
  'client': 'ClientUniversal',
  'visit': 'Visit',
  'property': 'Property'
};

const remove = (modelName) => asyncHandler(async (req, res) => {
  const Model = mongoose.model(modelName);
  const e = await Model.findById(req.params.id);
  
  if (!e) {
    return res.status(404).json({ success: false, message: 'Not found' });
  }
  
  // Soft delete if 'removed' field exists, otherwise hard delete
  if (typeof e.removed !== 'undefined') {
    e.removed = true;
    await e.save();
  } else {
    await Model.deleteOne({ _id: e._id });
  }
  
  return res.json({ success: true, message: 'Deleted successfully' });
});

module.exports = { remove, modelMap };
