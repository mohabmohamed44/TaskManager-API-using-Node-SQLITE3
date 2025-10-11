const taskRepository = require("../Repositories/TaskRepository");

class TaskService {
  async getAllTasks() {
    return await taskRepository.getAll();
  }

  async getTaskById(id) {
    const task = await taskRepository.getById(id);
    if (!task) {
      throw { status: 404, message: "Task not found" };
    }
    return task;
  }

  async createTask(taskData) {
    // Business logic: validate title
    if (!taskData.title || taskData.title.trim() === "") {
      throw { status: 400, message: "Title is required" };
    }

    try {
      return await taskRepository.create(taskData);
    } catch (error) {
      if (error.message.includes("UNIQUE constraint failed")) {
        throw { status: 409, message: "Task with this title already exists" };
      }
      throw error;
    }
  }

  async updateTask(id, taskData) {
    // Business logic: validate title
    if (!taskData.title || taskData.title.trim() === "") {
      throw { status: 400, message: "Title is required" };
    }

    const updatedTask = await taskRepository.update(id, taskData);
    if (!updatedTask) {
      throw { status: 404, message: "Task not found" };
    }
    return updatedTask;
  }

  async deleteTask(id) {
    const deleted = await taskRepository.delete(id);
    if (!deleted) {
      throw { status: 404, message: "Task not found" };
    }
    return { message: `Task with id ${id} deleted successfully` };
  }
}

module.exports = new TaskService();
