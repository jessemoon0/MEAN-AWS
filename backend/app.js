const express = require('express');
const bodyParser = require('body-parser');

const app = express();

// Body Parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// CORS
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, PUT, OPTIONS');
  next();
});

app.post('/api/posts', (req, res, next) => {
  const post = req.body;
  console.log(post);
  res.status(201).json({
    message: 'Post added successfully'
  });
});

app.get('/api/posts', (req, res, next) => {
  const posts = [
    {
      id: 'wldnrjvjebnv',
      title: 'First Server side post',
      content: 'This comes from server'
    },
    {
      id: 'dkvjnerjv',
      title: '2nd Server side post',
      content: 'This comes from server too!!!'
    }
  ];
  res.status(200).json({
    message: 'Posts fetched successfully',
    posts
  });
});

module.exports = app;
