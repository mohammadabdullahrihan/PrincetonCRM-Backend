const { createNotification } = require('../../../helpers/notificationHelper');

const remove = async (Model, req, res, next) => {
  try {
    // Check if user has permission to delete (only admin and owner can delete)
    const userRole = req.admin?.role?.toLowerCase();
    if (userRole === 'employee') {
      return res.status(403).json({
        success: false,
        result: null,
        message: 'Access denied. Employees cannot delete records. Please contact an administrator.',
      });
    }
    
    // Find the document by id and delete it
    let updates = {
      removed: true,
    };
    // Find the document by id and delete it
    const result = await Model.findOneAndUpdate(
      {
        _id: req.params.id,
      },
      { $set: updates },
      {
        new: true, // return the new result instead of the old one
      }
    ).exec();
    // If no results found, return document not found
    if (!result) {
      return res.status(404).json({
        success: false,
        result: null,
        message: 'No document found ',
      });
    } else {
      // Send notification after successful deletion
      try {
        const modelName = Model.modelName;
        const userId = req.admin?._id;
        
        if (userId) {
          let title = '';
          let message = '';
          let type = 'warning';
          
          // Customize notification based on model type
          switch(modelName) {
            case 'Client':
              title = 'Client Deleted';
              message = `Client "${result.name || result.company || 'Client'}" has been deleted`;
              type = 'warning';
              break;
            case 'Lead':
              title = 'Lead Deleted';
              message = `Lead "${result.name || result.company || 'Lead'}" has been deleted`;
              type = 'warning';
              break;
            case 'Invoice':
              title = 'Invoice Deleted';
              message = `Invoice #${result.number || result._id} has been deleted`;
              type = 'warning';
              break;
            case 'Quote':
              title = 'Quote Deleted';
              message = `Quote #${result.number || result._id} has been deleted`;
              type = 'warning';
              break;
            case 'Payment':
              title = 'Payment Deleted';
              message = `Payment of ${result.amount || 0} BDT has been deleted`;
              type = 'warning';
              break;
            case 'Property':
              title = 'Property Deleted';
              message = `Property "${result.title || result.name || 'Property'}" has been deleted`;
              type = 'warning';
              break;
            default:
              title = `${modelName} Deleted`;
              message = `A ${modelName.toLowerCase()} has been deleted`;
              type = 'warning';
          }
          
          await createNotification({
            userId,
            type,
            title,
            message,
            createdBy: userId,
            metadata: { 
              modelName,
              documentId: result._id,
              action: 'delete'
            }
          });
        }
      } catch (notifError) {
        // Don't fail the request if notification fails
        console.error('Error creating notification:', notifError);
      }
      
      return res.status(200).json({
        success: true,
        result,
        message: 'Successfully Deleted the document ',
      });
    }
  } catch (error) {
    return next(error);
  }
};

module.exports = remove;
