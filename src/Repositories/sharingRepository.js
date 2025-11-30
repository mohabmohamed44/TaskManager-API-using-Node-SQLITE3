const supabase = require("../config/database");

class SharingRepository {
  async shareTask(taskId, ownerId, sharedWithId, permission) {
    const { data, error } = await supabase
      .from("task_sharing")
      .insert([{
        task_id: taskId,
        owner_id: ownerId,
        shared_with_id: sharedWithId,
        permission: permission || "view"
      }])
      .select()
      .single();

    if (error) {
      // Handle duplicate entry error
      if (error.code === "23505" || error.message?.includes("duplicate") || error.message?.includes("unique")) {
        throw { 
          status: 409, 
          message: "Task is already shared with this user" 
        };
      }
      throw { status: 500, message: error.message || "Failed to share task" };
    }
    return data.id;
  }

  async unshareTask(taskId, sharedWithId) {
    const { error } = await supabase
      .from("task_sharing")
      .delete()
      .eq("task_id", taskId)
      .eq("shared_with_id", sharedWithId);

    if (error) throw error;
    return true;
  }

  async getSharedUsers(taskId) {
    const { data, error } = await supabase
      .from("task_sharing")
      .select(`
        permission,
        user:users!task_sharing_shared_with_id_fkey(id, email, name)
      `)
      .eq("task_id", taskId);

    if (error) throw error;
    return data.map(item => ({
      id: item.user.id,
      email: item.user.email,
      name: item.user.name,
      permission: item.permission
    }));
  }

  async hasAccess(taskId, userId) {
    const { data, error } = await supabase
      .from("task_sharing")
      .select("permission")
      .eq("task_id", taskId)
      .eq("shared_with_id", userId)
      .single();

    if (error && error.code !== "PGRST116") throw error;
    return data || null;
  }

  async updatePermission(taskId, sharedWithId, permission) {
    const { error } = await supabase
      .from("task_sharing")
      .update({ permission })
      .eq("task_id", taskId)
      .eq("shared_with_id", sharedWithId);

    if (error) throw error;
    return true;
  }
}

module.exports = new SharingRepository();