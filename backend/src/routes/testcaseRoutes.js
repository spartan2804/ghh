// testcaseRoutes.js - Testcase routes placeholder 
const express = require('express');
const router = express.Router();
const testcaseController = require('../controllers/testcaseController');
const upload = require('../config/multer');
const parseFields = require('../middleware/parseFields');

// Get all testcases, optionally filtered by feature_id
router.get('/', testcaseController.getTestcases);
router.get('/:id', testcaseController.getTestcaseById);
router.post('/',  upload.single('file'), testcaseController.createTestcase);
router.put('/:id', testcaseController.updateTestcase);
router.delete('/:id', testcaseController.deleteTestcase);

// Import testcases (bulk import)
router.post('/import', testcaseController.importTestcasesFromPreviousYear);

// Download testcase file
router.get('/:id/download', testcaseController.downloadTestcaseFile);

module.exports = router; 