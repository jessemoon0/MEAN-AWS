const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
// Mongoose Schema
const User = require('../models/user');

router.post('/join', (req, res, next) => {
  bcrypt.hash(req.body.password, 10)
    .then(hash => {
      const user = new User({
        email: req.body.email,
        password: hash
      });
      user.save()
        .then(result => {
          res.status(201).json({
            message: 'User Created',
            result: result
          });
        })
        // If user already exists
        .catch(err => {
          res.status(500).json({
            message: 'An error has occurred',
            error: err
          })
        });
    });
});

router.post('/login', (req, res, next) => {
  let fetchedUser;
  User.findOne({email: req.body.email})
    .then(user => {
      if (!user) {
        return res.status(401).json({
          message: 'User not found'
        });
      }
      fetchedUser = user;
      return bcrypt.compare(req.body.password, user.password)
    })
    .then(comparisonResult => {
      if (!comparisonResult) {
        return res.status(401).json({
          message: 'Wrong Password'
        });
      }

      // Create JWT
      const token = jwt.sign(
        { email: fetchedUser.email, userId: fetchedUser._id },
        'secret_this_should_be_longer_password',
        { expiresIn: '1hr' }
      );

      res.status(200).json({
        token
      })
    })
    .catch(err => {
      return res.status(401).json({
        error: err,
        message: 'Something strange happened...'
      });
    });
});

module.exports = router;