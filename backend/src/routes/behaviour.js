const express = require('express');
const router = express.Router();
const behaviourController = require('../controllers/behaviourController');
const { verifyToken: protect } = require('../middleware/authMiddleware');

router.get('/summary', protect, behaviourController.getSummary);

module.exports = router;
