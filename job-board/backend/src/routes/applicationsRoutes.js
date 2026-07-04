const express = require('express');
const router = express.Router();
const {
  applyToJob,
  getApplications,
  updateApplicationStatus,
  updateApplicationNotes
} = require('../controllers/applicationsController');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Base path is /api/applications

router.route('/')
  .get(protect, getApplications);

router.post('/apply', protect, authorize('CANDIDATE'), upload.single('resume'), applyToJob);

router.put('/:id/status', protect, authorize('RECRUITER'), updateApplicationStatus);

router.put('/:id/notes', protect, authorize('CANDIDATE'), updateApplicationNotes);

module.exports = router;
