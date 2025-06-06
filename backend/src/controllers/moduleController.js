const { pool } = require('../config/db');

// Create a new module
exports.createModule = async (req, res) => {
  try {
    const { module_name } = req.body;
    if (!module_name) return res.status(400).json({ error: 'module_name is required' });
    const [result] = await pool.query('INSERT INTO modules (module_name) VALUES (?)', [module_name]);
    res.status(201).json({ module_id: result.insertId, module_name });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get all modules
exports.getModules = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM modules');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get module by ID
exports.getModuleById = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query('SELECT * FROM modules WHERE module_id = ?', [id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Module not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update module
exports.updateModule = async (req, res) => {
  try {
    const { id } = req.params;
    const { module_name } = req.body;
    const [result] = await pool.query('UPDATE modules SET module_name = ? WHERE module_id = ?', [module_name, id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Module not found' });
    res.json({ message: 'Module updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete module
exports.deleteModule = async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await pool.query('DELETE FROM modules WHERE module_id = ?', [id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Module not found' });
    res.json({ message: 'Module deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}; 