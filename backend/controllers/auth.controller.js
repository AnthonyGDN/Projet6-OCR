const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user.model');

// This controller handles user signup and login processes.

// Signup function: hashes the password, creates a new user in the database.
exports.signup = (req, res, next) => {
  console.log('signup route reached');
  // Hash the user's password with a cost of 10.
  bcrypt.hash(req.body.password, 10)
    .then(hashedPassword => {
      // Create a new User instance using the hashed password.
      const user = new User({
        email: req.body.email,
        password: hashedPassword
      });
      // Save the user in the database.
      user.save()
      .then(() => res.status(201).json({ message: 'Utilisateur créé !' }))
      .catch(error => {
        // email already exists
        if (error.code === 11000) {
          return res.status(400).json({ error: 'Un compte avec cet e-mail existe déjà.' });
        }

        // ValidationError 
        if (error.name === 'ValidationError' && error.message.includes('expected `email` to be unique')) {
          return res.status(400).json({ error: 'Un compte avec cet e-mail existe déjà.' });
        }

        // Otherwise, the raw error or a more generic message is returned
        console.error('[signup error]', error);
        return res.status(400).json({
          error: error.message || 'Erreur lors de la création du compte.'
        });
      });
  })
  .catch(error => {
    console.error('[bcrypt error]', error);
    return res.status(500).json({ error });
  });
};

// Login function: checks user credentials and returns a signed JWT on success.
exports.login = (req, res, next) => {
  // Find the user based on the provided email.
  User.findOne({ email: req.body.email })
    .then(user => {
      // If no user is found, return an authentication error.
      if (!user) {
        return res.status(404).json({ error: 'Utilisateur non trouvé !' });
      }
      // Compare the provided password with the stored hashed password.
      bcrypt.compare(req.body.password, user.password)
        .then(valid => {
          // If comparison fails, the password is incorrect.
          if (!valid) {
            return res.status(401).json({ error: 'Mot de passe incorrect !' });
          }
          // If the password is correct, generate a JWT containing the user ID.
          const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
          );
          // Return the user ID and the token to the client.
          res.status(200).json({
            userId: user._id,
            token: token
          });
        })
        // If an error occurs during password comparison, return a 500 status.
        .catch(error => res.status(500).json({ error }));
    })
    // If an error occurs while searching for the user, return a 500 status.
    .catch(error => res.status(500).json({ error }));
};
