const supabase = require("../config/database");

class UserRepository {
  async create(user) {
    const { email, password, name, role } = user;
    
    const { data, error } = await supabase
      .from("users")
      .insert([{ email, password, name, role: role || "user" }])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getById(id) {
    const { data, error } = await supabase
      .from("users")
      .select("id, email, name, role, created_at, updated_at")
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
    const { name, role } = user;
    
    const { data, error } = await supabase
      .from("users")
      .update({ name, role })
      .eq("id", id)
      .select("id, email, name, role, created_at, updated_at")
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