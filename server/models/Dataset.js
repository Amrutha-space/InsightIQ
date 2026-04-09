const pool = require('../config/database');

class Dataset {
  static async create(datasetData) {
    const {
      userId,
      name,
      description,
      fileName,
      filePath,
      fileSize,
      fileType,
      columnsInfo,
      rowCount
    } = datasetData;

    const result = await pool.query(
      `INSERT INTO datasets 
       (user_id, name, description, file_name, file_path, file_size, file_type, columns_info, row_count) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
       RETURNING *`,
      [userId, name, description, fileName, filePath, fileSize, fileType, columnsInfo, rowCount]
    );

    return result.rows[0];
  }

  static async findById(id) {
    const result = await pool.query(
      'SELECT * FROM datasets WHERE id = $1',
      [id]
    );
    return result.rows[0];
  }

  static async findByUserId(userId) {
    const result = await pool.query(
      'SELECT * FROM datasets WHERE user_id = $1 ORDER BY uploaded_at DESC',
      [userId]
    );
    return result.rows;
  }

  static async update(id, updateData) {
    const { name, description } = updateData;
    const result = await pool.query(
      'UPDATE datasets SET name = $1, description = $2 WHERE id = $3 RETURNING *',
      [name, description, id]
    );
    return result.rows[0];
  }

  static async delete(id) {
    const result = await pool.query(
      'DELETE FROM datasets WHERE id = $1 RETURNING *',
      [id]
    );
    return result.rows[0];
  }

  static async getStats(userId) {
    const result = await pool.query(
      `SELECT 
        COUNT(*) as total_datasets,
        SUM(row_count) as total_rows,
        SUM(file_size) as total_storage,
        AVG(row_count) as avg_rows_per_dataset
       FROM datasets 
       WHERE user_id = $1`,
      [userId]
    );

    return result.rows[0];
  }

  static async getRecentDatasets(userId, limit = 5) {
    const result = await pool.query(
      `SELECT id, name, file_name, row_count, uploaded_at
       FROM datasets 
       WHERE user_id = $1 
       ORDER BY uploaded_at DESC 
       LIMIT $2`,
      [userId, limit]
    );
    return result.rows;
  }
}

module.exports = Dataset;
