const express = require('express');
const router = express.Router();

const propertyCtrl = require('@/controllers/appControllers/propertyController');
const { catchErrors } = require('@/handlers/errorHandlers');

// Optional authentication middleware
let { isValidAuthToken, adminOnly } = {};
try {
  ({ isValidAuthToken, adminOnly } = require('@/controllers/coreControllers/adminAuth'));
} catch (e) {
  // Fallback for dev mode (no auth)
  isValidAuthToken = (req, res, next) => next();
  adminOnly = null;
}

// Property Routes
router.get('/property/list', catchErrors(propertyCtrl.list));
router.get('/property/summary', catchErrors(propertyCtrl.summary));
router.post('/property/create', isValidAuthToken, catchErrors(propertyCtrl.create));
router.get('/property/read/:id', catchErrors(propertyCtrl.read));
router.patch('/property/update/:id', isValidAuthToken, catchErrors(propertyCtrl.update));
router.delete(
  '/property/delete/:id',
  isValidAuthToken,
  adminOnly ? catchErrors(adminOnly(propertyCtrl.delete)) : catchErrors(propertyCtrl.delete)
);

// Visit Routes
router.post('/property/:id/visit', isValidAuthToken, catchErrors(propertyCtrl.addVisit));
router.get('/property/:id/visits', isValidAuthToken, catchErrors(propertyCtrl.listVisits));

module.exports = router;
