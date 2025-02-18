const multer = require('multer');
const path = require('path');

// This object maps image MIME types to their respective file extensions.
const MIME_TYPES = {
  'image/jpg': 'jpg',
  'image/jpeg': 'jpg',
  'image/png': 'png',
};

// Configure the storage settings for Multer.
const storage = multer.diskStorage({
  // Specify the destination folder where files will be stored.
  destination: (req, file, callback) => {
    callback(null, 'images'); // 'images' folder
  },
  // Create a custom filename for each uploaded file.
  filename: (req, file, callback) => {
    // Use the field name from the form + current timestamp to ensure unique filenames.
    const name = file.fieldname + '-' + Date.now();

    // Determine the file extension based on the MIME type (default to empty string if not found).
    const extension = MIME_TYPES[file.mimetype] || '';

    // Construct the complete filename and pass it to the callback.
    callback(null, name + '.' + extension);
  }
});

// Export the Multer middleware configured to handle a single file in the 'image' field.
module.exports = multer({ storage }).single('image');
