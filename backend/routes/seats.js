const express = require('express');
const router = express.Router();
const db = require('../db'); // ваш модуль з'єднання з MySQL

// Отримати всі місця для концерту + зайнятість
router.get('/:concertId', async (req, res) => {
	const concertId = req.params.concertId;
	console.log('Запит місць для концерту ID:', concertId);

	try {
		const [seats] = await db.execute(
			`
      SELECT seats.id, seats.seat_number, seats.row__number, seats.section,
            EXISTS (
              SELECT 1 FROM tickets
              WHERE tickets.seat_id = seats.id AND tickets.status = 'дійсний'
            ) AS taken
      FROM seats
      WHERE seats.concert_id = ?
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
		await db.execute(
			`
    UPDATE tickets
    SET user_id = ?, status = 'дійсний'
    WHERE concert_id = ? AND seat_id = ?
  `,
			[userId, concertId, seatId]
		);

		res.json({ success: true });
	} catch (err) {
		res.status(500).json({ error: 'Не вдалося купити квиток' });
	}
});

module.exports = router;
