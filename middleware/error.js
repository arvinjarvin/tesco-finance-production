const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;
  error.opcode = err.opcode;

  console.log(err.message);

  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || 'Server Error',
    code: error.opcode,
  });
};

module.exports = errorHandler;
