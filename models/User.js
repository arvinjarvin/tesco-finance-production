const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const normalize = require('normalize-mongoose');
const { sendTemplatedEmail } = require('../util/mailService');

const UserSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, 'You must provide your first name'],
  },
  lastName: {
    type: String,
    required: [true, 'You must provide your last name'],
  },
  emailAddress: {
    type: String,
    unique: true,
    required: [true, 'You must provide an email address'],
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?w+)*(\.\w{2,3})+$/,
      'Email address must be valid',
    ],
  },
  password: {
    type: String, // Not actually storing the PASSWORD, but the PASSWORD HASH
    required: [true, 'You must provide a password'],
    minlength: 8,
    select: false,
  },
  emailVerificationCode: {
    type: Number,
    select: false,
  },
  resetPasswordToken: {
    type: String,
  },
  resetPasswordExpire: Date,
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

UserSchema.plugin(normalize);

UserSchema.pre('save', async function (next) {
  this.updatedAt = Date.now();

  if (!this.isModified('password')) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt); // hash password with salt
});

UserSchema.methods.getSignedJwtToken = function () {
  return jwt.sign(
    {
      id: this._id,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRE,
    }
  );
};

UserSchema.methods.matchPassword = async function (inputPassword) {
  return await bcrypt.compare(inputPassword, this.password); // <Boolean>
};

UserSchema.methods.createResetPasswordToken = function () {
  const resetToken = crypto.randomBytes(20).toString('hex');

  this.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

UserSchema.methods.verifyEmail = async function () {
  const emailCode = Math.floor(100000 + Math.random() * 900000);
  this.emailVerificationCode = emailCode;
  await sendTemplatedEmail({
    toAddress: this.emailAddress,
    mailer: 'noreply',
    template: 'VerifyEmail',
    templateData: {
      firstName: this.firstName,
      verifyCode: emailCode,
    },
  });
};

module.exports = mongoose.model('user', UserSchema);
