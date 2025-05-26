const express = require('express');
const router = express.Router();
const db = require('../db');

// Отримати всі квитки

router.get('/', async (req, res) => {
	try {
		const [rows] = await db.execute(`
      SELECT tickets.id, users.name AS user, concerts.name AS concert, seats.section, seats.row__number, seats.seat_number
      FROM tickets
      JOIN users ON tickets.user_id = users.id
      JOIN concerts ON tickets.concert_id = concerts.id
      LEFT JOIN seats ON tickets.seat_id = seats.id
    `);
		res.json(rows);
	} catch (err) {
		console.error('Помилка запиту:', err);
		res.status(500).json({ error: 'Помилка сервера' });
	}
});
module.exports = router;

const multer = require('multer');
const path = require('path');

// Конфігурація сховища
const storage = multer.diskStorage({
	destination: (req, file, cb) => {
		cb(null, 'uploads/'); // шлях до папки (відносно `server.js`)
	},
	filename: (req, file, cb) => {
		const uniqueName = Date.now() + '-' + file.originalname;
		cb(null, uniqueName);
	},
});

const upload = multer({ storage: storage });

router.post('/upload/:id/image', upload.single('image'), (req, res) => {
	const concertId = req.params.id;
	const imagePath = `uploads/${req.file.filename}`;

	const sql = 'UPDATE concerts SET image_path = ? WHERE id = ?';
	db.query(sql, [imagePath, concertId], (err, result) => {
		if (err) {
			console.error('❌ Помилка оновлення зображення:', err);
			return res.status(500).json({ error: 'Помилка сервера' });
		}
		res.json({ message: '✅ Зображення збережене для концерту', imagePath });
	});
});
module.exports = router;
