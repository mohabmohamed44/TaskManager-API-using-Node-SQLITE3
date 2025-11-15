const templateService = require("../services/templateService");

class TemplateController {
  async createTemplate(req, res, next) {
    try {
      const template = await templateService.createTemplate(
        req.user.id,
        req.body,
      );
      res.status(201).json(template);
    } catch (error) {
      next(error);
    }
  }

  async getTemplates(req, res, next) {
    try {
      const templates = await templateService.getTemplates(req.user.id);
      res.json(templates);
    } catch (error) {
      next(error);
    }
  }

  async getTemplateById(req, res, next) {
    try {
      const template = await templateService.getTemplateById(
        req.params.id,
        req.user.id,
      );
      res.json(template);
    } catch (error) {
      next(error);
    }
  }

  async updateTemplate(req, res, next) {
    try {
      const template = await templateService.updateTemplate(
        req.params.id,
        req.user.id,
        req.body,
      );
      res.json(template);
    } catch (error) {
      next(error);
    }
  }

  async deleteTemplate(req, res, next) {
    try {
      const result = await templateService.deleteTemplate(
        req.params.id,
        req.user.id,
      );
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async createTaskFromTemplate(req, res, next) {
    try {
      const task = await templateService.createTaskFromTemplate(
        req.params.id,
        req.user.id,
      );
      res.status(201).json(task);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new TemplateController();
