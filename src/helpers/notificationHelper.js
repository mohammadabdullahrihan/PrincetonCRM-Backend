const Notification = require('../models/coreModels/Notification');

/**
 * Create a notification for a user
 */
const createNotification = async ({
  userId,
  type = 'info',
  title,
  message,
  link = null,
  createdBy = null,
  metadata = {}
}) => {
  try {
    const notification = await Notification.create({
      user: userId,
      type,
      title,
      message,
      link,
      createdBy,
      metadata
    });

    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
};

/**
 * Create notifications for multiple users
 */
const createBulkNotifications = async (userIds, notificationData) => {
  try {
    const notifications = userIds.map(userId => ({
      user: userId,
      ...notificationData
    }));

    await Notification.insertMany(notifications);
    return true;
  } catch (error) {
    console.error('Error creating bulk notifications:', error);
    throw error;
  }
};

/**
 * Notify when a new project is assigned
 */
const notifyProjectAssigned = async (userId, projectName, projectId, assignedBy) => {
  return createNotification({
    userId,
    type: 'project',
    title: 'New Project Assigned',
    message: `You have been assigned to ${projectName}`,
    link: `/project/${projectId}`,
    createdBy: assignedBy,
    metadata: { projectId, projectName }
  });
};

/**
 * Notify when a task is created
 */
const notifyTaskCreated = async (userId, taskName, taskId, createdBy) => {
  return createNotification({
    userId,
    type: 'task',
    title: 'New Task Assigned',
    message: `You have a new task: ${taskName}`,
    link: `/task/${taskId}`,
    createdBy,
    metadata: { taskId, taskName }
  });
};

/**
 * Notify when a task is due soon
 */
const notifyTaskDueSoon = async (userId, taskName, taskId, dueDate) => {
  return createNotification({
    userId,
    type: 'warning',
    title: 'Task Due Soon',
    message: `Task "${taskName}" is due on ${dueDate}`,
    link: `/task/${taskId}`,
    metadata: { taskId, taskName, dueDate }
  });
};

/**
 * Notify when payment is received
 */
const notifyPaymentReceived = async (userId, amount, clientName, paymentId, createdBy) => {
  return createNotification({
    userId,
    type: 'success',
    title: 'Payment Received',
    message: `Payment of ${amount} BDT received from ${clientName}`,
    link: `/payment/${paymentId}`,
    createdBy,
    metadata: { amount, clientName, paymentId }
  });
};

/**
 * Notify when a new client is added
 */
const notifyNewClient = async (userId, clientName, clientId, createdBy) => {
  return createNotification({
    userId,
    type: 'client',
    title: 'New Client Added',
    message: `New client ${clientName} has been added to the system`,
    link: `/client/${clientId}`,
    createdBy,
    metadata: { clientId, clientName }
  });
};

/**
 * Notify about property visit scheduled
 */
const notifyVisitScheduled = async (userId, propertyName, visitDate, createdBy) => {
  return createNotification({
    userId,
    type: 'info',
    title: 'Visit Scheduled',
    message: `Property visit scheduled for ${propertyName} on ${visitDate}`,
    link: `/visits`,
    createdBy,
    metadata: { propertyName, visitDate }
  });
};

/**
 * Send custom notification
 */
const sendCustomNotification = async (userId, title, message, type = 'info', link = null) => {
  return createNotification({
    userId,
    type,
    title,
    message,
    link
  });
};

module.exports = {
  createNotification,
  createBulkNotifications,
  notifyProjectAssigned,
  notifyTaskCreated,
  notifyTaskDueSoon,
  notifyPaymentReceived,
  notifyNewClient,
  notifyVisitScheduled,
  sendCustomNotification
};
