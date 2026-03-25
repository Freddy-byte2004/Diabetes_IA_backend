const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
require('dotenv').config();

const SALT_ROUNDS = 10;

function generateUniqueCode() {
  return crypto.randomBytes(8).toString('hex').toUpperCase();
}

async function hashPassword(password) {
  return await bcrypt.hash(password, SALT_ROUNDS);
}

async function comparePassword(password, hash) {
  return await bcrypt.compare(password, hash);
}

function generateToken(payload, expiresIn = '12h') {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn });
}

function verifyToken(token) {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    return null;
  }
}

module.exports = {
  generateUniqueCode,
  hashPassword,
  comparePassword,
  generateToken,
  verifyToken
};
