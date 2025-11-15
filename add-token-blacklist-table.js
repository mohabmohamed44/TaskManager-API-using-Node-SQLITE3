const sqlite3 = require("sqlite3").verbose();
const path = require("path");

// Database path
const dbPath = path.join(__dirname, "tasks.db");

console.log("🔄 Running migration to add token_blacklist table...");
console.log("📁 Database path:", dbPath);

// Connect to database
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error("❌ Failed to connect to database:", err.message);
    process.exit(1);
  }
  console.log("✅ Connected to database");
});

// Create token_blacklist table
db.run(
  `
  CREATE TABLE IF NOT EXISTS token_blacklist (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    token TEXT NOT NULL UNIQUE,
    userId INTEGER NOT NULL,
    expiresAt DATETIME NOT NULL,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
  )
`,
  (err) => {
    if (err) {
      console.error("❌ Failed to create token_blacklist table:", err.message);
      process.exit(1);
    }
    console.log("✅ token_blacklist table created successfully");

    // Verify table exists
    db.get(
      "SELECT name FROM sqlite_master WHERE type='table' AND name='token_blacklist'",
      (err, row) => {
        if (err) {
          console.error("❌ Error verifying table:", err.message);
        } else if (row) {
          console.log("✅ Verified: token_blacklist table exists");

          // Show table structure
          db.all("PRAGMA table_info(token_blacklist)", (err, rows) => {
            if (err) {
              console.error("❌ Error getting table info:", err.message);
            } else {
              console.log("\n📋 Table structure:");
              console.table(rows);
            }

            // Close database connection
            db.close((err) => {
              if (err) {
                console.error("❌ Error closing database:", err.message);
              } else {
                console.log("\n✅ Migration completed successfully!");
                console.log("\n🎉 You can now use logout functionality without errors.");
                console.log("\n💡 Restart your server to apply changes:");
                console.log("   npm start");
              }
            });
          });
        } else {
          console.error("❌ Table was not created");
          db.close();
        }
      }
    );
  }
);
