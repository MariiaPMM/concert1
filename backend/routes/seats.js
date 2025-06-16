const express = require('express');
const router = express.Router();
const db = require('../db');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'secret';

// 🔐 Middleware перевірки авторизації
function authMiddleware(req, res, next) {
	const authHeader = req.headers.authorization;
	if (!authHeader || !authHeader.startsWith('Bearer ')) {
		return res.status(401).json({ error: 'Відсутній або некоректний токен' });
	}

	const token = authHeader.split(' ')[1];
	try {
		const decoded = jwt.verify(token, JWT_SECRET);
		req.user = decoded;
		next();
	} catch (err) {
		return res.status(403).json({ error: 'Недійсний токен' });
	}
}

// ✅ Купити квиток (повинен бути ПЕРШИМ, щоб не конфліктував з :concertId)

router.post('/buy', authMiddleware, async (req, res) => {
	const { concertId, seatId } = req.body;

	if (!concertId || !seatId) {
		return res.status(400).json({ error: 'Необхідно вказати concertId і seatId' });
	}

	try {
		// Чи місце вже зайняте?
		const [existing] = await db.execute(
			`
			SELECT id FROM tickets
			WHERE concert_id = ? AND seat_id = ? AND status = 'дійсний'
		`,
			[concertId, seatId]
		);

		if (existing.length > 0) {
			return res.status(400).json({ error: 'Це місце вже зайнято' });
		}

		// Вставити квиток
		await db.execute(
			`
			INSERT INTO tickets (concert_id, seat_id, user_id, status)
			VALUES (?, ?, ?, 'недійсний')
		`,
			[concertId, seatId, req.user.id]
		);

		res.json({ success: true, message: 'Квиток успішно куплено' });
	} catch (err) {
		console.error('Помилка при покупці квитка:', err);
		res.status(500).json({ error: 'Не вдалося купити квиток' });
	}
});

// ✅ Отримати всі місця для концерту
router.get('/:concertId', async (req, res) => {
	const concertId = req.params.concertId;
	console.log('Запит місць для концерту ID:', concertId);

	try {
		const [seats] = await db.execute(
			`
			SELECT seats.id, seats.seat_number,
				EXISTS (
					SELECT 1 FROM tickets
					WHERE tickets.seat_id = seats.id AND tickets.status = 'дійсний'
				) AS taken
			FROM seats
			WHERE seats.concert_id = ?
			ORDER BY seats.seat_number ASC
		`,
			[concertId]
		);

		console.log('Знайдено місць:', seats.length);
		res.json(seats);
	} catch (err) {
		console.error('Помилка при отриманні місць:', err);
		res.status(500).json({ error: 'Помилка при отриманні місць' });
	}
});

module.exports = router;
