const express = require('express');
const router = express.Router();

const bookCtrl = require('../controllers/book.controller');
const auth = require('../middlewares/auth.middleware');
const multer = require('../middlewares/multer-config');

// GET /api/books
router.get('/', bookCtrl.getAllBooks);

// GET /api/books/bestrating
router.get('/bestrating', bookCtrl.getBestRatingBooks);

// GET /api/books/:id
router.get('/:id', bookCtrl.getOneBook);

// POST /api/books (créer un livre)
router.post('/', auth, multer, bookCtrl.createBook);

// PUT /api/books/:id (modifier un livre)
router.put('/:id', auth, multer, bookCtrl.modifyBook);

// DELETE /api/books/:id (supprimer un livre)
router.delete('/:id', auth, bookCtrl.deleteBook);

// POST /api/books/:id/rating (noter un livre)
router.post('/:id/rating', auth, bookCtrl.rateBook);

module.exports = router;
