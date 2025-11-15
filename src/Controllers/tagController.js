const tagService = require("../services/tagService");

class TagController {
  async createTag(req, res, next) {
    try {
      const tag = await tagService.createTag(req.body);
      res.status(201).json(tag);
    } catch (error) {
      next(error);
    }
  }

  async getAllTags(req, res, next) {
    try {
      const tags = await tagService.getAllTags();
      res.json(tags);
    } catch (error) {
      next(error);
    }
  }

  async addTagToTask(req, res, next) {
    try {
      const result = await tagService.addTagToTask(
        req.params.id,
        req.user.id,
        req.body.tagId,
      );
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async removeTagFromTask(req, res, next) {
    try {
      const result = await tagService.removeTagFromTask(
        req.params.id,
        req.user.id,
        req.params.tagId,
      );
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async getTaskTags(req, res, next) {
    try {
      const tags = await tagService.getTaskTags(req.params.id, req.user.id);
      res.json(tags);
    } catch (error) {
      next(error);
    }
  }

  async deleteTag(req, res, next) {
    try {
      const result = await tagService.deleteTag(req.params.id);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new TagController();
