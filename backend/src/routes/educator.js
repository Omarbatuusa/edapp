const express = require('express');
const router = express.Router();
const educatorController = require('../controllers/educatorController');
const { verifyToken: protect } = require('../middleware/authMiddleware');

router.get('/class', protect, educatorController.getClassList);
router.post('/attendance', protect, educatorController.submitAttendance);

module.exports = router;
