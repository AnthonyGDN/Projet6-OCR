const mongoose = require('mongoose');

/*
  This schema defines the "Book" model for MongoDB, which includes:
  - userId: the unique MongoDB user ID of the user who created the book
  - title: the book's title
  - author: the book's author
  - imageUrl: a URL (or path) to the book's cover image
  - year: the publication year of the book
  - genre: the book's genre
  - ratings: an array of rating objects, each containing:
      * userId: the ID of the user who rated the book
      * grade: the numerical rating given (0–5)
  - averageRating: the overall average rating of the book (default is 0)
*/

const bookSchema = mongoose.Schema({
  userId:        { type: String, required: true },
  title:         { type: String, required: true },
  author:        { type: String, required: true },
  imageUrl:      { type: String, required: true },
  year:          { type: Number, required: true },
  genre:         { type: String, required: true },
  ratings: [
    {
      userId: { type: String, required: true },
      grade:  { type: Number, required: true },
    }
  ],
  averageRating: { type: Number, default: 0 },
});

// Export the "Book" model so it can be used in other parts of the application.
module.exports = mongoose.model('Book', bookSchema);
