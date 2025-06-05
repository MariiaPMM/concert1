const express = require('express');
const bcrypt = require('bcrypt');
const router = express.Router();
const db = require('../db');

router.post('/register', async (req, res) => {
	const { name, password } = req.body;

	if (!name || !password) {
		return res.status(400).json({ error: 'Імʼя та пароль обовʼязкові' });
	}

	try {
		const { name, email = null, phone = null, password } = req.body;
		const hashedPassword = await bcrypt.hash(password, 10);

		await db.execute(
			'INSERT INTO users (name, email, phone, password) VALUES (?, ?, ?, ?)',
			[name, email, phone, hashedPassword]
		);

		res.json({ message: 'Користувача зареєстровано' });
	} catch (err) {
		console.error('Помилка реєстрації:', err);
		res.status(500).json({ error: 'Помилка сервера або користувач уже існує' });
	}
});

module.exports = router;
