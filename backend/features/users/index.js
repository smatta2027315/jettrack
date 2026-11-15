const express = require('express');
const router = express.Router();

const auth = require('../../middleware/auth');
const listUsers = require('./list-users');

router.use(auth);
router.use(listUsers);


module.exports = router;
