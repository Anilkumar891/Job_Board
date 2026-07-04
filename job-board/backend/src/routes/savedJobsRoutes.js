const express = require('express');
const router = express.Router();
const {
  saveJob,
  getSavedJobs,
  unsaveJob
} = require('../controllers/savedJobsController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect, authorize('CANDIDATE')); // All bookmark routes require logged-in candidate

router.route('/')
  .get(getSavedJobs)
  .post(saveJob);

router.route('/:id')
  .delete(unsaveJob);

module.exports = router;
