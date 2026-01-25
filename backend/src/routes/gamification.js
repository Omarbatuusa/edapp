const express = require('express');
const router = express.Router();
const gamificationController = require('../controllers/gamificationController');
const { verifyToken: protect } = require('../middleware/authMiddleware');

router.get('/badges', protect, gamificationController.getBadges);

module.exports = router;
