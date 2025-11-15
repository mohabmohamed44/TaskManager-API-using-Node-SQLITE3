const templateRepository = require("../Repositories/templateRepository");
const taskRepository = require("../Repositories/TaskRepository");

class TemplateService {
  async createTemplate(userId, templateData) {
    return await templateRepository.create({
      userId,
      ...templateData,
    });
  }

  async getTemplates(userId) {
    return await templateRepository.getByUserId(userId);
  }

  async getTemplateById(id, userId) {
    const template = await templateRepository.getById(id);
    if (!template) {
      throw { status: 404, message: "Template not found" };
    }

    if (template.userId !== userId) {
      throw { status: 403, message: "Access denied" };
    }

    return template;
  }

  async updateTemplate(id, userId, templateData) {
    const template = await templateRepository.getById(id);
    if (!template) {
      throw { status: 404, message: "Template not found" };
    }

    if (template.userId !== userId) {
      throw { status: 403, message: "Access denied" };
    }

    return await templateRepository.update(id, templateData);
  }

  async deleteTemplate(id, userId) {
    const template = await templateRepository.getById(id);
    if (!template) {
      throw { status: 404, message: "Template not found" };
    }

    if (template.userId !== userId) {
      throw { status: 403, message: "Access denied" };
    }

    await templateRepository.delete(id);
    return { message: "Template deleted successfully" };
  }

  async createTaskFromTemplate(templateId, userId) {
    const template = await this.getTemplateById(templateId, userId);

    const task = await taskRepository.create({
      userId,
      title: template.title,
      description: template.description,
      priority: template.priority,
      category: template.category,
      completed: false,
    });

    return task;
  }
}

module.exports = new TemplateService();
