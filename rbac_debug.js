const express = require('express');
const router = express.Router();
const rbacController = require('../controllers/rbacController');

console.log('LOADING RBAC ROUTES');
const authMiddleware = require('../middleware/authMiddleware');
console.log('Auth Middleware Export in RBAC:', authMiddleware);

const protect = authMiddleware.verifyToken;

if (typeof protect !== 'function') {
    console.error('CRITICAL: verifyToken is missing in rbac.js check!');
}

router.get('/me', protect, rbacController.getMyContext);

module.exports = router;
