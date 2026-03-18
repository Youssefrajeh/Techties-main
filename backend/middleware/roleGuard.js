const User = require("../models/User");

/**
 * Middleware to restrict access to users with a specific role.
 * Usage: router.get("/route", auth, roleGuard("pm"), handler)
 */
module.exports = function roleGuard(requiredRole) {
  return async function (req, res, next) {
    try {
      const user = await User.findById(req.user).select("role");
      if (!user) {
        return res.status(401).json({ msg: "User not found." });
      }
      if (user.role !== requiredRole) {
        return res
          .status(403)
          .json({ msg: `Access denied. Requires role: ${requiredRole}.` });
      }
      next();
    } catch (err) {
      console.error("Role guard error:", err);
      res.status(500).json({ msg: "Server error during authorization." });
    }
  };
};
