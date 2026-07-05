const prisma = require('../config/db');

// @desc    Get all companies
// @route   GET /api/companies
// @access  Public
const getAllCompanies = async (req, res, next) => {
  try {
    const { search, industry, location } = req.query;

    const where = {};
    if (search) {
      where.name = { contains: search, mode: 'insensitive' };
    }
    if (industry) {
      where.industry = { contains: industry, mode: 'insensitive' };
    }
    if (location) {
      where.location = { contains: location, mode: 'insensitive' };
    }

    const companies = await prisma.company.findMany({
      where,
      orderBy: { name: 'asc' }
    });

    res.status(200).json({
      success: true,
      count: companies.length,
      data: companies
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get specific company details and their open jobs
// @route   GET /api/companies/:id
// @access  Public
const getCompanyById = async (req, res, next) => {
  try {
    const company = await prisma.company.findUnique({
      where: { id: req.params.id },
      include: {
        jobs: {
          where: { status: 'ACTIVE' },
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Company not found'
      });
    }

    res.status(200).json({
      success: true,
      data: company
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new company profile
// @route   POST /api/companies
// @access  Private (Recruiter)
const createCompany = async (req, res, next) => {
  try {
    const { name, logo, website, industry, location, size, description } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a company name'
      });
    }

    // Check if logged-in recruiter already has a company
    if (req.user) {
      const existingCompany = await prisma.company.findUnique({
        where: { recruiterId: req.user.id }
      });
      if (existingCompany) {
        return res.status(400).json({
          success: false,
          message: 'You have already registered a company profile'
        });
      }
    }

    // Check if company with same name exists
    const companyExists = await prisma.company.findFirst({
      where: { name: { equals: name, mode: 'insensitive' } }
    });

    if (companyExists) {
      return res.status(400).json({
        success: false,
        message: 'A company with this name already exists'
      });
    }

    const company = await prisma.company.create({
      data: {
        name,
        logo,
        website,
        industry,
        location,
        size,
        description,
        recruiterId: req.user ? req.user.id : null
      }
    });

    res.status(201).json({
      success: true,
      message: 'Company created successfully',
      data: company
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update company details
// @route   PUT /api/companies/:id
// @access  Private (Recruiter)
const updateCompany = async (req, res, next) => {
  try {
    const { name, logo, website, industry, location, size, description } = req.body;

    let company = await prisma.company.findUnique({
      where: { id: req.params.id }
    });

    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Company not found'
      });
    }

    company = await prisma.company.update({
      where: { id: req.params.id },
      data: {
        name: name || company.name,
        logo: logo !== undefined ? logo : company.logo,
        website: website !== undefined ? website : company.website,
        industry: industry !== undefined ? industry : company.industry,
        location: location !== undefined ? location : company.location,
        size: size !== undefined ? size : company.size,
        description: description !== undefined ? description : company.description
      }
    });

    res.status(200).json({
      success: true,
      message: 'Company updated successfully',
      data: company
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete company
// @route   DELETE /api/companies/:id
// @access  Private (Recruiter)
const deleteCompany = async (req, res, next) => {
  try {
    const company = await prisma.company.findUnique({
      where: { id: req.params.id }
    });

    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Company not found'
      });
    }

    await prisma.company.delete({
      where: { id: req.params.id }
    });

    res.status(200).json({
      success: true,
      message: 'Company profile deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get logged-in recruiter's company
// @route   GET /api/companies/my-company
// @access  Private (Recruiter only)
const getMyCompany = async (req, res, next) => {
  try {
    if (!req.user || req.user.role !== 'RECRUITER') {
      return res.status(403).json({
        success: false,
        message: 'Only recruiters can retrieve their associated company profile.'
      });
    }

    const company = await prisma.company.findUnique({
      where: { recruiterId: req.user.id }
    });

    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'No company profile found for this recruiter.'
      });
    }

    res.status(200).json({
      success: true,
      data: company
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllCompanies,
  getCompanyById,
  createCompany,
  updateCompany,
  deleteCompany,
  getMyCompany
};
