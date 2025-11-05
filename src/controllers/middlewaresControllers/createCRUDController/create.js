const { createNotification } = require('../../../helpers/notificationHelper');

const create = async (Model, req, res, next) => {
  try {
    // Creating a new document in the collection
    req.body.removed = false;
    
    const result = await new Model({
      ...req.body,
    }).save();

    // Send notification after successful creation
    try {
      const modelName = Model.modelName;
      const userId = req.admin?._id;
      
      if (userId) {
        let title = '';
        let message = '';
        let type = 'success';
        let link = '';
        
        // Customize notification based on model type
        switch(modelName) {
          case 'Client':
            title = 'New Client Added';
            message = `Client "${result.name || result.company || 'New Client'}" has been added successfully`;
            type = 'client';
            link = `/client/${result._id}`;
            break;
          case 'Lead':
            title = 'New Lead Created';
            message = `Lead "${result.name || result.company || 'New Lead'}" has been created`;
            type = 'info';
            link = `/lead/${result._id}`;
            break;
          case 'Invoice':
            title = 'New Invoice Created';
            message = `Invoice #${result.number || result._id} has been created`;
            type = 'success';
            link = `/invoice/${result._id}`;
            break;
          case 'Quote':
            title = 'New Quote Created';
            message = `Quote #${result.number || result._id} has been created`;
            type = 'info';
            link = `/quote/${result._id}`;
            break;
          case 'Payment':
            title = 'Payment Recorded';
            message = `Payment of ${result.amount || 0} BDT has been recorded`;
            type = 'payment';
            link = `/payment/${result._id}`;
            break;
          case 'Property':
            title = 'New Property Added';
            message = `Property "${result.title || result.name || 'New Property'}" has been added`;
            type = 'info';
            link = `/property/${result._id}`;
            break;
          default:
            title = `New ${modelName} Created`;
            message = `A new ${modelName.toLowerCase()} has been created successfully`;
            type = 'success';
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
            action: 'create'
          }
        });
      }
    } catch (notifError) {
      // Don't fail the request if notification fails
      console.error('Error creating notification:', notifError);
    }

    // Returning successfull response
    return res.status(201).json({
      success: true,
      result,
      message: 'Successfully Created the document in Model ',
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = create;
