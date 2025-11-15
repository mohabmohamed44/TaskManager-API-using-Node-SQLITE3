const database = require("../config/database");

class SubtaskRepository {
  async create(subtask) {
    const { taskId, text, position } = subtask;
    const result = await database.run(
      "INSERT INTO subtasks (taskId, text, position) VALUES (?, ?, ?)",
      [taskId, text, position || 0]
    );
    return this.getById(result.lastID);
  }

  async getById(id) {
    return await database.get(
      "SELECT * FROM subtasks WHERE id = ?",
      [id]
    );
  }

  async getByTaskId(taskId) {
    return await database.all(
      "SELECT * FROM subtasks WHERE taskId = ? ORDER BY position ASC",
      [taskId]
    );
  }

  async update(id, subtask) {
    const { text, completed, position } = subtask;
    await database.run(
      "UPDATE subtasks SET text = ?, completed = ?, position = ? WHERE id = ?",
      [text, completed ? 1 : 0, position, id]
    );
    return this.getById(id);
  }

  async delete(id) {
    const result = await database.run(
      "DELETE FROM subtasks WHERE id = ?",
      [id]
    );
    return result.changes > 0;
  }

  async toggleComplete(id) {
    await database.run(
      "UPDATE subtasks SET completed = NOT completed WHERE id = ?",
      [id]
    );
    return this.getById(id);
  }
}

module.exports = new SubtaskRepository();