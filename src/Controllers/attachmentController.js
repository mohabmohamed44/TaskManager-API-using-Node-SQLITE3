const attachmentService = require("../services/attachmentService");
const path = require("path");

class AttachmentController {
  async addAttachment(req, res, next) {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      const attachment = await attachmentService.addAttachment(
        req.params.id,
        req.user.id,
        req.file,
      );
      res.status(201).json(attachment);
    } catch (error) {
      next(error);
    }
  }

  async getAttachments(req, res, next) {
    try {
      const attachments = await attachmentService.getAttachments(
        req.params.id,
        req.user.id,
      );
      res.json(attachments);
    } catch (error) {
      next(error);
    }
  }

  async downloadAttachment(req, res, next) {
    try {
      const attachment = await attachmentService.getAttachment(
        req.params.attachmentId,
        req.user.id,
      );
      res.download(attachment.filePath, attachment.fileName);
    } catch (error) {
      next(error);
    }
  }

  async deleteAttachment(req, res, next) {
    try {
      const result = await attachmentService.deleteAttachment(
        req.params.attachmentId,
        req.user.id,
      );
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AttachmentController();
