const commentRepository = require("../Repositories/commentRepository");
const taskRepository = require("../Repositories/TaskRepository");
const sharingRepository = require("../Repositories/sharingRepository");

class CommentService {
  async createComment(taskId, userId, text) {
    // Validate IDs using digit regex
    if (!/^\d+$/.test(String(taskId)) || !/^\d+$/.test(String(userId))) {
      throw { status: 400, message: "Invalid taskId or userId" };
    }

    // Verify user has access to the task (either as owner or shared user)
    const task = await taskRepository.getById(taskId);
    const hasAccess = task && (String(task.user_id) === String(userId) || (await sharingRepository.hasAccess(taskId, userId)));
    if (!task || !hasAccess) {
      throw { status: 404, message: "Task not found" };
    }

    return await commentRepository.create({
      taskId,
      userId,
      text,
    });
  }

  async getComments(taskId, userId) {
    if (!/^\d+$/.test(String(taskId)) || !/^\d+$/.test(String(userId))) {
      throw { status: 400, message: "Invalid taskId or userId" };
    }

    // Verify user has access to the task
    const task = await taskRepository.getById(taskId);
    const hasAccess = task && (String(task.user_id) === String(userId) || (await sharingRepository.hasAccess(taskId, userId)));
    if (!task || !hasAccess) {
      throw { status: 404, message: "Task not found" };
    }

    return await commentRepository.getByTaskId(taskId);
  }

  async updateComment(id, userId, text) {
    if (!/^\d+$/.test(String(id)) || !/^\d+$/.test(String(userId))) {
      throw { status: 400, message: "Invalid comment id or user id" };
    }

    const comment = await commentRepository.getById(id);
    if (!comment) {
      throw { status: 404, message: "Comment not found" };
    }

    if (String(comment.user_id) !== String(userId)) {
      throw { status: 403, message: "You can only edit your own comments" };
    }

    return await commentRepository.update(id, text);
  }

  async deleteComment(id, userId) {
    if (!/^\d+$/.test(String(id)) || !/^\d+$/.test(String(userId))) {
      throw { status: 400, message: "Invalid comment id or user id" };
    }

    const comment = await commentRepository.getById(id);
    if (!comment) {
      throw { status: 404, message: "Comment not found" };
    }

    if (String(comment.user_id) !== String(userId)) {
      throw { status: 403, message: "You can only delete your own comments" };
    }

    await commentRepository.delete(id);
    return { message: "Comment deleted successfully" };
  }
}

module.exports = new CommentService();
