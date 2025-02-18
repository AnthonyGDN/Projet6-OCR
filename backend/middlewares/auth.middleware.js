const jwt = require('jsonwebtoken');

// This middleware checks the Bearer token in the "Authorization" header.
// If valid, it extracts the userId from the token and attaches it to req.auth.
// If missing or invalid, it returns a 401 Unauthorized error.

module.exports = (req, res, next) => {
  try {
    // Verify that the Authorization header is present.
    if (!req.headers.authorization) {
      return res.status(401).json({ error: 'Missing Authorization header' });
    }

    // Split the header to isolate the token string ("Bearer <token>").
    const token = req.headers.authorization.split(' ')[1];

    // Verify and decode the token using the secret from .env
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

    // Attach the userId to the request object for further use.
    req.auth = { userId: decodedToken.userId };

    // Proceed to the next middleware/route handler.
    next();
  } catch (error) {
    // If token verification fails or something else goes wrong, send a 401 error.
    return res.status(401).json({ error });
  }
};
