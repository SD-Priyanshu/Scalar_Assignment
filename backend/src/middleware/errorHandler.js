// Global error handling middleware

const errorHandler = (err, req, res, next) => {
  console.error(`[${new Date().toISOString()}] Error:`, err);

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal server error';

  // Prisma errors
  if (err.code === 'P2025') {
    return res.status(404).json({
      error: 'Resource not found',
      message: err.message,
    });
  }

  if (err.code === 'P2002') {
    return res.status(409).json({
      error: 'Conflict',
      message: 'This resource already exists',
    });
  }

  // Custom errors
  res.status(statusCode).json({
    error: err.name || 'Error',
    message,
  });
};

module.exports = errorHandler;
