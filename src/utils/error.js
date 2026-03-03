class AppError extends Error {
  /**
   * @param {string} message - The error message.
   * @param {number} statusCode - The HTTP status code.
   */
  constructor(message, statusCode) {
    super(message);

    this.statusCode = statusCode;
    this.isOperational = true; // Flag to identify our custom errors

    Error.captureStackTrace(this, this.constructor);
  }
}


class ValidationError extends AppError {
  constructor(message, details = null) {
    super(message, 400);
    this.details = details;
  }
}

class NotFoundError extends AppError {
  constructor(message = "Resource not found") {
    super(message, 404);
  }
}

class UnauthorizedError extends AppError {
  constructor(message = "Unauthorized") {
    super(message, 401);
  }
}

class ForbiddenError extends AppError {
  constructor(message = "Forbidden") {
    super(message, 403);
  }
}

class ConflictError extends AppError {
  constructor(message = "Conflict") {
    super(message, 409);
  }
}

class InternalServerError extends AppError {
  constructor(message = "Internal Server Error") {
    super(message, 500);
  }
}

class DatabaseError extends AppError {
  constructor(message = "Database Error", details = null) {
    super(message, 500);
    this.details = details;
  }
}

class RateLimiterError extends AppError {
  constructor(message = "Too many requests") {
    super(message, 429);
  }
}

module.exports = { AppError, ValidationError, NotFoundError, UnauthorizedError, ForbiddenError, ConflictError, InternalServerError, DatabaseError, RateLimiterError };