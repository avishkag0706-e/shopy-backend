// middleware/auth.js
// "Middleware" is a function that runs BEFORE a route handler.
// This one checks that the request carries a valid JWT, so only
// logged-in users can reach the routes it guards.

const jwt = require("jsonwebtoken");

function protect(req, res, next) {
  // The frontend sends the token in the Authorization header:
  // Authorization: Bearer <token>
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Not authorized, no token" });
  }

  const token = authHeader.split(" ")[1]; // remove the word "Bearer"

  try {
    // Verify the signature and read the payload ({ id: userId })
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach the user's id to the request so controllers can use it
    req.userId = decoded.id;

    next(); // token is valid -> continue to the actual route handler
  } catch (error) {
    return res.status(401).json({ message: "Not authorized, token invalid" });
  }
}

module.exports = protect;
