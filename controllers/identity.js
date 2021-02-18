const asyncHandler = require('../middleware/async');
const UserSchema = require('../models/User');
const ErrorResponse = require('../util/ErrorResponse');
const { sendTemplatedEmail } = require('../util/mailService');

/**
 * POST http://identity.api.lvh.me/register
 */
exports.identitySignUp = asyncHandler(async (req, res, next) => {
  const { firstName, lastName, emailAddress, password } = req.body;
  const user = await UserSchema.create({
    firstName,
    lastName,
    emailAddress,
    password,
  }); // Pass the password but hash pre-save, view UserSchema.js

  const createdUser = await UserSchema.findById(user.id);
  const token = user.getSignedJwtToken();
  console.log(`New user registered with id ${user.id}`);
  await sendTemplatedEmail({
    toAddress: emailAddress,
    mailer: 'accounts',
    template: 'WelcomeEmail',
    templateData: {
      firstName,
    },
  });
  await createdUser.verifyEmail();
  let copy = createdUser;
  delete copy.emailVerificationCode;
  res.status(200).json({
    success: true,
    access_token: token,
    data: copy,
  });
});

/**
 * POST identity.api.lvh.me/authenticate
 */
exports.identityAuthenticate = asyncHandler(async (req, res, next) => {
  const { emailAddress, password } = req.body;
  if (!emailAddress || !password) {
    return next(new ErrorResponse(`Credentials are required`, 400));
  }
  const user = await UserSchema.findOne({ emailAddress }).select('+password');
  if (!user)
    return next(
      new ErrorResponse("We couldn't find a user with that email", 401)
    );
  const isMatch = await user.matchPassword(password);
  if (!isMatch)
    return next(
      new ErrorResponse('At least one of your details are not correct', 401)
    );
  console.log(`[FINANCE_API] Action: Authenticate ${user.id}`);
  const token = user.getSignedJwtToken();
  res.status(200).json({
    success: true,
    access_token: token,
  });
});

exports.identityResendVerificationCode = asyncHandler(
  async (req, res, next) => {
    await req.user.verifyEmail();
  }
);

exports.identityVerifyEmail = asyncHandler(async (req, res, next) => {
  const { verifyCode } = req.body;
  if (!verifyCode)
    return next(new ErrorResponse('Verification code is required', 400));
  const user = await UserSchema.findById(req.user.id).select(
    '+emailVerificationCode'
  );
  if (
    emailVerificationCode !== undefined &&
    verifyCode == user.emailVerificationCode
  ) {
    return res.status(200).json({
      success: true,
    });
  } else return next(new ErrorResponse('The provided code was invalid!', 400));
});

exports.identityForgotPasswordRequest = asyncHandler(async (req, res, next) => {
  const { emailAddress } = req.body;
  if (!emailAddress)
    return next(new ErrorResponse('Email address is required', 400));
  const user = await UserSchema.findOne({ emailAddress }).select(
    '+resetPasswordToken'
  );
  if (!user)
    return next(
      new ErrorResponse('User not found with that email address!', 400)
    );
  const resetPasswordToken = await user.createResetPasswordToken();
  await sendTemplatedEmail({
    toAddress: user.emailAddress,
    mailer: 'identity',
    template: 'ResetPassword',
    templateData: {
      firstName: user.firstName,
      resetPasswordUrl: `${process.env.PUBLIC_URI}/resetpassword?emailAddress=${user.emailAddress}&token=${resetPasswordToken}`,
    },
  });
  res.status(200).json({
    success: true,
  });
});

exports.identityResetPassword = asyncHandler(async (req, res, next) => {
  const { emailAddress, token, newPassword, confirmPassword } = req.body;
  if (!emailAddress || !token)
    return next(new ErrorResponse('Malformed Request', 400));
  if (newPassword !== confirmPassword)
    return next(new ErrorResponse('Passwords much match', 400));
  const user = await UserSchema.findOne({ emailAddress, resetPasswordToken });
  if (!user || (user && user.resetPasswordExpire < Date.now()))
    return next(new ErrorResponse(`Invalid request or token expired.`, 400));
  await user.update({ password: newPassword });
  res.status(200).json({ success: true });
});

exports.identityGetSelf = asyncHandler(async (req, res, next) => {
  return res.status(200).json({
    success: true,
    data: req.user,
  });
});
