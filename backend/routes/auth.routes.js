const express = require('express');
const router = express.Router();

const authCtrl = require('../controllers/auth.controller');

// POST /api/auth/signup
router.post('/signup', authCtrl.signup);

// POST /api/auth/login
router.post('/login', authCtrl.login);

module.exports = router;
