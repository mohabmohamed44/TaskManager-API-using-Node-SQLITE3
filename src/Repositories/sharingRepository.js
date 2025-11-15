const database = require("../config/database");

class SharingRepository {
  async shareTask(taskId, ownerId, sharedWithId, permission) {
    const result = await database.run(
      "INSERT INTO task_sharing (taskId, ownerId, sharedWithId, permission) VALUES (?, ?, ?, ?)",
      [taskId, ownerId, sharedWithId, permission || "view"]
    );
    return result.lastID;
  }

  async unshareTask(taskId, sharedWithId) {
    const result = await database.run(
      "DELETE FROM task_sharing WHERE taskId = ? AND sharedWithId = ?",
      [taskId, sharedWithId]
    );
    return result.changes > 0;
  }

  async getSharedUsers(taskId) {
    return await database.all(
      `SELECT u.id, u.email, u.name, ts.permission
       FROM task_sharing ts
       JOIN users u ON ts.sharedWithId = u.id
       WHERE ts.taskId = ?`,
      [taskId]
    );
  }

  async hasAccess(taskId, userId) {
    const result = await database.get(
      `SELECT permission FROM task_sharing 
       WHERE taskId = ? AND sharedWithId = ?`,
      [taskId, userId]
    );
    return result || null;
  }

  async updatePermission(taskId, sharedWithId, permission) {
    const result = await database.run(
      "UPDATE task_sharing SET permission = ? WHERE taskId = ? AND sharedWithId = ?",
      [permission, taskId, sharedWithId]
    );
    return result.changes > 0;
  }
}

module.exports = new SharingRepository();