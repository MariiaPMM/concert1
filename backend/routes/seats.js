const express = require('express');
const router = express.Router();
const db = require('../db');

// Отримати всі місця для концерту + зайнятість
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

// Купити квиток
router.post('/buy', async (req, res) => {
	const { concertId, seatId, userId, price } = req.body;

	try {
		// Спочатку перевірити, чи місце вже зайняте
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

		// Інакше оновити або вставити квиток
		await db.execute(
			`
      INSERT INTO tickets (concert_id, seat_id, user_id, status)
      VALUES (?, ?, ?, 'дійсний')
    `,
			[concertId, seatId, userId]
		);

		res.json({ success: true });
	} catch (err) {
		console.error('Помилка при покупці квитка:', err);
		res.status(500).json({ error: 'Не вдалося купити квиток' });
	}
});

module.exports = router;
