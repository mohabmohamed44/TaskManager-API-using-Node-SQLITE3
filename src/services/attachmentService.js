const attachmentRepository = require("../Repositories/attachmentRepository");
const taskRepository = require("../Repositories/TaskRepository");
const fs = require("fs");

class AttachmentService {
  async addAttachment(taskId, userId, file) {
    const task = await taskRepository.getByIdAndUser(taskId, userId);
    if (!task) {
      throw { status: 404, message: "Task not found" };
    }

    return await attachmentRepository.create({
      taskId,
      fileName: file.originalname,
      filePath: file.path,
      fileSize: file.size,
      mimeType: file.mimetype,
    });
  }

  async getAttachments(taskId, userId) {
    const task = await taskRepository.getByIdAndUser(taskId, userId);
    if (!task) {
      throw { status: 404, message: "Task not found" };
    }

    return await attachmentRepository.getByTaskId(taskId);
  }

  async deleteAttachment(id, userId) {
    const attachment = await attachmentRepository.getById(id);
    if (!attachment) {
      throw { status: 404, message: "Attachment not found" };
    }

    const task = await taskRepository.getByIdAndUser(taskId, userId);
    if (!task) {
      throw { status: 403, message: "Access denied" };
    }

    if (fs.existsSync(attachment.filePath)) {
      fs.unlinkSync(attachment.filePath);
    }

    await attachmentRepository.delete(id);
    return { message: "Attachment deleted successfully" };
  }

  async getAttachment(id, userId) {
    const attachment = await attachmentRepository.getById(id);
    if (!attachment) {
      throw { status: 404, message: "Attachment not found" };
    }

    const task = await taskRepository.getById(attachment.taskId, userId);
    if (!task) {
      throw { status: 403, message: "Access denied" };
    }

    return attachment;
  }
}

module.exports = new AttachmentService();
