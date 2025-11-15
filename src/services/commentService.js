const commentRepository = require("../Repositories/commentRepository");
const taskRepository = require("../Repositories/TaskRepository");

class CommentService {
  async createComment(taskId, userId, text) {
    const task = await taskRepository.getByIdAndUser(taskId, userId);
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
    const task = await taskRepository.getByIdAndUser(taskId, userId);
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

    if (comment.userId !== userId) {
      throw { status: 403, message: "You can only edit your own comments" };
    }

    return await commentRepository.update(id, text);
  }

  async deleteComment(id, userId) {
    const comment = await commentRepository.getById(id);
    if (!comment) {
      throw { status: 404, message: "Comment not found" };
    }

    if (comment.userId !== userId) {
      throw { status: 403, message: "You can only delete your own comments" };
    }

    await commentRepository.delete(id);
    return { message: "Comment deleted successfully" };
  }
}

module.exports = new CommentService();
