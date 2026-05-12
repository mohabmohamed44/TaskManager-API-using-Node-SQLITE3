const supabase = require("../config/database");
const { DatabaseError, NotFoundError, ValidationError } = require("../utils/error");

class KanbanRepository {
  // ==================== BOARDS ====================
  
  async createBoard(userId, boardData) {
    try {
      const { name, description } = boardData;
      
      const { data, error } = await supabase
        .from("kanban_boards")
        .insert([{ user_id: userId, name, description }])
        .select()
        .single();

      if (error) {
        console.error("Supabase error (createBoard):", error);
        throw new DatabaseError("Failed to create board", error);
      }
      
      // Create default columns
      await supabase.rpc("create_default_kanban_columns", { p_board_id: data.id });
      
      return data;
    } catch (error) {
      if (error instanceof DatabaseError) throw error;
      console.error("Unexpected error (createBoard):", error);
      throw new DatabaseError("Unexpected error creating board", error);
    }
  }

  async getBoardsByUser(userId) {
    try {
      const { data, error } = await supabase
        .from("kanban_boards")
        .select("*")
        .eq("user_id", userId)
        .eq("is_archived", false)
        .order("created_at", { ascending: false });

      if (error) throw new DatabaseError("Failed to fetch boards", error);
      return data;
    } catch (error) {
      if (error instanceof DatabaseError) throw error;
      throw new DatabaseError("Unexpected error fetching boards", error);
    }
  }

  async getBoardById(boardId, userId) {
    try {
      const { data, error } = await supabase
        .from("kanban_boards")
        .select(`
          *,
          columns:kanban_columns(
            *,
            cards:kanban_cards(
              *,
              task:tasks(id, title, completed),
              assigned_user:users(id, name, email)
            )
          )
        `)
        .eq("id", boardId)
        .eq("user_id", userId)
        .single();

      if (error && error.code === "PGRST116") {
        throw new NotFoundError("Board not found");
      }
      if (error) throw new DatabaseError("Failed to fetch board", error);
      
      return data;
    } catch (error) {
      if (error instanceof NotFoundError || error instanceof DatabaseError) throw error;
      throw new DatabaseError("Unexpected error fetching board", error);
    }
  }

  async updateBoard(boardId, userId, updates) {
    try {
      const { data, error } = await supabase
        .from("kanban_boards")
        .update(updates)
        .eq("id", boardId)
        .eq("user_id", userId)
        .select()
        .single();

      if (error) throw new DatabaseError("Failed to update board", error);
      if (!data) throw new NotFoundError("Board not found");
      
      return data;
    } catch (error) {
      if (error instanceof NotFoundError || error instanceof DatabaseError) throw error;
      throw new DatabaseError("Unexpected error updating board", error);
    }
  }

  async deleteBoard(boardId, userId) {
    try {
      const { error } = await supabase
        .from("kanban_boards")
        .delete()
        .eq("id", boardId)
        .eq("user_id", userId);

      if (error) throw new DatabaseError("Failed to delete board", error);
      return true;
    } catch (error) {
      if (error instanceof DatabaseError) throw error;
      throw new DatabaseError("Unexpected error deleting board", error);
    }
  }

  // ==================== COLUMNS ====================
  
  async createColumn(boardId, columnData) {
    try {
      const { name, color, wip_limit } = columnData;
      
      // Get max position
      const { data: maxPos } = await supabase
        .from("kanban_columns")
        .select("position")
        .eq("board_id", boardId)
        .order("position", { ascending: false })
        .limit(1)
        .single();

      const position = maxPos ? maxPos.position + 1 : 0;

      const { data, error } = await supabase
        .from("kanban_columns")
        .insert([{ 
          board_id: boardId, 
          name, 
          color: color || "#3B82F6",
          position,
          wip_limit 
        }])
        .select()
        .single();

      if (error) throw new DatabaseError("Failed to create column", error);
      return data;
    } catch (error) {
      if (error instanceof DatabaseError) throw error;
      throw new DatabaseError("Unexpected error creating column", error);
    }
  }

