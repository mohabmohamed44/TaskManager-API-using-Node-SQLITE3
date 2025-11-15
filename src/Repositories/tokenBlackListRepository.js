const database = require("../config/database");

class TokenBlacklistRepository {
  async addToBlacklist(token, userId, expiresAt) {
    const result = await database.run(
      "INSERT INTO token_blacklist (token, userId, expiresAt) VALUES (?, ?, ?)",
      [token, userId, expiresAt]
    );
    return result.lastID;
  }

  async isBlacklisted(token) {
    const result = await database.get(
      "SELECT * FROM token_blacklist WHERE token = ? AND expiresAt > datetime('now')",
      [token]
    );
    return !!result;
  }

  async removeExpiredTokens() {
    const result = await database.run(
      "DELETE FROM token_blacklist WHERE expiresAt <= datetime('now')"
    );
    return result.changes;
  }

  async revokeAllUserTokens(userId) {
    const result = await database.run(
      "UPDATE token_blacklist SET expiresAt = datetime('now') WHERE userId = ?",
      [userId]
    );
    return result.changes;
  }
}

module.exports = new TokenBlacklistRepository();