const supabase = require("../config/database");

class SubtaskRepository {
  async create(subtask) {
    const { taskId, text, position } = subtask;
    const { data, error } = await supabase
      .from("subtasks")
      .insert([{ task_id: taskId, text, position: position || 0 }])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getById(id) {
    const { data, error } = await supabase
      .from("subtasks")
      .select("*")
      .eq("id", id)
      .single();

    if (error && error.code !== "PGRST116") throw error;
    return data;
  }

  async getByTaskId(taskId) {
    const { data, error } = await supabase
      .from("subtasks")
      .select("*")
      .eq("task_id", taskId)
      .order("position", { ascending: true });

    if (error) throw error;
    return data;
  }

  async update(id, subtask) {
    const { text, completed, position } = subtask;
    const { data, error } = await supabase
      .from("subtasks")
      .update({ text, completed, position })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async delete(id) {
    const { error } = await supabase
      .from("subtasks")
      .delete()
      .eq("id", id);

    if (error) throw error;
    return true;
  }

  async toggleComplete(id) {
    // Get current state
    const { data: current } = await supabase
      .from("subtasks")
      .select("completed")
      .eq("id", id)
      .single();

    // Toggle it
    const { data, error } = await supabase
      .from("subtasks")
      .update({ completed: !current.completed })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async findByText(taskId, text) {
    const trimmedText = text.trim();
    const {data, error} = await supabase 
      .from("subtasks")
      .select("*")
      .eq("task_id", taskId)
      .ilike("text", trimmedText)
      .maybeSingle();

      if (error) throw error
      return data;
  }
}

module.exports = new SubtaskRepository();