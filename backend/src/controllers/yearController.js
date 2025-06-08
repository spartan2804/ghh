const { pool } = require('../config/db');

// Create a new year
exports.createYear = async (req, res) => {
  try {
    const { module_id } = req.params;
    const { year_name } = req.body;
    if (!year_name || !module_id) return res.status(400).json({ error: 'year_name and module_id are required' });
    const [result] = await pool.query('INSERT INTO yrs (year_name, module_id) VALUES (?, ?)', [year_name, module_id]);
    res.status(201).json({ year_id: result.insertId, year_name, module_id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get all years
exports.getYears = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM yrs');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get year by ID
exports.getYearByModuleId = async (req, res) => {
  try {
    const { module_id } = req.params;
    const [rows] = await pool.query('SELECT * FROM yrs WHERE module_id = ?', [module_id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Year not found' });
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update year
exports.updateYear = async (req, res) => {
  try {
    const { id } = req.params;
    const { year_name, module_id } = req.body;
    const [result] = await pool.query('UPDATE yrs SET year_name = ?, module_id = ? WHERE year_id = ?', [year_name, module_id, id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Year not found' });
    res.json({ message: 'Year updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete year
exports.deleteYear = async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await pool.query('DELETE FROM yrs WHERE year_id = ?', [id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Year not found' });
    res.json({ message: 'Year deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
