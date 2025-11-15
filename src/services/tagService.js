const tagRepository = require("../Repositories/tagRepository");
const taskRepository = require("../Repositories/TaskRepository");

class TagService {
  async createTag(tagData) {
    const existing = await tagRepository.getByName(tagData.name);
    if (existing) {
      throw { status: 409, message: "Tag already exists" };
    }

    return await tagRepository.create(tagData);
  }

  async getAllTags() {
    return await tagRepository.getAll();
  }

  async addTagToTask(taskId, userId, tagId) {
    const task = await taskRepository.getById(taskId, userId);
    if (!task) {
      throw { status: 404, message: "Task not found" };
    }

    const tag = await tagRepository.getById(tagId);
    if (!tag) {
      throw { status: 404, message: "Tag not found" };
    }

    await tagRepository.addTagToTask(taskId, tagId);
    return { message: "Tag added to task" };
  }

  async removeTagFromTask(taskId, userId, tagId) {
    const task = await taskRepository.getById(taskId, userId);
    if (!task) {
      throw { status: 404, message: "Task not found" };
    }

    await tagRepository.removeTagFromTask(taskId, tagId);
    return { message: "Tag removed from task" };
  }

  async getTaskTags(taskId, userId) {
    const task = await taskRepository.getById(taskId, userId);
    if (!task) {
      throw { status: 404, message: "Task not found" };
    }

    return await tagRepository.getTaskTags(taskId);
  }

  async deleteTag(id) {
    const deleted = await tagRepository.delete(id);
    if (!deleted) {
      throw { status: 404, message: "Tag not found" };
    }
    return { message: "Tag deleted successfully" };
  }
}

module.exports = new TagService();
