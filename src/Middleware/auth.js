const jwtConfig = require("../config/jwt");
const userRepository = require("../Repositories/userRepository");
const tokenBlacklistRepository = require("../Repositories/tokenBlackListRepository");

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Authentication token required" });
    }

    const token = authHeader.substring(7);

    // First verify the token is valid
    const decoded = jwtConfig.verifyToken(token);

    // Then check if token is blacklisted (logged out)
    const isBlacklisted = await tokenBlacklistRepository.isBlacklisted(token);
    if (isBlacklisted) {
      return res
        .status(401)
        .json({ error: "Token has been revoked. Please login again." });
    }

    const user = await userRepository.getById(decoded.userId);

    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }

    req.user = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    };

    req.token = token; // Store token for logout

    next();
  } catch (error) {
    console.error("Authentication error:", error.message);

    if (error.message === "Token has expired") {
      return res
        .status(401)
        .json({ error: "Token has expired. Please login again." });
    } else if (error.message === "Invalid token") {
      return res.status(401).json({ error: "Invalid token provided" });
    } else if (error.message === "Token verification failed") {
      return res.status(401).json({ error: "Token verification failed" });
    }

    return res
      .status(401)
      .json({ error: "Authentication failed. Please check your token." });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: "Authentication required" });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: "Insufficient permissions" });
    }

    next();
  };
};

module.exports = { authenticate, authorize };
