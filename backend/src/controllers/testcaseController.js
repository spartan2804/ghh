// testcaseController.js - Testcase controller logic placeholder 

const { pool } = require('../config/db');
const path = require('path');
const fs = require('fs');

// Create a new testcase
exports.createTestcase = async (req, res) => {
  try {
    const { name, description, feature_id, copied_from_year, copied_from_TC_id ,module_id,feature_name , year_name} = req.body;
    if (!name || !feature_id || !req.file) return res.status(400).json({ error: 'name, file, and feature_id are required' });
    // file_path relative to /uploads
    const absUploads = path.resolve(__dirname, '../../uploads');
    const file_path = path.relative(absUploads, req.file.path).replace(/\\/g, '/');
    const [result] = await pool.query(
      'INSERT INTO testcases (name, description, file_path, feature_id, copied_from_year, copied_from_TC_id) VALUES (?, ?, ?, ?, ?, ?)',
      [name, description, file_path, feature_id, copied_from_year, copied_from_TC_id]
    );
    res.status(201).json({ id: result.insertId, name, description, file_path, feature_id, copied_from_year, copied_from_TC_id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get all testcases (optionally by feature_id)
exports.getTestcases = async (req, res) => {
  try {
    const { feature_id } = req.query;
    let query = 'SELECT * FROM testcases';
    let params = [];
    if (feature_id) {
      query += ' WHERE feature_id = ?';
      params.push(feature_id);
    }
    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get testcase by ID
exports.getTestcaseById = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query('SELECT * FROM testcases WHERE id = ?', [id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Testcase not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update testcase
exports.updateTestcase = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, file_path, feature_id, copied_from_year, copied_from_TC_id } = req.body;
    const [result] = await pool.query(
      'UPDATE testcases SET name = ?, description = ?, file_path = ?, feature_id = ?, copied_from_year = ?, copied_from_TC_id = ? WHERE id = ?',
      [name, description, file_path, feature_id, copied_from_year, copied_from_TC_id, id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Testcase not found' });
    res.json({ message: 'Testcase updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete testcase
exports.deleteTestcase = async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await pool.query('DELETE FROM testcases WHERE id = ?', [id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Testcase not found' });
    res.json({ message: 'Testcase deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Download testcase file
exports.downloadTestcaseFile = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query('SELECT file_path FROM testcases WHERE id = ?', [id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Testcase not found' });
    const filePath = rows[0].file_path;
    const absPath = path.join(__dirname, '../../uploads', filePath);
    res.download(absPath, err => {
      if (err) res.status(404).json({ error: 'File not found' });
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Bulk upload testcases (stub)
exports.bulkUploadTestcases = async (req, res) => {
  // TODO: Implement bulk upload logic
  res.status(501).json({ error: 'Not implemented' });
};

// Import testcases from previous year (copy selected TCs to target feature)
exports.importTestcasesFromPreviousYear = async (req, res) => {
  try {
    const { testcase_ids, target_feature_id } = req.body;
    if (!Array.isArray(testcase_ids) || !target_feature_id) {
      return res.status(400).json({ error: 'testcase_ids (array) and target_feature_id are required' });
    }
    // Fetch selected TCs
    const [tcs] = await pool.query(
      `SELECT name, description, file_path, ? as feature_id, year_id as copied_from_year, id as copied_from_TC_id FROM testcases JOIN features ON testcases.feature_id = features.feature_id WHERE testcases.id IN (?)`,
      [target_feature_id, testcase_ids]
    );
    if (tcs.length === 0) return res.status(404).json({ error: 'No testcases found to import' });
    // Insert copies
    const values = tcs.map(tc => [tc.name, tc.description, tc.file_path, tc.feature_id, tc.copied_from_year, tc.copied_from_TC_id]);
    await pool.query(
      'INSERT INTO testcases (name, description, file_path, feature_id, copied_from_year, copied_from_TC_id) VALUES ?',[values]
    );
    res.json({ message: 'Testcases imported', count: tcs.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}; 