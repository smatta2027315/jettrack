const express = require('express');
const router = express.Router();

const auth = require('../../middleware/auth');
const listUsers = require('./list-users');
const updateUserRole = require('./update-user-role');

router.use(auth);
router.use(listUsers);
router.use(updateUserRole);


module.exports = router;
