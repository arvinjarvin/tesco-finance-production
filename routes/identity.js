const express = require('express');
const {
  identitySignUp,
  identityAuthenticate,
  identityVerifyEmail,
  identityResendVerificationCode,
  identityForgotPasswordRequest,
  identityResetPassword,
  identityGetSelf,
} = require('../controllers/identity');
const { idFlowAuthenticated } = require('../middleware/auth');
const router = express.Router();

router.route('/register').post(identitySignUp);
router.route('/authenticate').post(identityAuthenticate);
router
  .route('/verify')
  .post(idFlowAuthenticated, identityVerifyEmail)
  .get(idFlowAuthenticated, identityResendVerificationCode);
router
  .route('/forgotpassword')
  .get(identityForgotPasswordRequest)
  .post(identityResetPassword);
router.route('/me').get(idFlowAuthenticated, identityGetSelf);

module.exports = router;
