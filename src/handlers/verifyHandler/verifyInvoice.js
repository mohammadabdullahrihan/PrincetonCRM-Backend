const mongoose = require('mongoose');
const { loadSettings } = require('../../middlewares/settings');

// Public, unauthenticated lookup for the invoice-verification QR/link printed on
// invoice PDFs. Only returns the same info already printed on the paper invoice
// itself (no notes, no contact details, no internal IDs) — see printout: the
// verify page exists so a third party (bank, auditor) can confirm a physical/PDF
// invoice they were handed matches a real record, not to expose new private data.
module.exports = verifyInvoice = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ success: false, result: null, message: 'Invalid invoice id' });
    }

    const Invoice = mongoose.model('Invoice');
    const invoice = await Invoice.findOne({ _id: id, removed: false }).exec();

    if (!invoice) {
      return res.status(404).json({ success: false, result: null, message: 'Invoice not found' });
    }

    const settings = await loadSettings();

    return res.status(200).json({
      success: true,
      result: {
        number: invoice.number,
        year: invoice.year,
        date: invoice.date,
        clientName: invoice.client?.name || '',
        location: invoice.location || '',
        projectName: invoice.projectName || '',
        total: invoice.total,
        status: invoice.status,
        companyName: settings.company_name || 'Princeton Development Ltd.',
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, result: null, message: error.message });
  }
};
