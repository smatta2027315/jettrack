const express = require('express');
const router = express.Router();

const listPosts = require('./list-posts');
const createPost = require('./create-post');

router.use(listPosts);
router.use(createPost);

module.exports = router;
