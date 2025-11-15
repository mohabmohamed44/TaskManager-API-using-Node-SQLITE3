// const sqlite3 = require("sqlite3").verbose();
// const path = require("path");

// class Database {
//   constructor() {
//     this.db = null;
//   }

//   connect() {
//     return new Promise((resolve, reject) => {
//       this.db = new sqlite3.Database(
//         path.join(__dirname, "../../tasks.db"),
//         (err) => {
//           if (err) {
//             console.error("Database Connection failed:", err.message);
//             reject(err);
//           } else {
//             console.log("connected Successfully");
//             this.initialize();
//             resolve(this.db);
//           }
//         },
//       );
//     });
//   }

//   initialize() {
//     this.db.serialize(() => {
//       this.db.run(`
//         CREATE TABLE IF NOT EXISTS tasks (
//         id INTEGER PRIMARY KEY AUTOINCREMENT,
//         title TEXT NOT NULL UNIQUE,
//         description TEXT,
//         completed BOOLEAN DEFAULT 0
//       )`);
//     });
//   }

//   getConnection() {
//     return this.db;
//   }
// }

// module.exports = new Database();
//
//
const sqlite3 = require("sqlite3").verbose();
const path = require("path");

class Database {
  constructor() {
    this.db = null;
  }

  connect() {
    return new Promise((resolve, reject) => {
      const dbPath =
        process.env.DB_PATH || path.join(process.cwd(), "tasks.db");

      this.db = new sqlite3.Database(dbPath, (err) => {
        if (err) {
          console.error("❌ Database connection failed:", err.message);
          reject(err);
        } else {
          console.log("✅ Connected to SQLite database at:", dbPath);
          this.initialize();
          resolve(this.db);
        }
      });
    });
  }

