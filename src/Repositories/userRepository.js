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

  async getAll() {
    const { data, error } = await supabase
      .from("users")
      .select("id, email, name, role, created_at");

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
}

module.exports = new UserRepository();