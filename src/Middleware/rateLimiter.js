const rateLimit = require("express-rate-limit");

const generalLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: "Too many requests from this IP, please try again later",
  standardHeaders: true,
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: "Too many authentication attempts, please try again later",
  skipSuccessfulRequests: true,
});

const createLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: "Too many create requests, please slow down",
});

module.exports = {
  generalLimiter,
  authLimiter,
  createLimiter,
};
