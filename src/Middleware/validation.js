const { body, param, query, validationResult } = require("express-validator");

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

const taskValidation = {
  create: [
    body("title").trim().notEmpty().withMessage("Title is required"),
    body("description").optional().trim(),
    body("priority").optional().isIn(["low", "medium", "high", "urgent"]),
    body("category").optional().trim(),
    body("dueDate").optional().isISO8601().withMessage("Invalid date format"),
    validate,
  ],

  update: [
    param("id").isInt().withMessage("Invalid task ID"),
    body("title").optional().trim().notEmpty(),
    body("priority").optional().isIn(["low", "medium", "high", "urgent"]),
    body("dueDate").optional().isISO8601(),
    validate,
  ],

  get: [param("id").isInt().withMessage("Invalid task ID"), validate],

  query: [
    query("page").optional().isInt({ min: 1 }),
    query("limit").optional().isInt({ min: 1, max: 100 }),
    query("sort")
      .optional()
      .isIn(["createdAt", "updatedAt", "dueDate", "priority", "title"]),
    query("order").optional().isIn(["asc", "desc"]),
    query("completed").optional().isBoolean(),
    validate,
  ],
};

const authValidation = {
  register: [
    body("email").isEmail().withMessage("Invalid email address"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters"),
    body("name").optional().trim(),
    validate,
  ],

  login: [
    body("email").isEmail().withMessage("Invalid email address"),
    body("password").notEmpty().withMessage("Password is required"),
    validate,
  ],
};

const commentValidation = {
  create: [
    param("id").isInt().withMessage("Invalid task ID"),
    body("text").trim().notEmpty().withMessage("Comment text is required"),
    validate,
  ],
};

const subtaskValidation = {
  create: [
    param("id").isInt().withMessage("Invalid task ID"),
    body("text").trim().notEmpty().withMessage("Subtask text is required"),
    validate,
  ],
};

module.exports = {
  taskValidation,
  authValidation,
  commentValidation,
  subtaskValidation,
};
