const providerManager = require('../services/externalJobs/providerManager');

// @desc    Get all external normalized jobs (cached, filtered)
// @route   GET /api/jobs/external
// @access  Public
const getExternalJobs = async (req, res, next) => {
  try {
    const {
      search,
      location,
      jobType,
      workMode,
      experience,
      sortBy,
      page = 1,
      limit = 12,
    } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);

    // Fetch from cache (or refresh if stale)
    let jobs = await providerManager.getExternalJobs();

    // ── Apply in-memory filters ──────────────────────────────────────────
    if (search) {
      const q = search.toLowerCase();
      jobs = jobs.filter(j =>
        j.title.toLowerCase().includes(q) ||
        j.company.toLowerCase().includes(q) ||
        (j.description || '').toLowerCase().includes(q) ||
        (Array.isArray(j.skills) && j.skills.some(s => s.toLowerCase().includes(q)))
      );
    }
    if (location) {
      const loc = location.toLowerCase();
      jobs = jobs.filter(j => (j.location || '').toLowerCase().includes(loc));
    }
    if (workMode) {
      const modes = Array.isArray(workMode) ? workMode.map(m => m.toLowerCase()) : [workMode.toLowerCase()];
      if (modes.includes('remote')) {
        jobs = jobs.filter(j => j.remote === true);
      }
    }
    if (experience) {
      const levels = Array.isArray(experience) ? experience.map(e => e.toLowerCase()) : [experience.toLowerCase()];
      jobs = jobs.filter(j => levels.some(l => (j.experience || '').toLowerCase().includes(l)));
    }
    if (jobType) {
      const types = Array.isArray(jobType) ? jobType.map(t => t.toLowerCase()) : [jobType.toLowerCase()];
      jobs = jobs.filter(j => types.some(t => (j.employmentType || '').toLowerCase().includes(t)));
    }

    // ── Sort ─────────────────────────────────────────────────────────────
    if (sortBy === 'highest-salary') {
      jobs.sort((a, b) => {
        const getSalary = s => parseInt((s || '0').replace(/[^0-9]/g, '')) || 0;
        return getSalary(b.salary) - getSalary(a.salary);
      });
    } else if (sortBy === 'lowest-salary') {
      jobs.sort((a, b) => {
        const getSalary = s => parseInt((s || '0').replace(/[^0-9]/g, '')) || 0;
        return getSalary(a.salary) - getSalary(b.salary);
      });
    } else {
      jobs.sort((a, b) => new Date(b.postedDate) - new Date(a.postedDate));
    }

    // ── Paginate ─────────────────────────────────────────────────────────
    const totalJobs = jobs.length;
    const totalPages = Math.ceil(totalJobs / limitNum);
    const skip = (pageNum - 1) * limitNum;
    const paginated = jobs.slice(skip, skip + limitNum);

    res.status(200).json({
      success: true,
      count: paginated.length,
      cacheReady: !!providerManager.lastFetched,
      pagination: {
        totalJobs,
        totalPages,
        currentPage: pageNum,
        limit: limitNum
      },
      data: paginated
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getExternalJobs };
