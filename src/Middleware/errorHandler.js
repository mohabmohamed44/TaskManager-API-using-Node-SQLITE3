const errorHandler = (err, req, res, next) => {
  console.error(err);

  if (err.status) {
    return res.status(err.status).json({ error: err.message });
  }

  // handle Database errors
  if (err.code === "SQLITE_CONSTRAINT") {
    return res.status(409).json({ error: "Duplicate entry" });
  }

  // handle other errors
  if (err.code === "SQLITE_ERROR") {
    return res.status(500).json({ error: "Internal Server Error" });
  }

  res.status(500).json({
    error: "Internal Server Error",
  });
};

module.exports = errorHandler;
