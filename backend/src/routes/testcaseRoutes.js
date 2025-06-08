// testcaseRoutes.js - Testcase routes placeholder 
const express = require('express');
const router = express.Router();
const testcaseController = require('../controllers/testcaseController');
const upload = require('../config/multer');
const parseFields = require('../middleware/parseFields');

// Get all testcases, optionally filtered by feature_id
router.get('/', testcaseController.getTestcases);

// Get testcase by ID
router.get('/get-by-id/:id', testcaseController.getTestcaseById);

// Create testcase for a feature
router.post('/create/:feature_id', upload.single('file'), testcaseController.createTestcase);

// Bulk upload testcases
router.post('/bulk-upload', upload.array('files', 1000), testcaseController.bulkUploadTestcases);

// Update testcase by ID
router.put('/update/:id', upload.single('file'), testcaseController.updateTestcase);

// Delete testcase by ID
router.delete('/delete/:id', testcaseController.deleteTestcase);

// Import testcases (bulk import)
router.post('/import', testcaseController.importFeatures);

// Download testcase file by ID
router.get('/download/:id', testcaseController.downloadTestcaseFile);


// View testcase file content by file path
// Test this route >> 
// GET http://localhost:3000/api/testcases/view-by-path?filePath=Roman/2023/Faadu_Feature_X/tttt/1749350934531_email_scraper.txt
router.get('/view-by-path', testcaseController.viewTestcaseFileByPath);

// Save (edit) testcase file content by file path
// Test this route >>
// POST http://localhost:3000/api/testcases/save-by-path
// Body (JSON):
// {
//   "filePath": "Roman/2023/Faadu_Feature_X/tttt/1749350934531_email_scraper.txt",
//   "content": "Your new file content here"
// }
router.post('/save-by-path', testcaseController.saveTestcaseFileByPath);

// Download testcase file by file path
router.get('/download-by-path', testcaseController.downloadTestcaseFileByPath);

// Search testcases
router.get('/search', testcaseController.searchTestcases);


// Test log route
router.post('/test-log', (req, res) => { console.log(req.body); res.send('ok'); });

module.exports = router; 