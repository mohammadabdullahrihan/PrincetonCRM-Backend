const { createNotification } = require('../../../helpers/notificationHelper');

const update = async (Model, req, res, next) => {
  try {
    // Find document by id and updates with the required fields
    req.body.removed = false;
    const result = await Model.findOneAndUpdate(
      {
        _id: req.params.id,
        removed: false,
      },
      req.body,
      {
        new: true, // return the new result instead of the old one
        runValidators: true,
      }
    ).exec();
    if (!result) {
      return res.status(404).json({
        success: false,
        result: null,
        message: 'No document found ',
      });
    } else {
      // Send notification after successful update
      try {
        const modelName = Model.modelName;
        const userId = req.admin?._id;
        
        if (userId) {
          let title = '';
          let message = '';
          let type = 'info';
          let link = '';
          
          // Customize notification based on model type
          switch(modelName) {
            case 'Client':
              title = 'Client Updated';
              message = `Client "${result.name || result.company || 'Client'}" has been updated`;
              type = 'info';
              link = `/client/${result._id}`;
              break;
            case 'Lead':
              title = 'Lead Updated';
              message = `Lead "${result.name || result.company || 'Lead'}" has been updated`;
              type = 'info';
              link = `/lead/${result._id}`;
              break;
            case 'Invoice':
              title = 'Invoice Updated';
              message = `Invoice #${result.number || result._id} has been updated`;
              type = 'info';
              link = `/invoice/${result._id}`;
              break;
            case 'Quote':
              title = 'Quote Updated';
              message = `Quote #${result.number || result._id} has been updated`;
              type = 'info';
              link = `/quote/${result._id}`;
              break;
            case 'Payment':
              title = 'Payment Updated';
              message = `Payment of ${result.amount || 0} BDT has been updated`;
              type = 'info';
              link = `/payment/${result._id}`;
              break;
            case 'Property':
              title = 'Property Updated';
              message = `Property "${result.title || result.name || 'Property'}" has been updated`;
              type = 'info';
              link = `/property/${result._id}`;
              break;
            default:
              title = `${modelName} Updated`;
              message = `A ${modelName.toLowerCase()} has been updated`;
              type = 'info';
              link = `/${modelName.toLowerCase()}/${result._id}`;
          }
          
          await createNotification({
            userId,
            type,
            title,
            message,
            link,
            createdBy: userId,
            metadata: { 
              modelName,
              documentId: result._id,
              action: 'update'
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
        message: 'we update this document ',
      });
    }
  } catch (error) {
    return next(error);
  }
};

module.exports = update;
