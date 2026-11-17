const express = require('express');
const router = express.Router();

const auth = require('../../middleware/auth');
const listCadets = require('./list-cadets');
const getCadet = require('./get-cadet');
const updateCadet = require('./update-cadet');

router.use(auth);
router.use(listCadets);
router.use(getCadet);
router.use(updateCadet);


module.exports = router;
