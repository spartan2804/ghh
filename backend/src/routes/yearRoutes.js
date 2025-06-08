const express = require('express');
const router = express.Router();
const yearController = require('../controllers/yearController');

// Get all years, optionally filtered by module_id
router.get('/', async (req, res) => {
  if (req.query.module_id) {
    try {
      const module_id = req.query.module_id;
      const [rows] = await require('../config/db').pool.query('SELECT * FROM yrs WHERE module_id = ?', [module_id]);
      return res.json(rows);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }
  yearController.getYears(req, res);
});

router.get('/:module_id', yearController.getYearByModuleId);
router.post('/:module_id', yearController.createYear);
router.put('/:id', yearController.updateYear);
router.delete('/:id', yearController.deleteYear);

module.exports = router;
