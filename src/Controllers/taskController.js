const taskService = require("../services/taskService");

class TaskController {
  async getAllTasks(req, res, next) {
    try {
      const tasks = await taskService.getAllTasks(req.user.id, req.query);
      res.json(tasks);
    } catch (error) {
      next(error);
    }
  }

  async getTaskById(req, res, next) {
    try {
      const task = await taskService.getTaskById(req.params.id, req.user.id);
      res.json(task);
    } catch (error) {
      next(error);
    }
  }

  async createTask(req, res, next) {
    try {
      const task = await taskService.createTask(req.user.id, req.body);
      res.status(201).json(task);
    } catch (error) {
      next(error);
    }
  }

  async updateTask(req, res, next) {
    try {
      const task = await taskService.updateTask(
        req.params.id,
        req.user.id,
        req.body,
      );
      res.json(task);
    } catch (error) {
      next(error);
    }
  }

  async deleteTask(req, res, next) {
    try {
      const result = await taskService.deleteTask(req.params.id, req.user.id);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async getStatistics(req, res, next) {
    try {
      const stats = await taskService.getStatistics(req.user.id);
      res.json(stats);
    } catch (error) {
      next(error);
    }
  }

  async searchTasks(req, res, next) {
    try {
      const tasks = await taskService.searchTasks(req.user.id, req.query);
      res.json(tasks);
    } catch (error) {
      next(error);
    }
  }

  async getSharedTasks(req, res, next) {
    try {
      const tasks = await taskService.getSharedTasks(req.user.id);
      res.json(tasks);
    } catch (error) {
      next(error);
    }
  }

  async getTrash(req, res, next) {
    try {
      const tasks = await taskService.getTrash(req.user.id);
      res.json(tasks);
    } catch (error) {
      next(error);
    }
  }

  async restoreTask(req, res, next) {
    try {
      const task = await taskService.restoreTask(req.params.id, req.user.id);
      res.json(task);
    } catch (error) {
      next(error);
    }
  }

  async permanentDelete(req, res, next) {
    try {
      const result = await taskService.permanentDelete(
        req.params.id,
        req.user.id,
      );
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async bulkUpdate(req, res, next) {
    try {
      if (!req.user || !req.user.id) {
        return res.status(401).json({ error: "Authentication required" });
      }

      const { taskIds, updates } = req.body;

      if (!taskIds || !Array.isArray(taskIds) || taskIds.length === 0) {
        return res.status(400).json({ error: "taskIds must be a non-empty array" });
      }

      if (!updates || typeof updates !== "object" || Object.keys(updates).length === 0) {
        return res.status(400).json({ error: "updates object is required and cannot be empty" });
      }

      // Validate taskIds are all numbers
      const invalidIds = taskIds.filter(id => isNaN(parseInt(id)));
      if (invalidIds.length > 0) {
        return res.status(400).json({ error: "All taskIds must be valid numbers" });
      }

      const result = await taskService.bulkUpdate(req.user.id, taskIds, updates);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async bulkDelete(req, res, next) {
    try {
      if (!req.user || !req.user.id) {
        return res.status(401).json({ error: "Authentication required" });
      }

      const { taskIds } = req.body;

      if (!taskIds || !Array.isArray(taskIds) || taskIds.length === 0) {
        return res.status(400).json({ error: "taskIds must be a non-empty array" });
      }

      // Validate taskIds are all numbers
      const invalidIds = taskIds.filter(id => isNaN(parseInt(id)));
      if (invalidIds.length > 0) {
        return res.status(400).json({ error: "All taskIds must be valid numbers" });
      }

      const result = await taskService.bulkDelete(req.user.id, taskIds);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new TaskController();
