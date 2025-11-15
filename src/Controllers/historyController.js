const historyRepository = require("../Repositories/historyRepository");
const taskRepository = require("../Repositories/TaskRepository");

class HistoryController {
  async getTaskHistory(req, res, next) {
    try {
      const task = await taskRepository.getByIdAndUser(
        req.params.id,
        req.user.id,
      );
      if (!task) {
        return res.status(404).json({ error: "Task not found" });
      }

      const history = await historyRepository.getByTaskId(req.params.id);
      res.json(history);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new HistoryController();
