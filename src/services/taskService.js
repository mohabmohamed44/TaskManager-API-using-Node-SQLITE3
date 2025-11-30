const taskRepository = require("../Repositories/TaskRepository");
const historyRepository = require("../Repositories/historyRepository");
const tagRepository = require("../Repositories/tagRepository");

class TaskService {
  async getAllTasks(userId, filters= {}) {
    const tasks = await taskRepository.getAll(userId, filters);
    
    if (filters.limit) {
      const total = await taskRepository.count(userId, filters);
      const totalPages = Math.ceil(total / filters.limit);
      
      return {
        tasks,
        pagination: {
          currentPage: parseInt(filters.page) || 1,
          totalPages,
          totalItems: total,
          itemsPerPage: parseInt(filters.limit),
        },
      };
    }
    
    return { tasks };
  }

  async getTaskById(id, userId) {
    const task = await taskRepository.getById(id, userId);
    if (!task) {
      throw { status: 404, message: "Task not found" };
    }

    const tags = await tagRepository.getTaskTags(id);
    return { ...task, tags };
  }

  async createTask(userId, taskData) {
    if (!taskData.title || taskData.title.trim() === "") {
      throw { status: 400, message: "Title is required" };
    }

    // Check if a task with the same title already exists for this user
    const existingTask = await taskRepository.findByTitle(userId, taskData.title.trim());
    if (existingTask) {
      throw { 
        status: 409, 
        message: `A task with the title "${taskData.title}" already exists` 
      };
    }

    const task = await taskRepository.create({
      userId,
      ...taskData,
    });

    await historyRepository.logTaskCreation(task.id, userId);

    if (taskData.tags && taskData.tags.length > 0) {
      for (const tagName of taskData.tags) {
        let tag = await tagRepository.getByName(tagName);
        if (!tag) {
          tag = await tagRepository.create({ name: tagName });
        }
        await tagRepository.addTagToTask(task.id, tag.id);
      }
    }

    return task;
  }

  async updateTask(id, userId, taskData) {
    const existingTask = await taskRepository.getById(id, userId);
    if (!existingTask) {
      throw { status: 404, message: "Task not found" };
    }

    if (taskData.title && taskData.title.trim() === "") {
      throw { status: 400, message: "Title cannot be empty" };
    }

    // Check for duplicate title if title is being changed
    if (taskData.title && taskData.title.trim() !== existingTask.title) {
      const duplicateTask = await taskRepository.findByTitle(userId, taskData.title.trim());
      if (duplicateTask && duplicateTask.id !== id) {
        throw { 
          status: 409, 
          message: `A task with the title "${taskData.title}" already exists` 
        };
      }
    }

    for (const [key, value] of Object.entries(taskData)) {
      if (existingTask[key] !== value && key !== "tags") {
        await historyRepository.logTaskUpdate(id, userId, key, existingTask[key], value);
      }
    }

    if (taskData.completed !== undefined && taskData.completed !== existingTask.completed) {
      await historyRepository.logTaskCompletion(id, userId, taskData.completed);
    }

    const updatedTask = await taskRepository.update(id, userId, {
      title: taskData.title !== undefined ? taskData.title : existingTask.title,
      description: taskData.description !== undefined ? taskData.description : existingTask.description,
      completed: taskData.completed !== undefined ? taskData.completed : existingTask.completed,
      priority: taskData.priority !== undefined ? taskData.priority : existingTask.priority,
      category: taskData.category !== undefined ? taskData.category : existingTask.category,
      dueDate: taskData.dueDate !== undefined ? taskData.dueDate : existingTask.due_date,
    });

    return updatedTask;
  }

  async deleteTask(id, userId) {
    const task = await taskRepository.getById(id, userId);
    if (!task) {
      throw { status: 404, message: "Task not found" };
    }

    await taskRepository.softDelete(id, userId);
    await historyRepository.logTaskDeletion(id, userId);

    return { message: `Task moved to trash` };
  }

  async restoreTask(id, userId) {
    const restored = await taskRepository.restore(id, userId);
    if (!restored) {
      throw { status: 404, message: "Task not found in trash" };
    }
    return { message: "Task restored successfully" };
  }

  async getTrash(userId) {
    return await taskRepository.getTrash(userId);
  }

  async permanentDelete(id, userId) {
    const deleted = await taskRepository.permanentDelete(id, userId);
    if (!deleted) {
      throw { status: 404, message: "Task not found" };
    }
    return { message: "Task permanently deleted" };
  }

  async bulkUpdate(userId, taskIds, updates) {
    // Validate inputs
    if (!taskIds || !Array.isArray(taskIds) || taskIds.length === 0) {
      throw { status: 400, message: "taskIds must be a non-empty array" };
    }

    if (!updates || typeof updates !== "object" || Object.keys(updates).length === 0) {
      throw { status: 400, message: "updates object is required and cannot be empty" };
    }

    // Validate allowed update fields
    const allowedFields = ["completed", "priority", "category"];
    const updateFields = Object.keys(updates);
    const invalidFields = updateFields.filter(field => !allowedFields.includes(field));
    
    if (invalidFields.length > 0) {
      throw { 
        status: 400, 
        message: `Invalid update fields: ${invalidFields.join(", ")}. Allowed fields: ${allowedFields.join(", ")}` 
      };
    }

    // Validate priority value if provided
    if (updates.priority && !["low", "medium", "high", "urgent"].includes(updates.priority)) {
      throw { 
        status: 400, 
        message: "Priority must be one of: low, medium, high, urgent" 
      };
    }

    // Validate completed is boolean if provided
    if (updates.completed !== undefined && typeof updates.completed !== "boolean") {
      throw { 
        status: 400, 
        message: "completed must be a boolean value" 
      };
    }

    // Check if all tasks belong to the user
    const tasks = await Promise.all(
      taskIds.map(id => taskRepository.getById(id, userId))
    );
    
    const notFoundTasks = tasks.filter((task, index) => !task);
    if (notFoundTasks.length > 0) {
      throw { 
        status: 404, 
        message: `${notFoundTasks.length} task(s) not found or you don't have access to them` 
      };
    }

    const count = await taskRepository.bulkUpdate(taskIds, userId, updates);
    return { message: `${count} task(s) updated successfully`, count };
  }

  async bulkDelete(userId, taskIds) {
    // Validate inputs
    if (!taskIds || !Array.isArray(taskIds) || taskIds.length === 0) {
      throw { status: 400, message: "taskIds must be a non-empty array" };
    }

    // Check if all tasks belong to the user
    const tasks = await Promise.all(
      taskIds.map(id => taskRepository.getById(id, userId))
    );
    
    const notFoundTasks = tasks.filter((task, index) => !task);
    if (notFoundTasks.length > 0) {
      throw { 
        status: 404, 
        message: `${notFoundTasks.length} task(s) not found or you don't have access to them` 
      };
    }

    const count = await taskRepository.bulkDelete(taskIds, userId);
    return { message: `${count} task(s) moved to trash successfully`, count };
  }

  async getStatistics(userId) {
    return await taskRepository.getStatistics(userId);
  }

  async getSharedTasks(userId) {
    return await taskRepository.getSharedTasks(userId);
  }

  async searchTasks(userId, query) {
    // Extract search term from query object (could be 'q', 'query', or 'search')
    const searchTerm = query.q || query.query || query.search || "";
    
    if (!searchTerm || searchTerm.trim() === "") {
      throw { status: 400, message: "Search query is required" };
    }
    
    return await taskRepository.getAll(userId, { search: searchTerm.trim() });
  }
}

module.exports = new TaskService();