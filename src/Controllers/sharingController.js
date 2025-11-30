const sharingService = require("../services/sharingService");

class SharingController {
  async shareTask(req, res, next) {
    try {
      if (!req.user || !req.user.id) {
        return res.status(401).json({ error: "Authentication required" });
      }

      const { email, permission } = req.body;
      
      if (!email || !email.trim()) {
        return res.status(400).json({ error: "Email is required" });
      }

      const result = await sharingService.shareTask(
        req.params.id,
        req.user.id,
        email.trim(),
        permission,
      );
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async unshareTask(req, res, next) {
    try {
      if (!req.user || !req.user.id) {
        return res.status(401).json({ error: "Authentication required" });
      }

      const { email } = req.body;
      
      if (!email || !email.trim()) {
        return res.status(400).json({ error: "Email is required" });
      }

      const result = await sharingService.unshareTask(
        req.params.id,
        req.user.id,
        email.trim(),
      );
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async getSharedUsers(req, res, next) {
    try {
      if (!req.user || !req.user.id) {
        return res.status(401).json({ error: "Authentication required" });
      }

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
      if (!req.user || !req.user.id) {
        return res.status(401).json({ error: "Authentication required" });
      }

      const { email, permission } = req.body;
      
      if (!email || !email.trim()) {
        return res.status(400).json({ error: "Email is required" });
      }

      if (!permission || !["view", "edit"].includes(permission)) {
        return res.status(400).json({ error: "Permission must be 'view' or 'edit'" });
      }

      const result = await sharingService.updatePermission(
        req.params.id,
        req.user.id,
        email.trim(),
        permission,
      );
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new SharingController();
