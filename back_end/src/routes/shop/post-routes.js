const express = require('express');
const router = express.Router();
const {
    getPosts,
    getDetailPost,
    searchPosts
} = require('../../controllers/shop/post-controller');
router.post('/', getPosts);
router.get('/search', searchPosts);
router.get('/:id', getDetailPost);
module.exports = router;
