const bcrypt = require('bcryptjs');
const env = require('../../config/env');

const hashPassword = async (plainPassword) => {
  return bcrypt.hash(plainPassword, env.bcryptRounds);
};

const comparePassword = async (plainPassword, hashedPassword) => {
  return bcrypt.compare(plainPassword, hashedPassword);
};

module.exports = {
  hashPassword,
  comparePassword
};