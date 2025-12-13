const rateLimit = require("express-rate-limit");

// Custom key generator to handle proxies that include port numbers in X-Forwarded-For
// This prevents rate limit bypass when source port changes
const keyGenerator = (request, _response) => {
  if (!request.ip) {
    console.error('Warning: request.ip is missing!');
    return request.socket.remoteAddress || 'unknown';
  }
  // Strip port number from IP address (e.g., "192.168.1.1:12345" -> "192.168.1.1")
  return request.ip.replace(/:\d+[^:]*$/, '');
};

const generalLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: "Too many requests from this IP, please try again later",
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator,
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: "Too many authentication attempts, please try again later",
  skipSuccessfulRequests: true,
  keyGenerator,
});

const createLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: "Too many create requests, please slow down",
  keyGenerator,
});

module.exports = {
  generalLimiter,
  authLimiter,
  createLimiter,
};
