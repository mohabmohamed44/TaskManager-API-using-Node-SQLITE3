const supabase = require("../config/database");

class TokenBlacklistRepository {
  async addToBlacklist(token, userId, expiresAt) {
    const { data, error } = await supabase
      .from("token_blacklist")
      .insert([{ token, user_id: userId, expires_at: expiresAt }])
      .select()
      .single();

    if (error) throw error;
    return data.id;
  }

  async isBlacklisted(token) {
    const { data, error } = await supabase
      .from("token_blacklist")
      .select("*")
      .eq("token", token)
      .gt("expires_at", new Date().toISOString())
      .single();

    if (error && error.code !== "PGRST116") throw error;
    return !!data;
  }

  async removeExpiredTokens() {
    const { data, error } = await supabase
      .from("token_blacklist")
      .delete()
      .lte("expires_at", new Date().toISOString())
      .select();

    if (error) throw error;
    return data ? data.length : 0;
  }

  async revokeAllUserTokens(userId) {
    const { error } = await supabase
      .from("token_blacklist")
      .update({ expires_at: new Date().toISOString() })
      .eq("user_id", userId);

    if (error) throw error;
    return true;
  }
}

module.exports = new TokenBlacklistRepository();