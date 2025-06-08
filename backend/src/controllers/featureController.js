const { pool } = require('../config/db');

// Create a new feature
exports.createFeature = async (req, res) => {
  try {
    const { year_id } = req.params;
    const { feature_name } = req.body;
    if (!feature_name || !year_id) return res.status(400).json({ error: 'feature_name and year_id are required' });
    const [result] = await pool.query('INSERT INTO features (feature_name, year_id) VALUES (?, ?)', [feature_name, year_id]);
    res.status(201).json({ feature_id: result.insertId, feature_name, year_id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get all features
exports.getFeatures = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM features');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get feature by ID
exports.getFeaturesByYearId = async (req, res) => {
  try {
    const { year_id } = req.params;
    const [rows] = await pool.query('SELECT * FROM features WHERE year_id = ?', [year_id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Feature not found' });
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update feature
exports.updateFeature = async (req, res) => {
  try {
    const { id } = req.params;
    const { feature_name, year_id } = req.body;
    const [result] = await pool.query('UPDATE features SET feature_name = ?, year_id = ? WHERE feature_id = ?', [feature_name, year_id, id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Feature not found' });
    res.json({ message: 'Feature updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete feature
exports.deleteFeature = async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await pool.query('DELETE FROM features WHERE feature_id = ?', [id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Feature not found' });
    res.json({ message: 'Feature deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}; 