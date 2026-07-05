const express = require('express');
const router = express.Router();
const {
  getAllCompanies,
  getCompanyById,
  createCompany,
  updateCompany,
  deleteCompany,
  getMyCompany
} = require('../controllers/companiesController');
const { protect, authorize } = require('../middleware/auth');

router.route('/')
  .get(getAllCompanies)
  .post(protect, authorize('RECRUITER'), createCompany);

router.get('/my-company', protect, authorize('RECRUITER'), getMyCompany);

router.route('/:id')
  .get(getCompanyById)
  .put(protect, authorize('RECRUITER'), updateCompany)
  .delete(protect, authorize('RECRUITER'), deleteCompany);

module.exports = router;
