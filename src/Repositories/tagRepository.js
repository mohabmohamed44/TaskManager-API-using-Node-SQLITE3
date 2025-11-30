const supabase  = require("../config/database");

class TagRepository {
  constructor() {
    this.colorPalette = [
      "#EF4444", "#F59E0B", "#10B981", "#3B82F6", "#8B5CF6",
      "#EC4899", "#06B6D4", "#F97316", "#84CC16", "#6366F1",
      "#14B8A6", "#F43F5E", "#A855F7", "#22D3EE", "#FB923C"
    ];
    this.currentColorIndex = 0;
  }

  getNextColor() {
    const color = this.colorPalette[this.currentColorIndex];
    this.currentColorIndex =
      (this.currentColorIndex + 1) % this.colorPalette.length;
    return color;
  }

  // Create a new tag
  async create(tag) {
    const { name, color } = tag;
    const tagColor = color || this.getNextColor();

    const { data, error } = await supabase
      .from("tags")
      .upsert([{ name, color: tagColor }], { onConflict: "name" })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  async getById(id) {
    const { data, error } = await supabase
      .from("tags")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  async getByName(name) {
    const { data, error } = await supabase
      .from("tags")
      .select("*")
      .eq("name", name)
      .single();

    if (error) return null; // tag not found
    return data;
  }

  async getAll() {
    const { data, error } = await supabase
      .from("tags")
      .select("*")
      .order("name", { ascending: true });

    if (error) throw new Error(error.message);
    return data;
  }

  // Add tag to task
  async addTagToTask(taskId, tagId) {
    const { error } = await supabase
      .from("task_tags")
      .upsert([{ task_id: taskId, tag_id: tagId }], { onConflict: "task_id,tag_id" }); // avoid duplicates

    if (error) throw new Error(error.message);
  }

  // Remove tag from task
  async removeTagFromTask(taskId, tagId) {
    const { data, error } = await supabase
      .from("task_tags")
      .delete()
      .eq("task_id", taskId)
      .eq("tag_id", tagId);

    if (error) throw new Error(error.message);
    return data.length > 0;
  }

  // Get all tags for a specific task
  async getTaskTags(taskId) {
    const { data, error } = await supabase
      .from("task_tags")
      .select(`
        tags: tag_id (id, name, color)
      `)
      .eq("task_id", taskId);

    if (error) throw new Error(error.message);

    return data.map((t) => t.tags);
  }

  // Delete a tag
  async delete(id) {
    const { data, error } = await supabase
      .from("tags")
      .delete()
      .eq("id", id);

    if (error) throw new Error(error.message);
    return data.length > 0;
  }
}

module.exports = new TagRepository();
