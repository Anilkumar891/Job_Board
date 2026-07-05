import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import api from '../services/api';
import { toast } from 'react-hot-toast';
import { Briefcase, MapPin, DollarSign, ArrowLeft, Building2 } from 'lucide-react';

function CreateJob() {
  const navigate = useNavigate();
  const [companies, setCompanies] = useState([]);
  const [loadingCompanies, setLoadingCompanies] = useState(true);
  const [hasNoCompany, setHasNoCompany] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Skills Tag state
  const [skills, setSkills] = useState([]);
  const [skillInput, setSkillInput] = useState('');

  const { register, handleSubmit, setValue, formState: { errors } } = useForm();

  // Load recruiter company profile
  useEffect(() => {
    const fetchRecruiterCompany = async () => {
      try {
        const response = await api.get('/companies/my-company');
        if (response.data.success && response.data.data) {
          const comp = response.data.data;
          setCompanies([comp]);
          setValue('companyId', comp.id); // Set selected company ID
          setHasNoCompany(false);
        } else {
          setHasNoCompany(true);
        }
      } catch (error) {
        console.error('Error fetching recruiter company:', error);
        if (error.response?.status === 404) {
          setHasNoCompany(true);
        } else {
          toast.error('Failed to load company credentials');
        }
      } finally {
        setLoadingCompanies(false);
      }
    };

    fetchRecruiterCompany();
  }, [setValue]);

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

  if (loadingCompanies) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 flex flex-col items-center justify-center space-y-4">
        <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-slate-500 dark:text-zinc-400 font-medium">Verifying company credentials...</p>
      </div>
    );
  }

  if (hasNoCompany) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
        <Link
          to="/recruiter-dashboard"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-primary-650 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>
        <div className="bg-white dark:bg-darkCard border border-slate-200 dark:border-darkBorder rounded-3xl p-8 shadow-premium text-center space-y-6">
          <div className="max-w-md mx-auto space-y-4">
            <div className="w-16 h-16 bg-rose-50 dark:bg-rose-950/20 text-rose-500 dark:text-rose-450 rounded-full flex items-center justify-center mx-auto">
              <Building2 className="w-8 h-8" />
            </div>
            <h2 className="font-sans font-extrabold text-2xl tracking-tight">No Company Profile Found</h2>
            <p className="text-slate-500 dark:text-zinc-400 text-sm font-semibold leading-relaxed">
              No company profile found. Please create a company profile before posting a job.
            </p>
            <Link
              to="/create-company"
              className="inline-flex items-center justify-center px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl text-sm transition-all shadow-premium"
            >
              Create Company Profile
            </Link>
          </div>
        </div>
      </div>
    );
  }

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

            {/* Company Select (Display lock) */}
            <div className="space-y-1">
              <label htmlFor="companyId" className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                Target Company
              </label>
              <select
                id="companyId"
                disabled
                {...register('companyId', { required: 'Please select a company' })}
                className="block w-full px-3 py-3 border border-slate-200 dark:border-zinc-800 rounded-xl bg-slate-100 dark:bg-zinc-900/60 text-slate-500 text-sm font-semibold focus:outline-none cursor-not-allowed"
              >
                {companies.map((comp) => (
                  <option key={comp.id} value={comp.id}>{comp.name}</option>
                ))}
              </select>
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

            {/* Location Details */}
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

          {/* Skill Requirements Tags Adder */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
              Required Skills
            </label>
            <p className="text-[10px] text-slate-400 font-medium mb-1">Type a skill and press Enter or comma (e.g. React, Node.js)</p>
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

    </div>
  );
}

export default CreateJob;
