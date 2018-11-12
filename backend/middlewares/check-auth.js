const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  try {
    // We want the token part after the "Bearer" word, only the token part.
    const token = req.headers.authorization.split(' ')[1];
    jwt.verify(token, 'secret_this_should_be_longer_password');
    next();
  } catch (error) {
    // We don't have a token and we are not authenticated.
    res.status(401).json({ message:  'Auth Failed!' });
  }
};
