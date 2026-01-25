const express = require('express');
const router = express.Router();
const academicController = require('../controllers/academicController');
const { verifyToken: protect } = require('../middleware/authMiddleware');

router.get('/timetable', protect, academicController.getTimetable);
router.get('/results', protect, academicController.getResults);
router.get('/assignments', protect, academicController.getAssignments);

module.exports = router;
