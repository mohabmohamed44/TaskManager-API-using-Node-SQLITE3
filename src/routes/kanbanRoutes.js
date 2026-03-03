const express = require("express");
const router = express.Router();
const kanbanController = require("../Controllers/kanbanController");
const { authenticate } = require("../Middleware/auth");
const { kanbanValidation } = require("../Middleware/validation");

// All routes require authentication
router.use(authenticate);

// BOARDS
router.get("/boards", kanbanController.getBoards);
router.post("/boards", kanbanValidation.createBoard, kanbanController.createBoard);
router.get("/boards/:id", kanbanController.getBoardById);
router.put("/boards/:id", kanbanValidation.updateBoard, kanbanController.updateBoard);
router.delete("/boards/:id", kanbanController.deleteBoard);
router.post("/boards/:id/archive", kanbanController.archiveBoard);
router.post("/boards/:id/unarchive", kanbanController.unarchiveBoard);

// COLUMNS (Always under a board)
router.post("/boards/:boardId/columns", kanbanValidation.createColumn, kanbanController.createColumn);
router.put("/columns/:id", kanbanController.updateColumn);
router.delete("/boards/:boardId/columns/:id", kanbanController.deleteColumn);
router.post("/boards/:boardId/columns/:id/reorder", kanbanController.reorderColumns);

// CARDS (Always under a board)
router.post("/boards/:boardId/cards", kanbanValidation.createCard, kanbanController.createCard);
router.put("/boards/:boardId/cards/:id", kanbanController.updateCard);
router.delete("/boards/:boardId/cards/:id", kanbanController.deleteCard);
router.post("/boards/:boardId/cards/:id/move", kanbanController.moveCard);
router.post("/boards/:boardId/cards/:id/reorder", kanbanController.reorderCards);
router.post("/boards/:boardId/cards/bulk-move", kanbanController.bulkMoveCards);

module.exports = router;
