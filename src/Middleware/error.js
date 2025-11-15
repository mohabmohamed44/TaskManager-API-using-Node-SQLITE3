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

module.exports = { AppError };