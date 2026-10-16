const express = require('express');
const router = express.Router();
const db = require('../../models'); // adjust path if needed

// GET /posts - Return posts from database (newest first)
router.get('/posts', async (req, res) => {
  try {
    const posts = await db.posts.findAll({
      order: [['created', 'DESC']],
      include: [
        { model: db.users, as: 'user', attributes: ['id', 'email', 'firstname', 'lastname'] }
      ]
    });

    return res.json(posts);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
