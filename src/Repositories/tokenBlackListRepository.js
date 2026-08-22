const supabase = require("../config/database");

class TokenBlacklistRepository {
  async addToBlacklist(token, userId, expiresAt) {
    try {
      const { data, error } = await supabase
        .from("token_blacklist")
        .insert([{ token, user_id: userId, expires_at: expiresAt }])
        .select()
        .single();

      if (error) {
        console.warn("token_blacklist addToBlacklist warning:", error.message);
        return null;
      }
      return data?.id;
    } catch (err) {
      console.warn("token_blacklist addToBlacklist exception:", err.message);
      return null;
    }
  }

  async isBlacklisted(token) {
    try {
      const { data, error } = await supabase
        .from("token_blacklist")
        .select("*")
        .eq("token", token)
        .gt("expires_at", new Date().toISOString())
        .single();

      if (error) {
        // PGRST116 = 0 rows returned (not blacklisted)
        if (error.code === "PGRST116") return false;
        console.warn("token_blacklist isBlacklisted warning:", error.message);
        return false;
      }
      return !!data;
    } catch (err) {
      console.warn("token_blacklist isBlacklisted exception:", err.message);
      return false;
    }
  }

  async removeExpiredTokens() {
    try {
      const { data, error } = await supabase
        .from("token_blacklist")
        .delete()
        .lte("expires_at", new Date().toISOString())
        .select();

      if (error) {
        console.warn("token_blacklist removeExpiredTokens warning:", error.message);
        return 0;
      }
      return data ? data.length : 0;
    } catch (err) {
      console.warn("token_blacklist removeExpiredTokens exception:", err.message);
      return 0;
    }
  }

  async revokeAllUserTokens(userId) {
    try {
      const { error } = await supabase
        .from("token_blacklist")
        .update({ expires_at: new Date().toISOString() })
        .eq("user_id", userId);

      if (error) {
        console.warn("token_blacklist revokeAllUserTokens warning:", error.message);
        return false;
      }
      return true;
    } catch (err) {
      console.warn("token_blacklist revokeAllUserTokens exception:", err.message);
      return false;
    }
  }
}

module.exports = new TokenBlacklistRepository();