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
      const taskId = req.params.id;
      const attachmentId = req.params.attachmentId;

      // Validate both parameters are provided
      if (!taskId || !attachmentId) {
        return res.status(400).json({ 
          error: "Invalid request",
          message: "Both task ID and attachment ID are required" 
        });
      }

      const attachment = await attachmentService.getAttachment(
        attachmentId,
        req.user.id,
      );

      // Verify that the attachment belongs to the specified task
      if (attachment.task_id !== parseInt(taskId)) {
        return res.status(404).json({ 
          error: "Attachment not found",
          message: "Attachment does not belong to the specified task" 
        });
      }

      // If file_url exists, redirect to Supabase public URL
      if (attachment.file_url) {
        return res.redirect(attachment.file_url);
      }

      // Fallback: construct URL from storage path
      if (attachment.file_path) {
        const db = require("../config/database");
        const supabaseStorage = db.supabaseStorage || db;
        const { data: urlData } = supabaseStorage.storage
          .from("Images")
          .getPublicUrl(attachment.file_path);

        if (urlData && urlData.publicUrl) {
          return res.redirect(urlData.publicUrl);
        }
      }

      // If no URL available, return error
      return res.status(404).json({ 
        error: "File not found",
        message: "Attachment file URL could not be generated" 
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteAttachment(req, res, next) {
    try {
      const taskId = req.params.id;
      const attachmentId = req.params.attachmentId;

      // Validate both parameters are provided
      if (!taskId || !attachmentId) {
        return res.status(400).json({ 
          error: "Invalid request",
          message: "Both task ID and attachment ID are required" 
        });
      }

      // Get attachment first to verify it belongs to the task
      const attachment = await attachmentService.getAttachment(
        attachmentId,
        req.user.id,
      );

      // Verify that the attachment belongs to the specified task
      if (attachment.task_id !== parseInt(taskId)) {
        return res.status(404).json({ 
          error: "Attachment not found",
          message: "Attachment does not belong to the specified task" 
        });
      }

      const result = await attachmentService.deleteAttachment(
        attachmentId,
        req.user.id,
      );
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AttachmentController();
