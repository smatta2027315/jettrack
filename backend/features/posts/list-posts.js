const express = require('express');
const router = express.Router();
const db = require('../../models'); // adjust path if needed

// GET /posts - Return posts from database (newest first)
router.get('/posts', async (req, res) => {
  try {
    const users = await db.users.findAll({
      order: [['last_name', 'ASC']],
      include: [
        { model: db.users, as: 'user', attributes: ['userid', 'email', 'first_name', 'last_name','role'] }
      ]
    });

    return res.json(users);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
