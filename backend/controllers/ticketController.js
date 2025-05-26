const db = require('../db');

exports.getAllTickets = async (req, res) => {
	try {
		const [tickets] = await db.query('SELECT * FROM tickets');
		res.json(tickets);
	} catch (err) {
		res.status(500).json({ error: 'Server error' });
	}
};

exports.buyTicket = async (req, res) => {
	const { concert_id, user_id } = req.body;
	try {
		await db.query(
			'INSERT INTO purchases (concert_id, user_id) VALUES (?, ?)',
			[concert_id, user_id]
		);
		res.json({ message: 'Ticket bought successfully' });
	} catch (err) {
		res.status(500).json({ error: 'Database error' });
	}
};
