const express = require('express');
const router = express.Router();
const db = require('../../models');

router.post('/', async (req, res) => {
  if (req.user.role !== 'Instructor') {
    return res.status(403).json({ error: 'Forbidden: Only instructors can create cadet profiles' });
  }

  const { userID, rank, position, flight, grade_level } = req.body;
  const parsedUserID = Number(userID);
  if (
    !Number.isSafeInteger(parsedUserID) || parsedUserID < 1 ||
    typeof rank !== 'string' || !rank.trim() ||
    !['Alpha', 'Bravo', 'Charlie'].includes(flight) ||
    !['Cadet', 'Cadet Leader'].includes(position) ||
    grade_level === undefined ||
    grade_level === null ||
    grade_level === '' ||
    !Number.isInteger(Number(grade_level)) ||
    Number(grade_level) < 8 ||
    Number(grade_level) > 12
  ) {
    return res.status(400).json({ error: 'Invalid cadet profile data' });
  }

  try {
    const outcome = await db.sequelize.transaction(async (transaction) => {
      const user = await db.user.findByPk(parsedUserID, {
        transaction,
        lock: transaction.LOCK.UPDATE,
      });
      if (!user) return { error: 'not-found' };
      if (user.role !== 'Cadet') return { error: 'not-cadet' };

      const existingCadet = await db.cadet.findOne({
        where: { userID: parsedUserID },
        transaction,
      });
      if (existingCadet) return { error: 'profile-exists' };

      const cadet = await db.cadet.create({
        userID: parsedUserID,
        rank: rank.trim(),
        position: position?.trim() || null,
        flight: flight.trim(),
        grade_level: Number(grade_level),
      }, { transaction });
      await user.update({ role: position }, { transaction });

      return { cadet, user };
    });

    if (outcome.error === 'not-found') {
      return res.status(404).json({ error: 'User not found' });
    }
    if (outcome.error === 'not-cadet') {
      return res.status(400).json({ error: 'A Cadet account must be selected' });
    }
    if (outcome.error === 'profile-exists') {
      return res.status(409).json({ error: 'This user already has a cadet profile' });
    }

    const { cadet, user } = outcome;
    return res.status(201).json({
      cadetID: cadet.cadetID,
      userID: cadet.userID,
      first_name: user.first_name,
      last_name: user.last_name,
      rank: cadet.rank,
      position: cadet.position,
      flight: cadet.flight,
      grade_level: cadet.grade_level,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