  async updateColumn(columnId, updates) {
    try {
      const { data, error } = await supabase
        .from("kanban_columns")
        .update(updates)
        .eq("id", columnId)
        .select()
        .single();

      if (error) throw new DatabaseError("Failed to update column", error);
      if (!data) throw new NotFoundError("Column not found");
      
      return data;
    } catch (error) {
      if (error instanceof NotFoundError || error instanceof DatabaseError) throw error;
      throw new DatabaseError("Unexpected error updating column", error);
    }
  }

  async deleteColumn(columnId) {
    try {
      const { error } = await supabase
        .from("kanban_columns")
        .delete()
        .eq("id", columnId);

      if (error) throw new DatabaseError("Failed to delete column", error);
      return true;
    } catch (error) {
      if (error instanceof DatabaseError) throw error;
      throw new DatabaseError("Unexpected error deleting column", error);
    }
  }

  async reorderColumns(boardId, columnId, newPosition) {
    try {
      // Get the current column to find its old position
      const { data: current, error: fetchError } = await supabase
        .from("kanban_columns")
        .select("position")
        .eq("id", columnId)
        .eq("board_id", boardId)
        .single();

      if (fetchError || !current) throw new NotFoundError("Column not found");

      const oldPosition = current.position;

      if (oldPosition === newPosition) return current;

      // Shift other columns to make room
      if (newPosition < oldPosition) {
        // Moving up: shift columns between [newPosition, oldPosition-1] down by 1
        const { data: toShift } = await supabase
          .from("kanban_columns")
          .select("id, position")
          .eq("board_id", boardId)
          .neq("id", columnId)
          .gte("position", newPosition)
          .lt("position", oldPosition)
          .order("position", { ascending: false });

        if (toShift) {
          for (const col of toShift) {
            await supabase
              .from("kanban_columns")
              .update({ position: col.position + 1 })
              .eq("id", col.id);
          }
        }
      } else {
        // Moving down: shift columns between [oldPosition+1, newPosition] up by 1
        const { data: toShift } = await supabase
          .from("kanban_columns")
          .select("id, position")
          .eq("board_id", boardId)
          .neq("id", columnId)
          .gt("position", oldPosition)
          .lte("position", newPosition)
          .order("position", { ascending: true });

        if (toShift) {
          for (const col of toShift) {
            await supabase
              .from("kanban_columns")
              .update({ position: col.position - 1 })
              .eq("id", col.id);
          }
        }
      }

      // Set the target column to the new position
      const { data, error } = await supabase
        .from("kanban_columns")
        .update({ position: newPosition })
        .eq("id", columnId)
        .eq("board_id", boardId)
        .select()
        .single();

      if (error) throw new DatabaseError("Failed to reorder columns", error);
      return data;
    } catch (error) {
      if (error instanceof NotFoundError || error instanceof DatabaseError) throw error;
      throw new DatabaseError("Unexpected error reordering columns", error);
    }
  }

  // ==================== CARDS ====================
  
  async createCard(cardData) {
    try {
      const { board_id, column_id, task_id, title, description, priority, labels, assigned_to, assigned_user_id, due_date } = cardData;
      const assignee = assigned_to || assigned_user_id || null;
      
      // Get max position in column
      const { data: maxPos } = await supabase
        .from("kanban_cards")
        .select("position")
        .eq("column_id", column_id)
        .order("position", { ascending: false })
        .limit(1)
        .single();

      const position = maxPos ? maxPos.position + 1 : 0;

      const { data, error } = await supabase
        .from("kanban_cards")
        .insert([{ 
          board_id,
          column_id,
          task_id,
          title,
          description,
          priority: priority || "medium",
          labels: labels || [],
          assigned_to: assignee,
          due_date,
          position
        }])
        .select()
        .single();

      if (error) throw new DatabaseError("Failed to create card", error);
      return data;
    } catch (error) {
      if (error instanceof DatabaseError) throw error;
      throw new DatabaseError("Unexpected error creating card", error);
    }
  }

