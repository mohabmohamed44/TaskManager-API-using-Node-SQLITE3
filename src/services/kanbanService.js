const kanbanRepository = require("../Repositories/kanbanRepository");
const { ValidationError, NotFoundError } = require("../utils/error");

class KanbanService {
  // ==================== BOARDS ====================
  
  async createBoard(userId, boardData) {
    const { name } = boardData;
    
    if (!name || name.trim() === "") {
      throw new ValidationError("Board name is required");
    }

    return await kanbanRepository.createBoard(userId, boardData);
  }

  async getBoardsByUser(userId) {
    return await kanbanRepository.getBoardsByUser(userId);
  }

  async getBoardById(boardId, userId) {
    const board = await kanbanRepository.getBoardById(boardId, userId);
    
    // Sort columns by position
    if (board.columns) {
      board.columns.sort((a, b) => a.position - b.position);
      
      // Sort cards within each column
      board.columns.forEach(column => {
        if (column.cards) {
          column.cards.sort((a, b) => a.position - b.position);
        }
      });
    }
    
    return board;
  }

  async updateBoard(boardId, userId, updates) {
    if (updates.name && updates.name.trim() === "") {
      throw new ValidationError("Board name cannot be empty");
    }

    return await kanbanRepository.updateBoard(boardId, userId, updates);
  }

  async deleteBoard(boardId, userId) {
    return await kanbanRepository.deleteBoard(boardId, userId);
  }

  async archiveBoard(boardId, userId) {
    return await kanbanRepository.updateBoard(boardId, userId, { is_archived: true });
  }

  async unarchiveBoard(boardId, userId) {
    return await kanbanRepository.updateBoard(boardId, userId, { is_archived: false });
  }

  // ==================== COLUMNS ====================
  
  async createColumn(boardId, userId, columnData) {
    // Verify user owns the board
    await kanbanRepository.getBoardById(boardId, userId);
    
    const { name } = columnData;
    if (!name || name.trim() === "") {
      throw new ValidationError("Column name is required");
    }

    return await kanbanRepository.createColumn(boardId, columnData);
  }

  async updateColumn(columnId, updates) {
    if (updates.name && updates.name.trim() === "") {
      throw new ValidationError("Column name cannot be empty");
    }

    if (updates.wip_limit !== undefined && updates.wip_limit < 0) {
      throw new ValidationError("WIP limit must be non-negative");
    }

    return await kanbanRepository.updateColumn(columnId, updates);
  }

  async deleteColumn(columnId, userId, boardId) {
    // Verify user owns the board
    await kanbanRepository.getBoardById(boardId, userId);
    
    return await kanbanRepository.deleteColumn(columnId);
  }

  async reorderColumns(boardId, userId, columnId, newPosition) {
    // Verify user owns the board
    await kanbanRepository.getBoardById(boardId, userId);
    
    if (newPosition < 0) {
      throw new ValidationError("Position must be non-negative");
    }

    return await kanbanRepository.reorderColumns(boardId, columnId, newPosition);
  }

  // ==================== CARDS ====================
  
  async createCard(boardId, userId, cardData) {
    // Verify user owns the board
    await kanbanRepository.getBoardById(boardId, userId);
    
    const { title, column_id } = cardData;
    
    if (!title || title.trim() === "") {
      throw new ValidationError("Card title is required");
    }

    if (!column_id) {
      throw new ValidationError("Column ID is required");
    }

    return await kanbanRepository.createCard({
      ...cardData,
      board_id: boardId
    });
  }

  async updateCard(cardId, userId, boardId, updates) {
    // Verify user owns the board
    await kanbanRepository.getBoardById(boardId, userId);
    
    if (updates.title && updates.title.trim() === "") {
      throw new ValidationError("Card title cannot be empty");
    }

    return await kanbanRepository.updateCard(cardId, updates);
  }

  async deleteCard(cardId, userId, boardId) {
    // Verify user owns the board
    await kanbanRepository.getBoardById(boardId, userId);
    
    return await kanbanRepository.deleteCard(cardId);
  }

  async moveCard(cardId, userId, boardId, newColumnId, newPosition) {
    // Verify user owns the board
    await kanbanRepository.getBoardById(boardId, userId);
    
    if (newPosition < 0) {
      throw new ValidationError("Position must be non-negative");
    }

    return await kanbanRepository.moveCard(cardId, newColumnId, newPosition);
  }

  async reorderCards(columnId, userId, boardId, cardId, newPosition) {
    // Verify user owns the board
    await kanbanRepository.getBoardById(boardId, userId);
    
    if (newPosition < 0) {
      throw new ValidationError("Position must be non-negative");
    }

    return await kanbanRepository.reorderCards(columnId, cardId, newPosition);
  }

  // ==================== BULK OPERATIONS ====================
  
  async bulkMoveCards(userId, boardId, cardIds, targetColumnId) {
    // Verify user owns the board
    await kanbanRepository.getBoardById(boardId, userId);
    
    const results = [];
    for (let i = 0; i < cardIds.length; i++) {
      const result = await kanbanRepository.moveCard(cardIds[i], targetColumnId, i);
      results.push(result);
    }
    
    return { message: `${results.length} cards moved successfully`, count: results.length };
  }
}

module.exports = new KanbanService();