const blackListedToken = new Set();

module.exports = {
    add: (token) => blackListedToken.add(token),
    has: (token) => blackListedToken.has(token),
    remove: (token) => blackListedToken.delete(token),
}