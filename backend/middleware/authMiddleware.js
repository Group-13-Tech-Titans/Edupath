/**
 * AUTHENTICATION MIDDLEWARE
 * Intercepts incoming requests to protected routes, verifies the JWT session,
 * and retrieves the authenticated user's data from the database.
 * Design Pattern: Interceptor / Middleware Pattern
 */

const jwt = require("jsonwebtoken");
const User = require("../modules/auth/models/User");

const authMiddleware = async (req, res, next) => {
  // Extract the token from the "Authorization" header
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;

  // 401 Unauthorized: The client must authenticate itself to get the requested response.
  if (!token) return res.status(401).json({ message: "No token" });

  try {
    // Cryptographically verify the token using the secret key
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Fetch fresh user data from the database (.select("-password") to ensure the hash never enters the req object)
    const user = await User.findById(decoded.id).select("-password");

    // The token is valid, but the user was deleted from the database
    if (!user) return res.status(401).json({ message: "User not found" });

    req.user = user; // Attach the user document to the request object so downstream controllers can use it

    // Pass control to the next middleware or controller
    next();
  } catch {
    res.status(401).json({ message: "Invalid token" });
  }
};

module.exports = authMiddleware;