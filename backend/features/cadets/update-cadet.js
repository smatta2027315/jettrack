const express = require('express');
const router = express.Router();
const db = require('../../models');

// PUT /api/cadets/:cadetID - Update a cadet and their user details
router.put('/:cadetID', async (req, res) => {
  if (req.user.role !== 'Instructor') {
    return res.status(403).json({ error: 'Forbidden: Only instructors can access this endpoint' });
  }

  const cadetID = Number(req.params.cadetID);
  if (!Number.isInteger(cadetID) || cadetID <= 0) {
    return res.status(400).json({ error: 'Invalid cadet ID' });
  }

  const { first_name, last_name, rank, position, flight, grade_level } = req.body;
  if (
    typeof first_name !== 'string' || !first_name.trim() ||
    typeof last_name !== 'string' || !last_name.trim() ||
    typeof rank !== 'string' || !rank.trim() ||
    typeof flight !== 'string' || !flight.trim() ||
    grade_level === undefined ||
    grade_level === null ||
    grade_level === '' ||
    !Number.isInteger(Number(grade_level)) ||
    (position !== null && typeof position !== 'string')
  ) {
    return res.status(400).json({ error: 'Invalid cadet profile data' });
  }

  try {
    const updatedCadet = await db.sequelize.transaction(async (transaction) => {
      const cadet = await db.cadet.findByPk(cadetID, {
        include: [{ model: db.user, as: 'user', required: true }],
        transaction,
      });

      if (!cadet) return null;

      await cadet.update({
        rank: rank.trim(),
        position: position?.trim() || null,
        flight: flight.trim(),
        grade_level: Number(grade_level),
      }, { transaction });

      await cadet.user.update({
        first_name: first_name.trim(),
        last_name: last_name.trim(),
      }, { transaction });

      return cadet;
    });

    if (!updatedCadet) {
      return res.status(404).json({ error: 'Cadet not found' });
    }

    return res.json({
      cadetID: updatedCadet.cadetID,
      userID: updatedCadet.userID,
      first_name: updatedCadet.user.first_name,
      last_name: updatedCadet.user.last_name,
      rank: updatedCadet.rank,
      position: updatedCadet.position,
      flight: updatedCadet.flight,
      grade_level: updatedCadet.grade_level,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
