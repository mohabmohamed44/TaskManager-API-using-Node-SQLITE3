const subtaskRepository = require("../Repositories/subtaskRepository");
const taskRepository = require("../Repositories/TaskRepository");

class SubtaskService {
  async createSubtask(taskId, userId, subtaskData) {
    const task = await taskRepository.getByIdAndUser(taskId, userId);
    if (!task) {
      throw { status: 404, message: "Task not found" };
    }

    return await subtaskRepository.create({
      taskId,
      ...subtaskData,
    });
  }

  async getSubtasks(taskId, userId) {
    const task = await taskRepository.getByIdAndUser(taskId, userId);
    if (!task) {
      throw { status: 404, message: "Task not found" };
    }

    return await subtaskRepository.getByTaskId(taskId);
  }

  async updateSubtask(id, userId, subtaskData) {
    const subtask = await subtaskRepository.getById(id);
    if (!subtask) {
      throw { status: 404, message: "Subtask not found" };
    }

    const task = await taskRepository.getByIdAndUser(subtask.taskId, userId);
    if (!task) {
      throw { status: 403, message: "Access denied" };
    }

    return await subtaskRepository.update(id, subtaskData);
  }

  async deleteSubtask(id, userId) {
    const subtask = await subtaskRepository.getById(id);
    if (!subtask) {
      throw { status: 404, message: "Subtask not found" };
    }

    const task = await taskRepository.getByIdAndUser(subtask.taskId, userId);
    if (!task) {
      throw { status: 403, message: "Access denied" };
    }

    await subtaskRepository.delete(id);
    return { message: "Subtask deleted successfully" };
  }

  async toggleComplete(id, userId) {
    const subtask = await subtaskRepository.getById(id);
    if (!subtask) {
      throw { status: 404, message: "Subtask not found" };
    }

    const task = await taskRepository.getByIdAndUser(subtask.taskId, userId);
    if (!task) {
      throw { status: 403, message: "Access denied" };
    }

    return await subtaskRepository.toggleComplete(id);
  }
}

module.exports = new SubtaskService();
