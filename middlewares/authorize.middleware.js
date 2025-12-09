import User from "../models/user.model.js";

const authorizeRole = (requiredRole) => {
  return async (req, res, next) => {
    try {
      // console.log("reqreqreqreq",req.user)
      const userId = req.user;

      const user = await User.findById(userId);
      console.log("user.role",typeof user.role,typeof requiredRole)

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      if (Number(user.role) !== Number(requiredRole)) {
        return res.status(403).json({ error: "Access denied" });
      }

      next();
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  };
};

export default authorizeRole;
