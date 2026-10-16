const express = require('express');
const router = express.Router();
const { randomUUID } = require('crypto');
const db = require('../../models'); // adjust path if needed
const auth = require('../../middleware/auth');

// POST /posts - Create a new post (database) - protected
router.post('/posts', auth, async (req, res) => {
  try {
    const { content } = req.body || {};

    // req.user is populated by auth middleware
    const userId = req.user && req.user.id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    if (!content || !content.trim()) {
      return res.status(400).json({ error: 'Content required' });
    }

    const post = await db.posts.create({
      id: randomUUID(),
      content: content.trim(),
      created: new Date(),
      user_id: userId
    });

    return res.status(201).json(post);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
