const supabase = require("../config/database");

class TemplateRepository {
  async create(template) {
    try {
      const { userId, name, title, description, priority, category } = template;

      console.log("[REPO CREATE] Creating template:", {
        userId,
        name,
        title,
        priority: priority || "medium",
        category: category || "general"
      });

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

      if (error) {
        console.error("[REPO CREATE] Supabase error:", {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        throw new Error(`Database error: ${error.message}`);
      }

      console.log("[REPO CREATE] Success:", data.id);
      return data;
    } catch (error) {
      console.error("[REPO CREATE] Exception:", error);
      throw error;
    }
  }

  async getById(id) {
    try {
      const { data, error } = await supabase
        .from("templates")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // Not found
          return null;
        }
        console.error("[REPO GET BY ID] Supabase error:", error);
        throw new Error(`Database error: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error("[REPO GET BY ID] Exception:", error);
      throw error;
    }
  }

  async getByUserId(userId) {
    try {
      const { data, error } = await supabase
        .from("templates")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("[REPO GET BY USER ID] Supabase error:", error);
        throw new Error(`Database error: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error("[REPO GET BY USER ID] Exception:", error);
      throw error;
    }
  }

  async update(id, template) {
    try {
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

      if (error) {
        console.error("[REPO UPDATE] Supabase error:", error);
        throw new Error(`Database error: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error("[REPO UPDATE] Exception:", error);
      throw error;
    }
  }

  async delete(id) {
    try {
      const { error } = await supabase
        .from("templates")
        .delete()
        .eq("id", id);

      if (error) {
        console.error("[REPO DELETE] Supabase error:", error);
        throw new Error(`Database error: ${error.message}`);
      }

      return true;
    } catch (error) {
      console.error("[REPO DELETE] Exception:", error);
      throw error;
    }
  }
}

module.exports = new TemplateRepository();