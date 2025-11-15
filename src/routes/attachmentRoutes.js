const express = require("express");
const router = express.Router();
const attachmentController = require("../Controllers/attachmentController");
const { authenticate } = require("../Middleware/auth");
const upload = require("../Middleware/upload");

// All routes require authentication
router.use(authenticate);

// Attachment routes (nested under tasks)
router.get("/:id/attachments", attachmentController.getAttachments);
router.post(
  "/:id/attachments",
  upload.single("file"),
  attachmentController.addAttachment,
);
router.get(
  "/:id/attachments/:attachmentId/download",
  attachmentController.downloadAttachment,
);
router.delete(
  "/:id/attachments/:attachmentId",
  attachmentController.deleteAttachment,
);

module.exports = router;
