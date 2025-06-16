const express = require('express');
const router = express.Router();
const QRCode = require('qrcode');
const { db, getTicketById, markTicketAsSold } = require('../db');
const authMiddleware = require('../middleware/auth');

// 🪑 Додати квиток до корзини
router.post('/cart/add', authMiddleware, async (req, res) => {
  try {
    const { ticketId } = req.body;
    const userId = req.user.id;

    await db.execute(
      'UPDATE tickets SET user_id = ?, status = ? WHERE id = ?',
      [userId, 'недійсний', ticketId]
    );

    res.json({ message: 'Квиток додано до корзини' });
  } catch (err) {
    console.error('❌ Помилка при додаванні до корзини:', err);
    res.status(500).json({ error: 'Не вдалося додати квиток до корзини' });
  }
});

// 🛒 Отримати корзину користувача
router.get('/cart', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;

    const [tickets] = await db.execute(
      `SELECT 
        t.id, concerts.name AS concertName, seats.seat_number AS seatNumber, concerts.price, t.status, concerts.date
      FROM tickets t
      JOIN concerts ON t.concert_id = concerts.id
      JOIN seats ON t.seat_id = seats.id
      WHERE t.user_id = ? AND status = 'недійсний'`,
      [userId]
    );

    res.json(tickets);
  } catch (err) {
    console.error('❌ Помилка при отриманні корзини:', err);
    res.status(500).json({ error: 'Не вдалося завантажити корзину' });
  }
});

// ✅ Купити квиток з генерацією QR-коду
router.post('/cart/buy/:id', authMiddleware, async (req, res) => {
  try {
    const ticketId = req.params.id;
    const userId = req.user.id;

    const ticket = await getTicketById(ticketId);

    if (!ticket) {
      return res.status(404).json({ error: 'Квиток не знайдено' });
    }

    if (ticket.user_id !== userId) {
      return res.status(403).json({ error: 'Цей квиток вам не належить' });
    }

    if (ticket.status === 'дійсний') {
      return res.status(400).json({ error: 'Квиток вже оплачений' });
    }

    await markTicketAsSold(ticketId, userId);

    // Генеруємо QR-код (наприклад, посилання на сторінку квитка)
    const qrData = `https://your-site.com/tickets/${ticketId}`;
    const qrCodeDataUrl = await QRCode.toDataURL(qrData);

    res.json({ message: 'Квиток успішно куплено', qrCode: qrCodeDataUrl });
  } catch (err) {
    console.error('❌ Помилка при купівлі квитка:', err);
    res.status(500).json({ error: 'Не вдалося завершити купівлю' });
  }
});

module.exports = router;
