const express = require('express');

const router = express.Router();

const { catchErrors } = require('@/handlers/errorHandlers');
const adminAuth = require('@/controllers/coreControllers/adminAuth');

router.route('/login').post(catchErrors(adminAuth.login));
router.route('/register').post(catchErrors(adminAuth.register));

router.route('/forgetpassword').post(catchErrors(adminAuth.forgetPassword));
router.route('/resetpassword').post(catchErrors(adminAuth.resetPassword));

router.route('/logout').post(adminAuth.isValidAuthToken, catchErrors(adminAuth.logout));

router.route('/isValid').get(adminAuth.isValidAuthToken, (req, res) => {
  res.status(200).json({
    success: true,
    result: {
      message: 'Token is valid',
      user: req.admin // This will be the fallback user in development
    }
  });
});

module.exports = router;
