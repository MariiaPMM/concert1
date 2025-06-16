const express = require('express');
const jwt = require('jsonwebtoken');
const db = require('../db');
const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'secret';

// 🔐 Middleware перевірки токена
function authMiddleware(req, res, next) {
	const authHeader = req.headers.authorization;
	if (!authHeader || !authHeader.startsWith('Bearer ')) {
		return res
			.status(401)
			.json({ error: 'Немає або неправильний заголовок авторизації' });
	}

	const token = authHeader.split(' ')[1];
	try {
		const decoded = jwt.verify(token, JWT_SECRET);
		if (!decoded?.id) {
			return res.status(403).json({ error: 'Недійсний токен: відсутній ID' });
		}
		req.user = decoded;
		next();
	} catch (err) {
		return res.status(403).json({ error: 'Недійсний токен' });
	}
}

// ✅ Отримати корзину користувача
router.get('/cart', authMiddleware, async (req, res) => {
	try {
		const [rows] = await db.execute(
			`SELECT 
        t.id, concerts.name AS concertName, seats.seat_number AS seatNumber, concerts.price, t.status
      FROM tickets t
      JOIN concerts ON t.concert_id = concerts.id
      JOIN seats ON t.seat_id = seats.id
      WHERE t.user_id = ? AND status = 'недійсний'`,
			[req.user.id]
		);
		res.json(rows);
	} catch (err) {
		res.status(500).json({ error: 'Помилка сервера' });
	}
});

// ✅ Купити один квиток із корзини
router.post('/cart/buy/:ticketId', authMiddleware, async (req, res) => {
	try {
		const [result] = await db.execute(
			`UPDATE tickets 
       SET status = 'дійсний' 
       WHERE id = ? AND user_id = ? AND status = 'недійсний'`,
			[req.params.ticketId, req.user.id]
		);

		if (result.affectedRows === 0) {
			return res
				.status(404)
				.json({ error: 'Квиток не знайдено або вже куплено' });
		}

		res.json({ message: 'Квиток успішно куплено' });
	} catch (err) {
		res.status(500).json({ error: 'Помилка сервера' });
	}
});

// ✅ Купити всі квитки в корзині
router.post('/cart/checkout', authMiddleware, async (req, res) => {
	try {
		const [result] = await db.execute(
			`UPDATE tickets
         SET status = 'дійсний'
       WHERE user_id = ? AND status = 'недійсний'`,
			[req.user.id]
		);

		if (result.affectedRows === 0) {
			return res
				.status(400)
				.json({ message: 'У корзині немає квитків для покупки' });
		}

		res.json({
			message: `Оплата успішна. Куплено квитків: ${result.affectedRows}`,
		});
	} catch (err) {
		console.error('Помилка при оплаті квитків:', err);
		res.status(500).json({ error: 'Виникла помилка під час оплати' });
	}
});

// ✅ Видалити квиток з корзини
router.delete('/cart/:id', authMiddleware, async (req, res) => {
	try {
		const [result] = await db.execute(
			`DELETE FROM tickets 
       WHERE id = ? AND user_id = ? AND status = 'недійсний'`,
			[req.params.id, req.user.id]
		);

		if (result.affectedRows === 0) {
			return res
				.status(404)
				.json({ error: 'Квиток не знайдено або вже куплено' });
		}

		res.json({ message: 'Квиток видалено з корзини' });
	} catch (err) {
		res.status(500).json({ error: 'Помилка сервера' });
	}
});

module.exports = router;
