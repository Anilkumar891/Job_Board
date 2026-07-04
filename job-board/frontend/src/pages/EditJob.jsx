import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import api from '../services/api';
import { toast } from 'react-hot-toast';
import { Briefcase, MapPin, DollarSign, ArrowLeft, RefreshCw } from 'lucide-react';

function EditJob() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [companies, setCompanies] = useState([]);

  // Skills tag state
  const [skills, setSkills] = useState([]);
  const [skillInput, setSkillInput] = useState('');

  const { register, handleSubmit, setValue, formState: { errors } } = useForm();

  // Load companies and job data
  useEffect(() => {
    const loadData = async () => {
      try {
        const [compRes, jobRes] = await Promise.all([
          api.get('/companies'),
          api.get(`/jobs/${id}`)
        ]);

        if (compRes.data.success) {
          setCompanies(compRes.data.data);
        }

        if (jobRes.data.success) {
          const job = jobRes.data.data;
          
          // Populate fields
          setValue('title', job.title);
          setValue('companyId', job.companyId);
          setValue('description', job.description);
          setValue('salary', job.salary);
          setValue('experience', job.experience);
          setValue('location', job.location);
          setValue('jobType', job.jobType);
          setValue('workMode', job.workMode);
          setSkills(job.skills || []);
        }
      } catch (error) {
        console.error('Edit load error:', error);
        toast.error('Failed to load posting details.');
        navigate('/recruiter-dashboard');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id, setValue, navigate]);

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
      toast.error('Please add at least one required skill.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        ...data,
        skills
      };

      const response = await api.put(`/jobs/${id}`, payload);
      if (response.data.success) {
        toast.success('Job posting updated successfully!');
        navigate('/recruiter-dashboard');
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || 'Error updating job posting.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 flex flex-col items-center justify-center space-y-4">
        <RefreshCw className="w-10 h-10 text-primary-500 animate-spin" />
        <p className="text-slate-500 dark:text-zinc-400 font-medium">Loading posting details...</p>
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
          <h1 className="font-sans font-extrabold text-2xl tracking-tight">Edit Job Posting</h1>
          <p className="text-slate-500 dark:text-zinc-400 text-sm font-semibold">
            Modify requirements, salary boundaries, or skills tags.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          
          {/* Main Info */}
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
              <select
                id="companyId"
                disabled
                {...register('companyId')}
                className="block w-full px-3 py-3 border border-slate-200 dark:border-zinc-800 rounded-xl bg-slate-100 dark:bg-zinc-900/60 text-slate-400 text-sm font-semibold focus:outline-none cursor-not-allowed"
              >
                {companies.map((comp) => (
                  <option key={comp.id} value={comp.id}>{comp.name}</option>
                ))}
              </select>
              <p className="text-[10px] text-slate-400 font-semibold mt-1">Company profile cannot be altered after listing.</p>
            </div>

          </div>

          {/* Job Description Textarea */}
          <div className="space-y-1">
            <label htmlFor="description" className="block text-xs font-bold uppercase tracking-wider text-slate-500">
              Full Job Description
            </label>
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
            
            {/* Salary */}
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

            {/* Experience */}
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

            {/* Location */}
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

          {/* Skills Input */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
              Required Skills
            </label>
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

          {/* Actions */}
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
              {submitting ? 'Saving Changes...' : 'Save Changes'}
            </button>
          </div>

        </form>
      </div>

    </div>
  );
}

export default EditJob;
