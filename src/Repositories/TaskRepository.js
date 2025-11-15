const database = require("../config/database");

class TaskRepository {
  getAll() {
    return new Promise((resolve, reject) => {
      const db = database.getConnection();
      db.all("SELECT * FROM tasks WHERE isDeleted = 0", (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  getById(id) {
    return new Promise((resolve, reject) => {
      const db = database.getConnection();
      db.get(
        "SELECT * FROM tasks WHERE id = ? AND isDeleted = 0",
        [id],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        },
      );
    });
  }

  create(task) {
    return new Promise((resolve, reject) => {
      const db = database.getConnection();
      const {
        userId,
        title,
        description,
        completed,
        priority,
        category,
        dueDate,
      } = task;

      db.run(
        `INSERT INTO tasks (userId, title, description, completed, priority, category, dueDate, createdAt, updatedAt)
         VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
        [
          userId,
          title,
          description || "",
          completed ? 1 : 0,
          priority || "medium",
          category || "general",
          dueDate,
        ],
        function (err) {
          if (err) reject(err);
          else {
            // Fetch the created task
            db.get(
              "SELECT * FROM tasks WHERE id = ?",
              [this.lastID],
              (err, row) => {
                if (err) reject(err);
                else resolve(row);
              },
            );
          }
        },
      );
    });
  }

  update(id, task) {
    return new Promise((resolve, reject) => {
      const db = database.getConnection();
      const { title, description, completed, priority, category, dueDate } =
        task;

      db.run(
        `UPDATE tasks SET title = ?, description = ?, completed = ?, priority = ?, category = ?, dueDate = ?, updatedAt = CURRENT_TIMESTAMP
         WHERE id = ? AND isDeleted = 0`,
        [
          title,
          description,
          completed ? 1 : 0,
          priority,
          category,
          dueDate,
          id,
        ],
        function (err) {
          if (err) reject(err);
          else if (this.changes === 0) resolve(null);
          else {
            // Fetch the updated task
            db.get("SELECT * FROM tasks WHERE id = ?", [id], (err, row) => {
              if (err) reject(err);
              else resolve(row);
            });
          }
        },
      );
    });
  }

  delete(id) {
    return new Promise((resolve, reject) => {
      const db = database.getConnection();
      // Soft delete - mark as deleted
      db.run(
        "UPDATE tasks SET isDeleted = 1, deletedAt = CURRENT_TIMESTAMP WHERE id = ? AND isDeleted = 0",
        [id],
        function (err) {
          if (err) reject(err);
          else resolve(this.changes > 0);
        },
      );
    });
  }

  getStatistics(userId) {
    return new Promise((resolve, reject) => {
      const db = database.getConnection();

      const queries = {
        total:
          "SELECT COUNT(*) as count FROM tasks WHERE userId = ? AND isDeleted = 0",
        completed:
          "SELECT COUNT(*) as count FROM tasks WHERE userId = ? AND completed = 1 AND isDeleted = 0",
        pending:
          "SELECT COUNT(*) as count FROM tasks WHERE userId = ? AND completed = 0 AND isDeleted = 0",
        overdue: `SELECT COUNT(*) as count FROM tasks WHERE userId = ? AND dueDate < datetime('now') AND completed = 0 AND isDeleted = 0`,
        byPriority: `SELECT priority, COUNT(*) as count FROM tasks WHERE userId = ? AND isDeleted = 0 GROUP BY priority`,
        byCategory: `SELECT category, COUNT(*) as count FROM tasks WHERE userId = ? AND isDeleted = 0 GROUP BY category`,
      };

      const stats = {};
      let completed = 0;
      const total = Object.keys(queries).length;

      Object.entries(queries).forEach(([key, query]) => {
        if (key === "byPriority" || key === "byCategory") {
          db.all(query, [userId], (err, rows) => {
            if (err) {
              reject(err);
              return;
            }
            stats[key] = rows;
            completed++;
            if (completed === total) resolve(stats);
          });
        } else {
          db.get(query, [userId], (err, row) => {
            if (err) {
              reject(err);
              return;
            }
            stats[key] = row.count;
            completed++;
            if (completed === total) resolve(stats);
          });
        }
      });
    });
  }

  search(query, userId) {
    return new Promise((resolve, reject) => {
      const db = database.getConnection();
      const {
        q,
        completed,
        priority,
        category,
        sortBy = "createdAt",
        sortOrder = "DESC",
      } = query;

      let sql = "SELECT * FROM tasks WHERE userId = ? AND isDeleted = 0";
      const params = [userId];

      if (q) {
        sql += " AND (title LIKE ? OR description LIKE ?)";
        params.push(`%${q}%`, `%${q}%`);
      }

      if (completed !== undefined) {
        sql += " AND completed = ?";
        params.push(completed === "true" ? 1 : 0);
      }

      if (priority) {
        sql += " AND priority = ?";
        params.push(priority);
      }

      if (category) {
        sql += " AND category = ?";
        params.push(category);
      }

      sql += ` ORDER BY ${sortBy} ${sortOrder}`;

      db.all(sql, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  getShared(userId) {
    return new Promise((resolve, reject) => {
      const db = database.getConnection();
      const sql = `
        SELECT t.*, ts.permission, u.name as ownerName, u.email as ownerEmail
        FROM tasks t
        JOIN task_sharing ts ON t.id = ts.taskId
        JOIN users u ON ts.ownerId = u.id
        WHERE ts.sharedWithId = ? AND t.isDeleted = 0
        ORDER BY t.createdAt DESC
      `;

      db.all(sql, [userId], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  getTrash(userId) {
    return new Promise((resolve, reject) => {
      const db = database.getConnection();
      db.all(
        "SELECT * FROM tasks WHERE userId = ? AND isDeleted = 1 ORDER BY deletedAt DESC",
        [userId],
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        },
      );
    });
  }

  restore(id, userId) {
    return new Promise((resolve, reject) => {
      const db = database.getConnection();
      db.run(
        "UPDATE tasks SET isDeleted = 0, deletedAt = NULL, updatedAt = CURRENT_TIMESTAMP WHERE id = ? AND userId = ? AND isDeleted = 1",
        [id, userId],
        function (err) {
          if (err) reject(err);
          else if (this.changes === 0) resolve(null);
          else {
            // Fetch the restored task
            db.get("SELECT * FROM tasks WHERE id = ?", [id], (err, row) => {
              if (err) reject(err);
              else resolve(row);
            });
          }
        },
      );
    });
  }

  permanentDelete(id, userId) {
    return new Promise((resolve, reject) => {
      const db = database.getConnection();
      db.run(
        "DELETE FROM tasks WHERE id = ? AND userId = ? AND isDeleted = 1",
        [id, userId],
        function (err) {
          if (err) reject(err);
          else resolve(this.changes > 0);
        },
      );
    });
  }

  bulkUpdate(taskIds, updates, userId) {
    return new Promise((resolve, reject) => {
      const db = database.getConnection();
      const placeholders = taskIds.map(() => "?").join(",");
      const setClauses = [];
      const params = [];

      // Build SET clauses based on updates
      if (updates.completed !== undefined) {
        setClauses.push("completed = ?");
        params.push(updates.completed ? 1 : 0);
      }
      if (updates.priority) {
        setClauses.push("priority = ?");
        params.push(updates.priority);
      }
      if (updates.category) {
        setClauses.push("category = ?");
        params.push(updates.category);
      }
      if (updates.dueDate !== undefined) {
        setClauses.push("dueDate = ?");
        params.push(updates.dueDate);
      }

      if (setClauses.length === 0) {
        resolve({ updated: 0, message: "No valid updates provided" });
        return;
      }

      setClauses.push("updatedAt = CURRENT_TIMESTAMP");
      params.push(...taskIds, userId);

      const sql = `
        UPDATE tasks
        SET ${setClauses.join(", ")}
        WHERE id IN (${placeholders}) AND userId = ? AND isDeleted = 0
      `;

      db.run(sql, params, function (err) {
        if (err) reject(err);
        else
          resolve({
            updated: this.changes,
            message: `${this.changes} tasks updated`,
          });
      });
    });
  }

  bulkDelete(taskIds, userId) {
    return new Promise((resolve, reject) => {
      const db = database.getConnection();
      const placeholders = taskIds.map(() => "?").join(",");
      const params = [...taskIds, userId];

      const sql = `
        UPDATE tasks
        SET isDeleted = 1, deletedAt = CURRENT_TIMESTAMP
        WHERE id IN (${placeholders}) AND userId = ? AND isDeleted = 0
      `;

      db.run(sql, params, function (err) {
        if (err) reject(err);
        else
          resolve({
            deleted: this.changes,
            message: `${this.changes} tasks moved to trash`,
          });
      });
    });
  }

  // Additional helper methods for user-specific queries
  getAllByUser(userId) {
    return new Promise((resolve, reject) => {
      const db = database.getConnection();
      db.all(
        "SELECT * FROM tasks WHERE userId = ? AND isDeleted = 0 ORDER BY createdAt DESC",
        [userId],
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        },
      );
    });
  }

  getByIdAndUser(id, userId) {
    return new Promise((resolve, reject) => {
      const db = database.getConnection();
      db.get(
        "SELECT * FROM tasks WHERE id = ? AND userId = ? AND isDeleted = 0",
        [id, userId],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        },
      );
    });
  }
}

module.exports = new TaskRepository();
