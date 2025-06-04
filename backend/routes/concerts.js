const express = require('express');
const router = express.Router();
const db = require('../../backend/db');

// Отримати всі концерти
router.get('/', async (req, res) => {
	try {
		const [concerts] = await db.execute(`
      SELECT id, name, location, date, image_path, price
      FROM concerts
      ORDER BY date ASC
    `);
		res.json(concerts);
	} catch (err) {
		console.error('Помилка при отриманні концертів:', err);
		res.status(500).json({ error: 'Не вдалося завантажити концерти' });
	}
});

module.exports = router;
