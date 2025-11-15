const database = require("../config/database");

class AttachmentRepository {
  async create(attachment) {
    const { taskId, fileName, filePath, fileSize, mimeType } = attachment;
    const result = await database.run(
      "INSERT INTO attachments (taskId, fileName, filePath, fileSize, mimeType) VALUES (?, ?, ?, ?, ?)",
      [taskId, fileName, filePath, fileSize, mimeType]
    );
    return this.getById(result.lastID);
  }

  async getById(id) {
    return await database.get("SELECT * FROM attachments WHERE id = ?", [id]);
  }

  async getByTaskId(taskId) {
    return await database.all(
      "SELECT * FROM attachments WHERE taskId = ? ORDER BY createdAt DESC",
      [taskId]
    );
  }

  async delete(id) {
    const result = await database.run(
      "DELETE FROM attachments WHERE id = ?",
      [id]
    );
    return result.changes > 0;
  }
}

module.exports = new AttachmentRepository();