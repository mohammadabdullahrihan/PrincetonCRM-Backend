const fs = require('fs');
const path = require('path');
const os = require('os');
const mongoose = require('mongoose');
const { Resend } = require('resend');

const custom = require('../../pdfController');
const { loadSettings } = require('../../../middlewares/settings');
const { SendInvoice } = require('../../../emailTemplate/SendEmailTemplate');

const Model = mongoose.model('Invoice');

const mail = async (req, res) => {
  const { id } = req.body;

  const invoice = await Model.findOne({ _id: id, removed: false }).exec();

  if (!invoice) {
    return res.status(404).json({
      success: false,
      result: null,
      message: 'Invoice not found',
    });
  }

  if (!invoice.client || !invoice.client.email) {
    return res.status(400).json({
      success: false,
      result: null,
      message: 'This client has no email on file, cannot send invoice',
    });
  }

  if (!process.env.RESEND_API) {
    return res.status(400).json({
      success: false,
      result: null,
      message: 'Email sending is not configured on the server (missing RESEND_API)',
    });
  }

  const settings = await loadSettings();
  const fromEmail = settings['company_email'] || settings['idurar_app_company_email'];

  if (!fromEmail) {
    return res.status(400).json({
      success: false,
      result: null,
      message: 'No sender email configured. Set "company_email" in Settings before sending invoices.',
    });
  }

  const fileId = 'invoice-' + invoice._id + '.pdf';
  // os.tmpdir() (not a project-relative path) — serverless platforms like Vercel
  // ship a read-only filesystem for everything except /tmp, so writing anywhere
  // under the project directory (e.g. src/public/...) throws ENOENT/EROFS there.
  const targetLocation = path.join(os.tmpdir(), 'download', 'invoice', fileId);

  try {
    fs.mkdirSync(path.dirname(targetLocation), { recursive: true });

    await custom.generatePdf(
      'Invoice',
      { filename: 'invoice', format: 'A4', targetLocation },
      invoice,
      async () => {
        try {
          const pdfBuffer = fs.readFileSync(targetLocation);
          const resend = new Resend(process.env.RESEND_API);

          const { error } = await resend.emails.send({
            from: fromEmail,
            to: invoice.client.email,
            subject: `Invoice ${invoice.number}/${invoice.year} from ${settings['company_name'] || 'Princeton'}`,
            html: SendInvoice({
              title: `Invoice ${invoice.number}/${invoice.year}`,
              name: invoice.client.name,
              time: invoice.date,
            }),
            attachments: [{ filename: fileId, content: pdfBuffer.toString('base64') }],
          });

          if (error) {
            return res.status(400).json({
              success: false,
              result: null,
              message: error.message || 'Failed to send invoice email',
            });
          }

          return res.status(200).json({
            success: true,
            result: null,
            message: 'Invoice emailed to ' + invoice.client.email,
          });
        } catch (sendError) {
          return res.status(500).json({
            success: false,
            result: null,
            message: sendError.message || 'Failed to send invoice email',
          });
        }
      }
    );
  } catch (error) {
    return res.status(500).json({
      success: false,
      result: null,
      message: error.message || 'Failed to generate invoice PDF',
    });
  }
};

module.exports = mail;
