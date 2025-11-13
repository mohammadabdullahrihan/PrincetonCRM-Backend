const express = require('express');
const router = express.Router();

const { catchErrors } = require('../../handlers/errorHandlers');
const employeeController = require('../../controllers/coreControllers/employeeController');
const adminAuth = require('../../controllers/coreControllers/adminAuth');

// All routes require authentication
router.use(adminAuth.isValidAuthToken);

// List all employees
router.route('/list').get(catchErrors(employeeController.list));

// Get employee summary/statistics
router.route('/summary').get(catchErrors(employeeController.summary));

// Get single employee
router.route('/:id').get(catchErrors(employeeController.read));

// Update employee role
router.route('/:id/role').patch(catchErrors(employeeController.updateRole));

// Update employee status (enable/disable)
router.route('/:id/status').patch(catchErrors(employeeController.updateStatus));

// Delete employee
router.route('/:id').delete(catchErrors(employeeController.remove));

module.exports = router;
