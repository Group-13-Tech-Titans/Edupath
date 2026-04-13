const jwt = require("jsonwebtoken");
const User = require("../models/user");

module.exports = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.startsWith("Bearer ") ? authHeader.slice(7) : authHeader;

  if (!token) return res.status(401).json({ message: "No token" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");
    if (!user) return res.status(401).json({ message: "User not found" });
    if (
      decoded.authTokenVersion != null &&
      decoded.authTokenVersion !== (user.authTokenVersion || 0)
    ) {
      return res.status(401).json({ message: "Session expired" });
    }
    if (
      decoded.authTokenVersion == null &&
      user.logoutAfter &&
      (!decoded.iat || decoded.iat * 1000 < user.logoutAfter.getTime())
    ) {
      return res.status(401).json({ message: "Session expired" });
    }
    req.user = user;
    next();
  } catch {
    res.status(401).json({ message: "Invalid token" });
  }
};
