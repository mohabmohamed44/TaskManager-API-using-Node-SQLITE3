const database = require("../config/database");

class CommentRepository {
  async create(comment) {
    const { taskId, userId, text } = comment;
    const result = await database.run(
      "INSERT INTO comments (taskId, userId, text) VALUES (?, ?, ?)",
      [taskId, userId, text]
    );
    return this.getById(result.lastID);
  }

  async getById(id) {
    return await database.get(
      `SELECT c.*, u.name as userName, u.email as userEmail 
       FROM comments c 
       JOIN users u ON c.userId = u.id 
       WHERE c.id = ?`,
      [id]
    );
  }

  async getByTaskId(taskId) {
    return await database.all(
      `SELECT c.*, u.name as userName, u.email as userEmail 
       FROM comments c 
       JOIN users u ON c.userId = u.id 
       WHERE c.taskId = ? 
       ORDER BY c.createdAt DESC`,
      [taskId]
    );
  }

  async update(id, text) {
    await database.run(
      "UPDATE comments SET text = ? WHERE id = ?",
      [text, id]
    );
    return this.getById(id);
  }

  async delete(id) {
    const result = await database.run(
      "DELETE FROM comments WHERE id = ?",
      [id]
    );
    return result.changes > 0;
  }
}

module.exports = new CommentRepository();