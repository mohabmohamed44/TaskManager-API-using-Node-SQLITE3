const templateService = require("../services/templateService");

class TemplateController {
  async createTemplate(req, res, next) {
    try {
      // Validate user authentication
      if (!req.user || !req.user.id) {
        return res.status(401).json({ 
          error: "Unauthorized", 
          message: "User authentication required" 
        });
      }

      // Validate request body
      if (!req.body || Object.keys(req.body).length === 0) {
        return res.status(400).json({ 
          error: "Bad Request", 
          message: "Request body is required" 
        });
      }

      console.log("[CREATE TEMPLATE] User ID:", req.user.id);
      console.log("[CREATE TEMPLATE] Body:", JSON.stringify(req.body, null, 2));

      const template = await templateService.createTemplate(
        req.user.id,
        req.body,
      );

      console.log("[CREATE TEMPLATE] Success:", template.id);
      res.status(201).json(template);
    } catch (error) {
      console.error("[CREATE TEMPLATE] Error:", error);
      next(error);
    }
  }

  async getTemplates(req, res, next) {
    try {
      if (!req.user || !req.user.id) {
        return res.status(401).json({ 
          error: "Unauthorized", 
          message: "User authentication required" 
        });
      }

      const templates = await templateService.getTemplates(req.user.id);
      res.json(templates);
    } catch (error) {
      console.error("[GET TEMPLATES] Error:", error);
      next(error);
    }
  }

  async getTemplateById(req, res, next) {
    try {
      if (!req.user || !req.user.id) {
        return res.status(401).json({ 
          error: "Unauthorized", 
          message: "User authentication required" 
        });
      }

      const template = await templateService.getTemplateById(
        req.params.id,
        req.user.id,
      );
      res.json(template);
    } catch (error) {
      console.error("[GET TEMPLATE BY ID] Error:", error);
      next(error);
    }
  }

  async updateTemplate(req, res, next) {
    try {
      if (!req.user || !req.user.id) {
        return res.status(401).json({ 
          error: "Unauthorized", 
          message: "User authentication required" 
        });
      }

      const template = await templateService.updateTemplate(
        req.params.id,
        req.user.id,
        req.body,
      );
      res.json(template);
    } catch (error) {
      console.error("[UPDATE TEMPLATE] Error:", error);
      next(error);
    }
  }

  async deleteTemplate(req, res, next) {
    try {
      if (!req.user || !req.user.id) {
        return res.status(401).json({ 
          error: "Unauthorized", 
          message: "User authentication required" 
        });
      }

      const result = await templateService.deleteTemplate(
        req.params.id,
        req.user.id,
      );
      res.json(result);
    } catch (error) {
      console.error("[DELETE TEMPLATE] Error:", error);
      next(error);
    }
  }

  async createTaskFromTemplate(req, res, next) {
    try {
      if (!req.user || !req.user.id) {
        return res.status(401).json({ 
          error: "Unauthorized", 
          message: "User authentication required" 
        });
      }

      const task = await templateService.createTaskFromTemplate(
        req.params.id,
        req.user.id,
      );
      res.status(201).json(task);
    } catch (error) {
      console.error("[CREATE TASK FROM TEMPLATE] Error:", error);
      next(error);
    }
  }
}

module.exports = new TemplateController();
