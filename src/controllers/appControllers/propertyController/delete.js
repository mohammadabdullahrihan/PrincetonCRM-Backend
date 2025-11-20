const mongoose = require('mongoose');
const Entry = mongoose.model('Property');
const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

const remove = asyncHandler(async (req, res) => {
  try {
    let entry;
    
    // Check if the ID is a valid ObjectId
    if (mongoose.Types.ObjectId.isValid(req.params.id)) {
      entry = await Entry.findById(req.params.id);
    } else {
      // If not a valid ObjectId, try to find by numeric ID field if it exists
      entry = await Entry.findOne({ id: req.params.id });
      
      // If still not found, try to find by any field that might match
      if (!entry) {
        entry = await Entry.findOne({
          $or: [
            { _id: req.params.id },
            { id: req.params.id },
            { number: req.params.id },
            { ref: req.params.id }
          ]
        });
      }
    }

    if (!entry) {
      return res.status(404).json({ 
        success: false, 
        message: 'Entry not found',
        details: `No entry found with ID: ${req.params.id}`
      });
    }

    if (typeof entry.removed !== 'undefined') {
      entry.removed = true;
      await entry.save();
      return res.json({ 
        success: true, 
        message: 'Marked as removed',
        id: entry._id
      });
    } else {
      await Entry.deleteOne({ _id: entry._id });
      return res.json({ 
        success: true, 
        message: 'Permanently deleted',
        id: entry._id
      });
    }
  } catch (error) {
    console.error('Delete error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error deleting entry',
      error: error.message,
      receivedId: req.params.id,
      errorType: error.name
    });
  }
});

module.exports = remove;
