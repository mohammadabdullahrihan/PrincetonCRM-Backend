/*
  Catch Errors Handler

  With async/await, you need some way to catch errors
  Instead of using try{} catch(e) {} in each controller, we wrap the function in
  catchErrors(), catch any errors they throw, and pass it along to our express middleware with next()
*/

exports.catchErrors = (fn) => {
  return function (req, res, next) {
    return fn(req, res, next).catch((error) => {
      if (error.name === 'ValidationError') {
        return res.status(400).json({
          success: false,
          result: null,
          message: 'Required fields are not supplied',
          controller: fn.name,
          error: error.message,
        });
      } else if (error.name === 'CastError') {
        return res.status(400).json({
          success: false,
          result: null,
          message: 'Invalid ID format',
          controller: fn.name,
          error: error.message,
        });
      } else if (error.code === 11000) {
        return res.status(409).json({
          success: false,
          result: null,
          message: 'Duplicate entry - record already exists',
          controller: fn.name,
          error: error.message,
        });
      } else if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          result: null,
          message: 'Invalid or expired token',
          controller: fn.name,
          error: error.message,
        });
      } else {
        // Server Error
        return res.status(500).json({
          success: false,
          result: null,
          message: error.message || 'Internal server error',
          controller: fn.name,
          error: process.env.NODE_ENV === 'development' ? error : {},
        });
      }
    });
  };
};

/*
  Not Found Error Handler

  If we hit a route that is not found, we mark it as 404 and pass it along to the next error handler to display
*/
exports.notFound = (req, res, next) => {
  const error = new Error(`Not found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

/*
  Development Error Handler

  In development we show good error messages so if we hit a syntax error or any other previously un-handled error, we can show good info on what happened
*/
exports.developmentErrors = (error, req, res, next) => {
  error.stack = error.stack || '';
  const errorDetails = {
    message: error.message,
    status: error.status,
    stackHighlighted: error.stack.replace(/[a-z_-\d]+.js:\d+:\d+/gi, '<mark>$&</mark>'),
  };

  return res.status(500).json({
    success: false,
    message: error.message,
    error: error,
  });
};

/*
  Production Error Handler

  No stacktraces are leaked to admin
*/
exports.productionErrors = (error, req, res, next) => {
  return res.status(500).json({
    success: false,
    message: error.message,
    error: error,
  });
};
