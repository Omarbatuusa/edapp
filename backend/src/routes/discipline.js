const express = require('express');
const router = express.Router();
const disciplineController = require('../controllers/disciplineController');
const { verifyToken } = require('../middleware/authMiddleware');

// All routes require authentication
router.use(verifyToken);

router.get('/categories', disciplineController.getCategories);
router.post('/issue', disciplineController.issueIncident);
router.get('/student/:id/history', disciplineController.getStudentHistory);

module.exports = router;
