const subtaskService = require("../services/subtaskService");

class SubtaskController {
  async createSubtask(req, res, next) {
    try {
      const subtask = await subtaskService.createSubtask(
        req.params.id,
        req.user.id,
        req.body,
      );
      res.status(201).json(subtask);
    } catch (error) {
      next(error);
    }
  }

  async getSubtasks(req, res, next) {
    try {
      const subtasks = await subtaskService.getSubtasks(
        req.params.id,
        req.user.id,
      );
      res.json(subtasks);
    } catch (error) {
      next(error);
    }
  }

  async updateSubtask(req, res, next) {
    try {
      const subtask = await subtaskService.updateSubtask(
        req.params.subtaskId,
        req.user.id,
        req.body,
      );
      res.json(subtask);
    } catch (error) {
      next(error);
    }
  }

  async deleteSubtask(req, res, next) {
    try {
      const result = await subtaskService.deleteSubtask(
        req.params.subtaskId,
        req.user.id,
      );
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async toggleComplete(req, res, next) {
    try {
      const subtask = await subtaskService.toggleComplete(
        req.params.subtaskId,
        req.user.id,
      );
      res.json(subtask);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new SubtaskController();
