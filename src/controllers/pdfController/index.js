const pug = require('pug');
const fs = require('fs');
const path = require('path');
const moment = require('moment');
const QRCode = require('qrcode');
const { listAllSettings, loadSettings } = require('../../middlewares/settings');
const { getData } = require('../../middlewares/serverData');
const useLanguage = require('../../locale/useLanguage');
const { useMoney, useDate } = require('../../settings');
const { numberToWords } = require('../../helpers');

const pugFiles = ['invoice', 'offer', 'quote', 'payment'];

require('dotenv').config({ path: '.env' });
require('dotenv').config({ path: '.env.local' });

// __dirname-based (not CWD-relative) — on serverless platforms like Vercel, the
// function's working directory isn't guaranteed to be the project root, so a bare
// 'src/pdf/...' path resolves nowhere. __dirname always points at this file's own
// directory inside the deployed bundle regardless of how/where the process was
// launched. (vercel.json also needs "includeFiles": ["src/pdf/**"] so these
// non-JS assets — .pug/.png/.woff — actually get bundled in the first place;
// Vercel's static analysis doesn't follow the dynamic 'src/pdf/' + modelName
// string below, so without that config it silently excludes them.)
const PDF_DIR = path.join(__dirname, '../../pdf');

// Company logo, embedded as a base64 data URI so PDF rendering never depends
// on a reachable PUBLIC_SERVER_FILE URL.
let logoDataUri = null;
try {
  const logoBuffer = fs.readFileSync(path.join(PDF_DIR, 'assets/princeton-logo.jpeg'));
  logoDataUri = `data:image/jpeg;base64,${logoBuffer.toString('base64')}`;
} catch {
  logoDataUri = null;
}

// Invoice header/background artwork (designed full-page, company info baked in),
// embedded as a base64 data URI for the same reason as the logo above.
let invoiceHeaderBg = null;
try {
  const bgBuffer = fs.readFileSync(path.join(PDF_DIR, 'assets/invoice-header-bg.png'));
  invoiceHeaderBg = `data:image/png;base64,${bgBuffer.toString('base64')}`;
} catch {
  invoiceHeaderBg = null;
}

// Poppins font, embedded as base64 @font-face sources — html-pdf/PhantomJS has no
// network access during render, so the font must be self-contained, not @import'd.
const poppinsFonts = {};
for (const weight of [400, 600, 700, 800]) {
  try {
    const buf = fs.readFileSync(path.join(PDF_DIR, `assets/fonts/poppins-${weight}.woff`));
    poppinsFonts[weight] = `data:font/woff;base64,${buf.toString('base64')}`;
  } catch {
    poppinsFonts[weight] = null;
  }
}

// A4 at 96dpi (the standard CSS-px-to-print convention Chromium/Puppeteer use).
// Setting the viewport to this size before rendering means percentage-based CSS
// (width:100%, the header-spacer's width-based padding-top trick, etc.) resolves
// against the SAME dimensions the final PDF page actually prints at, so layout
// math done against this page doesn't drift between preview and printed output.
const PAGE_WIDTH_PX = 794;
const PAGE_HEIGHT_PX = 1123;

// PhantomJS/html-pdf was abandoned in 2018 and its prebuilt binary can't run at
// all on serverless platforms (Vercel's read-only filesystem + function-size
// limits), so PDF rendering now runs on real Chromium via Puppeteer instead.
// Locally and on Render (a normal persistent container) the full `puppeteer`
// package's own bundled Chromium is used; on Vercel, `puppeteer-core` drives the
// serverless-optimized binary from `@sparticuz/chromium` (a purpose-built
// package for exactly this AWS-Lambda/Vercel read-only-filesystem scenario).
// `@sparticuz/chromium`'s launch args/headless-mode API changed across versions
// (older versions exposed `.defaultViewport`/`.headless` properties directly;
// 140+ only ships `.args` — which already bakes in `--headless='shell'` — plus
// `.executablePath()`), so this follows the current README's exact recipe rather
// than the older, commonly-copied pattern.
async function launchBrowser() {
  if (process.env.VERCEL) {
    const chromium = require('@sparticuz/chromium');
    const puppeteerCore = require('puppeteer-core');
    return puppeteerCore.launch({
      args: puppeteerCore.defaultArgs({ args: chromium.args, headless: 'shell' }),
      defaultViewport: { width: PAGE_WIDTH_PX, height: PAGE_HEIGHT_PX },
      executablePath: await chromium.executablePath(),
      headless: 'shell',
    });
  }
  const puppeteer = require('puppeteer');
  return puppeteer.launch({ headless: true });
}

// Launching Chromium (launchBrowser) is by far the slowest part of PDF
// generation — hundreds of ms to multiple seconds — and previously ran on
// EVERY "view PDF" click, since generatePdf launched a fresh browser and
// closed it again per request. That's why opening the live-preview PDF felt
// slow even for a document that was just viewed a moment ago. A single
// Chromium process is reused across requests instead (one launch per warm
// server process), and only the lightweight per-request `page` is opened and
// closed each time — page creation/render is fast, the browser launch is not.
let browserInstance = null;
let browserLaunchPromise = null;

async function getBrowser() {
  if (browserInstance && browserInstance.isConnected()) {
    return browserInstance;
  }
  if (!browserLaunchPromise) {
    browserLaunchPromise = launchBrowser()
      .then((browser) => {
        browserInstance = browser;
        browser.once('disconnected', () => {
          if (browserInstance === browser) browserInstance = null;
        });
        return browser;
      })
      .finally(() => {
        browserLaunchPromise = null;
      });
  }
  return browserLaunchPromise;
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

      const htmlContent = pug.renderFile(path.join(PDF_DIR, modelName + '.pug'), {
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
      const margin = { top: border, bottom: border, left: border, right: border };

      const browser = await getBrowser();
      const page = await browser.newPage();
      try {
        await page.setViewport({ width: PAGE_WIDTH_PX, height: PAGE_HEIGHT_PX });
        await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
        // Base64 @font-face sources still need a tick to actually apply before
        // the PDF is captured, even though nothing further loads over network.
        await page.evaluateHandle('document.fonts.ready');
        await page.pdf({
          path: targetLocation,
          format: info.format || 'A4',
          printBackground: true,
          margin,
        });
      } finally {
        await page.close();
      }

      if (callback) callback();
    }
  } catch (error) {
    throw new Error(error);
  }
};
