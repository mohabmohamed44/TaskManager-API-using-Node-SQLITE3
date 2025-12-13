const { rateLimit, ipKeyGenerator } = require("express-rate-limit");

// Custom key generator using ipKeyGenerator helper to properly handle IPv6 addresses
// This prevents rate limit bypass for both IPv4 and IPv6 users
const keyGenerator = (request, _response) => {
  if (!request.ip) {
    console.error('Warning: request.ip is missing!');
    return request.socket.remoteAddress || 'unknown';
  }
  // Use ipKeyGenerator to properly handle IPv6 subnet masking
  // This also strips port numbers from IP addresses
  return ipKeyGenerator(request.ip);
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
