const express = require('express');
const router = express.Router();
const tenantController = require('../controllers/tenantController');

// GET /v1/tenants/search?code=XYZ
router.get('/search', tenantController.searchTenant);

module.exports = router;
