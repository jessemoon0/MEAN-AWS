const express = require('express');
const router = express.Router();
// Auth Middleware
const checkAuth = require('../middlewares/check-auth');
// Multer file upload Middleware
const extractFile = require('../middlewares/file-upload-multer');
const PostsController = require('../controllers/posts');

router.post('', checkAuth, extractFile, PostsController.createPost);
router.get('', PostsController.getPosts);
router.get('/:id', PostsController.getPostById);
router.put('/:id', checkAuth, extractFile, PostsController.updatePostById);
router.delete('/:id', checkAuth, PostsController.deletePostById);

module.exports = router;
