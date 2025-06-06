// multer.js - Multer configuration placeholder 
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Get names from form fields
    const moduleName = req.body.module_name || 'unknown_module';
    const yearName = req.body.year_name || 'unknown_year';
    const featureName = req.body.feature_name || 'unknown_feature';
    const tcName = req.body.name || 'unknown_tc';
    // Sanitize names for filesystem
    function safe(str) { return String(str).replace(/[^a-zA-Z0-9_-]/g, '_'); }
    const dir = path.join(
      __dirname,
      '../../uploads',
      safe(moduleName),
      safe(yearName),
      safe(featureName),
      safe(tcName)
    );
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '_' + file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_'));
  }
});

const upload = multer({ storage });

module.exports = upload; 