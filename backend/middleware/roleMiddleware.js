/**
 * ROLE-BASED ACCESS CONTROL (RBAC) MIDDLEWARE
 * Restricts endpoint access to specific user roles.
 * Design Pattern: Factory Function / Closure
 */

const roleMiddleware = (roles) => {
  return (req, res, next) => {

    const rawRole = req.user.role || req.user.toObject?.().role || "";
    const userRole = String(rawRole).toLowerCase().trim();
    const allowedRoles = roles.map(r => String(r).toLowerCase().trim());

    // AUTHORIZATION CHECK:
    // 1. Check if primary role matches
    const isPrimaryRole = allowedRoles.includes(userRole);
    
    // 2. Check for dual-role mentor (Educator with isMentor = true)
    const isDualRoleMentor = allowedRoles.includes("mentor") && (req.user.isMentor === true || req.user.toObject?.().isMentor === true);

    if (!isPrimaryRole && !isDualRoleMentor) {
      return res.status(403).json({ 
        message: `Access denied. Your role: ${rawRole || "none"}. Required: ${roles.join(" or ")}` 
      });
    }
    next();
  };
};
  

module.exports = roleMiddleware;
