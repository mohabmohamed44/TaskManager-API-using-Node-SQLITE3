const jwtConfig = require("../config/jwt");
const userRepository = require("../Repositories/userRepository");
const tokenBlacklistRepository = require("../Repositories/tokenBlackListRepository");

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({ 
        error: "Authentication token required",
        message: "Please provide an Authorization header with Bearer token"
      });
    }

    if (!authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ 
        error: "Invalid authorization format",
        message: "Authorization header must start with 'Bearer '"
      });
    }

    const token = authHeader.substring(7).trim();

    // Validate token is not empty
    if (!token || token.length === 0) {
      return res.status(401).json({ 
        error: "Invalid token provided",
        message: "Token cannot be empty"
      });
    }

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

    // Check for "logout from all devices"
    if (user.tokens_valid_from) {
      const tokenIssuedAt = new Date(decoded.iat * 1000);
      const tokensValidFrom = new Date(user.tokens_valid_from);
      if (tokenIssuedAt < tokensValidFrom) {
        return res
          .status(401)
          .json({ error: "Token has been revoked by a global logout." });
      }
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
    console.error("Error details:", error);

    // Handle specific JWT errors
    if (error.message === "Token has expired") {
      return res.status(401).json({ 
        error: "Token has expired",
        message: "Your session has expired. Please login again."
      });
    } else if (error.message === "Invalid token") {
      return res.status(401).json({ 
        error: "Invalid token provided",
        message: "The provided token is malformed or invalid. Please login again to get a new token."
      });
    } else if (error.message === "Token not active") {
      return res.status(401).json({ 
        error: "Token not active",
        message: "The token is not yet valid. Please check your system time."
      });
    } else if (error.message === "Token verification failed") {
      return res.status(401).json({ 
        error: "Token verification failed",
        message: "Unable to verify the token. Please login again."
      });
    }

    // Handle JWT library errors directly
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ 
        error: "Invalid token provided",
        message: error.message || "The token format is invalid. Please login again."
      });
    } else if (error.name === "TokenExpiredError") {
      return res.status(401).json({ 
        error: "Token has expired",
        message: "Your session has expired. Please login again."
      });
    }

    return res.status(401).json({ 
      error: "Authentication failed",
      message: error.message || "Please check your token and try again."
    });
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
