const commentService = require("../services/commentService");

class CommentController {
  async createComment(req, res, next) {
    try {
      const { text } = req.body;
      const comment = await commentService.createComment(
        req.params.id,
        req.user.id,
        text,
      );
      res.status(201).json(comment);
    } catch (error) {
      next(error);
    }
  }

  async getComments(req, res, next) {
    try {
      const comments = await commentService.getComments(
        req.params.id,
        req.user.id,
      );
      res.json(comments);
    } catch (error) {
      next(error);
    }
  }

  async updateComment(req, res, next) {
    try {
      const { text } = req.body;
      const comment = await commentService.updateComment(
        req.params.commentId,
        req.user.id,
        text,
      );
      res.json(comment);
    } catch (error) {
      next(error);
    }
  }

  async deleteComment(req, res, next) {
    try {
      const result = await commentService.deleteComment(
        req.params.commentId,
        req.user.id,
      );
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new CommentController();
