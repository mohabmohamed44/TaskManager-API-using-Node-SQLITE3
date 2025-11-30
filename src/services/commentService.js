const commentRepository = require("../Repositories/commentRepository");
const taskRepository = require("../Repositories/TaskRepository");
const sharingRepository = require("../Repositories/sharingRepository");

class CommentService {
  async createComment(taskId, userId, text) {
    // Verify user has access to the task (either as owner or shared user)
    const task = await taskRepository.getById(taskId);
    const hasAccess = task && (task.user_id === userId || await sharingRepository.hasAccess(taskId, userId));
    if (!task) {
      throw { status: 404, message: "Task not found" };
    }

    return await commentRepository.create({
      taskId,
      userId,
      text,
    });
  }

  async getComments(taskId, userId) {
    // Verify user has access to the task
    const task = await taskRepository.getById(taskId);
    const hasAccess = task && (task.user_id === userId || await sharingRepository.hasAccess(taskId, userId));
    if (!task) {
      throw { status: 404, message: "Task not found" };
    }

    return await commentRepository.getByTaskId(taskId);
  }

  async updateComment(id, userId, text) {
    const comment = await commentRepository.getById(id);
    if (!comment) {
      throw { status: 404, message: "Comment not found" };
    }

    // repository returns DB column names (snake_case) such as user_id
    if (comment.user_id !== userId) {
      throw { status: 403, message: "You can only edit your own comments" };
    }

    return await commentRepository.update(id, text);
  }

  async deleteComment(id, userId) {
    const comment = await commentRepository.getById(id);
    if (!comment) {
      throw { status: 404, message: "Comment not found" };
    }

    if (comment.user_id !== userId) {
      throw { status: 403, message: "You can only delete your own comments" };
    }

    await commentRepository.delete(id);
    return { message: "Comment deleted successfully" };
  }
}

module.exports = new CommentService();
