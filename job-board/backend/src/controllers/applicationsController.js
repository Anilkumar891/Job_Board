const prisma = require('../config/db');
const path = require('path');

// @desc    Submit a job application
// @route   POST /api/applications/apply
// @access  Private (Candidate only)
const applyToJob = async (req, res, next) => {
  try {
    const { jobId, coverLetter, notes } = req.body;

    if (!jobId) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a job ID'
      });
    }

    // Check if job exists and is active
    const job = await prisma.job.findUnique({
      where: { id: jobId }
    });

    if (!job || job.status !== 'ACTIVE') {
      return res.status(404).json({
        success: false,
        message: 'Job posting is no longer active or does not exist.'
      });
    }

    // Check if already applied
    const alreadyApplied = await prisma.application.findUnique({
      where: {
        candidateId_jobId: {
          candidateId: req.user.id,
          jobId: jobId
        }
      }
    });

    if (alreadyApplied) {
      return res.status(400).json({
        success: false,
        message: 'You have already applied to this job posting.'
      });
    }

    // Determine resume URL
    let resumeUrl = req.user.resumeUrl; // Use default profile resume if available
    
    if (req.file) {
      // If a file is uploaded, construct path
      // In production this would be S3, but locally we serve from static uploads folder
      resumeUrl = `/uploads/resumes/${req.file.filename}`;

      // Update candidate's default profile resume too
      await prisma.user.update({
        where: { id: req.user.id },
        data: { resumeUrl }
      });
    }

    if (!resumeUrl) {
      return res.status(400).json({
        success: false,
        message: 'Resume file missing. Please upload a resume or set a profile default resume.'
      });
    }

    const application = await prisma.application.create({
      data: {
        candidateId: req.user.id,
        jobId,
        resumeUrl,
        coverLetter,
        status: 'APPLIED',
        notes: notes || 'Applied to position.'
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
      message: 'Application submitted successfully',
      data: application
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all applications (context based: Candidate sees their own, Recruiter sees their jobs' applications)
// @route   GET /api/applications
// @access  Private
const getApplications = async (req, res, next) => {
  try {
    const { status, search } = req.query;

    if (req.user.role === 'CANDIDATE') {
      // Candidates see their own applications
      const where = { candidateId: req.user.id };
      if (status) {
        where.status = status;
      }
      if (search) {
        where.job = {
          OR: [
            { title: { contains: search, mode: 'insensitive' } },
            { company: { name: { contains: search, mode: 'insensitive' } } }
          ]
        };
      }

      const applications = await prisma.application.findMany({
        where,
        include: {
          job: {
            include: {
              company: true
            }
          }
        },
        orderBy: { appliedAt: 'desc' }
      });

      return res.status(200).json({
        success: true,
        count: applications.length,
        data: applications
      });
    } else if (req.user.role === 'RECRUITER') {
      // Recruiters see applications to jobs they created
      const where = {
        job: {
          recruiterId: req.user.id
        }
      };

      if (status) {
        where.status = status;
      }
      if (search) {
        where.OR = [
          { candidate: { name: { contains: search, mode: 'insensitive' } } },
          { candidate: { email: { contains: search, mode: 'insensitive' } } },
          { job: { title: { contains: search, mode: 'insensitive' } } }
        ];
      }

      const applications = await prisma.application.findMany({
        where,
        include: {
          candidate: {
            select: {
              id: true,
              name: true,
              email: true,
              resumeUrl: true
            }
          },
          job: {
            include: {
              company: true
            }
          }
        },
        orderBy: { appliedAt: 'desc' }
      });

      return res.status(200).json({
        success: true,
        count: applications.length,
        data: applications
      });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Update application status
// @route   PUT /api/applications/:id/status
// @access  Private (Recruiter only)
const updateApplicationStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const { id } = req.params;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Please provide the new application status'
      });
    }

    const validStatuses = [
      'WISHLIST', 'APPLIED', 'SCREENING', 'ASSESSMENT', 
      'INTERVIEW', 'HR_ROUND', 'OFFER', 'REJECTED', 'JOINED'
    ];

    if (!validStatuses.includes(status.toUpperCase())) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Choose from: ${validStatuses.join(', ')}`
      });
    }

    // Retrieve application
    const application = await prisma.application.findUnique({
      where: { id },
      include: {
        job: true
      }
    });

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    // Verify recruiter owns this job
    if (application.job.recruiterId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only update applicants for jobs you posted.'
      });
    }

    const updatedApplication = await prisma.application.update({
      where: { id },
      data: {
        status: status.toUpperCase()
      },
      include: {
        candidate: {
          select: {
            name: true,
            email: true
          }
        },
        job: true
      }
    });

    res.status(200).json({
      success: true,
      message: `Applicant status updated to ${status}`,
      data: updatedApplication
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update application tracking notes
// @route   PUT /api/applications/:id/notes
// @access  Private (Candidate only)
const updateApplicationNotes = async (req, res, next) => {
  try {
    const { notes } = req.body;
    const { id } = req.params;

    const application = await prisma.application.findUnique({
      where: { id }
    });

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application tracker record not found'
      });
    }

    // Verify candidate ownership
    if (application.candidateId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only add notes to your own applications.'
      });
    }

    const updatedApplication = await prisma.application.update({
      where: { id },
      data: {
        notes
      }
    });

    res.status(200).json({
      success: true,
      message: 'Tracking notes updated successfully',
      data: updatedApplication
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  applyToJob,
  getApplications,
  updateApplicationStatus,
  updateApplicationNotes
};
