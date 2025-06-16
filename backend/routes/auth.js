const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const router = express.Router();
const { db } = require('../db');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'; // бажано з .env

// ✅ Реєстрація
router.post('/register', async (req, res) => {
	const { name, email, phone, password } = req.body;

	if (!name || !email || !phone || !password) {
		return res
			.status(400)
			.json({ error: 'Усі поля обовʼязкові: імʼя, email, телефон, пароль' });
	}

	try {
		const [existingUsers] = await db.execute(
			'SELECT * FROM users WHERE name = ? OR email = ?',
			[name, email]
		);

		if (existingUsers.length > 0) {
			return res
				.status(409)
				.json({ error: 'Користувач з таким імʼям або email вже існує' });
		}

		const hashedPassword = await bcrypt.hash(password, 10);

		const [result] = await db.execute(
			'INSERT INTO users (name, email, phone, password) VALUES (?, ?, ?, ?)',
			[name, email, phone, hashedPassword]
		);

		const userId = result.insertId;

		const token = jwt.sign({ id: userId, name }, JWT_SECRET, {
			expiresIn: '1d',
		});

		return res.json({ message: 'Реєстрація успішна', token });
	} catch (err) {
		console.error('Помилка при реєстрації:', err);
		return res.status(500).json({ error: 'Помилка сервера' });
	}
});

// ✅ Вхід
router.post('/login', async (req, res) => {
	const { email, password } = req.body;

	if (!email || !password) {
		return res.status(400).json({ error: 'Імʼя та пароль обовʼязкові' });
	}

	try {
		const [rows] = await db.execute('SELECT * FROM users WHERE email = ?', [
			email,
		]);
		const user = rows[0];

		if (!user) {
			return res.status(401).json({ error: 'Невірне імʼя або пароль' });
		}

		const isMatch = await bcrypt.compare(password, user.password);

		if (!isMatch) {
			return res.status(401).json({ error: 'Невірне імʼя або пароль' });
		}

		const token = jwt.sign({ id: user.id, name: user.name }, JWT_SECRET, {
			expiresIn: '1d',
		});

		return res.json({ message: 'Вхід успішний', token });
	} catch (err) {
		console.error('Помилка при вході:', err);
		return res.status(500).json({ error: 'Помилка сервера' });
	}
});

// ✅ Профіль
router.get('/profile', async (req, res) => {
	const authHeader = req.headers.authorization;

	if (!authHeader) {
		return res.status(401).json({ error: 'Немає токена' });
	}

	const token = authHeader.split(' ')[1];

	try {
		const decoded = jwt.verify(token, JWT_SECRET);

		const [rows] = await db.execute(
			'SELECT id, name, email, phone FROM users WHERE id = ?',
			[decoded.id]
		);

		if (!rows.length) {
			return res.status(404).json({ error: 'Користувача не знайдено' });
		}

		return res.json(rows[0]);
	} catch (err) {
		console.error('Помилка при отриманні профілю:', err);
		return res.status(401).json({ error: 'Недійсний токен' });
	}
});

module.exports = router;
