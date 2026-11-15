const express = require('express');
const router = express.Router();
const db = require('../../models'); // adjust path if needed

// GET /api/users - Return users from database (sorted by last name)
router.get('/', async (req, res) => {
  if (req.user.role !== 'Instructor') {
    return res.status(403).json({ error: 'Forbidden: Only instructors can access this endpoint' });
  }
  
  try {



    const users = await db.user.findAll({
      attributes: ['userID', 'email', 'first_name', 'last_name', 'role'],
      order: [['last_name', 'ASC']],
    });

    return res.json(users);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
