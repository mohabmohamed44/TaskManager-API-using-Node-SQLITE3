const express = require("express");
const router = express.Router();
const sharingController = require("../Controllers/sharingController");
const { authenticate } = require("../Middleware/auth");

router.use(authenticate);

// task sharing routes
router.get("/:id/share", sharingController.getSharedUsers);
router.post("/:id/share", sharingController.shareTask);
router.delete("/:id/share", sharingController.unshareTask);
router.put("/:id/share", sharingController.updatePermission);

module.exports = router;
