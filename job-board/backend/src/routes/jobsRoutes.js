const express = require('express');
const router = express.Router();
const {
  getAllJobs,
  getJobById,
  createJob,
  updateJob,
  deleteJob,
  getMyPostedJobs
} = require('../controllers/jobsController');
const { protect, authorize } = require('../middleware/auth');

router.route('/')
  .get(getAllJobs)
  .post(protect, authorize('RECRUITER'), createJob);

router.get('/my-postings', protect, authorize('RECRUITER'), getMyPostedJobs);

router.route('/:id')
  .get(getJobById)
  .put(protect, authorize('RECRUITER'), updateJob)
  .delete(protect, authorize('RECRUITER'), deleteJob);

module.exports = router;
