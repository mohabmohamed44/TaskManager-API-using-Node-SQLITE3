const express = require("express");
const router = express.Router();
const templateController = require("../Controllers/templateController");
const { authenticate } = require("../Middleware/auth");

router.use(authenticate);

router.get("/", templateController.getTemplates);
router.get("/:id", templateController.getTemplateById);
router.post("/", templateController.createTemplate);
router.put("/:id", templateController.updateTemplate);
router.delete("/:id", templateController.deleteTemplate);

router.post("/:id/create-task", templateController.createTaskFromTemplate);

module.exports = router;
