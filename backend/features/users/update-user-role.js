const express = require('express');
const router = express.Router();
const db = require('../../models');

const allowedRoles = ['Cadet', 'Cadet Leader', 'Instructor'];

router.patch('/:userID/role', async (req, res) => {
  if (req.user.role !== 'Instructor') {
    return res.status(403).json({ error: 'Forbidden: Only instructors can assign roles' });
  }

  const userID = Number(req.params.userID);
  if (!Number.isSafeInteger(userID) || userID < 1) {
    return res.status(400).json({ error: 'A valid user ID is required' });
  }

  const { role } = req.body;
  if (!allowedRoles.includes(role)) {
    return res.status(400).json({ error: 'Role must be Cadet, Cadet Leader, or Instructor' });
  }

  try {
    const [updatedCount] = await db.user.update(
      { role, accountStatus: 'active', roleApprovedBy: req.user.id },
      {
        where: {
          userID,
          role: null,
          accountStatus: 'pending'
        }
      }
    );

    if (updatedCount === 0) {
      const user = await db.user.findByPk(userID);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      return res.status(409).json({ error: 'This account has already been assigned a role' });
    }

    const user = await db.user.findByPk(userID, {
      attributes: ['userID', 'email', 'first_name', 'last_name', 'role', 'accountStatus']
    });
    return res.json({ user });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
