// middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
// const JWT_SECRET = process.env.JWT_SECRET || 'secret';
const JWT_SECRET = process.env.JWT_SECRET;

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Відсутній або некоректний токен' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    if (!decoded.id) {
      return res.status(401).json({ error: 'Токен не містить ID користувача' });
    }

    console.log('Decoded token:', decoded); // Лог токена всередині функції

    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Недійсний токен' });
  }
}

module.exports = authMiddleware;
