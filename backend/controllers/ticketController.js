const QRCode = require('qrcode');
const PDFDocument = require('pdfkit');
const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');
const { getTicketById, markTicketAsSold } = require('../db');

const generateTicketPDF = async ticket => {
  const doc = new PDFDocument();
  const filePath = path.join(__dirname, `../uploads/ticket-${ticket.id}.pdf`);
  const stream = fs.createWriteStream(filePath);

  doc.pipe(stream);
  doc.fontSize(18).text('Ваш квиток', { align: 'center' });
  doc.moveDown();
  doc.text(`Концерт: ${ticket.concertName}`);
  doc.text(`Місце: ${ticket.seat}`);
  doc.text(`Ціна: ${ticket.price} ₴`);

  const qrData = `Квиток №${ticket.id} | ${ticket.concertName} | Місце: ${ticket.seat}`;
  const qrCodeURL = await QRCode.toDataURL(qrData);
  doc.image(Buffer.from(qrCodeURL.split(',')[1], 'base64'), {
    fit: [150, 150],
    align: 'center',
    valign: 'center',
  });

  doc.end();

  return new Promise((resolve, reject) => {
    stream.on('finish', () => resolve(filePath));
    stream.on('error', reject);
  });
};

const sendTicketEmail = async (email, filePath) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  await transporter.sendMail({
    from: '"ConcertApp" <noreply@concertapp.com>',
    to: email,
    subject: 'Ваш квиток 🎫',
    text: 'Дякуємо за покупку! Квиток у вкладенні.',
    attachments: [{ filename: 'ticket.pdf', path: filePath }],
  });
};

exports.buyTicket = async (req, res) => {
  try {
    const ticketId = req.params.id;
    const userId = req.user.id;
    const userEmail = req.user.email;

    const ticket = await getTicketById(ticketId);
    if (!ticket || ticket.status === 'sold') {
      return res.status(400).json({ error: 'Квиток вже продано' });
    }

    await markTicketAsSold(ticketId, userId);
    const pdfPath = await generateTicketPDF(ticket);
    await sendTicketEmail(userEmail, pdfPath);
    fs.unlink(pdfPath, () => {});

    res.status(200).json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Помилка при покупці квитка' });
  }
};
