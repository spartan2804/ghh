// moduleRoutes.js - Module routes placeholder 
const express = require('express');
const router = express.Router();
const moduleController = require('../controllers/moduleController');

router.get('/', moduleController.getModules);
router.get('/:id', moduleController.getModuleById);
router.post('/', moduleController.createModule);
router.put('/:id', moduleController.updateModule);
router.delete('/:id', moduleController.deleteModule);

module.exports = router; 