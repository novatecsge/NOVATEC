const successResponse = (res, message, data = {}, statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data
  });
};

const errorResponse = (res, message, code = 'ERROR', statusCode = 400, details = null) => {
  return res.status(statusCode).json({
    success: false,
    message,
    error: {
      code,
      details
    }
  });
};

module.exports = {
  successResponse,
  errorResponse
};