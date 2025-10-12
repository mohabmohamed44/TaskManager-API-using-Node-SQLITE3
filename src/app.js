const express = require("express");
const cors = require("cors");
const errorHandler = require("./Middleware/errorHandler");
const taskRoutes = require("./routes/taskRoutes");

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Cors setup
const corsOptions = {
  origin: true, // Allow all origins for development
  credentials: true,
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));

app.use("/", taskRoutes);
app.use(errorHandler);

module.exports = app;
