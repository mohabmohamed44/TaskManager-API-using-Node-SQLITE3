const database = require("../config/database");

class TagRepository {
  constructor() {
    // Color palette for tags
    this.colorPalette = [
      "#EF4444", // Red
      "#F59E0B", // Amber
      "#10B981", // Green
      "#3B82F6", // Blue
      "#8B5CF6", // Violet
      "#EC4899", // Pink
      "#06B6D4", // Cyan
      "#F97316", // Orange
      "#84CC16", // Lime
      "#6366F1", // Indigo
      "#14B8A6", // Teal
      "#F43F5E", // Rose
      "#A855F7", // Purple
      "#22D3EE", // Sky
      "#FB923C", // Orange-400
    ];
    this.currentColorIndex = 0;
  }

  getNextColor() {
    const color = this.colorPalette[this.currentColorIndex];
    this.currentColorIndex =
      (this.currentColorIndex + 1) % this.colorPalette.length;
    return color;
  }

  async create(tag) {
    const { name, color } = tag;
    // Assign a unique color from the palette if not provided
    const tagColor = color || this.getNextColor();
    const result = await database.run(
      "INSERT INTO tags (name, color) VALUES (?, ?)",
      [name, tagColor],
    );
    return this.getById(result.lastID);
  }

  async getById(id) {
    return await database.get("SELECT * FROM tags WHERE id = ?", [id]);
  }

  async getByName(name) {
    return await database.get("SELECT * FROM tags WHERE name = ?", [name]);
  }

  async getAll() {
    return await database.all("SELECT * FROM tags ORDER BY name ASC");
  }

  async addTagToTask(taskId, tagId) {
    await database.run(
      "INSERT OR IGNORE INTO task_tags (taskId, tagId) VALUES (?, ?)",
      [taskId, tagId],
    );
  }

  async removeTagFromTask(taskId, tagId) {
    const result = await database.run(
      "DELETE FROM task_tags WHERE taskId = ? AND tagId = ?",
      [taskId, tagId],
    );
    return result.changes > 0;
  }

  async getTaskTags(taskId) {
    return await database.all(
      `SELECT t.* FROM tags t
       JOIN task_tags tt ON t.id = tt.tagId
       WHERE tt.taskId = ?`,
      [taskId],
    );
  }

  async delete(id) {
    const result = await database.run("DELETE FROM tags WHERE id = ?", [id]);
    return result.changes > 0;
  }
}

module.exports = new TagRepository();
