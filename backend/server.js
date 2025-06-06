const express = require('express');
const cors = require('cors');
const path = require('path');
const { initDB } = require('./src/config/db');

const moduleRoutes = require('./src/routes/moduleRoutes');
const yearRoutes = require('./src/routes/yearRoutes');
const featureRoutes = require('./src/routes/featureRoutes');
const testcaseRoutes = require('./src/routes/testcaseRoutes');

const app = express();
app.use(cors());
app.use(express.json());

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API routes
app.use('/api/modules', moduleRoutes);
app.use('/api/years', yearRoutes);
app.use('/api/features', featureRoutes);
app.use('/api/testcases', testcaseRoutes);

// Start server after DB init
initDB().then(() => {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});
