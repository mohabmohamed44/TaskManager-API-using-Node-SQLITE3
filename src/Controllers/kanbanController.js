const kanbanService = require("../services/kanbanService");

class KanbanController {
  // ==================== BOARDS ====================

  async createBoard(req, res, next) {
    try {
      const board = await kanbanService.createBoard(req.user.id, req.body);
      res.status(201).json(board);
    } catch (error) {
      next(error);
    }
  }

  async getBoards(req, res, next) {
    try {
      const boards = await kanbanService.getBoardsByUser(req.user.id);
      res.json(boards);
    } catch (error) {
      next(error);
    }
  }

  async getBoardById(req, res, next) {
    try {
      const board = await kanbanService.getBoardById(req.params.id, req.user.id);
      res.json(board);
    } catch (error) {
      next(error);
    }
  }

  async updateBoard(req, res, next) {
    try {
      const board = await kanbanService.updateBoard(
        req.params.id,
        req.user.id,
        req.body
      );
      res.json(board);
    } catch (error) {
      next(error);
    }
  }

  async deleteBoard(req, res, next) {
    try {
      await kanbanService.deleteBoard(req.params.id, req.user.id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }

  async archiveBoard(req, res, next) {
    try {
      const board = await kanbanService.archiveBoard(req.params.id, req.user.id);
      res.json(board);
    } catch (error) {
      next(error);
    }
  }

  async unarchiveBoard(req, res, next) {
    try {
      const board = await kanbanService.unarchiveBoard(
        req.params.id,
        req.user.id
      );
      res.json(board);
    } catch (error) {
      next(error);
    }
  }

  // ==================== COLUMNS ====================

  async createColumn(req, res, next) {
    try {
      const column = await kanbanService.createColumn(
        req.params.boardId,
        req.user.id,
        req.body
      );
      res.status(201).json(column);
    } catch (error) {
      next(error);
    }
  }

  async updateColumn(req, res, next) {
    try {
      const column = await kanbanService.updateColumn(req.params.id, req.body);
      res.json(column);
    } catch (error) {
      next(error);
    }
  }

  async deleteColumn(req, res, next) {
    try {
      await kanbanService.deleteColumn(
        req.params.id,
        req.user.id,
        req.params.boardId
      );
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }

  async reorderColumns(req, res, next) {
    try {
      const { newPosition } = req.body;
      await kanbanService.reorderColumns(
        req.params.boardId,
        req.user.id,
        req.params.id,
        newPosition
      );
      res.json({ success: true });
    } catch (error) {
      next(error);
    }
  }

  // ==================== CARDS ====================

  async createCard(req, res, next) {
    try {
      const card = await kanbanService.createCard(
        req.params.boardId,
        req.user.id,
        req.body
      );
      res.status(201).json(card);
    } catch (error) {
      next(error);
    }
  }

  async updateCard(req, res, next) {
    try {
      const card = await kanbanService.updateCard(
        req.params.id,
        req.user.id,
        req.params.boardId,
        req.body
      );
      res.json(card);
    } catch (error) {
      next(error);
    }
  }

  async deleteCard(req, res, next) {
    try {
      await kanbanService.deleteCard(
        req.params.id,
        req.user.id,
        req.params.boardId
      );
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }

  async moveCard(req, res, next) {
    try {
      const { newColumnId, columnId, newPosition } = req.body;
      const targetColumnId = columnId || newColumnId;
      await kanbanService.moveCard(
        req.params.id,
        req.user.id,
        req.params.boardId,
        targetColumnId,
        newPosition
      );
      res.json({ success: true });
    } catch (error) {
      next(error);
    }
  }

  async reorderCards(req, res, next) {
    try {
      const { columnId, newPosition } = req.body;
      await kanbanService.reorderCards(
        columnId,
        req.user.id,
        req.params.boardId,
        req.params.id,
        newPosition
      );
      res.json({ success: true });
    } catch (error) {
      next(error);
    }
  }

  async bulkMoveCards(req, res, next) {
    try {
      const { cardIds, targetColumnId } = req.body;
      const result = await kanbanService.bulkMoveCards(
        req.user.id,
        req.params.boardId,
        cardIds,
        targetColumnId
      );
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new KanbanController();
