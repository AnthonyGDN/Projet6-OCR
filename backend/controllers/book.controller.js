const fs = require('fs');
const Book = require('../models/book.model');

// Retrieves all books from the database and returns them as JSON.
exports.getAllBooks = (req, res, next) => {
  Book.find()
    .then(books => {
      // Convert each book's _id to id for the frontend.
      const formattedBooks = books.map(book => ({
        ...book._doc,
        id: book._id.toString(),
      }));
      res.status(200).json(formattedBooks);
    })
    // If something goes wrong, return a 400 error.
    .catch(error => res.status(400).json({ error }));
};

// Retrieves the top 3 books with the highest averageRating.
exports.getBestRatingBooks = (req, res, next) => {
  Book.find()
    .sort({ averageRating: -1 }) // Sort descending by averageRating
    .limit(3)
    .then(books => {
      const formattedBooks = books.map(book => ({
        ...book._doc,
        id: book._id.toString(),
      }));
      res.status(200).json(formattedBooks);
    })
    .catch(error => res.status(400).json({ error }));
};

// Retrieves a single book by its _id and returns it as JSON with a transformed `id`.
exports.getOneBook = (req, res, next) => {
  Book.findOne({ _id: req.params.id })
    .then(book => {
      // If the book doesn't exist, return a 404 error.
      if (!book) return res.status(404).json({ error: 'Livre non trouvé' });
      const formattedBook = {
        ...book._doc,
        id: book._id.toString(),
      };
      res.status(200).json(formattedBook);
    })
    // If an error occurs, return a 404 status as specified here.
    .catch(error => res.status(404).json({ error }));
};

// Creates a new book, using the uploaded image and the data parsed from req.body.book.
exports.createBook = (req, res, next) => {
  const bookObject = JSON.parse(req.body.book);
  // bookObject.rating contiendra la note transmise
  const rating = parseInt(bookObject.rating, 10) || 0;
  
  let ratings = [];
  let averageRating = 0;
  if (rating > 0) {
    // On enregistre une seule note : celle de l'utilisateur qui crée
    ratings.push({ userId: req.auth.userId, grade: rating });
    averageRating = rating;
  }
  
  const imageUrl = `${req.protocol}://${req.get('host')}/images/${req.file.filename}`;
  
  // On crée le livre
  const book = new Book({
    title: bookObject.title,
    author: bookObject.author,
    year: bookObject.year,
    genre: bookObject.genre,
    userId: req.auth.userId,
    imageUrl: imageUrl,
    ratings: ratings,
    averageRating: averageRating,
  });
  
  // On sauvegarde
  book.save()
    .then(() => res.status(201).json({ message: 'Livre enregistré !' }))
    .catch(error => res.status(400).json({ error }));
};

// Updates an existing book. If a new file is uploaded, delete the old image from the server.
exports.modifyBook = (req, res, next) => {
  Book.findOne({ _id: req.params.id })
    .then(book => {
      // If the book doesn't exist, return a 404 error.
      if (!book) {
        return res.status(404).json({ error: 'Livre non trouvé' });
      }
      // Ownership check: only the user who created the book can modify it.
      if (book.userId !== req.auth.userId) {
        return res.status(403).json({ message: 'unauthorized request' });
      }

      let bookObject = {};

      // Case: a new image is uploaded
      if (req.file) {
        // Remove the old image from the images folder
        const filename = book.imageUrl.split('/images/')[1];
        fs.unlink(`images/${filename}`, () => {});

        // Parse the updated book data from req.body.book (JSON string).
        bookObject = {
          ...JSON.parse(req.body.book),
          imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`,
        };
      } else {
        // No new image => updated fields are in req.body directly
        bookObject = { ...req.body };
      }

      // Update the book in the database. Keep existing ratings and averageRating.
      Book.updateOne({ _id: req.params.id }, { ...bookObject, _id: req.params.id })
        .then(() => res.status(200).json({ message: 'Livre modifié !' }))
        .catch(error => res.status(400).json({ error }));
    })
    // If a server error occurs, return a 500 status.
    .catch(error => res.status(500).json({ error }));
};

// Deletes an existing book and its associated image if the user is the book's owner.
exports.deleteBook = (req, res, next) => {
  Book.findOne({ _id: req.params.id })
    .then(book => {
      // If the book doesn't exist, return a 404 error.
      if (!book) {
        return res.status(404).json({ error: 'Livre non trouvé' });
      }
      // Ownership check
      if (book.userId !== req.auth.userId) {
        return res.status(403).json({ message: 'unauthorized request' });
      }
      // Remove the book's image from the server
      const filename = book.imageUrl.split('/images/')[1];
      fs.unlink(`images/${filename}`, () => {
        // Then delete the book from the database
        Book.deleteOne({ _id: req.params.id })
          .then(() => res.status(200).json({ message: 'Livre supprimé !' }))
          .catch(error => res.status(400).json({ error }));
      });
    })
    .catch(error => res.status(500).json({ error }));
};

// Adds a rating to a book if the user hasn't rated it yet. Recomputes averageRating as well.
exports.rateBook = (req, res, next) => {
  const userId = req.body.userId;
  const rating = parseInt(req.body.rating, 10);

  // The rating must be between 0 and 5.
  if (rating < 0 || rating > 5) {
    return res.status(400).json({ message: 'La note doit être entre 0 et 5' });
  }

  Book.findOne({ _id: req.params.id })
    .then(book => {
      if (!book) {
        return res.status(404).json({ error: 'Livre non trouvé' });
      }
      // Check if this user has already rated the book
      const alreadyRated = book.ratings.find(r => r.userId === userId);
      if (alreadyRated) {
        return res.status(400).json({ message: 'Vous avez déjà noté ce livre' });
      }

      // Add the new rating to the ratings array
      book.ratings.push({ userId: userId, grade: rating });

      // Recompute the average rating
      const total = book.ratings.reduce((sum, r) => sum + r.grade, 0);
      book.averageRating = parseFloat(
        (total / book.ratings.length).toFixed(1)
      );      

      // Save changes in the database
      return book.save();
    })
    .then((updated) => {
      // Convert _id en id pour le front
      const formattedBook = { ...updated._doc, id: updated._id.toString() };
      res.status(200).json(formattedBook);
    })
    .catch((error) => res.status(500).json({ error }));
};
