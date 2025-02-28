const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

// Extension dictionary based on MIME type
const MIME_TYPES = {
  'image/jpg': 'jpg',
  'image/jpeg': 'jpg',
  'image/png': 'png',
};

// First store the file in memory
const storage = multer.memoryStorage();

// Multer configuration for a single field named 'image'
const upload = multer({ storage }).single('image');

module.exports = (req, res, next) => {
  // Run multer to retrieve the file in memory
  upload(req, res, async (err) => {
    try {
      // In case of error during upload
      if (err) {
        return res.status(400).json({ error: err.message });
      }

      // If no file has been sent, we move on to the next middleware
      if (!req.file) {
        return next();
      }

      // Generates a unique file name
      const extension = MIME_TYPES[req.file.mimetype] || '';
      const filename = `${req.file.fieldname}-${Date.now()}.${extension}`;

      // Process the image with Sharp
      await sharp(req.file.buffer)
        .resize({ width: 800 })
        .jpeg({ quality: 80 })
        .toFile(path.join('images', filename));

      // Update req.file so the controller knows what filename to use
      req.file.filename = filename;

      // Next middleware
      next();
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  });
};