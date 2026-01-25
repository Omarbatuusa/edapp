const express = require('express');
const router = express.Router();
const rbacController = require('../controllers/rbacController');
const { verifyToken } = require('../middleware/authMiddleware');

router.get('/me', verifyToken, rbacController.getMyContext);

module.exports = router;
