const mysql = require('mysql2');

const pool = mysql.createPool({
	host: '127.0.0.1',
	user: 'root',
	password: '23062005',
	database: 'concert',
	waitForConnections: true,
	connectionLimit: 10,
	queueLimit: 0,
});

const db = pool.promise();

const getTicketById = async id => {
	const [rows] = await db.execute('SELECT * FROM tickets WHERE id = ?', [id]);
	return rows[0];
};

const markTicketAsSold = async (id, userId) => {
	await db.execute('UPDATE tickets SET status = ?, user_id = ? WHERE id = ?', [
		'дійсний',
		userId,
		id,
	]);
};

module.exports = {
	db,
	getTicketById,
	markTicketAsSold,
};
