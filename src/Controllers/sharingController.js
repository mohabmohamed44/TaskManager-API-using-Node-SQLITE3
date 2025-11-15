const sharingService = require("../services/sharingService");

class SharingController {
  async shareTask(req, res, next) {
    try {
      const { email, permission } = req.body;
      const result = await sharingService.shareTask(
        req.params.id,
        req.user.id,
        email,
        permission,
      );
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async unshareTask(req, res, next) {
    try {
      const { email } = req.body;
      const result = await sharingService.unshareTask(
        req.params.id,
        req.user.id,
        email,
      );
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async getSharedUsers(req, res, next) {
    try {
      const users = await sharingService.getSharedUsers(
        req.params.id,
        req.user.id,
      );
      res.json(users);
    } catch (error) {
      next(error);
    }
  }

  async updatePermission(req, res, next) {
    try {
      const { email, permission } = req.body;
      const result = await sharingService.updatePermission(
        req.params.id,
        req.user.id,
        email,
        permission,
      );
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new SharingController();
