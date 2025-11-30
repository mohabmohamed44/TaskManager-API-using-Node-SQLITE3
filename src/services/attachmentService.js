const attachmentRepository = require("../Repositories/attachmentRepository");
const taskRepository = require("../Repositories/TaskRepository");
const db = require("../config/database");
const supabase = db.supabase || db;
const supabaseStorage = db.supabaseStorage || db;
const path = require("path");

class AttachmentService {
  async addAttachment(taskId, userId, file) {
    try {
      const task = await taskRepository.getByIdAndUser(taskId, userId);
      if (!task) {
        throw { status: 404, message: "Task not found" };
      }

      // Validate file
      if (!file || !file.buffer) {
        throw { status: 400, message: "Invalid file data" };
      }

      // Generate unique filename
      const fileExt = path.extname(file.originalname);
      const fileName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${fileExt}`;
      const filePath = `tasks/${taskId}/${fileName}`;

      // Upload file to Supabase Storage (using service role key to bypass RLS)
      const { data: uploadData, error: uploadError } = await supabaseStorage.storage
        .from("Images")
        .upload(filePath, file.buffer, {
          contentType: file.mimetype,
          upsert: false,
        });

      if (uploadError) {
        console.error("Supabase upload error:", uploadError);
        
        // Handle specific Supabase errors
        if (uploadError.message?.includes("Bucket not found") || uploadError.message?.includes("The resource was not found")) {
          throw { 
            status: 500, 
            message: "Storage bucket 'Images' not found. Please create it in Supabase Dashboard." 
          };
        }
        
        // Handle RLS policy errors
        if (uploadError.message?.includes("row-level security policy") || uploadError.statusCode === '403') {
          throw { 
            status: 500, 
            message: "Storage access denied. Please check RLS policies or use SUPABASE_SERVICE_ROLE_KEY in your .env file." 
          };
        }
        
        throw { 
          status: 500, 
          message: `Failed to upload file: ${uploadError.message || "Unknown error"}` 
        };
      }

      // Get public URL for the uploaded file
      const { data: urlData } = supabaseStorage.storage
        .from("Images")
        .getPublicUrl(filePath);

      const publicUrl = urlData?.publicUrl || null;

      // Save attachment metadata to database
      try {
        return await attachmentRepository.create({
          taskId,
          fileName: file.originalname,
          filePath: filePath, // Store the storage path
          fileUrl: publicUrl, // Store the public URL (may be null if column doesn't exist)
          fileSize: file.size,
          mimeType: file.mimetype,
        });
      } catch (dbError) {
        // If database insert fails, try to delete the uploaded file
        console.error("Database error, attempting to clean up uploaded file:", dbError);
        await supabaseStorage.storage.from("Images").remove([filePath]);
        
        // Check if error is due to missing column
        if (dbError.message?.includes("column") && dbError.message?.includes("file_url")) {
          throw { 
            status: 500, 
            message: "Database schema error: 'file_url' column not found. Please add it to the attachments table." 
          };
        }
        
        throw { 
          status: 500, 
          message: `Failed to save attachment: ${dbError.message || "Unknown error"}` 
        };
      }
    } catch (error) {
      // Re-throw if it's already formatted
      if (error.status && error.message) {
        throw error;
      }
      // Format unexpected errors
      throw { 
        status: 500, 
        message: error.message || "Failed to add attachment" 
      };
    }
  }

  async getAttachments(taskId, userId) {
    const task = await taskRepository.getByIdAndUser(taskId, userId);
    if (!task) {
      throw { status: 404, message: "Task not found" };
    }

    const attachments = await attachmentRepository.getByTaskId(taskId);
    
    // Ensure all attachments have file_url (for backward compatibility)
    return attachments.map(attachment => {
      if (!attachment.file_url && attachment.file_path) {
        const { data: urlData } = supabaseStorage.storage
          .from("Images")
          .getPublicUrl(attachment.file_path);
        
        attachment.file_url = urlData.publicUrl;
      }
      return attachment;
    });
  }

  async deleteAttachment(id, userId) {
    const attachment = await attachmentRepository.getById(id);
    if (!attachment) {
      throw { status: 404, message: "Attachment not found" };
    }

    const task = await taskRepository.getByIdAndUser(attachment.task_id, userId);
    if (!task) {
      throw { status: 403, message: "Access denied" };
    }

    // Delete file from Supabase Storage (using service role key to bypass RLS)
    const { error: deleteError } = await supabaseStorage.storage
      .from("Images")
      .remove([attachment.file_path]);

    if (deleteError) {
      console.error("Error deleting file from storage:", deleteError);
      // Continue with database deletion even if storage deletion fails
    }

    // Delete attachment record from database
    await attachmentRepository.delete(id);
    return { message: "Attachment deleted successfully" };
  }

  async getAttachment(id, userId) {
    const attachment = await attachmentRepository.getById(id);
    if (!attachment) {
      throw { status: 404, message: "Attachment not found" };
    }

    const task = await taskRepository.getByIdAndUser(attachment.task_id, userId);
    if (!task) {
      throw { status: 403, message: "Access denied" };
    }

    // Get signed URL if file_url doesn't exist (for backward compatibility)
    if (!attachment.file_url && attachment.file_path) {
      const { data: urlData } = supabaseStorage.storage
        .from("Images")
        .getPublicUrl(attachment.file_path);
      
      attachment.file_url = urlData.publicUrl;
    }

    return attachment;
  }
}

module.exports = new AttachmentService();
