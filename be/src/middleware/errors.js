function notFoundHandler(req, res) {
  res.status(404).json({
    success: false,
    error: 'Route not found',
    message: `The requested route ${req.originalUrl} does not exist`
  });
}

function errorHandler(error, req, res, next) {
  if (res.headersSent) {
    return next(error);
  }

  console.error(error);
  const status = Number(error.status || error.statusCode || 500);

  return res.status(status).json({
    success: false,
    error: status >= 500 ? 'Internal server error' : 'Request failed',
    message:
      status >= 500 && process.env.NODE_ENV === 'production'
        ? 'Something went wrong'
        : error.message
  });
}

module.exports = { errorHandler, notFoundHandler };
