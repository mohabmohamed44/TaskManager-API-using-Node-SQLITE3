const jwt = require("jsonwebtoken");

const JWT_SECRET =
  process.env.JWT_SECRET || "your-secret-key-change-in-production";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || "30d";

// Warn if using default secret in production
if (process.env.NODE_ENV === "production" && JWT_SECRET === "your-secret-key-change-in-production") {
  console.warn("⚠️  WARNING: Using default JWT_SECRET in production! This is a security risk!");
}

class JWTConfig {
  generateToken(payload) {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
  }

  generateRefreshToken(payload) {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_REFRESH_EXPIRES_IN });
  }

  verifyToken(token) {
    if (!token || typeof token !== "string" || token.trim().length === 0) {
      throw new Error("Token is required");
    }

    try {
      return jwt.verify(token.trim(), JWT_SECRET);
    } catch (error) {
      // Re-throw the original error to preserve error name and message
      if (error.name === "TokenExpiredError") {
        const expiredError = new Error("Token has expired");
        expiredError.name = "TokenExpiredError";
        throw expiredError;
      } else if (error.name === "JsonWebTokenError") {
        const invalidError = new Error(error.message || "Invalid token");
        invalidError.name = "JsonWebTokenError";
        throw invalidError;
      } else if (error.name === "NotBeforeError") {
        const notBeforeError = new Error("Token not active");
        notBeforeError.name = "NotBeforeError";
        throw notBeforeError;
      }
      throw error;
    }
  }

  decodeToken(token) {
    return jwt.decode(token);
  }
}

module.exports = new JWTConfig();
