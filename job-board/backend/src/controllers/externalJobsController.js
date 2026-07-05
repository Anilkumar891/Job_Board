const providerManager = require('../services/externalJobs/providerManager');

// @desc    Get all external normalized jobs
// @route   GET /api/jobs/external
// @access  Public
const getExternalJobs = async (req, res, next) => {
  try {
    const jobs = await providerManager.getExternalJobs();
    res.status(200).json({
      success: true,
      count: jobs.length,
      data: jobs
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getExternalJobs
};
