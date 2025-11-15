const database = require("../config/database");

class TemplateRepository {
  async create(template) {
    const { userId, name, title, description, priority, category } = template;
    const result = await database.run(
      "INSERT INTO templates (userId, name, title, description, priority, category) VALUES (?, ?, ?, ?, ?, ?)",
      [userId, name, title, description || "", priority || "medium", category || "general"]
    );
    return this.getById(result.lastID);
  }

  async getById(id) {
    return await database.get("SELECT * FROM templates WHERE id = ?", [id]);
  }

  async getByUserId(userId) {
    return await database.all(
      "SELECT * FROM templates WHERE userId = ? ORDER BY createdAt DESC",
      [userId]
    );
  }

  async update(id, template) {
    const { name, title, description, priority, category } = template;
    await database.run(
      "UPDATE templates SET name = ?, title = ?, description = ?, priority = ?, category = ? WHERE id = ?",
      [name, title, description, priority, category, id]
    );
    return this.getById(id);
  }

  async delete(id) {
    const result = await database.run("DELETE FROM templates WHERE id = ?", [id]);
    return result.changes > 0;
  }
}

module.exports = new TemplateRepository();