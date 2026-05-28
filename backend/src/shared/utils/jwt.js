const jwt = require('jsonwebtoken');
const env = require('../../config/env');

const signAccessToken = (payload) => {
  return jwt.sign(payload, env.jwt.accessSecret, {
    expiresIn: env.jwt.accessExpiresIn
  });
};

const signRefreshToken = (payload) => {
  return jwt.sign(payload, env.jwt.refreshSecret, {
    expiresIn: env.jwt.refreshExpiresIn
  });
};

const signQrToken = (payload) => {
  return jwt.sign(payload, env.jwt.qrSecret, {
    expiresIn: env.jwt.qrExpiresIn
  });
};

const verifyAccessToken = (token) => jwt.verify(token, env.jwt.accessSecret);
const verifyRefreshToken = (token) => jwt.verify(token, env.jwt.refreshSecret);
const verifyQrToken = (token) => jwt.verify(token, env.jwt.qrSecret);

module.exports = {
  signAccessToken,
  signRefreshToken,
  signQrToken,
  verifyAccessToken,
  verifyRefreshToken,
  verifyQrToken
};