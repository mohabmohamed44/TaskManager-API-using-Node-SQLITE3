const express = require("express");
const router = express.Router();
const commentController = require("../Controllers/commentController");
const { authenticate } = require("../Middleware/auth");
const { commentValidation } = require("../Middleware/validation");

// All routes require authentication
router.use(authenticate);

// Comment routes (nested under tasks)
router.get("/:id/comments", commentController.getComments);
router.post(
  "/:id/comments",
  commentValidation.create,
  commentController.createComment,
);
router.put("/:id/comments/:commentId", commentController.updateComment);
router.delete("/:id/comments/:commentId", commentController.deleteComment);

module.exports = router;
