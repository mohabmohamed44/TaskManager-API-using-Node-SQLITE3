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
    // Add debugging and validation for undefined taskData
    console.log("createTask called with:", { taskData });

    // Validate that taskData exists
    if (!taskData) {
      throw { status: 400, message: "Request body is required" };
    }

    // Validate title
    if (!taskData.title) {
      throw { status: 400, message: "Title is required" };
    }

    if (typeof taskData.title !== "string") {
      throw { status: 400, message: "Title must be a string" };
    }

    if (taskData.title.trim() === "") {
      throw { status: 400, message: "Title cannot be empty" };
    }

    if (taskData.title.trim().length < 3) {
      throw {
        status: 400,
        message: "Title must be at least 3 characters long",
      };
    }

    if (taskData.title.trim().length > 255) {
      throw {
        status: 400,
        message: "Title cannot be longer than 255 characters",
      };
    }

    // Validate description (optional but must be valid if provided)
    if (taskData.description !== undefined && taskData.description !== null) {
      if (typeof taskData.description !== "string") {
        throw { status: 400, message: "Description must be a string" };
      }

      if (taskData.description.length > 1000) {
        throw {
          status: 400,
          message: "Description cannot be longer than 1000 characters",
        };
      }
    }

    // Validate completed (optional but must be valid if provided)
    if (taskData.completed !== undefined && taskData.completed !== null) {
      if (
        typeof taskData.completed !== "boolean" &&
        taskData.completed !== 0 &&
        taskData.completed !== 1
      ) {
        throw { status: 400, message: "Completed must be a boolean or 0/1" };
      }
    }

    // Check if task with the same title already exists
    try {
      const existingTasks = await taskRepository.getAll();
      const duplicateTask = existingTasks.find(
        (task) =>
          task.title.toLowerCase().trim() ===
          taskData.title.toLowerCase().trim(),
      );

      if (duplicateTask) {
        throw { status: 409, message: "A task with this title already exists" };
      }

      // Clean the data before creating
      const cleanTaskData = {
        title: taskData.title.trim(),
        description: taskData.description ? taskData.description.trim() : "",
        completed: taskData.completed || false,
      };

      return await taskRepository.create(cleanTaskData);
    } catch (error) {
      // If it's already a custom error with status, re-throw it
      if (error.status) {
        throw error;
      }

      // Handle database constraint errors
      if (error.message && error.message.includes("UNIQUE constraint failed")) {
        throw { status: 409, message: "A task with this title already exists" };
      }

      // Handle other database errors
      console.error("Database error in createTask:", error);
      throw {
        status: 500,
        message: "Failed to create task due to database error",
      };
    }
  }

  async updateTask(id, taskData) {
    // Add debugging and validation for undefined taskData
    console.log("updateTask called with:", { id, taskData });

    // Validate ID
    if (!id) {
      throw { status: 400, message: "Task ID is required" };
    }

    if (isNaN(parseInt(id)) || parseInt(id) <= 0) {
      throw { status: 400, message: "Task ID must be a positive number" };
    }

    // Validate that taskData exists
    if (!taskData) {
      throw { status: 400, message: "Request body is required" };
    }

    // Validate title
    if (!taskData.title) {
      throw { status: 400, message: "Title is required" };
    }

    if (typeof taskData.title !== "string") {
      throw { status: 400, message: "Title must be a string" };
    }

    if (taskData.title.trim() === "") {
      throw { status: 400, message: "Title cannot be empty" };
    }

    if (taskData.title.trim().length < 3) {
      throw {
        status: 400,
        message: "Title must be at least 3 characters long",
      };
    }

    if (taskData.title.trim().length > 255) {
      throw {
        status: 400,
        message: "Title cannot be longer than 255 characters",
      };
    }

    // Validate description (optional but must be valid if provided)
    if (taskData.description !== undefined && taskData.description !== null) {
      if (typeof taskData.description !== "string") {
        throw { status: 400, message: "Description must be a string" };
      }

      if (taskData.description.length > 1000) {
        throw {
          status: 400,
          message: "Description cannot be longer than 1000 characters",
        };
      }
    }

    // Validate completed (optional but must be valid if provided)
    if (taskData.completed !== undefined && taskData.completed !== null) {
      if (
        typeof taskData.completed !== "boolean" &&
        taskData.completed !== 0 &&
        taskData.completed !== 1
      ) {
        throw { status: 400, message: "Completed must be a boolean or 0/1" };
      }
    }

    try {
      // Check if task exists first
      const existingTask = await taskRepository.getById(id);
      if (!existingTask) {
        throw { status: 404, message: "Task not found" };
      }

      // Check if another task with the same title already exists (excluding current task)
      const allTasks = await taskRepository.getAll();
      const duplicateTask = allTasks.find(
        (task) =>
          task.id != id &&
          task.title.toLowerCase().trim() ===
            taskData.title.toLowerCase().trim(),
      );

      if (duplicateTask) {
        throw { status: 409, message: "A task with this title already exists" };
      }

      // Clean the data before updating
      const cleanTaskData = {
        title: taskData.title.trim(),
        description: taskData.description
          ? taskData.description.trim()
          : existingTask.description,
        completed:
          taskData.completed !== undefined
            ? taskData.completed
            : existingTask.completed,
      };

      const updatedTask = await taskRepository.update(id, cleanTaskData);
      if (!updatedTask) {
        throw { status: 404, message: "Task not found" };
      }
      return updatedTask;
    } catch (error) {
      // If it's already a custom error with status, re-throw it
      if (error.status) {
        throw error;
      }

      // Handle database constraint errors
      if (error.message && error.message.includes("UNIQUE constraint failed")) {
        throw { status: 409, message: "A task with this title already exists" };
      }

      // Handle other database errors
      console.error("Database error in updateTask:", error);
      throw {
        status: 500,
        message: "Failed to update task due to database error",
      };
    }
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
