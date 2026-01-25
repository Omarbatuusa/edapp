const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

console.log('LOADING AUTH ROUTES');
const authMiddleware = require('../middleware/authMiddleware');
console.log('Auth Middleware Export:', authMiddleware);

const protect = authMiddleware.verifyToken;
if (typeof protect !== 'function') {
    console.error('CRITICAL: verifyToken is missing in auth.js check!');
}

router.post('/login', authController.login);
router.get('/me', protect, authController.getMe);

module.exports = router;
