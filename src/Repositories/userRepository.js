const supabase = require("../config/database");

class UserRepository {
  async create(user) {
    const { email, password, name, role, profile_image_url, oauth_providers } = user;

    const insertData = { email, password, name, role: role || "user" };
    if (profile_image_url) insertData.profile_image_url = profile_image_url;
    if (oauth_providers) insertData.oauth_providers = oauth_providers;
    
    const { data, error } = await supabase
      .from("users")
      .insert([insertData])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getById(id) {
    const { data, error } = await supabase
      .from("users")
      .select("id, email, name, role, profile_image_url, created_at, updated_at")
      .eq("id", id)
      .single();

    if (error && error.code !== "PGRST116") throw error;
    return data;
  }

  async getByEmail(email) {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .single();

    if (error && error.code !== "PGRST116") throw error;
    return data;
  }

  async getAll(excludeUserId = null) {
    let query = supabase
      .from("users")
      .select("id, email, name, role, profile_image_url, created_at, updated_at");

    if (excludeUserId) {
      query = query.neq("id", excludeUserId);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data;
  }

  async update(id, user) {
    // Build dynamic update object — only include fields that are provided
    const updateData = {};
    if (user.name !== undefined) updateData.name = user.name;
    if (user.role !== undefined) updateData.role = user.role;
    if (user.profile_image_url !== undefined) updateData.profile_image_url = user.profile_image_url;

    const { data, error } = await supabase
      .from("users")
      .update(updateData)
      .eq("id", id)
      .select("id, email, name, role, profile_image_url, oauth_providers, created_at, updated_at")
      .single();

    if (error) throw error;
    return data;
  }

  async delete(id) {
    const { error } = await supabase
      .from("users")
      .delete()
      .eq("id", id);

    if (error) throw error;
    return true;
  }

  // Update Profile Image
  async uploadProfilePicture(userId, imageUrl) {
    const { error } = await supabase
      .from("users")
      .update({profile_image_url: imageUrl})
      .eq("id", userId);
    
    if (error) throw error;
  }

  async addOAuthProvider(id, provider) {
    const user = await this.getById(id);
    if (!user) return;

    let providers = [];
    if (typeof user.oauth_providers === "string") {
      try {
        providers = JSON.parse(user.oauth_providers);
      } catch (e) {
        providers = [];
      }
    } else if (Array.isArray(user.oauth_providers)) {
      providers = user.oauth_providers;
    }

    if (!providers.includes(provider)) {
      providers.push(provider);
      
      const { error } = await supabase
        .from("users")
        .update({ oauth_providers: JSON.stringify(providers) })
        .eq("id", id);

      if (error) throw error;
    }
  }

  async getOAuthProviders(id) {
    const { data, error } = await supabase
      .from("users")
      .select("oauth_providers")
      .eq("id", id)
      .single();

    if (error && error.code !== "PGRST116") throw error;
    
    if (!data || !data.oauth_providers) return [];

    if (typeof data.oauth_providers === "string") {
      try {
        return JSON.parse(data.oauth_providers);
      } catch (e) {
        return [];
      }
    }
    
    if (Array.isArray(data.oauth_providers)) {
      return data.oauth_providers;
    }
    
    return [];
  }
}

module.exports = new UserRepository();