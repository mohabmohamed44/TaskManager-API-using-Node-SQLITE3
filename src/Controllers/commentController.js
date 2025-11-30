const commentService = require("../services/commentService");

class CommentController {
  async createComment(req, res, next) {
    try {
      // Authentication check
      if (!req.user || req.user.id === undefined || req.user.id === null) {
        return res.status(401).json({ error: "Authentication required" });
      }

      // Validate task id (digits only)
      const taskId = req.params.id;
      if (!taskId || !/^\d+$/.test(String(taskId))) {
        return res.status(400).json({ error: "Invalid task id" });
      }

      // Validate user id (digits only)
      const userId = req.user.id;
      if (userId === undefined || userId === null || !/^\d+$/.test(String(userId))) {
        return res.status(401).json({ error: "Invalid authenticated user id" });
      }

      const { text } = req.body;
      if (!text || typeof text !== "string" || !text.trim()) {
        return res.status(400).json({ error: "Comment text is required" });
      }

      const comment = await commentService.createComment(
        taskId,
        userId,
        text.trim(),
      );
      res.status(201).json(comment);
    } catch (error) {
      next(error);
    }
  }

  async getComments(req, res, next) {
    try {
      if (!req.user || req.user.id === undefined || req.user.id === null) {
        return res.status(401).json({ error: "Authentication required" });
      }

      const taskId = req.params.id;
      if (!taskId || !/^\d+$/.test(String(taskId))) {
        return res.status(400).json({ error: "Invalid task id" });
      }

      const userId = req.user.id;
      if (userId === undefined || userId === null || !/^\d+$/.test(String(userId))) {
        return res.status(401).json({ error: "Invalid authenticated user id" });
      }

      const comments = await commentService.getComments(taskId, userId);
      res.json(comments);
    } catch (error) {
      next(error);
    }
  }

  async updateComment(req, res, next) {
    try {
      if (!req.user || req.user.id === undefined || req.user.id === null) {
        return res.status(401).json({ error: "Authentication required" });
      }
      const { text } = req.body;
      const commentId = req.params.commentId;
      if (!commentId || !/^\d+$/.test(String(commentId))) {
        return res.status(400).json({ error: "Invalid comment id" });
      }

      const userId = req.user.id;
      if (userId === undefined || userId === null || !/^\d+$/.test(String(userId))) {
        return res.status(401).json({ error: "Invalid authenticated user id" });
      }

      const comment = await commentService.updateComment(
        commentId,
        userId,
        text,
      );
      res.json(comment);
    } catch (error) {
      next(error);
    }
  }

  async deleteComment(req, res, next) {
    try {
      if (!req.user || req.user.id === undefined || req.user.id === null) {
        return res.status(401).json({ error: "Authentication required" });
      }
      const commentId = req.params.commentId;
      if (!commentId || !/^\d+$/.test(String(commentId))) {
        return res.status(400).json({ error: "Invalid comment id" });
      }

      const userId = req.user.id;
      if (userId === undefined || userId === null || !/^\d+$/.test(String(userId))) {
        return res.status(401).json({ error: "Invalid authenticated user id" });
      }

      const result = await commentService.deleteComment(
        commentId,
        userId,
      );
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new CommentController();
