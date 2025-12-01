const templateRepository = require("../Repositories/templateRepository");
const taskRepository = require("../Repositories/TaskRepository");

class TemplateService {
  async createTemplate(userId, templateData) {
    try {
      // Validate required fields
      if (!templateData.name || !templateData.title) {
        throw { 
          status: 400, 
          message: "Name and title are required fields" 
        };
      }

      console.log("[SERVICE CREATE] Creating template for user:", userId);
      
      const template = await templateRepository.create({
        userId,
        ...templateData,
      });

      console.log("[SERVICE CREATE] Template created:", template.id);
      return template;
    } catch (error) {
      console.error("[SERVICE CREATE] Error:", error);
      throw error;
    }
  }

  async getTemplates(userId) {
    try {
      return await templateRepository.getByUserId(userId);
    } catch (error) {
      console.error("[SERVICE GET TEMPLATES] Error:", error);
      throw error;
    }
  }

  async getTemplateById(id, userId) {
    try {
      const template = await templateRepository.getById(id);
      
      if (!template) {
        throw { status: 404, message: "Template not found" };
      }

      if (template.user_id !== userId) {
        throw { status: 403, message: "Access denied" };
      }

      return template;
    } catch (error) {
      console.error("[SERVICE GET BY ID] Error:", error);
      throw error;
    }
  }

  async updateTemplate(id, userId, templateData) {
    try {
      const template = await templateRepository.getById(id);
      
      if (!template) {
        throw { status: 404, message: "Template not found" };
      }

      if (template.user_id !== userId) {
        throw { status: 403, message: "Access denied" };
      }

      return await templateRepository.update(id, templateData);
    } catch (error) {
      console.error("[SERVICE UPDATE] Error:", error);
      throw error;
    }
  }

  async deleteTemplate(id, userId) {
    try {
      const template = await templateRepository.getById(id);
      
      if (!template) {
        throw { status: 404, message: "Template not found" };
      }

      if (template.user_id !== userId) {
        throw { status: 403, message: "Access denied" };
      }

      await templateRepository.delete(id);
      return { message: "Template deleted successfully" };
    } catch (error) {
      console.error("[SERVICE DELETE] Error:", error);
      throw error;
    }
  }

  async createTaskFromTemplate(templateId, userId) {
    try {
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
    } catch (error) {
      console.error("[SERVICE CREATE TASK FROM TEMPLATE] Error:", error);
      throw error;
    }
  }
}

module.exports = new TemplateService();