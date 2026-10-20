const jwt = require('jsonwebtoken');
const db = require('../models');

const JWT_SECRET = process.env.JWT_SECRET || 'change_this_secret';

function getTokenFromHeaderOrCookie(req) {
  const auth = req.headers.authorization;
  if (auth) {
    const parts = auth.split(' ');
    if (parts.length === 2 && parts[0] === 'Bearer') return parts[1];
  }

  const cookieHeader = req.headers.cookie; // simple parsing to avoid extra dependency
  if (cookieHeader) {
    const parts = cookieHeader.split(';').map(p => p.trim());
    for (const p of parts) {
      if (p.startsWith('token=')) return p.slice('token='.length);
    }
  }
  return null;
}

module.exports = async function (req, res, next) {
  const token = getTokenFromHeaderOrCookie(req);
  if (!token) return res.status(401).json({ error: 'No token provided' });

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    const user = await db.user.findByPk(payload.id);
    if (!user) return res.status(401).json({ error: 'Invalid token' });
    req.user = { id: user.id, email: user.email };
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};
