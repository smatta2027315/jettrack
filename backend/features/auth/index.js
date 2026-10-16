const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');

const db = require('../../models');
const User = db.users;

const JWT_SECRET = process.env.JWT_SECRET || 'change_this_secret';

function setTokenCookie(res, token) {
  const isProd = process.env.NODE_ENV === 'production';
  res.cookie('token', token, {
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  });
}

router.post('/register', async (req, res) => {
  const { email, password, firstname, lastname } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

  const existing = await User.findOne({ where: { email } });
  if (existing) return res.status(409).json({ error: 'Email already in use' });

  const hashed = await bcrypt.hash(password, 10);
  try {
    const user = await User.create({ id: uuidv4(), email, password: hashed, firstname, lastname });
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
    setTokenCookie(res, token);
    return res.status(201).json({ id: user.id, email: user.email, firstname: user.firstname, lastname: user.lastname });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

  const user = await User.findOne({ where: { email } });
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });

  const match = await bcrypt.compare(password, user.password || '');
  if (!match) return res.status(401).json({ error: 'Invalid credentials' });

  const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
  setTokenCookie(res, token);
  return res.json({ user: { id: user.id, email: user.email, firstname: user.firstname, lastname: user.lastname } });
});

// Return current user based on token cookie (auth middleware will populate req.user)
const auth = require('../../middleware/auth');
router.get('/me', auth, async (req, res) => {
  const user = await User.findByPk(req.user.id, { attributes: ['id','email','firstname','lastname'] });
  if (!user) return res.status(404).json({ error: 'User not found' });
  return res.json({ user });
});

router.post('/logout', (req, res) => {
  res.clearCookie('token');
  return res.json({ ok: true });
});

module.exports = router;
