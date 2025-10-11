const app = require("./src/app");
const database = require("./src/config/database");

const PORT = process.env.PORT || 3000;

// Connect to database and start server
database
  .connect()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`🚀 Server listening on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Failed to start server:", err);
    process.exit(1);
  });
