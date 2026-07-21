const express = require('express');
const verifyInvoice = require('../../handlers/verifyHandler/verifyInvoice');

const router = express.Router();

// Public, unauthenticated — same trust model as /download (no login required),
// scanned from the QR code printed on the invoice PDF.
router.route('/invoice/:id').get(verifyInvoice);

module.exports = router;
