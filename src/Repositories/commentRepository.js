const db = require("../config/database");
const supabase = db.supabase || db; // support both: module.exports = supabase OR module.exports = { supabase, supabaseStorage }

class CommentRepository {
  async create(comment) {
    const { taskId, userId, text } = comment;
    const { data, error } = await supabase
      .from("comments")
      .insert([{ task_id: taskId, user_id: userId, text }])
      .select(`
        id,
        text,
        created_at,
        user:users (name, email)
      `)
      .single();

    if (error) throw error;
    return {
      ...data,
      userName: data.user?.name,
      userEmail: data.user?.email,
    };
  }

  async getById(id) {
    const { data, error } = await supabase
      .from("comments")
      .select(`
        *,
        user:users(name, email)
      `)
      .eq("id", id)
      .single();

    if (error && error.code !== "PGRST116") throw error;
    return data ? {
      ...data,
      userName: data.user.name,
      userEmail: data.user.email
    } : null;
  }

  async getByTaskId(taskId) {
    const { data, error } = await supabase
      .from("comments")
      .select(`
        *,
        user:users(name, email)
      `)
      .eq("task_id", taskId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data.map(comment => ({
      ...comment,
      userName: comment.user.name,
      userEmail: comment.user.email
    }));
  }

  async update(id, text) {
    const { data, error } = await supabase
      .from("comments")
      .update({ text })
      .eq("id", id)
      .select(`
        *,
        user:users(name, email)
      `)
      .single();

    if (error) throw error;
    return {
      ...data,
      userName: data.user.name,
      userEmail: data.user.email
    };
  }

  async delete(id) {
    const { error } = await supabase
      .from("comments")
      .delete()
      .eq("id", id);

    if (error) throw error;
    return true;
  }
}

module.exports = new CommentRepository();