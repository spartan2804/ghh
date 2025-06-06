// db.js - Database configuration placeholder 

const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '@Abcd1234', // update as needed
  database: 'testcase_manager', // update as needed
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

async function initDB() {
  const conn = await pool.getConnection();
  try {
    await conn.query(`
      CREATE TABLE IF NOT EXISTS modules (
        module_id INT AUTO_INCREMENT PRIMARY KEY,
        module_name VARCHAR(255) NOT NULL
      );
    `);
    await conn.query(`
      CREATE TABLE IF NOT EXISTS yrs (
        year_id INT AUTO_INCREMENT PRIMARY KEY,
        year_name VARCHAR(255) NOT NULL,
        module_id INT,
        FOREIGN KEY (module_id) REFERENCES modules(module_id) ON DELETE CASCADE
      );
    `);
    await conn.query(`
      CREATE TABLE IF NOT EXISTS features (
        feature_id INT AUTO_INCREMENT PRIMARY KEY,
        feature_name VARCHAR(255) NOT NULL,
        year_id INT,
        FOREIGN KEY (year_id) REFERENCES yrs(year_id) ON DELETE CASCADE
      );
    `);
    await conn.query(`
      CREATE TABLE IF NOT EXISTS testcases (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        file_path VARCHAR(1000) NOT NULL,
        feature_id INT NOT NULL,
        copied_from_year INT DEFAULT NULL,
        copied_from_TC_id INT DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (feature_id) REFERENCES features(feature_id) ON DELETE CASCADE
      );
    `);
    console.log('All tables created or already exist.');
  } finally {
    conn.release();
  }
}

module.exports = { pool, initDB }; 