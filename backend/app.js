const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const postsRoutes = require('./routes/posts');

const app = express();

mongoose.connect('mongodb+srv://jessie:SqxwAz6zHY9QlCTI@udemy-mean-app-44qey.mongodb.net/test?retryWrites=true', { useNewUrlParser: true })
  .then(() => {
    console.log('Connected to DB!!!');
  })
  .catch(() => {
    console.log('Connection failed =(');
  });

// Body Parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
// Make images folder available
app.use('/images', express.static(path.join('backend/images')));

// CORS
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, PUT, OPTIONS');
  next();
});

app.use('/api/posts', postsRoutes);

module.exports = app;
