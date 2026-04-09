const pool = require('../config/database');

class User {
  static async findById(id) {
    const result = await pool.query(
      'SELECT id, email, created_at, updated_at FROM users WHERE id = $1',
      [id]
    );
    return result.rows[0];
  }

  static async findByEmail(email) {
    const result = await pool.query(
      'SELECT id, email, password, created_at, updated_at FROM users WHERE email = $1',
      [email]
    );
    return result.rows[0];
  }

  static async create(userData) {
    const { email, password } = userData;
    const result = await pool.query(
      'INSERT INTO users (email, password) VALUES ($1, $2) RETURNING id, email, created_at',
      [email, password]
    );
    return result.rows[0];
  }

  static async getStats(userId) {
    const queries = await pool.query(
      'SELECT COUNT(*) as total_queries FROM data_queries WHERE user_id = $1',
      [userId]
    );

    const datasets = await pool.query(
      'SELECT COUNT(*) as total_datasets, SUM(file_size) as total_storage FROM datasets WHERE user_id = $1',
      [userId]
    );

    const insights = await pool.query(
      'SELECT COUNT(*) as total_insights FROM ai_insights WHERE user_id = $1',
      [userId]
    );

    return {
      totalQueries: parseInt(queries.rows[0].total_queries),
      totalDatasets: parseInt(datasets.rows[0].total_datasets),
      totalStorage: parseInt(datasets.rows[0].total_storage) || 0,
      totalInsights: parseInt(insights.rows[0].total_insights)
    };
  }
}

module.exports = User;
