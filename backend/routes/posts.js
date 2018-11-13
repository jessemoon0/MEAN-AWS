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
    imagePath: `${serverUrl}/images/${req.file.filename}`,
    creator: req.userData.userId
  });

  post.save()
    .then((createdPost) => {
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
    })
    .catch(error => {
      res.status(500).json({
        message: 'Creating a post failed',
        error
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
    })
    .catch((error) => {
      res.status(500).json({
        message: 'Fetching posts failed',
        error
      });
    });;
});

router.get('/:id', (req, res, next) => {
  Post.findById(req.params.id)
    .then(post => {
      if (post) {
        res.status(200).json(post);
      } else {
        res.status(404).json({message: 'Post not found'});
      }
    })
    .catch((error) => {
      res.status(500).json({
        message: 'Fetching the desired post failed',
        error
      });
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
    imagePath,
    creator: req.userData.userId
  });

  Post.updateOne({_id: req.params.id, creator: req.userData.userId}, updatedPost)
    .then((result) => {
      // If the field has been really modified, meaning is the right user.
      if (result.nModified > 0) {
        res.status(200).json({ message: 'Updated successfully!' });
      } else {
        res.status(401).json({ message: 'You are not authorized to modify this post' })
      }

    })
    .catch((error) => {
      res.status(500).json({
        message: 'Couldn\'t update post',
        error
      });
    });

});

router.delete(
  '/:id',
  checkAuth,
  (req, res, next) => {
  Post.deleteOne({_id: req.params.id, creator: req.userData.userId})
    .then((result) => {
      // If the user is the creator of the post, he/she can delete it.
      if (result.n > 0) {
        console.log('Deleted from Backend!');
        res.status(200).json({ message: 'Deleted from Backend!' });
      } else {
        res.status(401).json({ message: 'You are not authorized to delete this post' })
      }
    })
    .catch((error) => {
      res.status(500).json({
        message: 'Deleting the post failed',
        error
      });
    });;
});

module.exports = router;
