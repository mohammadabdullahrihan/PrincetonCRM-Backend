const express = require('express');
const { catchErrors } = require('@/handlers/errorHandlers');
const aiController = require('@/controllers/coreControllers/aiController');

const router = express.Router();

router.route('/ai/gemini').post(catchErrors(aiController.geminiChat));
router.route('/ai/command').post(catchErrors(aiController.executeCommand));

module.exports = router;