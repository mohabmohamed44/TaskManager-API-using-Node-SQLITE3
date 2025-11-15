const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const compression = require("compression");

const authRoutes = require("./routes/authRoutes");
const taskRoutes = require("./routes/taskRoutes");
const subtaskRoutes = require("./routes/subtaskRoutes");
const commentRoutes = require("./routes/commentRoutes");
const tagRoutes = require("./routes/tagRoutes");
const attachmentRoutes = require("./routes/attachmentRoutes");
const templateRoutes = require("./routes/templateRoutes");
const sharingRoutes = require("./routes/sharingRoutes");
const historyRoutes = require("./routes/historyRoutes");

const { errorHandler, notFound } = require("./Middleware/errorHandler");
const { generalLimiter } = require("./Middleware/rateLimiter");

const app = express();

// Security middleware
app.use(helmet());

// CORS setup
const corsOptions = {
  origin: process.env.CORS_ORIGIN || "http://localhost:3000",
  credentials: true,
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));

// Request logging
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Compression middleware
app.use(compression());

// Rate limiting
app.use(generalLimiter);

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
  });
});

// API Routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/tasks", taskRoutes);
app.use("/api/v1/tasks", subtaskRoutes);
app.use("/api/v1/tasks", commentRoutes);
app.use("/api/v1/tags", tagRoutes);
app.use("/api/v1/tasks", attachmentRoutes);
app.use("/api/v1/templates", templateRoutes);
app.use("/api/v1/tasks", sharingRoutes);
app.use("/api/v1/tasks", historyRoutes);

// 404 handler
app.use(notFound);

// Error handling middleware (must be last)
app.use(errorHandler);

module.exports = app;
