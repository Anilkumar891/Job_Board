import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import api from '../services/api';
import { toast } from 'react-hot-toast';
import { Briefcase, MapPin, DollarSign, ArrowLeft, ChevronDown, Check, Building } from 'lucide-react';

function CreateJob() {
  const navigate = useNavigate();
  const [companies, setCompanies] = useState([]);
  const [loadingCompanies, setLoadingCompanies] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Skills Tag state
  const [skills, setSkills] = useState([]);
  const [skillInput, setSkillInput] = useState('');

  // Create Company Inline States
  const [showCreateCompanyModal, setShowCreateCompanyModal] = useState(false);
  const [creatingCompany, setCreatingCompany] = useState(false);
  const [companyForm, setCompanyForm] = useState({
    name: '',
    website: '',
    industry: '',
    location: '',
    size: '11-50',
    description: ''
  });

  const { register, handleSubmit, setValue, formState: { errors } } = useForm();

  const handleCreateCompanySubmit = async (e) => {
    e.preventDefault();
    if (!companyForm.name.trim()) {
      toast.error('Company Name is required');
      return;
    }

    setCreatingCompany(true);
    try {
      const response = await api.post('/companies', companyForm);
      if (response.data.success) {
        const newCompany = response.data.data;
        setCompanies(prev => [...prev, newCompany]);
        setValue('companyId', newCompany.id); // Set selected company ID
        toast.success('Company profile created successfully!');
        setShowCreateCompanyModal(false);
        setCompanyForm({
          name: '',
          website: '',
          industry: '',
          location: '',
          size: '11-50',
          description: ''
        });
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Error creating company profile');
    } finally {
      setCreatingCompany(false);
    }
  };

  // Load existing companies
  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const response = await api.get('/companies');
        if (response.data.success) {
          setCompanies(response.data.data);
        }
      } catch (error) {
        console.error('Error fetching companies:', error);
        toast.error('Failed to load companies list');
      } finally {
        setLoadingCompanies(false);
      }
    };

    fetchCompanies();
  }, []);

  // Handle skills keypresses
  const handleSkillKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const val = skillInput.trim().replace(/,/g, '');
      if (val && !skills.includes(val)) {
        setSkills([...skills, val]);
        setSkillInput('');
      }
    }
  };

  const removeSkill = (indexToRemove) => {
    setSkills(skills.filter((_, index) => index !== indexToRemove));
  };

  const onSubmit = async (data) => {
    if (skills.length === 0) {
      toast.error('Please add at least one required skill tag.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        ...data,
        skills
      };

      const response = await api.post('/jobs', payload);
      if (response.data.success) {
        toast.success('Job posting published successfully!');
        navigate('/recruiter-dashboard');
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || 'Error creating job posting.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      
      {/* Back navigation */}
      <Link
        to="/recruiter-dashboard"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-primary-600 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Dashboard
      </Link>

      <div className="bg-white dark:bg-darkCard border border-slate-200 dark:border-darkBorder rounded-3xl p-8 shadow-premium space-y-6">
        <div>
          <h1 className="font-sans font-extrabold text-2xl tracking-tight">Post a New Job</h1>
          <p className="text-slate-500 dark:text-zinc-400 text-sm font-semibold">
            Publish an active job listing and search for potential candidate applications.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          
          {/* Main info row (Title + Company) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Title */}
            <div className="space-y-1">
              <label htmlFor="title" className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                Job Position Title
              </label>
              <input
                id="title"
                type="text"
                placeholder="e.g. Senior Full-Stack Developer"
                {...register('title', { required: 'Job title is required' })}
                className="block w-full px-3 py-3 border border-slate-200 dark:border-zinc-800 rounded-xl bg-slate-50 dark:bg-zinc-900 text-slate-800 dark:text-zinc-100 text-sm font-medium focus:outline-none"
              />
              {errors.title && <p className="text-xs text-rose-500 font-semibold">{errors.title.message}</p>}
            </div>

            {/* Company Select */}
            <div className="space-y-1">
              <label htmlFor="companyId" className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                Target Company
              </label>
              {loadingCompanies ? (
                <div className="h-10 bg-slate-100 dark:bg-zinc-900 animate-pulse rounded-xl"></div>
              ) : (
                <>
                  <select
                    id="companyId"
                    {...register('companyId', { required: 'Please select a company' })}
                    className="block w-full px-3 py-3 border border-slate-200 dark:border-zinc-800 rounded-xl bg-slate-50 dark:bg-zinc-900 text-slate-850 dark:text-zinc-100 text-sm font-semibold focus:outline-none"
                  >
                    <option value="">Choose Company Profile</option>
                    {companies.map((comp) => (
                      <option key={comp.id} value={comp.id}>{comp.name}</option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => setShowCreateCompanyModal(true)}
                    className="text-xs text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 hover:underline font-bold mt-1.5 block text-left"
                  >
                    Can't find your company? Create a new profile
                  </button>
                </>
              )}
              {errors.companyId && <p className="text-xs text-rose-500 font-semibold">{errors.companyId.message}</p>}
            </div>
          </div>

          {/* Job description Rich Text */}
          <div className="space-y-1">
            <label htmlFor="description" className="block text-xs font-bold uppercase tracking-wider text-slate-500">
              Full Job Description
            </label>
            <p className="text-[10px] text-slate-400 font-medium mb-1">Outline roles, responsibilities, requirements, and corporate perks.</p>
            <textarea
              id="description"
              rows={8}
              placeholder="Provide a detailed description of the role..."
              {...register('description', { required: 'Description is required' })}
              className="block w-full px-3 py-3 border border-slate-200 dark:border-zinc-800 rounded-xl bg-slate-50 dark:bg-zinc-900 text-slate-800 dark:text-zinc-100 text-sm font-medium focus:outline-none"
            />
            {errors.description && <p className="text-xs text-rose-500 font-semibold">{errors.description.message}</p>}
          </div>

          {/* Meta rows (Salary, Experience, Location) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Salary Range */}
            <div className="space-y-1">
              <label htmlFor="salary" className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                Offered Salary Range
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-3.5 w-4 h-4 text-slate-400" />
                <input
                  id="salary"
                  type="text"
                  placeholder="e.g. $100k - $120k"
                  {...register('salary', { required: 'Salary info is required' })}
                  className="block w-full pl-9 pr-3 py-3 border border-slate-200 dark:border-zinc-800 rounded-xl bg-slate-50 dark:bg-zinc-900 text-slate-800 dark:text-zinc-100 text-sm font-medium focus:outline-none"
                />
              </div>
              {errors.salary && <p className="text-xs text-rose-500 font-semibold">{errors.salary.message}</p>}
            </div>

            {/* Experience Level */}
            <div className="space-y-1">
              <label htmlFor="experience" className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                Experience Level
              </label>
              <select
                id="experience"
                {...register('experience', { required: 'Experience level is required' })}
                className="block w-full px-3 py-3 border border-slate-200 dark:border-zinc-800 rounded-xl bg-slate-50 dark:bg-zinc-900 text-slate-850 dark:text-zinc-100 text-sm font-semibold focus:outline-none"
              >
                <option value="Entry Level">Entry Level</option>
                <option value="2-5 years">2-5 years</option>
                <option value="5+ years">5+ years</option>
                <option value="Senior">Senior</option>
              </select>
            </div>

            {/* Location Location */}
            <div className="space-y-1">
              <label htmlFor="location" className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                Location Details
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3.5 w-4 h-4 text-slate-400" />
                <input
                  id="location"
                  type="text"
                  placeholder="e.g. Austin, TX"
                  {...register('location', { required: 'Location is required' })}
                  className="block w-full pl-9 pr-3 py-3 border border-slate-200 dark:border-zinc-800 rounded-xl bg-slate-50 dark:bg-zinc-900 text-slate-800 dark:text-zinc-100 text-sm font-medium focus:outline-none"
                />
              </div>
              {errors.location && <p className="text-xs text-rose-500 font-semibold">{errors.location.message}</p>}
            </div>

          </div>

          {/* Job Type & Work Mode */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Job Type */}
            <div className="space-y-1">
              <label htmlFor="jobType" className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                Employment Type
              </label>
              <select
                id="jobType"
                {...register('jobType', { required: 'Job type is required' })}
                className="block w-full px-3 py-3 border border-slate-200 dark:border-zinc-800 rounded-xl bg-slate-50 dark:bg-zinc-900 text-slate-850 dark:text-zinc-100 text-sm font-semibold focus:outline-none"
              >
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="Contract">Contract</option>
                <option value="Internship">Internship</option>
              </select>
            </div>

            {/* Work Mode */}
            <div className="space-y-1">
              <label htmlFor="workMode" className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                Work Mode
              </label>
              <select
                id="workMode"
                {...register('workMode')}
                className="block w-full px-3 py-3 border border-slate-200 dark:border-zinc-800 rounded-xl bg-slate-50 dark:bg-zinc-900 text-slate-850 dark:text-zinc-100 text-sm font-semibold focus:outline-none"
              >
                <option value="Onsite">Onsite</option>
                <option value="Hybrid">Hybrid</option>
                <option value="Remote">Remote</option>
              </select>
            </div>

          </div>

          {/* Dynamic Required Skills tag Input */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
              Required Skills
            </label>
            <p className="text-[10px] text-slate-400 font-semibold mb-1">
              Type a skill (e.g. React, Docker) and press <kbd className="bg-slate-100 dark:bg-zinc-800 px-1 rounded">Enter</kbd> or <kbd className="bg-slate-100 dark:bg-zinc-800 px-1 rounded">,</kbd> to add.
            </p>
            
            {/* Tag display list */}
            <div className="flex flex-wrap gap-2 mb-2">
              {skills.map((skill, index) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary-100 text-primary-700 dark:bg-primary-950/30 dark:text-primary-300 font-bold text-xs rounded-xl"
                >
                  {skill}
                  <button
                    type="button"
                    onClick={() => removeSkill(index)}
                    className="hover:text-rose-500 focus:outline-none"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>

            <input
              type="text"
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              onKeyDown={handleSkillKeyDown}
              placeholder="e.g. Node.js"
              className="block w-full px-3 py-3 border border-slate-200 dark:border-zinc-800 rounded-xl bg-slate-50 dark:bg-zinc-900 text-slate-800 dark:text-zinc-100 text-sm font-medium focus:outline-none"
            />
          </div>

          {/* Action Row */}
          <div className="flex gap-4 pt-4 border-t dark:border-zinc-805">
            <button
              type="button"
              onClick={() => navigate('/recruiter-dashboard')}
              className="w-1/2 border border-slate-200 dark:border-zinc-800 hover:border-slate-300 text-slate-700 dark:text-zinc-300 font-bold py-3 rounded-xl text-sm transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="w-1/2 bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 rounded-xl text-sm transition-all disabled:opacity-50"
            >
              {submitting ? 'Publishing...' : 'Publish Job Listing'}
            </button>
          </div>

        </form>
      </div>

      {/* Create Company Modal */}
      {showCreateCompanyModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-darkCard max-w-md w-full rounded-3xl border border-slate-200 dark:border-darkBorder shadow-premium-hover p-6 space-y-6">
            
            <div className="flex justify-between items-start border-b dark:border-zinc-800 pb-3">
              <div>
                <h3 className="font-sans font-extrabold text-lg">Create Company Profile</h3>
                <p className="text-xs text-slate-400 font-semibold">Register a corporate profile to assign to job posts</p>
              </div>
              <button
                onClick={() => setShowCreateCompanyModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 text-sm font-bold"
              >
                Close
              </button>
            </div>

            <form onSubmit={handleCreateCompanySubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                  Company Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={companyForm.name}
                  onChange={(e) => setCompanyForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g. Acme Corp"
                  className="block w-full px-3 py-2.5 border border-slate-200 dark:border-zinc-800 rounded-xl bg-slate-50 dark:bg-zinc-900 text-slate-800 dark:text-zinc-100 text-sm font-medium focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                    Industry
                  </label>
                  <input
                    type="text"
                    value={companyForm.industry}
                    onChange={(e) => setCompanyForm(prev => ({ ...prev, industry: e.target.value }))}
                    placeholder="e.g. Technology"
                    className="block w-full px-3 py-2.5 border border-slate-200 dark:border-zinc-800 rounded-xl bg-slate-50 dark:bg-zinc-900 text-slate-800 dark:text-zinc-100 text-sm font-medium focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                    Location
                  </label>
                  <input
                    type="text"
                    value={companyForm.location}
                    onChange={(e) => setCompanyForm(prev => ({ ...prev, location: e.target.value }))}
                    placeholder="e.g. New York, NY"
                    className="block w-full px-3 py-2.5 border border-slate-200 dark:border-zinc-800 rounded-xl bg-slate-50 dark:bg-zinc-900 text-slate-800 dark:text-zinc-100 text-sm font-medium focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                    Company Size
                  </label>
                  <select
                    value={companyForm.size}
                    onChange={(e) => setCompanyForm(prev => ({ ...prev, size: e.target.value }))}
                    className="block w-full px-3 py-2.5 border border-slate-200 dark:border-zinc-800 rounded-xl bg-slate-50 dark:bg-zinc-900 text-slate-800 dark:text-zinc-100 text-sm font-semibold focus:outline-none"
                  >
                    <option value="1-10">1-10 employees</option>
                    <option value="11-50">11-50 employees</option>
                    <option value="51-200">51-200 employees</option>
                    <option value="201-500">201-500 employees</option>
                    <option value="501-1000">501-1000 employees</option>
                    <option value="1000+">1000+ employees</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                    Website URL
                  </label>
                  <input
                    type="text"
                    value={companyForm.website}
                    onChange={(e) => setCompanyForm(prev => ({ ...prev, website: e.target.value }))}
                    placeholder="e.g. https://acme.com"
                    className="block w-full px-3 py-2.5 border border-slate-200 dark:border-zinc-800 rounded-xl bg-slate-50 dark:bg-zinc-900 text-slate-800 dark:text-zinc-100 text-sm font-medium focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                  Description
                </label>
                <textarea
                  value={companyForm.description}
                  onChange={(e) => setCompanyForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Tell us about the company..."
                  rows={3}
                  className="block w-full px-3 py-2.5 border border-slate-200 dark:border-zinc-800 rounded-xl bg-slate-50 dark:bg-zinc-900 text-slate-800 dark:text-zinc-100 text-sm font-medium focus:outline-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateCompanyModal(false)}
                  className="w-1/2 border border-slate-200 dark:border-zinc-800 hover:border-slate-300 text-slate-700 dark:text-zinc-300 font-bold py-2.5 rounded-xl text-sm transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingCompany}
                  className="w-1/2 bg-primary-600 hover:bg-primary-700 text-white font-bold py-2.5 rounded-xl text-sm transition-all disabled:opacity-50"
                >
                  {creatingCompany ? 'Creating...' : 'Create Profile'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

export default CreateJob;
