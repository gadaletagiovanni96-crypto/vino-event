require('dotenv').config();
module.exports = {
  PORT: process.env.PORT || 4000,
  MONGO_URI: process.env.MONGO_URI,
  ACCESS_SECRET: process.env.JWT_ACCESS_SECRET || 'dev-access',
  REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || 'dev-refresh',
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',
  ADMIN_CODE: process.env.ADMIN_INVITE_CODE || 'ADMIN-2026',
  OPERATOR_CODE: process.env.OPERATOR_INVITE_CODE || 'OPERATORE-2026',
  COOKIE_SAMESITE: process.env.COOKIE_SAMESITE || 'lax',
  PROD: process.env.NODE_ENV === 'production',
  SMTP: {
    host: process.env.SMTP_HOST, port: Number(process.env.SMTP_PORT || 587),
    user: process.env.SMTP_USER, pass: process.env.SMTP_PASS,
  },
  MAIL_FROM: process.env.MAIL_FROM || 'Calici & Colline <no-reply@example.com>',
};
