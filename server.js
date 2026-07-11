require("dotenv").config();
const app = require("./src/app");
const cronJobs = require("./src/config/cronJobs");
const supabase = require("./src/config/database");

// IISNode passes a dynamic port or a Named Pipe string on production.
// Keeping fallback to 3000 for local development.
const PORT = process.env.PORT || 3000;

// Graceful shutdown handler
const gracefulShutdown = () => {
  console.log("\n🛑 Shutting down gracefully...");
  process.exit(0);
};

process.on("SIGTERM", gracefulShutdown);
process.on("SIGINT", gracefulShutdown);

// No DB connection needed — Supabase is HTTP API
(async () => {
  console.log("🔗 Supabase connection initialized:", !!supabase);

  // Start cron jobs (- must be rewritten to use Supabase queries)
  cronJobs.start();

  // Start Express server
  app.listen(PORT, () => {
    // Check if PORT is a standard number or a named pipe string from IIS
    const isNamedPipe = typeof PORT === 'string' && PORT.isNaN;
    
    console.log(`🚀 Server listening on: ${isNamedPipe ? PORT : `http://localhost:${PORT}`}`);
    console.log(`📝 Environment: ${process.env.NODE_ENV || "development"}`);
    
    if (!isNamedPipe) {
      console.log(`📊 API v1: http://localhost:${PORT}/api/v1`);
      console.log(`💚 Health check: http://localhost:${PORT}/health`);
    }
  });
})();
