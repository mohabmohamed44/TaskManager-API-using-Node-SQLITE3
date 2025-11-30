const sharingRepository = require("../Repositories/sharingRepository");
const taskRepository = require("../Repositories/TaskRepository");
const userRepository = require("../Repositories/userRepository");

class SharingService {
  async shareTask(taskId, userId, sharedWithEmail, permission) {
    // Validate taskId
    if (!taskId || isNaN(parseInt(taskId))) {
      throw { status: 400, message: "Invalid task ID" };
    }

    const task = await taskRepository.getByIdAndUser(taskId, userId);
    if (!task) {
      throw { status: 404, message: "Task not found" };
    }

    if (!sharedWithEmail || !sharedWithEmail.trim()) {
      throw { status: 400, message: "Email is required" };
    }

    const sharedWithUser = await userRepository.getByEmail(sharedWithEmail.trim());
    if (!sharedWithUser) {
      throw { status: 404, message: "User to share with not found" };
    }

    if (sharedWithUser.id === userId) {
      throw { status: 400, message: "Cannot share task with yourself" };
    }

    // Check if task is already shared with this user
    const existingShare = await sharingRepository.hasAccess(taskId, sharedWithUser.id);
    if (existingShare) {
      throw { 
        status: 409, 
        message: `Task is already shared with ${sharedWithEmail}` 
      };
    }

    await sharingRepository.shareTask(
      taskId,
      userId,
      sharedWithUser.id,
      permission || "view",
    );
    return { message: "Task shared successfully" };
  }

  async unshareTask(taskId, userId, sharedWithEmail) {
    const task = await taskRepository.getByIdAndUser(taskId, userId);
    if (!task) {
      throw { status: 404, message: "Task not found" };
    }

    const sharedWithUser = await userRepository.getByEmail(sharedWithEmail);
    if (!sharedWithUser) {
      throw { status: 404, message: "User not found" };
    }

    await sharingRepository.unshareTask(taskId, sharedWithUser.id);
    return { message: "Task unshared successfully" };
  }

  async getSharedUsers(taskId, userId) {
    const task = await taskRepository.getByIdAndUser(taskId, userId);
    if (!task) {
      throw { status: 404, message: "Task not found" };
    }

    return await sharingRepository.getSharedUsers(taskId);
  }

  async updatePermission(taskId, userId, sharedWithEmail, permission) {
    const task = await taskRepository.getByIdAndUser(taskId, userId);
    if (!task) {
      throw { status: 404, message: "Task not found" };
    }

    const sharedWithUser = await userRepository.getByEmail(sharedWithEmail);
    if (!sharedWithUser) {
      throw { status: 404, message: "User not found" };
    }

    await sharingRepository.updatePermission(
      taskId,
      sharedWithUser.id,
      permission,
    );
    return { message: "Permission updated successfully" };
  }
}

module.exports = new SharingService();
