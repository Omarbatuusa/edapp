const express = require('express');
const router = express.Router();
const policyController = require('../controllers/policyController');
const multer = require('multer');

// Configure upload storage (Memory storage for R2 upload)
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// GET /api/policies
router.get('/', policyController.getPolicies);

// POST /api/policies (with file upload)
router.post('/', upload.single('file'), policyController.createPolicy);

// PUT /api/policies/:id
router.put('/:id', policyController.updatePolicy);

// DELETE /api/policies/:id
router.delete('/:id', policyController.deletePolicy);

module.exports = router;
