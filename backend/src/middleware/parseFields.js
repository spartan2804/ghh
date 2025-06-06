const busboy = require('busboy');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

module.exports = (req, res, next) => {
  if (req.headers['content-type'] && req.headers['content-type'].includes('multipart/form-data')) {
    const bb = busboy({ headers: req.headers });
    req.body = {};
    bb.on('field', (name, val) => {
      req.body[name] = val;
    });
    bb.on('finish', () => {
      next();
    });
    req.pipe(bb);
  } else {
    next();
  }
};

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = path.join(__dirname, '../../uploads/tmp');
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '_' + file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_'));
  }
}); 