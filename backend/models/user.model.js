const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

/*
  This schema defines the "User" model for MongoDB. It includes:
    - email: a unique email address identifying the user
    - password: the user's hashed password
  We apply the "mongoose-unique-validator" plugin to enforce uniqueness
  for the email field and handle validation errors appropriately.
*/

const userSchema = mongoose.Schema({
  email:    { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

// This plugin ensures the 'email' field is unique in the database.
userSchema.plugin(uniqueValidator);

// Export the "User" model to make it accessible in other parts of the application.
module.exports = mongoose.model('User', userSchema);
