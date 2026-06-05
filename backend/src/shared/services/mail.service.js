const nodemailer = require('nodemailer');

const createTransporter = () => {
  if (!process.env.SMTP_HOST) return null;

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
};

const sendPasswordResetEmail = async ({ to, fullName, resetUrl }) => {
  const transporter = createTransporter();

  if (!transporter) {
    console.log('[PASSWORD_RESET_URL]', resetUrl);
    return;
  }

  await transporter.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to,
    subject: 'Recuperación de contraseña - NOVATEC SGE',
    html: `
      <h2>Recuperación de contraseña</h2>
      <p>Hola ${fullName || ''}, recibimos una solicitud para restablecer tu contraseña.</p>
      <p>Da clic en el siguiente enlace:</p>
      <p><a href="${resetUrl}">${resetUrl}</a></p>
      <p>Este enlace expira en 30 minutos.</p>
      <p>Si no solicitaste este cambio, ignora este correo.</p>
    `
  });
};

module.exports = {
  sendPasswordResetEmail
};