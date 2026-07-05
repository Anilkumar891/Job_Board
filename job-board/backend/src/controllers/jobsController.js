const prisma = require('../config/db');
const providerManager = require('../services/externalJobs/providerManager');

// @desc    Get all jobs (recruiter + external, merged, filtered, paginated)
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
      skills,
      sortBy, // 'latest', 'highest-salary', 'lowest-salary'
      page = 1,
      limit = 12,
      includeExternal = 'true'
    } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);

    // ─── 1. RECRUITER JOBS FROM DATABASE ─────────────────────────────────────
    const where = { status: 'ACTIVE' };

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { company: { name: { contains: search, mode: 'insensitive' } } },
        { skills: { hasSome: [search] } }
      ];
    }
    if (location) where.location = { contains: location, mode: 'insensitive' };
    if (jobType) {
      const types = Array.isArray(jobType) ? jobType : [jobType];
      where.jobType = { in: types };
    }
    if (workMode) {
      const modes = Array.isArray(workMode) ? workMode : [workMode];
      where.workMode = { in: modes };
    }
    if (experience) {
      const levels = Array.isArray(experience) ? experience : [experience];
      where.experience = { in: levels };
    }
    if (skills) {
      const skillList = Array.isArray(skills) ? skills : [skills];
      where.skills = { hasSome: skillList };
    }

    const dbJobs = await prisma.job.findMany({
      where,
      include: {
        company: {
          select: { name: true, logo: true, location: true, industry: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Normalize recruiter jobs to unified format
    const recruiterJobs = dbJobs.map(job => ({
      id: job.id,
      title: job.title,
      company: job.company?.name || 'Unknown Company',
      companyLogo: job.company?.logo || null,
      location: job.location || 'Not Specified',
      salary: job.salary || 'Salary Undisclosed',
      experience: job.experience || 'Not Specified',
      employmentType: job.jobType || 'Full-time',
      remote: job.workMode === 'Remote',
      skills: Array.isArray(job.skills) ? job.skills : [],
      description: job.description || '',
      postedDate: job.createdAt,
      source: 'Recruiter',
      applyUrl: null,        // null = in-app apply
      originalId: job.id    // keep DB id for in-app apply flow
    }));

    // ─── 2. EXTERNAL JOBS FROM PROVIDER MANAGER ──────────────────────────────
    let externalJobs = [];
    if (includeExternal !== 'false') {
      try {
        externalJobs = await providerManager.getExternalJobs();
      } catch (err) {
        console.error('[getAllJobs] External provider fetch failed:', err.message);
      }
    }

    // Apply same filters to external jobs in-memory
    let filteredExternal = externalJobs;
    if (search) {
      const q = search.toLowerCase();
      filteredExternal = filteredExternal.filter(j =>
        j.title.toLowerCase().includes(q) ||
        j.company.toLowerCase().includes(q) ||
        (j.description || '').toLowerCase().includes(q) ||
        (Array.isArray(j.skills) && j.skills.some(s => s.toLowerCase().includes(q)))
      );
    }
    if (location) {
      const loc = location.toLowerCase();
      filteredExternal = filteredExternal.filter(j =>
        (j.location || '').toLowerCase().includes(loc)
      );
    }
    if (workMode) {
      const modes = Array.isArray(workMode) ? workMode.map(m => m.toLowerCase()) : [workMode.toLowerCase()];
      if (modes.includes('remote')) {
        filteredExternal = filteredExternal.filter(j => j.remote === true);
      }
    }
    if (experience) {
      const levels = Array.isArray(experience) ? experience.map(e => e.toLowerCase()) : [experience.toLowerCase()];
      filteredExternal = filteredExternal.filter(j =>
        levels.some(l => (j.experience || '').toLowerCase().includes(l))
      );
    }
    if (jobType) {
      const types = Array.isArray(jobType) ? jobType.map(t => t.toLowerCase()) : [jobType.toLowerCase()];
      filteredExternal = filteredExternal.filter(j =>
        types.some(t => (j.employmentType || '').toLowerCase().includes(t))
      );
    }

    // ─── 3. MERGE & SORT ─────────────────────────────────────────────────────
    let combined = [...recruiterJobs, ...filteredExternal];

    if (sortBy === 'highest-salary') {
      combined.sort((a, b) => {
        const getSalary = s => parseInt((s || '0').replace(/[^0-9]/g, '')) || 0;
        return getSalary(b.salary) - getSalary(a.salary);
      });
    } else if (sortBy === 'lowest-salary') {
      combined.sort((a, b) => {
        const getSalary = s => parseInt((s || '0').replace(/[^0-9]/g, '')) || 0;
        return getSalary(a.salary) - getSalary(b.salary);
      });
    } else {
      // Default: latest first
      combined.sort((a, b) => new Date(b.postedDate) - new Date(a.postedDate));
    }

    // ─── 4. PAGINATE ─────────────────────────────────────────────────────────
    const totalJobs = combined.length;
    const totalPages = Math.ceil(totalJobs / limitNum);
    const skip = (pageNum - 1) * limitNum;
    const paginatedJobs = combined.slice(skip, skip + limitNum);

    res.status(200).json({
      success: true,
      count: paginatedJobs.length,
      pagination: {
        totalJobs,
        totalPages,
        currentPage: pageNum,
        limit: limitNum
      },
      data: paginatedJobs
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
