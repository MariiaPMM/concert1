const express = require('express');
const cors = require('cors');
const app = express();
const db = require('../backend/db');
const ticketRoutes = require('./routes/tickets');
const path = require('path');

app.use(cors());
app.get('/', (req, res) => {
	res.send('🚀 Сервер працює!');
});

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/api/tickets', async (req, res) => {
	try {
		const [rows] = await db.execute(`
  SELECT 
    tickets.id,
    users.name AS user,
    concerts.name AS concert,
    concerts.image_path AS image,
    seats.section,
    seats.row__number,
    seats.seat_number,
    tickets.status
  FROM tickets
  JOIN concerts ON tickets.concert_id = concerts.id
  LEFT JOIN seats ON tickets.seat_id = seats.id
  LEFT JOIN users ON tickets.user_id = users.id
`);

		res.json(rows);
	} catch (err) {
		console.error('Помилка запиту:', err);
		res.status(500).json({ error: 'Помилка при отриманні квитків' });
	}
});

app.use(cors({ origin: 'http://localhost:5173' })); // або 5173, залежить від Vue

app.use(express.json());

app.use('/api/tickets', ticketRoutes);
db.execute('SELECT COUNT(*) AS total FROM tickets')
	.then(([rows]) => {
		console.log(`🎟️ Всього квитків у базі даних: ${rows[0].total}`);
	})
	.catch(err => {
		console.error('❌ Помилка підключення до бази даних:', err);
	});

const PORT = 3000;
app.listen(PORT, () => {
	console.log(`✅ Server running on http://localhost:${PORT}`);
});
app.use(cors({ origin: '*' }));

app.get('/api/image-paths', (req, res) => {
	const sql = 'SELECT id, image_path FROM concerts'; // або 'tickets'
	db.query(sql, (err, results) => {
		if (err) {
			console.error('Помилка отримання image_path:', err);
			return res.status(500).json({ error: 'Помилка сервера' });
		}
		res.json(results); // Повертає масив об'єктів з image_path
	});
});
