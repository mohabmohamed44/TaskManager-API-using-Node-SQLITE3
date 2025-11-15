const database = require("../config/database");

class UserRepository {
  async create(user) {
    const { email, password, name, role } = user;
    const result = await database.run(
      "INSERT INTO users (email, password, name, role) VALUES (?, ?, ?, ?)",
      [email, password, name || null, role || "user"],
    );
    return this.getById(result.lastID);
  }

  async getById(id) {
    return await database.get(
      "SELECT id, email, name, role, createdAt, updatedAt FROM users WHERE id = ?",
      [id],
    );
  }

  async getByEmail(email) {
    return await database.get("SELECT * FROM users WHERE email = ?", [email]);
  }

  async getAll() {
    return await database.all(
      "SELECT id, email, name, role, createdAt FROM users",
    );
  }

  async update(id, user) {
    const { name, role } = user;
    await database.run(
      "UPDATE users SET name = ?, role = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?",
      [name, role, id],
    );
    return this.getById(id);
  }

  async delete(id) {
    const result = await database.run("DELETE FROM users WHERE id = ?", [id]);
    return result.changes > 0;
  }
}

module.exports = new UserRepository();
