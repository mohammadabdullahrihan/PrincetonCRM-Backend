require('module-alias/register');
const express = require('express');

const cors = require('cors');
const compression = require('compression');

const cookieParser = require('cookie-parser');
const { globSync } = require('glob');
const path = require('path');

// Ensure all Mongoose models are registered before controllers/routes are loaded
const modelsFiles = globSync('./src/models/**/*.js');
for (const filePath of modelsFiles) {
  require(path.resolve(filePath));
}

const coreAuthRouter = require('./routes/coreRoutes/coreAuth');
const coreApiRouter = require('./routes/coreRoutes/coreApi');
const coreDownloadRouter = require('./routes/coreRoutes/coreDownloadRouter');
const corePublicRouter = require('./routes/coreRoutes/corePublicRouter');
const notificationRouter = require('./routes/coreRoutes/notificationRoutes');
const employeeRouter = require('./routes/coreRoutes/employeeRoutes');
const adminAuth = require('./controllers/coreControllers/adminAuth');

const errorHandlers = require('./handlers/errorHandlers');
const erpApiRouter = require('./routes/appRoutes/appApi');

const fileUpload = require('express-fileupload');
// create our Express app
const app = express();

app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

app.use(cookieParser());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

app.use(compression());

// // default options
// app.use(fileUpload());

// Here our API Routes

// Root route to show backend is running
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Backend Running</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            margin: 0;
            background: linear-gradient(135deg, #1a1410 0%, #2d2416 100%);
          }
          .container {
            text-align: center;
            background: #2c2416;
            padding: 40px 60px;
            border-radius: 10px;
            box-shadow: 0 10px 25px rgba(0,0,0,0.5);
            border: 1px solid #8b7355;
          }
          h1 {
            color: #f6d365;
            margin: 0 0 10px 0;
            text-shadow: 0 0 10px rgba(246, 211, 101, 0.3);
          }
          p {
            color: #e0e0e0;
            margin: 10px 0;
          }
          .status {
            display: inline-block;
            width: 12px;
            height: 12px;
            background: #4caf50;
            border-radius: 50%;
            margin-right: 8px;
            animation: pulse 2s infinite;
            box-shadow: 0 0 8px #4caf50;
          }
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1><span class="status"></span>Backend is Running</h1>
          <p>Princeton CRM API Server</p>
          <p>Port: ${process.env.PORT || 5000}</p>
        </div>
      </body>
    </html>
  `);
});

app.use('/api', coreAuthRouter);
app.use('/api/employee', employeeRouter); // Must be before erpApiRouter to override generic employee routes
app.use('/api', adminAuth.isValidAuthToken, coreApiRouter);
app.use('/api', adminAuth.isValidAuthToken, erpApiRouter);
app.use('/api', adminAuth.isValidAuthToken, notificationRouter);
app.use('/download', coreDownloadRouter);
app.use('/public', corePublicRouter);

// If that above routes didnt work, we 404 them and forward to error handler
app.use(errorHandlers.notFound);

// development error handler (for testing)
if (process.env.NODE_ENV === 'development') {
  app.use(errorHandlers.developmentErrors);
}

// production error handler
app.use(errorHandlers.productionErrors);

// done! we export it so we can start the site in start.js
module.exports = app;
