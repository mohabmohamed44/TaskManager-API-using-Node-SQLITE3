const database = require("../config/database");

class TaskRepository {
  getAll() {
    return new Promise((resolve, reject) => {
      const db = database.getConnection();
      db.all("SELECT * FROM tasks", (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  getById(id) {
    return new Promise((resolve, reject) => {
      const db = database.getConnection();
      db.get("SELECT * FROM tasks WHERE id = ?", [id], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  }

  create(task) {
    return new Promise((resolve, reject) => {
      const db = database.getConnection();
      const { title, description, completed } = task;

      db.run(
        "INSERT INTO tasks (title, description, completed) VALUES (?, ?, ?)",
        [title, description || "", completed ? 1 : 0],
        function (err) {
          if (err) reject(err);
          else
            resolve({
              id: this.lastID,
              title,
              description: description || "",
              completed: completed ? 1 : 0,
            });
        },
      );
    });
  }

  update(id, task) {
    return new Promise((resolve, reject) => {
      const db = database.getConnection();
      const { title, description, completed } = task;

      db.run(
        "UPDATE tasks SET title = ?, description = ?, completed = ? WHERE id = ?",
        [title, description, completed ? 1 : 0, id],
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
      db.run("DELETE FROM tasks WHERE id = ?", [id], function (err) {
        if (err) reject(err);
        else resolve(this.changes > 0);
      });
    });
  }
}

module.exports = new TaskRepository();
