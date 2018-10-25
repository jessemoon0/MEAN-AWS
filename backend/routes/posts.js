const express = require('express');
const multer = require('multer');
const router = express.Router();
const Post = require('../models/post');

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

router.post('', multer({storage}).single('image'), (req, res, next) => {

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
  Post.find()
    .then(documents => {
      res.status(200).json({
        message: 'Posts fetched successfully',
        posts: documents
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

router.put('/:id', multer({storage}).single('image'), (req, res, next) => {
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

router.delete('/:id', (req, res, next) => {
  Post.deleteOne({_id: req.params.id})
    .then((result) => {
      console.log('Deleted from Backend!');
      console.log(result);
      res.status(200).json({message: 'Post Deleted!'})
    });
});

module.exports = router;
