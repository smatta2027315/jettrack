const express = require('express');
const router = express.Router();
const db = require('../../models');

// GET /api/cadets/:cadetID - Return one cadet with their user details
router.get('/:cadetID', async (req, res) => {
  if (!['Instructor', 'Cadet Leader', 'Cadet'].includes(req.user.role)) {
    return res.status(403).json({ error: 'Forbidden: You cannot view cadet profiles' });
  }

  const cadetID = Number(req.params.cadetID);
  if (!Number.isInteger(cadetID) || cadetID <= 0) {
    return res.status(400).json({ error: 'Invalid cadet ID' });
  }

  try {
    const cadet = await db.cadet.findOne({
      attributes: ['cadetID', 'userID', 'rank', 'grade_level', 'position', 'flight'],
      where: {
        cadetID,
        ...(req.user.role === 'Cadet' ? { userID: req.user.id } : {}),
      },
      include: [{
        model: db.user,
        as: 'user',
        attributes: ['first_name', 'last_name'],
        required: true,
      }],
    });

    if (!cadet) {
      return res.status(404).json({ error: 'Cadet not found' });
    }

    const { cadetID: id, userID, rank, grade_level, position, flight, user } = cadet;
    return res.json({
      cadetID: id,
      userID,
      last_name: user.last_name,
      first_name: user.first_name,
      rank,
      grade_level,
      position,
      flight,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