  initialize() {
    this.db.serialize(() => {
      // Users table
      this.db.run(`
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          email TEXT NOT NULL UNIQUE,
          password TEXT NOT NULL,
          name TEXT,
          role TEXT DEFAULT 'user',
          createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
          updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Refresh Tokens table
      this.db.run(`
        CREATE TABLE IF NOT EXISTS refresh_tokens (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          userId INTEGER NOT NULL,
          token TEXT NOT NULL UNIQUE,
          expiresAt DATETIME NOT NULL,
          createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
        )
      `);

      // Token Blacklist table (for logout functionality)
      this.db.run(`
        CREATE TABLE IF NOT EXISTS token_blacklist (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          token TEXT NOT NULL UNIQUE,
          userId INTEGER NOT NULL,
          expiresAt DATETIME NOT NULL,
          createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
        )
      `);

      // Tasks table
      this.db.run(`
        CREATE TABLE IF NOT EXISTS tasks (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          userId INTEGER NOT NULL,
          title TEXT NOT NULL,
          description TEXT,
          completed BOOLEAN DEFAULT 0,
          priority TEXT DEFAULT 'medium',
          category TEXT DEFAULT 'general',
          dueDate DATETIME,
          isDeleted BOOLEAN DEFAULT 0,
          deletedAt DATETIME,
          createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
          updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
        )
      `);

      // Tags table
      this.db.run(`
        CREATE TABLE IF NOT EXISTS tags (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL UNIQUE,
          color TEXT DEFAULT '#3B82F6',
          createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Task Tags junction table
      this.db.run(`
        CREATE TABLE IF NOT EXISTS task_tags (
          taskId INTEGER NOT NULL,
          tagId INTEGER NOT NULL,
          PRIMARY KEY (taskId, tagId),
          FOREIGN KEY (taskId) REFERENCES tasks(id) ON DELETE CASCADE,
          FOREIGN KEY (tagId) REFERENCES tags(id) ON DELETE CASCADE
        )
      `);

      // Subtasks table
      this.db.run(`
        CREATE TABLE IF NOT EXISTS subtasks (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          taskId INTEGER NOT NULL,
          text TEXT NOT NULL,
          completed BOOLEAN DEFAULT 0,
          position INTEGER DEFAULT 0,
          createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (taskId) REFERENCES tasks(id) ON DELETE CASCADE
        )
      `);

      // Comments table
      this.db.run(`
        CREATE TABLE IF NOT EXISTS comments (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          taskId INTEGER NOT NULL,
          userId INTEGER NOT NULL,
          text TEXT NOT NULL,
          createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (taskId) REFERENCES tasks(id) ON DELETE CASCADE,
          FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
        )
      `);

      // Attachments table
      this.db.run(`
        CREATE TABLE IF NOT EXISTS attachments (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          taskId INTEGER NOT NULL,
          fileName TEXT NOT NULL,
          filePath TEXT NOT NULL,
          fileSize INTEGER,
          mimeType TEXT,
          createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (taskId) REFERENCES tasks(id) ON DELETE CASCADE
        )
      `);

      // Task History table
      this.db.run(`
        CREATE TABLE IF NOT EXISTS task_history (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          taskId INTEGER NOT NULL,
          userId INTEGER NOT NULL,
          action TEXT NOT NULL,
          field TEXT,
          oldValue TEXT,
          newValue TEXT,
          createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (taskId) REFERENCES tasks(id) ON DELETE CASCADE,
          FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
        )
      `);

      // Task Sharing table
      this.db.run(`
        CREATE TABLE IF NOT EXISTS task_sharing (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          taskId INTEGER NOT NULL,
          ownerId INTEGER NOT NULL,
          sharedWithId INTEGER NOT NULL,
          permission TEXT DEFAULT 'view',
          createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (taskId) REFERENCES tasks(id) ON DELETE CASCADE,
          FOREIGN KEY (ownerId) REFERENCES users(id) ON DELETE CASCADE,
          FOREIGN KEY (sharedWithId) REFERENCES users(id) ON DELETE CASCADE
        )
      `);

      // Templates table
      this.db.run(`
        CREATE TABLE IF NOT EXISTS templates (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          userId INTEGER NOT NULL,
          name TEXT NOT NULL,
          title TEXT NOT NULL,
          description TEXT,
          priority TEXT DEFAULT 'medium',
          category TEXT DEFAULT 'general',
          createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
        )
      `);

      // Reminders table
      this.db.run(`
        CREATE TABLE IF NOT EXISTS reminders (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          taskId INTEGER NOT NULL,
          reminderDate DATETIME NOT NULL,
          type TEXT DEFAULT 'email',
          sent BOOLEAN DEFAULT 0,
          createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (taskId) REFERENCES tasks(id) ON DELETE CASCADE
        )
      `);

      // Task Dependencies table
      this.db.run(`
        CREATE TABLE IF NOT EXISTS task_dependencies (
          taskId INTEGER NOT NULL,
          dependsOnTaskId INTEGER NOT NULL,
          PRIMARY KEY (taskId, dependsOnTaskId),
          FOREIGN KEY (taskId) REFERENCES tasks(id) ON DELETE CASCADE,
          FOREIGN KEY (dependsOnTaskId) REFERENCES tasks(id) ON DELETE CASCADE
        )
      `);

      // Recurring Tasks table
      this.db.run(`
        CREATE TABLE IF NOT EXISTS recurring_tasks (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          taskId INTEGER NOT NULL,
          frequency TEXT NOT NULL,
          interval INTEGER DEFAULT 1,
          daysOfWeek TEXT,
          endDate DATETIME,
          lastGenerated DATETIME,
          createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (taskId) REFERENCES tasks(id) ON DELETE CASCADE
        )
      `);

      console.log("✅ Database tables initialized");
    });
  }

  getConnection() {
    return this.db;
  }

  run(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.run(sql, params, function (err) {
        if (err) reject(err);
        else resolve(this);
      });
    });
  }

  get(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.get(sql, params, (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  }

  all(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.all(sql, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }
}

module.exports = new Database();
