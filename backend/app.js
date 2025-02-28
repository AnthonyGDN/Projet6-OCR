const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config();
const cors = require('cors');

const authRoutes = require('./routes/auth.routes');
const bookRoutes = require('./routes/book.routes');

const app = express();

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Connexion à MongoDB réussie !'))
.catch((error) => console.log('Connexion à MongoDB échouée : ', error));

// Enabling CORS Middleware
app.use(cors({
  origin: '*', 
  allowedHeaders: [
    'Origin',
    'X-Requested-With',
    'Content',
    'Accept',
    'Content-Type',
    'Authorization',
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
}));

// Global middleware for parsing JSON
app.use(express.json());

// Entry points
app.use('/api/auth', authRoutes);
app.use('/api/books', bookRoutes);

// Serves the "images" folder statically
app.use('/images', express.static(path.join(__dirname, 'images')));

module.exports = app;
