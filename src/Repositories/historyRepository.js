const database = require("../config/database");

class HistoryRepository {
  async create(history) {
    const { taskId, userId, action, field, oldValue, newValue } = history;
    const result = await database.run(
      "INSERT INTO task_history (taskId, userId, action, field, oldValue, newValue) VALUES (?, ?, ?, ?, ?, ?)",
      [taskId, userId, action, field || null, oldValue || null, newValue || null]
    );
    return result.lastID;
  }

  async getByTaskId(taskId) {
    return await database.all(
      `SELECT h.*, u.name as userName, u.email as userEmail
       FROM task_history h
       JOIN users u ON h.userId = u.id
       WHERE h.taskId = ?
       ORDER BY h.createdAt DESC`,
      [taskId]
    );
  }

  async logTaskCreation(taskId, userId) {
    return this.create({
      taskId,
      userId,
      action: "created",
    });
  }

  async logTaskUpdate(taskId, userId, field, oldValue, newValue) {
    return this.create({
      taskId,
      userId,
      action: "updated",
      field,
      oldValue: String(oldValue),
      newValue: String(newValue),
    });
  }

  async logTaskCompletion(taskId, userId, completed) {
    return this.create({
      taskId,
      userId,
      action: completed ? "completed" : "reopened",
    });
  }

  async logTaskDeletion(taskId, userId) {
    return this.create({
      taskId,
      userId,
      action: "deleted",
    });
  }
}

module.exports = new HistoryRepository();