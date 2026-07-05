import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import api from '../services/api';
import { toast } from 'react-hot-toast';
import { Building2, Globe, MapPin, Briefcase, ArrowLeft, Users } from 'lucide-react';

function CreateCompany() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      name: '',
      website: '',
      industry: '',
      location: '',
      size: '11-50',
      description: '',
      logo: ''
    }
  });

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      const response = await api.post('/companies', data);
      if (response.data.success) {
        toast.success('Company profile created successfully!');
        navigate('/create-job');
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || 'Error creating company profile.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      {/* Back button */}
      <Link
        to="/recruiter-dashboard"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-primary-600 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Dashboard
      </Link>

      <div className="bg-white dark:bg-darkCard border border-slate-200 dark:border-darkBorder rounded-3xl p-8 shadow-premium space-y-6">
        <div className="space-y-1">
          <h1 className="font-sans font-extrabold text-2xl tracking-tight">Create Company Profile</h1>
          <p className="text-slate-500 dark:text-zinc-400 text-sm font-medium">
            Register your corporate details before publishing active job listings.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Company Name */}
            <div className="space-y-1">
              <label htmlFor="name" className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                Company Name <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Building2 className="absolute left-3.5 top-3.5 w-4.5 h-4.5 text-slate-400" />
                <input
                  id="name"
                  type="text"
                  placeholder="e.g. Google"
                  {...register('name', { required: 'Company name is required' })}
                  className="block w-full pl-10 pr-3 py-3 border border-slate-200 dark:border-zinc-800 rounded-xl bg-slate-50 dark:bg-zinc-900 text-slate-800 dark:text-zinc-100 text-sm font-medium focus:outline-none"
                />
              </div>
              {errors.name && <p className="text-xs text-rose-500 font-semibold">{errors.name.message}</p>}
            </div>

            {/* Website URL */}
            <div className="space-y-1">
              <label htmlFor="website" className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                Website URL
              </label>
              <div className="relative">
                <Globe className="absolute left-3.5 top-3.5 w-4.5 h-4.5 text-slate-400" />
                <input
                  id="website"
                  type="url"
                  placeholder="https://example.com"
                  {...register('website')}
                  className="block w-full pl-10 pr-3 py-3 border border-slate-200 dark:border-zinc-800 rounded-xl bg-slate-50 dark:bg-zinc-900 text-slate-800 dark:text-zinc-100 text-sm font-medium focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Industry */}
            <div className="space-y-1">
              <label htmlFor="industry" className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                Industry
              </label>
              <div className="relative">
                <Briefcase className="absolute left-3.5 top-3.5 w-4.5 h-4.5 text-slate-400" />
                <input
                  id="industry"
                  type="text"
                  placeholder="e.g. Technology"
                  {...register('industry')}
                  className="block w-full pl-10 pr-3 py-3 border border-slate-200 dark:border-zinc-800 rounded-xl bg-slate-50 dark:bg-zinc-900 text-slate-800 dark:text-zinc-100 text-sm font-medium focus:outline-none"
                />
              </div>
            </div>

            {/* Location */}
            <div className="space-y-1">
              <label htmlFor="location" className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                Location
              </label>
              <div className="relative">
                <MapPin className="absolute left-3.5 top-3.5 w-4.5 h-4.5 text-slate-400" />
                <input
                  id="location"
                  type="text"
                  placeholder="e.g. Mountain View, CA"
                  {...register('location')}
                  className="block w-full pl-10 pr-3 py-3 border border-slate-200 dark:border-zinc-800 rounded-xl bg-slate-50 dark:bg-zinc-900 text-slate-800 dark:text-zinc-100 text-sm font-medium focus:outline-none"
                />
              </div>
            </div>

            {/* Company Size */}
            <div className="space-y-1">
              <label htmlFor="size" className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                Company Size
              </label>
              <div className="relative">
                <Users className="absolute left-3.5 top-3.5 w-4.5 h-4.5 text-slate-400" />
                <select
                  id="size"
                  {...register('size')}
                  className="block w-full pl-10 pr-3 py-3 border border-slate-200 dark:border-zinc-800 rounded-xl bg-slate-50 dark:bg-zinc-900 text-slate-850 dark:text-zinc-100 text-sm font-semibold focus:outline-none"
                >
                  <option value="1-10">1-10 employees</option>
                  <option value="11-50">11-50 employees</option>
                  <option value="51-200">51-200 employees</option>
                  <option value="201-500">201-500 employees</option>
                  <option value="501-1000">501-1000 employees</option>
                  <option value="1000+">1000+ employees</option>
                </select>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6">
            {/* Logo URL */}
            <div className="space-y-1">
              <label htmlFor="logo" className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                Logo Image URL
              </label>
              <input
                id="logo"
                type="text"
                placeholder="e.g. https://images.unsplash.com/... or company logo link"
                {...register('logo')}
                className="block w-full px-3 py-3 border border-slate-200 dark:border-zinc-800 rounded-xl bg-slate-50 dark:bg-zinc-900 text-slate-800 dark:text-zinc-100 text-sm font-medium focus:outline-none"
              />
            </div>

            {/* Description */}
            <div className="space-y-1">
              <label htmlFor="description" className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                Company Overview
              </label>
              <textarea
                id="description"
                rows={5}
                placeholder="Describe your organization's mission, values, and benefits..."
                {...register('description')}
                className="block w-full px-3 py-3 border border-slate-200 dark:border-zinc-800 rounded-xl bg-slate-50 dark:bg-zinc-900 text-slate-800 dark:text-zinc-100 text-sm font-medium focus:outline-none"
              />
            </div>
          </div>

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
              {submitting ? 'Creating Profile...' : 'Create Company Profile'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}

export default CreateCompany;
