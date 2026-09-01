const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { Resend } = require('resend');
require('dotenv').config();

const SALT_ROUNDS = 10;

function generateUniqueCode() {
  return crypto.randomBytes(8).toString('hex').toUpperCase();
}

function generateVerificationCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
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

async function sendPasswordResetCodeEmail(toEmail, code) {
  if (!process.env.RESEND_API_KEY) {
    throw new Error('RESEND_API_KEY no esta configurada');
  }

  const fromEmail = process.env.RESEND_FROM || process.env.RESEND_SENDER_EMAIL || process.env.BREVO_SENDER_EMAIL;
  if (!fromEmail) {
    throw new Error('RESEND_FROM no esta configurada');
  }

  const resend = new Resend(process.env.RESEND_API_KEY);
  const { error } = await resend.emails.send({
    from: fromEmail,
    to: [toEmail],
    subject: 'Codigo de verificacion para cambio de contrasena',
    text: `Tu codigo de verificacion es: ${code}. Si no solicitaste este cambio, ignora este mensaje.`
  });

  if (error) {
    throw new Error(error.message || 'No se pudo enviar el correo con Resend');
  }
}

async function sendAccountVerificationCodeEmail(toEmail, code) {
  if (!process.env.RESEND_API_KEY) {
    throw new Error('RESEND_API_KEY no esta configurada');
  }

  const fromEmail = process.env.RESEND_FROM || process.env.RESEND_SENDER_EMAIL || process.env.BREVO_SENDER_EMAIL;
  if (!fromEmail) {
    throw new Error('RESEND_FROM no esta configurada');
  }

  const resend = new Resend(process.env.RESEND_API_KEY);
  const { error } = await resend.emails.send({
    from: fromEmail,
    to: [toEmail],
    subject: 'Verifica tu cuenta',
    text: `Tu codigo de verificacion es: ${code}. Este codigo expira en 15 minutos.`
  });

  if (error) {
    throw new Error(error.message || 'No se pudo enviar el correo con Resend');
  }
}

module.exports = {
  generateUniqueCode,
  generateVerificationCode,
  hashPassword,
  comparePassword,
  generateToken,
  verifyToken,
  sendPasswordResetCodeEmail,
  sendAccountVerificationCodeEmail
};
