const express = require('express');
const router = express.Router();
const db = require('../../models'); // adjust path if needed

// GET /api/cadets - Return cadets with their user details
router.get('/', async (req, res) => {
  if (!['Instructor', 'Cadet Leader', 'Cadet'].includes(req.user.role)) {
    return res.status(403).json({ error: 'Forbidden: You cannot view cadet profiles' });
  }
  
  try {
    const cadets = await db.cadet.findAll({
      attributes: ['cadetID', 'userID', 'rank', 'grade_level', 'position', 'flight'],
      where: req.user.role === 'Cadet' ? { userID: req.user.id } : undefined,
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

router.get('/available-users', async (req, res) => {
  if (req.user.role !== 'Instructor') {
    return res.status(403).json({ error: 'Forbidden: Only instructors can add cadet profiles' });
  }

  try {
    const [users, cadets] = await Promise.all([
      db.user.findAll({
        attributes: ['userID', 'first_name', 'last_name'],
        where: { role: 'Cadet' },
        order: [['last_name', 'ASC']],
      }),
      db.cadet.findAll({ attributes: ['userID'] }),
    ]);
    const profiledUserIDs = new Set(cadets.map((cadet) => cadet.userID));

    return res.json(users
      .filter((user) => !profiledUserIDs.has(user.userID))
      .map((user) => ({
        userID: user.userID,
        first_name: user.first_name,
        last_name: user.last_name,
      })));
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
