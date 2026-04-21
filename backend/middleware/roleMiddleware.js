/**
 * ROLE-BASED ACCESS CONTROL (RBAC) MIDDLEWARE
 * Restricts endpoint access to specific user roles.
 * Design Pattern: Factory Function / Closure
 */

const roleMiddleware = (roles) => {
  return (req, res, next) => {

    // Extract the role from the req.user object attached by authMiddleware.
    const role = req.user.role || req.user.toObject?.().role;
    
    if (!roles.includes(role)) {
      return res.status(403).json({ message: "Access denied" });
    }
    next();
  };
};

module.exports = roleMiddleware;