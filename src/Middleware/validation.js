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
    body("title").notEmpty().withMessage("Title is required").trim(),
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

const weeklyGoalValidation = {
  create: [
    body("title").notEmpty().withMessage("Title is required").trim(),
    body("week_start").optional().isISO8601().withMessage("Invalid week start date"),
    body("week_end").optional().isISO8601().withMessage("Invalid week end date"),
    body("priority").optional().isIn(["low", "medium", "high", "urgent"]),
    body("category").optional().trim(),
    validate,
  ],

  update: [
    param("id").isInt().withMessage("Invalid goal ID"),
    body("title").optional().trim().notEmpty(),
    body("priority").optional().isIn(["low", "medium", "high", "urgent"]),
    body("status").optional().isIn(["not_started", "in_progress", "completed", "abandoned"]),
    body("progress").optional().isInt({ min: 0, max: 100 }),
    validate,
  ],

  get: [param("id").isInt().withMessage("Invalid goal ID"), validate],
};

const kanbanValidation = {
  createBoard: [
    body("name").notEmpty().withMessage("Board name is required").trim(),
    body("description").optional().trim(),
    validate,
  ],
  updateBoard: [
    param("id").isInt().withMessage("Invalid board ID"),
    body("name").optional().trim().notEmpty(),
    validate,
  ],
  createColumn: [
    param("boardId").isInt().withMessage("Invalid board ID"),
    body("name").notEmpty().withMessage("Column name is required").trim(),
    body("color").optional().isHexColor(),
    body("wip_limit").optional().isInt({ min: 0 }),
    validate,
  ],
  createCard: [
    param("boardId").isInt().withMessage("Invalid board ID"),
    body("column_id").isInt().withMessage("Invalid column ID"),
    body("title").notEmpty().withMessage("Card title is required").trim(),
    body("priority").optional().isIn(["low", "medium", "high", "urgent"]),
    validate,
  ],
};

module.exports = {
  taskValidation,
  authValidation,
  commentValidation,
  subtaskValidation,
  weeklyGoalValidation,
  kanbanValidation,
};
