const db = require("../config/database");
const supabase = db.supabase || db; // support both: module.exports = supabase OR module.exports = { supabase, supabaseStorage }

class AttachmentRepository {
  // Create a new attachment
  async create(attachment) {
    const { taskId, fileName, filePath, fileUrl, fileSize, mimeType } = attachment;

    // Build insert object, only include file_url if it's provided
    const insertData = {
      task_id: taskId,
      file_name: fileName,
      file_path: filePath,
      file_size: fileSize,
      mime_type: mimeType
    };

    // Only add file_url if provided (column might not exist in older schemas)
    if (fileUrl !== undefined && fileUrl !== null) {
      insertData.file_url = fileUrl;
    }

    const { data, error } = await supabase
      .from("attachments")
      .insert([insertData])
      .select()
      .single();

    if (error) {
      console.error("Database insert error:", error);
      throw new Error(error.message);
    }
    return data;
  }

  // Get attachment by ID
  async getById(id) {
    const { data, error } = await supabase
      .from("attachments")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  // Get attachments by Task ID
  async getByTaskId(taskId) {
    const { data, error } = await supabase
      .from("attachments")
      .select("*")
      .eq("task_id", taskId)
      .order("created_at", { ascending: false });

    if (error) throw new Error(error.message);
    return data;
  }

  // Delete attachment by ID
  async delete(id) {
    const { data, error } = await supabase
      .from("attachments")
      .delete()
      .eq("id", id);

    if (error) throw new Error(error.message);
    return data.length > 0;
  }
}

module.exports = new AttachmentRepository();