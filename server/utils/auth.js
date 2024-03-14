const jwt = require("jsonwebtoken");

// Set token secret and expiration date
const secret = "mysecretsshhhhh";
const expiration = "2h";

module.exports = {
  // Middleware for authenticated routes
  authMiddleware: function (req, res, next) {
    // Allow token to be sent via headers
    const token = req.headers.authorization;

    if (!token) {
      return res.status(401).json({ message: "You are not authenticated!" });
    }

    try {
      // Verify token and get user data out of it
      const { data } = jwt.verify(token, secret);
      req.user = data;
      next();
    } catch (err) {
      console.error("Invalid token:", err);
      return res.status(401).json({ message: "Invalid token!" });
    }
  },

  // Function to sign JWT token
  signToken: function ({ username, email, _id }) {
    const payload = { username, email, _id };
    return jwt.sign({ data: payload }, secret, { expiresIn: expiration });
  },
};
