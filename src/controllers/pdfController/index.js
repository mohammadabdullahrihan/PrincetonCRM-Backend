const pug = require('pug');
const fs = require('fs');
const moment = require('moment');
const QRCode = require('qrcode');
let pdf = require('html-pdf');
const { listAllSettings, loadSettings } = require('../../middlewares/settings');
const { getData } = require('../../middlewares/serverData');
const useLanguage = require('../../locale/useLanguage');
const { useMoney, useDate } = require('../../settings');
const { numberToWords } = require('../../helpers');

const pugFiles = ['invoice', 'offer', 'quote', 'payment'];

require('dotenv').config({ path: '.env' });
require('dotenv').config({ path: '.env.local' });

// Company logo, embedded as a base64 data URI so PDF rendering never depends
// on a reachable PUBLIC_SERVER_FILE URL.
let logoDataUri = null;
try {
  const logoBuffer = fs.readFileSync('src/pdf/assets/princeton-logo.jpeg');
  logoDataUri = `data:image/jpeg;base64,${logoBuffer.toString('base64')}`;
} catch {
  logoDataUri = null;
}

// Invoice header/background artwork (designed full-page, company info baked in),
// embedded as a base64 data URI for the same reason as the logo above.
let invoiceHeaderBg = null;
try {
  const bgBuffer = fs.readFileSync('src/pdf/assets/invoice-header-bg.png');
  invoiceHeaderBg = `data:image/png;base64,${bgBuffer.toString('base64')}`;
} catch {
  invoiceHeaderBg = null;
}

// Poppins font, embedded as base64 @font-face sources — html-pdf/PhantomJS has no
// network access during render, so the font must be self-contained, not @import'd.
const poppinsFonts = {};
for (const weight of [400, 600, 700, 800]) {
  try {
    const buf = fs.readFileSync(`src/pdf/assets/fonts/poppins-${weight}.woff`);
    poppinsFonts[weight] = `data:font/woff;base64,${buf.toString('base64')}`;
  } catch {
    poppinsFonts[weight] = null;
  }
}

exports.generatePdf = async (
  modelName,
  info = { filename: 'pdf_file', format: 'A5', targetLocation: '' },
  result,
  callback
) => {
  try {
    const { targetLocation } = info;

    // if PDF already exists, then delete it and create a new PDF
    if (fs.existsSync(targetLocation)) {
      fs.unlinkSync(targetLocation);
    }

    // render pdf html

    if (pugFiles.includes(modelName.toLowerCase())) {
      // Compile Pug template

      const settings = await loadSettings();
      const selectedLang = settings['idurar_app_language'];
      const translate = useLanguage({ selectedLang });

      const {
        currency_symbol,
        currency_position,
        decimal_sep,
        thousand_sep,
        cent_precision,
        zero_format,
      } = settings;

      const { moneyFormatter } = useMoney({
        settings: {
          currency_symbol,
          currency_position,
          decimal_sep,
          thousand_sep,
          cent_precision,
          zero_format,
        },
      });
      const { dateFormat } = useDate({ settings });

      settings.public_server_file = process.env.PUBLIC_SERVER_FILE;

      // Verification QR (invoice only): lets anyone who receives the PDF scan it
      // and confirm the invoice is genuine against our own records, rather than a
      // forged lookalike — see FRONTEND_URL in .env for the domain it points at.
      let verifyQrDataUri = null;
      let verifyUrl = null;
      if (modelName.toLowerCase() === 'invoice' && result?._id) {
        const frontendUrl = (process.env.FRONTEND_URL || 'http://localhost:5173').replace(/\/+$/, '');
        verifyUrl = `${frontendUrl}/verify/${result._id}`;
        try {
          verifyQrDataUri = await QRCode.toDataURL(verifyUrl, { margin: 1, width: 160 });
        } catch {
          verifyQrDataUri = null;
        }
      }

      const htmlContent = pug.renderFile('src/pdf/' + modelName + '.pug', {
        model: result,
        settings,
        translate,
        dateFormat,
        moneyFormatter,
        moment: moment,
        logoDataUri,
        invoiceHeaderBg,
        poppinsFonts,
        verifyQrDataUri,
        verifyUrl,
        numberToWords,
      });

      // Invoice uses a full-bleed background design (no page margin); other
      // pug templates (quote/offer/payment) still assume the standard 10mm inset.
      const border = modelName.toLowerCase() === 'invoice' ? '0' : '10mm';

      pdf
        .create(htmlContent, {
          format: info.format,
          orientation: 'portrait',
          border,
        })
        .toFile(targetLocation, function (error) {
          if (error) throw new Error(error);
          if (callback) callback();
        });
    }
  } catch (error) {
    throw new Error(error);
  }
};
