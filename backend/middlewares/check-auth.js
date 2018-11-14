const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  try {
    // We want the token part after the "Bearer" word, only the token part.
    const token = req.headers.authorization.split(' ')[1];
    const decodedToken = jwt.verify(token, process.env.JWT_KEY);
    req.userData = {
      email: decodedToken.email,
      userId: decodedToken.userId
    };
    next();
  } catch (error) {
    // We don't have a token and we are not authenticated.
    res.status(401).json({ message:  'Invalid token!' });
  }
};
