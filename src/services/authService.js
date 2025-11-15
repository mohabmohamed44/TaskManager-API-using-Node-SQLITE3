const bcrypt = require("bcryptjs");
const jwtConfig = require("../config/jwt");
const userRepository = require("../Repositories/userRepository");
const tokenBlacklistRepository = require("../Repositories/tokenBlackListRepository");

class AuthService {
  async register(userData) {
    const { email, password, name } = userData;

    const existingUser = await userRepository.getByEmail(email);
    if (existingUser) {
      throw { status: 409, message: "User already exists" };
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await userRepository.create({
      email,
      password: hashedPassword,
      name,
      role: "user",
    });

    const token = jwtConfig.generateToken({
      userId: user.id,
      email: user.email,
    });
    const refreshToken = jwtConfig.generateRefreshToken({ userId: user.id });

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      token,
      refreshToken,
    };
  }

  async login(credentials) {
    const { email, password } = credentials;

    const user = await userRepository.getByEmail(email);
    if (!user) {
      throw { status: 401, message: "Invalid credentials" };
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw { status: 401, message: "Invalid credentials" };
    }

    const token = jwtConfig.generateToken({
      userId: user.id,
      email: user.email,
    });
    const refreshToken = jwtConfig.generateRefreshToken({ userId: user.id });

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      token,
      refreshToken,
    };
  }

  async logout(token, userId) {
    try {
      if (!token) {
        throw { status: 400, message: "Token is required for logout" };
      }

      // Decode token to get expiration
      const decoded = jwtConfig.decodeToken(token);

      if (!decoded || !decoded.exp) {
        throw { status: 400, message: "Invalid token format" };
      }

      const expiresAt = new Date(decoded.exp * 1000).toISOString();

      // Add token to blacklist
      await tokenBlacklistRepository.addToBlacklist(token, userId, expiresAt);

      return { message: "Logged out successfully" };
    } catch (error) {
      console.error("Logout error:", error);
      if (error.status) {
        throw error;
      }
      throw { status: 500, message: "Logout failed: " + error.message };
    }
  }

  async logoutAll(userId) {
    try {
      // Revoke all tokens for this user
      await tokenBlacklistRepository.revokeAllUserTokens(userId);

      return { message: "All sessions logged out successfully" };
    } catch (error) {
      throw { status: 500, message: "Logout all failed" };
    }
  }

  async refreshToken(refreshToken) {
    try {
      // Check if refresh token is blacklisted
      const isBlacklisted =
        await tokenBlacklistRepository.isBlacklisted(refreshToken);
      if (isBlacklisted) {
        throw { status: 401, message: "Refresh token has been revoked" };
      }

      const decoded = jwtConfig.verifyToken(refreshToken);
      const user = await userRepository.getById(decoded.userId);

      if (!user) {
        throw { status: 401, message: "User not found" };
      }

      const newToken = jwtConfig.generateToken({
        userId: user.id,
        email: user.email,
      });

      return { token: newToken };
    } catch (error) {
      throw { status: 401, message: "Invalid refresh token" };
    }
  }

  async getProfile(userId) {
    const user = await userRepository.getById(userId);
    if (!user) {
      throw { status: 404, message: "User not found" };
    }
    return user;
  }

  async cleanupExpiredTokens() {
    // Remove expired tokens from blacklist
    const count = await tokenBlacklistRepository.removeExpiredTokens();
    return { message: `Cleaned up ${count} expired tokens` };
  }
}

module.exports = new AuthService();
