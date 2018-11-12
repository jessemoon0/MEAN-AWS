const express = require('express');
const router = express.Router();
// File handler
const multer = require('multer');
// Mongoose schema
const Post = require('../models/post');
// Auth Middleware
const checkAuth = require('../middlewares/check-auth');

const MIME_TYPE_MAP = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg',
};

const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    const isValid = MIME_TYPE_MAP[file.mimetype];
    let error = new Error('Invalid MIME type');
    if (isValid) {
      error = null;
    }
    callback(error, 'backend/images');
  },
  filename: (req, file, callback) => {
    const name = file.originalname.toLowerCase().split(' ').join('-'); // Replace space with dash
    const extension = MIME_TYPE_MAP[file.mimetype];
    callback(null, `${name}-${Date.now()}.${extension}`); // Build unique filename
  }
});

router.post(
  '',
  checkAuth,
  multer({storage}).single('image'),
  (req, res, next) => {

  const serverUrl = `${req.protocol}://${req.get('host')}`;

  const post = new Post({
    title: req.body.title,
    content: req.body.content,
    imagePath: `${serverUrl}/images/${req.file.filename}`
  });
  post.save().then((createdPost) => {
    console.log(createdPost);
    res.status(201).json({
      message: 'Post added successfully',
      post: {
        id: createdPost._id,
        title: createdPost.title,
        content: createdPost.content,
        imagePath: createdPost.imagePath
      }
    });
  });
});

router.get('', (req, res, next) => {
  const pageSize = +req.query.pageSize;
  const currentPage = +req.query.page;
  const postQuery = Post.find();
  let fetchedPosts = [];
  if (pageSize && currentPage) {
    // Inefficient for really large DBs
    postQuery.skip(pageSize * (currentPage - 1)).limit(pageSize);
  }
  postQuery
    .then(documents => {
      fetchedPosts = documents;
      return Post.countDocuments()
    })
    .then(count => {
      res.status(200).json({
        message: 'Posts fetched successfully',
        posts: fetchedPosts,
        maxPosts: count
      });
    });
});

router.get('/:id', (req, res, next) => {
  Post.findById(req.params.id)
    .then(post => {
      if (post) {
        res.status(200).json(post);
      } else {
        res.status(404).json({message: 'Post not found'});
      }
    });
});

router.put(
  '/:id',
  checkAuth,
  multer({storage}).single('image'),
  (req, res, next) => {

  let imagePath = req.body.imagePath;
  if (req.file) {
    const serverUrl = `${req.protocol}://${req.get('host')}`;
    imagePath = `${serverUrl}/images/${req.file.filename}`;
  }
  const updatedPost = new Post({
    _id: req.body.id,
    title: req.body.title,
    content: req.body.content,
    imagePath
  });
  Post.updateOne({_id: req.params.id}, updatedPost).then((response) => {
    console.log(response);
    res.status(200).json({message: 'Updated successfully!'});
  });
});

router.delete(
  '/:id',
  checkAuth,
  (req, res, next) => {
  Post.deleteOne({_id: req.params.id})
    .then((result) => {
      console.log('Deleted from Backend!');
      console.log(result);
      res.status(200).json({message: 'Post Deleted!'})
    });
});

module.exports = router;
