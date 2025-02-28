const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

// Dictionnaire d’extensions en fonction du type MIME
const MIME_TYPES = {
  'image/jpg': 'jpg',
  'image/jpeg': 'jpg',
  'image/png': 'png',
};

// On stocke d’abord le fichier en mémoire (Buffer)
const storage = multer.memoryStorage();

// Configuration de multer pour un seul champ nommé 'image'
const upload = multer({ storage }).single('image');

module.exports = (req, res, next) => {
  // D’abord, on exécute multer pour récupérer le fichier en mémoire (req.file.buffer)
  upload(req, res, async (err) => {
    try {
      // En cas d’erreur lors de l’upload
      if (err) {
        return res.status(400).json({ error: err.message });
      }

      // Si aucun fichier n'a été envoyé, on passe au middleware suivant
      if (!req.file) {
        return next();
      }

      // Génère un nom de fichier unique
      const extension = MIME_TYPES[req.file.mimetype] || '';
      const filename = `${req.file.fieldname}-${Date.now()}.${extension}`;

      // Traite l'image avec Sharp (ex. redimension : 800px de large, conversion en jpeg qualité 80)
      await sharp(req.file.buffer)
        .resize({ width: 800 })
        .jpeg({ quality: 80 })
        .toFile(path.join('images', filename));

      // On met à jour req.file pour que le contrôleur sache quel nom de fichier utiliser
      req.file.filename = filename;

      // Middleware suivant (createBook, modifyBook, etc.)
      next();
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  });
};