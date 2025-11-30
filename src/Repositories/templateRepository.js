const supabase = require("../config/database");

class TemplateRepository {
  async create(template) {
    const { userId, name, title, description, priority, category } = template;

    const { data, error } = await supabase
      .from("templates")
      .insert([
        {
          user_id: userId,
          name,
          title,
          description: description || "",
          priority: priority || "medium",
          category: category || "general",
        },
      ])
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  async getById(id) {
    const { data, error } = await supabase
      .from("templates")
      .select("*")
      .eq("id", id)
      .single();

    if (error) return null;
    return data;
  }

  async getByUserId(userId) {
    const { data, error } = await supabase
      .from("templates")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw new Error(error.message);
    return data;
  }

  async update(id, template) {
    const { name, title, description, priority, category } = template;

    const { data, error } = await supabase
      .from("templates")
      .update({
        name,
        title,
        description,
        priority,
        category,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  async delete(id) {
    const { data, error } = await supabase
      .from("templates")
      .delete()
      .eq("id", id);

    if (error) throw new Error(error.message);
    return data.length > 0;
  }
}

module.exports = new TemplateRepository();
