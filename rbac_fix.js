const express = require('express');
const router = express.Router();
const rbacController = require('../controllers/rbacController');
const { verifyToken: protect } = require('../middleware/authMiddleware');

console.log('RBAC Route Loading...');
console.log('Protect Middleware Type:', typeof protect);

if (typeof protect !== 'function') {
    throw new Error('Auth Middleware failed to load in rbac.js');
}

router.get('/me', protect, rbacController.getMyContext);

module.exports = router;
