const express = require('express');
const router = express.Router();
const db = require('../../models'); // adjust path if needed

// GET /api/cadets - Return cadets with their user details
router.get('/', async (req, res) => {
  if (req.user.role !== 'Instructor') {
    return res.status(403).json({ error: 'Forbidden: Only instructors can access this endpoint' });
  }
  
  try {
    const cadets = await db.cadet.findAll({
      attributes: ['cadetID', 'userID', 'rank', 'grade_level', 'position', 'flight'],
      include: [{
        model: db.user,
        as: 'user',
        attributes: ['first_name', 'last_name'],
        required: true,
      }],
      order: [[{ model: db.user, as: 'user' }, 'last_name', 'ASC']],
    });

    return res.json(cadets.map(({ cadetID, userID, grade_level, position, flight, rank, user }) => ({
      cadetID,
      userID,
      last_name: user.last_name,
      first_name: user.first_name,
      grade_level,
      position,
      flight,
      rank,
    })));
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
