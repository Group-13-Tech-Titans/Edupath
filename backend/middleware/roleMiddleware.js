module.exports = (roles) => {
  return (req, res, next) => {
    const role = req.user.role || req.user.toObject?.().role;
    if (!roles.includes(role)) {
      return res.status(403).json({ message: "Access denied" });
    }
    next();
  };
};
  