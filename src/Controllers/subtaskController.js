const TaskRepository = require("../Repositories/TaskRepository");
const subtaskRepository = require("../Repositories/subtaskRepository");
const supabase = require("../config/database");
const subtaskService = require("../services/subtaskService");

class SubtaskController {
  async createSubtask(taskId, userId, subtaskData) {
    if (!task) {
      throw { status: 404, message: "Task not found"};
    }

    // Validate text is Provided and not empty
    if(!subtaskData.text || subtaskData.text.trim() === "") {
      throw { status: 400, message: "Subtask text is required"};
    }

    const existingSubtask = await subtaskRepository.findByText(taskId, subtaskData.text);
    if(existingSubtask) {
      throw {
        status: 409,
        message: `A subtask with the text "${subtaskData.text}" already exists for this task`
      }
    }

    return await subtaskRepository.create({
      taskId,
      ...subtaskData,
    })
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
