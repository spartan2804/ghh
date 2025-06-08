        // testcaseController.js - Testcase controller logic placeholder 

const { pool } = require('../config/db');
const path = require('path');
const fs = require('fs');


// Create a new testcase
exports.createTestcase = async (req, res) => {
  try {
    const { feature_id } = req.params;
    const { name, description, copied_from_year, copied_from_TC_id, module_name, year_name, feature_name } = req.body;
    if (!name || !feature_id || !req.file) return res.status(400).json({ error: 'name, file, and feature_id are required' });
    // Move file to correct folder
    function safe(str) { return String(str).replace(/[^a-zA-Z0-9_-]/g, '_'); }
    const destDir = path.join(
      __dirname,
      '../../uploads',
      safe(module_name || 'unknown_module'),
      safe(year_name || 'unknown_year'),
      safe(feature_name || 'unknown_feature'),
      safe(name || 'unknown_tc')
    );
    fs.mkdirSync(destDir, { recursive: true });
    const destPath = path.join(destDir, req.file.filename);
    fs.renameSync(req.file.path, destPath);
    // file_path relative to /uploads
    const absUploads = path.resolve(__dirname, '../../uploads');
    const file_path = path.relative(absUploads, destPath).replace(/\\/g, '/');
    const [result] = await pool.query(
      'INSERT INTO testcases (name, description, file_path, feature_id, copied_from_year, copied_from_TC_id) VALUES (?, ?, ?, ?, ?, ?)',
      [name, description, file_path, feature_id, copied_from_year, copied_from_TC_id]
    );
    res.status(201).json({ id: result.insertId, name, description, file_path, feature_id, copied_from_year, copied_from_TC_id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get all testcases (optionally by feature_id) with pagination
exports.getTestcases = async (req, res) => {
  try {
    const { feature_id, page = 1, limit = 25 } = req.query;
    console.log("This is GET request", req.query);
    console.log("feature_id",feature_id, "page", page, "limit", limit);
    const offset = (page - 1) * limit;
    
    // Base query for testcases
    let query = 'SELECT * FROM testcases';
    let countQuery = 'SELECT COUNT(*) as total FROM testcases';
    let params = [];
    
    if (feature_id) {
      query += ' WHERE feature_id = ?';
      countQuery += ' WHERE feature_id = ?';
      params.push(feature_id);
    }
    
    // Add pagination
    query += ' LIMIT ? OFFSET ?';
    params.push(Number(limit), Number(offset));
    
    // Execute both queries
    const [rows] = await pool.query(query, params);
    const [countResult] = await pool.query(countQuery, feature_id ? [feature_id] : []);
    const total = countResult[0].total;
    
    res.json({
      testcases: rows,
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / limit)
    });
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
    const { name, description, feature_id, copied_from_year, copied_from_TC_id, module_name, year_name, feature_name } = req.body;
    // Fetch old testcase for file_path
    const [oldRows] = await pool.query('SELECT file_path FROM testcases WHERE id = ?', [id]);
    if (oldRows.length === 0) return res.status(404).json({ error: 'Testcase not found' });
    let newFilePath = oldRows[0].file_path;
    if (req.file) {
      // Move old file to recycleBin/removedByUpdates before replacing
      const oldAbsPath = path.join(__dirname, '../../uploads', oldRows[0].file_path);
      if (fs.existsSync(oldAbsPath)) {
        // Compute recycle bin path
        const recycleBinBase = path.join(__dirname, '../../uploads/recycle_bin/removedByUpdates');
        const oldRelPath = oldRows[0].file_path;
        const recycleBinPath = path.join(recycleBinBase, oldRelPath);
        const recycleBinDir = path.dirname(recycleBinPath);
        fs.mkdirSync(recycleBinDir, { recursive: true });
        fs.renameSync(oldAbsPath, recycleBinPath);
      }
      // Move new file to correct folder
      function safe(str) { return String(str).replace(/[^a-zA-Z0-9_-]/g, '_'); }
      const destDir = path.join(
        __dirname,
        '../../uploads',
        safe(module_name || 'unknown_module'),
        safe(year_name || 'unknown_year'),
        safe(feature_name || 'unknown_feature'),
        safe(name || 'unknown_tc')
      );
      fs.mkdirSync(destDir, { recursive: true });
      const destPath = path.join(destDir, req.file.filename);
      fs.renameSync(req.file.path, destPath);
      const absUploads = path.resolve(__dirname, '../../uploads');
      newFilePath = path.relative(absUploads, destPath).replace(/\\/g, '/');
    }
    const [result] = await pool.query(
      'UPDATE testcases SET name = ?, description = ?, file_path = ?, feature_id = ?, copied_from_year = ?, copied_from_TC_id = ? WHERE id = ?',
      [name, description, newFilePath, feature_id, copied_from_year, copied_from_TC_id, id]
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
    // Get file_path before deleting
    const [rows] = await pool.query('SELECT file_path FROM testcases WHERE id = ?', [id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Testcase not found' });
    const filePath = rows[0].file_path;
    if (filePath) {
      const absPath = path.join(__dirname, '../../uploads', filePath);
      const recycleBinPath = path.join(__dirname, '../../uploads/recycle_bin', filePath);
      const recycleBinDir = path.dirname(recycleBinPath);
      if (fs.existsSync(absPath)) {
        fs.mkdirSync(recycleBinDir, { recursive: true });
        fs.renameSync(absPath, recycleBinPath);
      }
    }
    // Now delete DB entry
    const [result] = await pool.query('DELETE FROM testcases WHERE id = ?', [id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Testcase not found' });
    res.json({ message: 'Testcase deleted (file moved to recycle bin if existed)' });
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

// Download testcase file by file path (relative to /uploads)
exports.downloadTestcaseFileByPath = async (req, res) => {
  try {
    const { filePath } = req.query;
    if (!filePath) return res.status(400).json({ error: 'filePath is required' });
    const absPath = path.join(__dirname, '../../uploads', filePath);
    if (!fs.existsSync(absPath)) return res.status(404).json({ error: 'File not found' });
    res.download(absPath, err => {
      if (err) res.status(404).json({ error: 'File not found' });
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Bulk upload testcases (name extracted from filename)
exports.bulkUploadTestcases = async (req, res) => {
  try {
    // Only expecting description array (optional), and other fields as strings
    console.log(req.body);  
    const { feature_id, module_name, year_name, feature_name } = req.body;
    let { description } = req.body;

    // Ensure files and feature_id are present
    if (!feature_id || !req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'feature_id and files are required' });
    }

    // Normalize description to array
    if (!Array.isArray(description)) description = description ? [description] : [];

    function safe(str) { return String(str).replace(/[^a-zA-Z0-9_-]/g, '_'); }
    const results = [];

    for (let i = 0; i < req.files.length; i++) {
      const file = req.files[i];
      try {
        // Extract name from filename (without extension)
        const tcName = file.originalname.replace(/\.[^/.]+$/, '');
        const tcDescription = description[i] || '';

        // Build destination directory as in createTestcase
        const destDir = path.join(
          __dirname,
          '../../uploads',
          safe(module_name || 'unknown_module'),
          safe(year_name || 'unknown_year'),
          safe(feature_name || 'unknown_feature')
          // safe(tcName || 'unknown_tc')
        );
        fs.mkdirSync(destDir, { recursive: true });

        // Move file to destination
        const destPath = path.join(destDir, file.originalname);
        fs.renameSync(file.path, destPath);

        // Compute file_path relative to /uploads
        const absUploads = path.resolve(__dirname, '../../uploads');
        const file_path = path.relative(absUploads, destPath).replace(/\\/g, '/');

        // Insert into DB
        const [result] = await pool.query(
          'INSERT INTO testcases (name, description, file_path, feature_id) VALUES (?, ?, ?, ?)',
          [tcName, tcDescription, file_path, feature_id]
        );
        results.push({ file: file.originalname, status: 'success', id: result.insertId });
      } catch (err) {
        results.push({ file: file.originalname, status: 'error', error: err.message });
      }
    }
    res.json({ message: 'Bulk upload complete', results });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Import testcases from previous year (copy selected TCs to target feature)

exports.importTestcasesFromPreviousYear = async (req, res) => {
  const { testcase_ids, target_feature_id } = req.body;

  if (!Array.isArray(testcase_ids) || !target_feature_id) {
    return res.status(400).json({ error: 'testcase_ids (array) and target_feature_id are required' });
  }

  const conn = await pool.getConnection();
  try {
    // 1. Get target feature details (to build new file paths)
    const [targetFeatureRows] = await conn.query(
      `SELECT features.feature_id, features.feature_name, yrs.year_id, yrs.year_name, modules.module_id, modules.module_name
       FROM features
       JOIN yrs ON features.year_id = yrs.year_id
       JOIN modules ON yrs.module_id = modules.module_id
       WHERE features.feature_id = ?`,
      [target_feature_id]
    );
    if (targetFeatureRows.length === 0) {
      conn.release();
      return res.status(404).json({ error: 'Target feature not found' });
    }
    const targetFeature = targetFeatureRows[0];

    // 2. Fetch selected TCs and their source feature/year/module info
    const [tcs] = await conn.query(
      `SELECT testcases.*, features.feature_name, yrs.year_name, modules.module_name
       FROM testcases
       JOIN features ON testcases.feature_id = features.feature_id
       JOIN yrs ON features.year_id = yrs.year_id
       JOIN modules ON yrs.module_id = modules.module_id
       WHERE testcases.id IN (?)`,
      [testcase_ids]
    );
    if (tcs.length === 0) {
      conn.release();
      return res.status(404).json({ error: 'No testcases found to import' });
    }

    let imported_count = 0;
    const imported = [];

    for (const tc of tcs) {
      // Build new destination directory
      function safe(str) { return String(str).replace(/[^a-zA-Z0-9_-]/g, '_'); }
      const tcName = tc.name || 'unknown_tc';
      const destDir = path.join(
        __dirname,
        '../../uploads',
        safe(targetFeature.module_name || 'unknown_module'),
        safe(targetFeature.year_name || 'unknown_year'),
        safe(targetFeature.feature_name || 'unknown_feature'),
        safe(tcName)
      );
      fs.mkdirSync(destDir, { recursive: true });

      // Copy file to new location
      const absUploads = path.resolve(__dirname, '../../uploads');
      const srcPath = path.join(absUploads, tc.file_path);
      const destPath = path.join(destDir, path.basename(tc.file_path));
      try {
        fs.copyFileSync(srcPath, destPath);
      } catch (err) {
        imported.push({ testcase_id: tc.id, status: 'error', error: 'File copy failed: ' + err.message });
        continue;
      }

      // Compute new file_path relative to /uploads
      const new_file_path = path.relative(absUploads, destPath).replace(/\\/g, '/');

      // Insert new testcase row
      await conn.query(
        `INSERT INTO testcases (name, description, file_path, feature_id, copied_from_year, copied_from_TC_id)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          tc.name,
          tc.description,
          new_file_path,
          target_feature_id,
          tc.year_name,
          tc.id
        ]
      );
      imported.push({ testcase_id: tc.id, status: 'success' });
      imported_count++;
    }

    res.status(200).json({
      message: 'Testcases imported',
      count: imported_count,
      results: imported
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    conn.release();
  }
};

// View testcase file content by file path (for code files)
exports.viewTestcaseFileByPath = async (req, res) => {
  try {
    const { filePath } = req.query;
    if (!filePath) return res.status(400).json({ error: 'filePath is required' });
    const absPath = path.join(__dirname, '../../uploads', filePath);
    if (!fs.existsSync(absPath)) return res.status(404).json({ error: 'File not found' });
    const content = fs.readFileSync(absPath, 'utf8');
    res.type('text/plain').send(content);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Save (edit) testcase file content by file path
exports.saveTestcaseFileByPath = async (req, res) => {
  try {
    const { filePath, content } = req.body;
    if (!filePath || typeof content !== 'string') return res.status(400).json({ error: 'filePath and content are required' });
    const absPath = path.join(__dirname, '../../uploads', filePath);
    if (!fs.existsSync(absPath)) return res.status(404).json({ error: 'File not found' });
    fs.writeFileSync(absPath, content, 'utf8');
    res.json({ message: 'File saved successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Import features (and all their testcases) from a source year to a target year using year_ids
exports.importFeatures = async (req, res) => {
  const { source_year_id, target_year_id, feature_ids } = req.body;

  if (!source_year_id || !target_year_id || !Array.isArray(feature_ids)) {
    return res.status(400).json({ message: 'source_year_id, target_year_id, and feature_ids (array) are required' });
  }

  const conn = await pool.getConnection();
  try {
    // Fetch target year and module names
    const [targetYearRows] = await conn.query(
      'SELECT y.year_name, m.module_name FROM yrs y JOIN modules m ON y.module_id = m.module_id WHERE y.year_id = ?',
      [target_year_id]
    );
    const targetYearName = targetYearRows[0]?.year_name || 'unknown_year';
    const targetModuleName = targetYearRows[0]?.module_name || 'unknown_module';

    const importedFeatures = [];
    for (const original_feature_id of feature_ids) {
      // 1. Get original feature details (must match source_year_id)
      const [originalFeatureRows] = await conn.query(
        'SELECT f.*, y.year_name, m.module_name FROM features f ' +
        'JOIN yrs y ON f.year_id = y.year_id ' +
        'JOIN modules m ON y.module_id = m.module_id ' +
        'WHERE f.feature_id = ? AND f.year_id = ?',
        [original_feature_id, source_year_id]
      );
      if (originalFeatureRows.length === 0) continue;
      const originalFeature = originalFeatureRows[0];

      // 2. Create new feature in target year
      const [newFeatureInsert] = await conn.query(
        'INSERT INTO features (feature_name, year_id) VALUES (?, ?)',
        [originalFeature.feature_name, target_year_id]
      );
      const new_feature_id = newFeatureInsert.insertId;

      // 3. Fetch all testcases of the original feature
      const [testcases] = await conn.query(
        'SELECT * FROM testcases WHERE feature_id = ?',
        [original_feature_id]
      );
      let imported_count = 0;
      for (const tc of testcases) {
        // Compute original and new file paths
        const absUploads = path.resolve(__dirname, '../../uploads');
        const originalPath = path.join(absUploads, tc.file_path);
        const originalFilename = path.basename(tc.file_path);

        // Create new path structure: target_module_name/target_year_name/feature_name/filename
        function safe(str) { return String(str).replace(/[^a-zA-Z0-9_-]/g, '_'); }
        const newFolder = path.join(
          absUploads,
          safe(targetModuleName),
          safe(targetYearName),
          safe(originalFeature.feature_name || 'unknown_feature')
        );
        fs.mkdirSync(newFolder, { recursive: true });
        const newFullPath = path.join(newFolder, originalFilename);

        // Copy the file to the new path
        try {
          fs.copyFileSync(originalPath, newFullPath);
        } catch (err) {
          console.error(`File copy failed: ${originalPath} -> ${newFullPath}`, err);
          continue;
        }

        // Compute new file_path relative to /uploads
        const new_file_path = path.relative(absUploads, newFullPath).replace(/\\/g, '/');

        // 4. Create a new testcase row
        await conn.query(
          `INSERT INTO testcases (name, description, file_path, feature_id, copied_from_year, copied_from_TC_id)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [
            tc.name,
            tc.description,
            new_file_path,
            new_feature_id,
            source_year_id,
            tc.id,
          ]
        );
        imported_count++;
      }
      importedFeatures.push({
        original_feature_id,
        new_feature_id,
        imported_tc_count: imported_count
      });
    }
    res.status(200).json({
      message: 'Features and testcases imported successfully',
      imported_features: importedFeatures
    });
  } catch (err) {
    console.error('Import failed:', err);
    res.status(500).json({ message: 'Server error' });
  } finally {
    conn.release();
  }
};

exports.searchTestcases = async (req, res) => {
  try {
    const { search, feature_id, page = 1, limit = 25 } = req.query;
    const offset = (page - 1) * limit;

    // Base query for testcases with search
    let query = 'SELECT * FROM testcases WHERE (name REGEXP ? OR description REGEXP ?)';
    let countQuery = 'SELECT COUNT(*) as total FROM testcases WHERE (name REGEXP ? OR description REGEXP ?)';
    let params = [search, search];

    // Add feature_id filter if provided
    if (feature_id) {
      query += ' AND feature_id = ?';
      countQuery += ' AND feature_id = ?';
      params.push(feature_id);
    }

    // Add pagination
    query += ' LIMIT ? OFFSET ?';
    params.push(Number(limit), Number(offset));

    // Execute both queries
    const [rows] = await pool.query(query, params);
    const [countResult] = await pool.query(countQuery, feature_id ? [...params.slice(0, -2), feature_id] : params.slice(0, -2));
    const total = countResult[0].total;

    res.json({
      testcases: rows,
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / limit)
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
