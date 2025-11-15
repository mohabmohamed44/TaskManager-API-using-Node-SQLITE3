require("dotenv").config();
const app = require("./src/app");
const database = require("./src/config/database");
const cronJobs = require("./src/config/cronJobs");

const PORT = process.env.PORT || 3000;

// Graceful shutdown handler
const gracefulShutdown = () => {
  console.log("\n🛑 Shutting down gracefully...");
  process.exit(0);
};

process.on("SIGTERM", gracefulShutdown);
process.on("SIGINT", gracefulShutdown);

// Connect to database and start server
database
  .connect()
  .then(() => {
    // Start cron jobs
    cronJobs.start();

    app.listen(PORT, () => {
      console.log(`🚀 Server listening on http://localhost:${PORT}`);
      console.log(`📝 Environment: ${process.env.NODE_ENV || "development"}`);
      console.log(`📊 API v1: http://localhost:${PORT}/api/v1`);
      console.log(`💚 Health check: http://localhost:${PORT}/health`);
    });
  })
  .catch((err) => {
    console.error("❌ Failed to start server:", err);
    process.exit(1);
  });