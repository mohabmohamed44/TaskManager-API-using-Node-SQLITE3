const errorHandler = (err, req, res, next) => {
  console.error("Error:", err);

  if (err.isOperational) {
    return res.status(err.statusCode).json({
      error: err.message,
      ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
    });
  }

  if (err.code === "SQLITE_CONSTRAINT") {
    return res.status(409).json({
      error: "Constraint violation: Duplicate entry or invalid data",
    });
  }

  if (err.name === "JsonWebTokenError") {
    return res.status(401).json({
      error: "Invalid authentication token",
    });
  }

  if (err.name === "TokenExpiredError") {
    return res.status(401).json({
      error: "Authentication token expired",
    });
  }

  if (err.name === "MulterError") {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        error: "File size too large",
      });
    }
    return res.status(400).json({
      error: err.message,
    });
  }

  res.status(500).json({
    error: "Internal Server Error",
    ...(process.env.NODE_ENV === "development" && { message: err.message }),
  });
};

const notFound = (req, res) => {
  res.status(404).json({
    error: "Route not found",
    path: req.originalUrl,
  });
};

module.exports = { errorHandler, notFound };
