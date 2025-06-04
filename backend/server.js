const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();
const db = require('../backend/db');
const ticketRoutes = require('./routes/tickets');
const seatsRoutes = require('./routes/seats');
const concertRoutes = require('./routes/concerts'); // ➕ новий маршрут

app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/seats', seatsRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/concerts', concertRoutes); // ➕ додано маршрут

app.get('/', (req, res) => {
	res.send('🚀 Сервер працює!');
});

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
