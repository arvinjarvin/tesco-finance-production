const jwt = require('jsonwebtoken');
const asyncHandler = require('./async');
const ErrorResponse = require('../util/ErrorResponse');
const UserSchema = require('../models/User');

exports.idFlowAuthenticated = asyncHandler(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(
      new ErrorResponse(
        'Sorry, you need to be logged in to access this resource',
        401
      )
    );
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = await UserSchema.findById(decoded.id);

    next();
  } catch (err) {
    return next(
      new ErrorResponse(
        'Sorry, you need to be logged in to access this resource',
        401
      )
    );
  }
});
