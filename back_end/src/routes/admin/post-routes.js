const express = require('express');
const router = express.Router();
const {
    createPost,
    updatePost
} = require('../../controllers/admin/post-controller');
router.post('/createPost', createPost);
router.put('/updatePost/:id', updatePost);
module.exports = router;
