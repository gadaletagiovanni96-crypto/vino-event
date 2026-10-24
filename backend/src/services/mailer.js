const nodemailer = require('nodemailer');
const QRCode = require('qrcode');
const { SMTP, MAIL_FROM } = require('../config');

const transporter = SMTP.host
  ? nodemailer.createTransport({ host: SMTP.host, port: SMTP.port, secure: SMTP.port === 465, auth: { user: SMTP.user, pass: SMTP.pass } })
  : nodemailer.createTransport({ jsonTransport: true });

async function sendTicketsEmail(user, tickets, event) {
  const attachments = [];
  let blocks = '';
  for (let i = 0; i < tickets.length; i++) {
    const t = tickets[i];
    attachments.push({ filename: `biglietto-${i + 1}.png`, content: await QRCode.toBuffer(t.code, { width: 320, margin: 1 }), cid: `qr${i}` });
    blocks += `<div style="border:1px solid #ddd;border-radius:8px;padding:16px;margin:12px 0;text-align:center">
      <h3 style="margin:0 0 8px">${t.typeName}</h3><img src="cid:qr${i}" width="220" alt="QR"/>
      <p style="font-size:12px;color:#666">Codice: ${t.code}</p></div>`;
  }
  const when = new Date(event.date).toLocaleString('it-IT', { dateStyle: 'full', timeStyle: 'short' });
  const info = await transporter.sendMail({
    from: MAIL_FROM, to: user.email,
    subject: `I tuoi biglietti per ${event.title}`,
    html: `<h2>Grazie ${user.name}!</h2><p>${event.title} — ${when}<br/>${event.location}</p>
           <p>Presenta il QR code all'ingresso. I biglietti sono sempre disponibili anche nella tua bacheca.</p>${blocks}`,
    attachments,
  });
  if (!SMTP.host) console.log(`[email simulata] a ${user.email}: ${tickets.length} biglietti (configura SMTP_* per l'invio reale)`);
  return info;
}
module.exports = { sendTicketsEmail };
