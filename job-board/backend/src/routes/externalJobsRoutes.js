const express = require('express');
const router = express.Router();
const { getExternalJobs } = require('../controllers/externalJobsController');

// Base path is /api/jobs/external
router.get('/', getExternalJobs);

module.exports = router;