  async updateCard(cardId, updates) {
    try {
      const { data, error } = await supabase
        .from("kanban_cards")
        .update(updates)
        .eq("id", cardId)
        .select()
        .single();

      if (error) throw new DatabaseError("Failed to update card", error);
      if (!data) throw new NotFoundError("Card not found");
      
      return data;
    } catch (error) {
      if (error instanceof NotFoundError || error instanceof DatabaseError) throw error;
      throw new DatabaseError("Unexpected error updating card", error);
    }
  }

  async deleteCard(cardId) {
    try {
      const { error } = await supabase
        .from("kanban_cards")
        .delete()
        .eq("id", cardId);

      if (error) throw new DatabaseError("Failed to delete card", error);
      return true;
    } catch (error) {
      if (error instanceof DatabaseError) throw error;
      throw new DatabaseError("Unexpected error deleting card", error);
    }
  }

  async moveCard(cardId, newColumnId, newPosition) {
    try {
      // Shift cards in the target column to make room
      const { data: targetCards } = await supabase
        .from("kanban_cards")
        .select("id, position")
        .eq("column_id", newColumnId)
        .gte("position", newPosition)
        .order("position", { ascending: false });

      if (targetCards && targetCards.length > 0) {
        for (const card of targetCards) {
          await supabase
            .from("kanban_cards")
            .update({ position: card.position + 1 })
            .eq("id", card.id);
        }
      }

      // Move the card
      const { data, error } = await supabase
        .from("kanban_cards")
        .update({
          column_id: newColumnId,
          position: newPosition
        })
        .eq("id", cardId)
        .select()
        .single();

      if (error) throw new DatabaseError("Failed to move card", error);
      if (!data) throw new NotFoundError("Card not found");
      return data;
    } catch (error) {
      if (error instanceof NotFoundError || error instanceof DatabaseError) throw error;
      throw new DatabaseError("Unexpected error moving card", error);
    }
  }

  async reorderCards(columnId, cardId, newPosition) {
    try {
      // Get current card info (use card ID only to find actual column)
      const { data: current, error: fetchError } = await supabase
        .from("kanban_cards")
        .select("position, column_id")
        .eq("id", cardId)
        .single();

      if (fetchError || !current) throw new NotFoundError("Card not found");

      // Use the card's actual column_id
      const actualColumnId = current.column_id;
      const oldPosition = current.position;

      if (oldPosition === newPosition) return current;

      // Shift cards between old and new positions
      if (newPosition < oldPosition) {
        const { data: toShift } = await supabase
          .from("kanban_cards")
          .select("id, position")
          .eq("column_id", actualColumnId)
          .neq("id", cardId)
          .gte("position", newPosition)
          .lt("position", oldPosition)
          .order("position", { ascending: false });

        if (toShift) {
          for (const card of toShift) {
            await supabase
              .from("kanban_cards")
              .update({ position: card.position + 1 })
              .eq("id", card.id);
          }
        }
      } else {
        const { data: toShift } = await supabase
          .from("kanban_cards")
          .select("id, position")
          .eq("column_id", actualColumnId)
          .neq("id", cardId)
          .gt("position", oldPosition)
          .lte("position", newPosition)
          .order("position", { ascending: true });

        if (toShift) {
          for (const card of toShift) {
            await supabase
              .from("kanban_cards")
              .update({ position: card.position - 1 })
              .eq("id", card.id);
          }
        }
      }

      // Set target card to new position
      const { data, error } = await supabase
        .from("kanban_cards")
        .update({ position: newPosition })
        .eq("id", cardId)
        .select()
        .single();

      if (error) throw new DatabaseError("Failed to reorder cards", error);
      return data;
    } catch (error) {
      if (error instanceof NotFoundError || error instanceof DatabaseError) throw error;
      throw new DatabaseError("Unexpected error reordering cards", error);
    }
  }
}

module.exports = new KanbanRepository();