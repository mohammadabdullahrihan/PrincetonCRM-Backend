const mongoose = require('mongoose');
// Ensure Setting model is loaded
require('../../models/coreModels/Setting');
const Model = mongoose.model('Setting');

const listBySettingKey = async ({ settingKeyArray = [] }) => {
  try {
    const settingsToShow = { $or: [] };

    if (settingKeyArray.length === 0) {
      return [];
    }

    settingKeyArray.forEach((each) => {
      settingsToShow.$or.push({ settingKey: each });
    });

    // Find the document by id using settingsToShow instead of undefined 'settings'
    const result = await Model.find(settingsToShow).where('removed', false);

    // If no results found, return empty array
    if (!result || result.length < 1) {
      return [];
    }

    // Return the result
    return result;
  } catch (error) {
    console.error('Error in listBySettingKey:', error);
    throw error;
  }
};

module.exports = listBySettingKey;
