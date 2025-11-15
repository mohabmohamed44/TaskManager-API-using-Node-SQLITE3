const taskService = require("../services/taskService");

class TaskController {
  async getAllTasks(req, res, next) {
    try {
      const tasks = await taskService.getAllTasks(req.user.id);
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
      const task = await taskService.createTask(req.body, req.user.id);
      res.status(201).json(task);
    } catch (error) {
      next(error);
    }
  }

  async updateTask(req, res, next) {
    try {
      const task = await taskService.updateTask(
        req.params.id,
        req.body,
        req.user.id,
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
      const tasks = await taskService.searchTasks(req.query, req.user.id);
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
      const result = await taskService.bulkUpdate(req.body, req.user.id);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async bulkDelete(req, res, next) {
    try {
      const result = await taskService.bulkDelete(req.body, req.user.id);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new TaskController();
