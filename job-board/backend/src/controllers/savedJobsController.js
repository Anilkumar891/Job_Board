const prisma = require('../config/db');

// @desc    Bookmark/Save a job posting
// @route   POST /api/saved
// @access  Private (Candidate only)
const saveJob = async (req, res, next) => {
  try {
    const { jobId } = req.body;

    if (!jobId) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a job ID'
      });
    }

    // Verify job exists
    const job = await prisma.job.findUnique({
      where: { id: jobId }
    });

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job posting not found'
      });
    }

    // Check if already saved
    const alreadySaved = await prisma.savedJob.findUnique({
      where: {
        candidateId_jobId: {
          candidateId: req.user.id,
          jobId: jobId
        }
      }
    });

    if (alreadySaved) {
      return res.status(400).json({
        success: false,
        message: 'Job posting is already saved'
      });
    }

    const savedJob = await prisma.savedJob.create({
      data: {
        candidateId: req.user.id,
        jobId: jobId
      },
      include: {
        job: {
          include: {
            company: true
          }
        }
      }
    });

    res.status(201).json({
      success: true,
      message: 'Job bookmarked successfully',
      data: savedJob
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all saved jobs for candidate
// @route   GET /api/saved
// @access  Private (Candidate only)
const getSavedJobs = async (req, res, next) => {
  try {
    const savedJobs = await prisma.savedJob.findMany({
      where: { candidateId: req.user.id },
      include: {
        job: {
          include: {
            company: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.status(200).json({
      success: true,
      count: savedJobs.length,
      data: savedJobs
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove saved job
// @route   DELETE /api/saved/:id
// @access  Private (Candidate only)
const unsaveJob = async (req, res, next) => {
  try {
    const { id } = req.params;

    const savedJob = await prisma.savedJob.findUnique({
      where: { id }
    });

    if (!savedJob) {
      return res.status(404).json({
        success: false,
        message: 'Bookmarked job record not found'
      });
    }

    // Verify ownership
    if (savedJob.candidateId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only remove your own bookmarks.'
      });
    }

    await prisma.savedJob.delete({
      where: { id }
    });

    res.status(200).json({
      success: true,
      message: 'Job bookmark removed successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  saveJob,
  getSavedJobs,
  unsaveJob
};
