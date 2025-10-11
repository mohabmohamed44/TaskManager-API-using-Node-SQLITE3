const sqlite3 = require("sqlite3").verbose();
// console is a global object in Node.js
const path = require("path");

class Database {
  constructor() {
    this.db = null;
  }

  connect() {
    return new Promise((resolve, reject) => {
      this.db = new sqlite3.Database(
        path.join(__dirname, "../../tasks.db"),
        (err) => {
          if (err) {
            console.error("Database Connection failed:", err.message);
            reject(err);
          } else {
            console.log("connected Successfully");
            this.initialize();
            resolve(this.db);
          }
        },
      );
    });
  }

  initialize() {
    this.db.serialize(() => {
      this.db.run(`
        CREATE TABLE IF NOT EXISTS tasks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL UNIQUE,
        description TEXT,
        completed BOOLEAN DEFAULT 0
      )`);
    });
  }

  getConnection() {
    return this.db;
  }
}

module.exports = new Database();
