// featureRoutes.js - Feature routes placeholder 
const express = require('express');
const router = express.Router();
const featureController = require('../controllers/featureController');

// Get all features, optionally filtered by year_id
router.get('/', async (req, res) => {
  if (req.query.year_id) {
    try {
      const year_id = req.query.year_id;
      const [rows] = await require('../config/db').pool.query('SELECT * FROM features WHERE year_id = ?', [year_id]);
      return res.json(rows);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }
  featureController.getFeatures(req, res);
});

router.get('/:year_id', featureController.getFeaturesByYearId);
router.post('/:year_id', featureController.createFeature);
router.put('/:id', featureController.updateFeature);
router.delete('/:id', featureController.deleteFeature);

module.exports = router; 