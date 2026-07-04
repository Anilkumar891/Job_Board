const prisma = require('../config/db');

// @desc    Get all jobs (with advanced search, filter, sorting, and pagination)
// @route   GET /api/jobs
// @access  Public
const getAllJobs = async (req, res, next) => {
  try {
    const {
      search,
      location,
      jobType,
      workMode,
      experience,
      minSalary,
      maxSalary,
      skills,
      companyId,
      sortBy, // 'latest', 'highest-salary', 'lowest-salary'
      page = 1,
      limit = 10
    } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Build the query where clause
    const where = {
      status: 'ACTIVE' // By default only active jobs are shown to the public
    };

    // If companyId is requested (e.g. for company profile page)
    if (companyId) {
      where.companyId = companyId;
    }

    // Filter by Search Query (Title, Company Name, Skills, Description)
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { company: { name: { contains: search, mode: 'insensitive' } } },
        { skills: { hasSome: [search] } } // exact match on one skill in search string
      ];
    }

    // Filter by Location
    if (location) {
      where.location = { contains: location, mode: 'insensitive' };
    }

    // Filter by Job Type (e.g. Full-time, Part-time, Contract, Internship)
    if (jobType) {
      const types = Array.isArray(jobType) ? jobType : [jobType];
      where.jobType = { in: types };
    }

    // Filter by Work Mode (e.g. Remote, Hybrid, Onsite)
    if (workMode) {
      const modes = Array.isArray(workMode) ? workMode : [workMode];
      where.workMode = { in: modes };
    }

    // Filter by Experience Level
    if (experience) {
      const levels = Array.isArray(experience) ? experience : [experience];
      where.experience = { in: levels };
    }

    // Filter by skills (e.g., array of skills)
    if (skills) {
      const skillList = Array.isArray(skills) ? skills : [skills];
      where.skills = { hasSome: skillList };
    }

    // Determine Sort Order
    let orderBy = { createdAt: 'desc' }; // default 'latest'
    if (sortBy === 'highest-salary') {
      orderBy = { salary: 'desc' };
    } else if (sortBy === 'lowest-salary') {
      orderBy = { salary: 'asc' };
    }

    // Execute query with transaction to get total count
    const [jobs, totalJobs] = await prisma.$transaction([
      prisma.job.findMany({
        where,
        include: {
          company: {
            select: {
              name: true,
              logo: true,
              location: true,
              industry: true
            }
          }
        },
        orderBy,
        skip,
        take: limitNum
      }),
      prisma.job.count({ where })
    ]);

    const totalPages = Math.ceil(totalJobs / limitNum);

    res.status(200).json({
      success: true,
      count: jobs.length,
      pagination: {
        totalJobs,
        totalPages,
        currentPage: pageNum,
        limit: limitNum
      },
      data: jobs
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get detailed job description
// @route   GET /api/jobs/:id
// @access  Public
const getJobById = async (req, res, next) => {
  try {
    const job = await prisma.job.findUnique({
      where: { id: req.params.id },
      include: {
        company: true,
        recruiter: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job opening not found'
      });
    }

    res.status(200).json({
      success: true,
      data: job
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a job opening
// @route   POST /api/jobs
// @access  Private (Recruiter only)
const createJob = async (req, res, next) => {
  try {
    const {
      companyId,
      title,
      description,
      salary,
      experience,
      location,
      jobType,
      workMode,
      skills
    } = req.body;

    // Validate fields
    if (!companyId || !title || !description || !salary || !experience || !location || !jobType) {
      return res.status(400).json({
        success: false,
        message: 'Please fill all required fields'
      });
    }

    // Verify company exists
    const company = await prisma.company.findUnique({
      where: { id: companyId }
    });

    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'The associated company profile was not found'
      });
    }

    const job = await prisma.job.create({
      data: {
        companyId,
        recruiterId: req.user.id,
        title,
        description,
        salary,
        experience,
        location,
        jobType,
        workMode: workMode || 'Onsite',
        skills: Array.isArray(skills) ? skills : [],
        status: 'ACTIVE'
      },
      include: {
        company: true
      }
    });

    res.status(201).json({
      success: true,
      message: 'Job posting created successfully',
      data: job
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update an existing job posting
// @route   PUT /api/jobs/:id
// @access  Private (Recruiter only, must be creator)
const updateJob = async (req, res, next) => {
  try {
    const {
      title,
      description,
      salary,
      experience,
      location,
      jobType,
      workMode,
      skills,
      status
    } = req.body;

    let job = await prisma.job.findUnique({
      where: { id: req.params.id }
    });

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job posting not found'
      });
    }

    // Verify ownership
    if (job.recruiterId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only update jobs you have created.'
      });
    }

    job = await prisma.job.update({
      where: { id: req.params.id },
      data: {
        title: title || job.title,
        description: description || job.description,
        salary: salary || job.salary,
        experience: experience || job.experience,
        location: location || job.location,
        jobType: jobType || job.jobType,
        workMode: workMode || job.workMode,
        skills: skills !== undefined ? (Array.isArray(skills) ? skills : []) : job.skills,
        status: status || job.status
      },
      include: {
        company: true
      }
    });

    res.status(200).json({
      success: true,
      message: 'Job posting updated successfully',
      data: job
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a job listing
// @route   DELETE /api/jobs/:id
// @access  Private (Recruiter only, must be creator)
const deleteJob = async (req, res, next) => {
  try {
    const job = await prisma.job.findUnique({
      where: { id: req.params.id }
    });

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job posting not found'
      });
    }

    // Verify ownership
    if (job.recruiterId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only delete jobs you have created.'
      });
    }

    await prisma.job.delete({
      where: { id: req.params.id }
    });

    res.status(200).json({
      success: true,
      message: 'Job posting deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all jobs posted by logged-in recruiter
// @route   GET /api/jobs/my-postings
// @access  Private (Recruiter only)
const getMyPostedJobs = async (req, res, next) => {
  try {
    const jobs = await prisma.job.findMany({
      where: { recruiterId: req.user.id },
      include: {
        company: {
          select: {
            name: true,
            logo: true
          }
        },
        _count: {
          select: { applications: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

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
  getAllJobs,
  getJobById,
  createJob,
  updateJob,
  deleteJob,
  getMyPostedJobs
};
