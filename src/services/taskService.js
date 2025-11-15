const taskRepository = require("../Repositories/TaskRepository");

class TaskService {
  async getAllTasks(userId) {
    if (!userId) {
      throw { status: 400, message: "User ID is required" };
    }
    return await taskRepository.getAllByUser(userId);
  }

  async getTaskById(id, userId) {
    if (!userId) {
      throw { status: 400, message: "User ID is required" };
    }

    const task = await taskRepository.getByIdAndUser(id, userId);
    if (!task) {
      throw { status: 404, message: "Task not found" };
    }
    return task;
  }

  async createTask(taskData, userId) {
    if (!userId) {
      throw { status: 400, message: "User ID is required" };
    }

    // Business logic: validate title
    if (!taskData.title || taskData.title.trim() === "") {
      throw { status: 400, message: "Title is required" };
    }

    // Add userId to task data
    const taskWithUser = { ...taskData, userId };

    try {
      return await taskRepository.create(taskWithUser);
    } catch (error) {
      if (error.message.includes("UNIQUE constraint failed")) {
        throw { status: 409, message: "Task with this title already exists" };
      }
      throw error;
    }
  }

  async updateTask(id, taskData, userId) {
    if (!userId) {
      throw { status: 400, message: "User ID is required" };
    }

    // Business logic: validate title if provided
    if (
      taskData.title !== undefined &&
      (!taskData.title || taskData.title.trim() === "")
    ) {
      throw { status: 400, message: "Title is required" };
    }

    const updatedTask = await taskRepository.update(id, taskData);
    if (!updatedTask) {
      throw { status: 404, message: "Task not found" };
    }
    return updatedTask;
  }

  async deleteTask(id, userId) {
    if (!userId) {
      throw { status: 400, message: "User ID is required" };
    }

    const deleted = await taskRepository.delete(id);
    if (!deleted) {
      throw { status: 404, message: "Task not found" };
    }
    return { message: `Task with id ${id} moved to trash successfully` };
  }

  async getStatistics(userId) {
    if (!userId) {
      throw { status: 400, message: "User ID is required" };
    }
    // Get task statistics for a user
    const stats = await taskRepository.getStatistics(userId);
    return stats;
  }

  async searchTasks(query, userId) {
    if (!userId) {
      throw { status: 400, message: "User ID is required" };
    }
    // Search tasks based on query parameters
    return await taskRepository.search(query, userId);
  }

  async getSharedTasks(userId) {
    if (!userId) {
      throw { status: 400, message: "User ID is required" };
    }
    // Get tasks shared with the user
    return await taskRepository.getShared(userId);
  }

  async getTrash(userId) {
    if (!userId) {
      throw { status: 400, message: "User ID is required" };
    }
    // Get soft-deleted tasks
    return await taskRepository.getTrash(userId);
  }

  async restoreTask(id, userId) {
    if (!userId) {
      throw { status: 400, message: "User ID is required" };
    }
    // Restore a soft-deleted task
    const task = await taskRepository.restore(id, userId);
    if (!task) {
      throw { status: 404, message: "Task not found in trash" };
    }
    return task;
  }

  async permanentDelete(id, userId) {
    if (!userId) {
      throw { status: 400, message: "User ID is required" };
    }
    // Permanently delete a task
    const deleted = await taskRepository.permanentDelete(id, userId);
    if (!deleted) {
      throw { status: 404, message: "Task not found" };
    }
    return { message: `Task with id ${id} permanently deleted` };
  }

  async bulkUpdate(data, userId) {
    if (!userId) {
      throw { status: 400, message: "User ID is required" };
    }
    // Update multiple tasks at once
    const { taskIds, updates } = data;
    if (!taskIds || !Array.isArray(taskIds) || taskIds.length === 0) {
      throw { status: 400, message: "Task IDs array is required" };
    }
    if (!updates || typeof updates !== "object") {
      throw { status: 400, message: "Updates object is required" };
    }
    return await taskRepository.bulkUpdate(taskIds, updates, userId);
  }

  async bulkDelete(data, userId) {
    if (!userId) {
      throw { status: 400, message: "User ID is required" };
    }
    // Delete multiple tasks at once
    const { taskIds } = data;
    if (!taskIds || !Array.isArray(taskIds) || taskIds.length === 0) {
      throw { status: 400, message: "Task IDs array is required" };
    }
    return await taskRepository.bulkDelete(taskIds, userId);
  }
}

module.exports = new TaskService();
