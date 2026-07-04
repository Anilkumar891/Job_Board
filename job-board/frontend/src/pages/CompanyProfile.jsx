import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { MapPin, Globe, Users, Building, ArrowLeft, ArrowUpRight, AlertCircle, Briefcase } from 'lucide-react';

function CompanyProfile() {
  const { id } = useParams();
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCompanyData = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await api.get(`/companies/${id}`);
        if (response.data.success) {
          setCompany(response.data.data);
        }
      } catch (err) {
        console.error('Company details fetch error:', err.message);
        setError(err.response?.data?.message || 'Failed to load company details.');
      } finally {
        setLoading(false);
      }
    };

    fetchCompanyData();
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 animate-pulse space-y-8">
        <div className="h-4 bg-slate-200 dark:bg-zinc-800 rounded w-16"></div>
        <div className="flex gap-4 items-center">
          <div className="w-20 h-20 bg-slate-200 dark:bg-zinc-800 rounded-2xl"></div>
          <div className="space-y-3 flex-grow">
            <div className="h-6 bg-slate-200 dark:bg-zinc-800 rounded w-1/3"></div>
            <div className="h-4 bg-slate-200 dark:bg-zinc-800 rounded w-1/6"></div>
          </div>
        </div>
        <div className="h-48 bg-slate-100 dark:bg-zinc-900 rounded w-full"></div>
      </div>
    );
  }

  if (error || !company) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
        <h2 className="font-sans font-bold text-xl">Could not retrieve company profile</h2>
        <p className="text-slate-500 text-sm">{error || 'Company not found'}</p>
        <Link to="/jobs" className="inline-flex items-center gap-1 text-primary-600 font-semibold hover:underline">
          <ArrowLeft className="w-4 h-4" /> Return to jobs
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Back Button */}
      <Link
        to="/jobs"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-primary-600 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Listings
      </Link>

      {/* Hero Header Block */}
      <div className="bg-white dark:bg-darkCard border border-slate-200 dark:border-darkBorder rounded-3xl p-8 shadow-premium flex flex-col md:flex-row items-center md:items-start justify-between gap-6">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6 text-center md:text-left">
          <img
            src={company.logo || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&h=100&fit=crop'}
            alt={`${company.name} logo`}
            className="w-20 h-20 object-cover rounded-2xl border border-slate-100 dark:border-zinc-800"
          />
          <div className="space-y-2">
            <h1 className="font-sans font-extrabold text-3xl tracking-tight text-slate-800 dark:text-zinc-150">
              {company.name}
            </h1>
            <p className="text-sm font-semibold text-primary-600 dark:text-primary-400">
              {company.industry || 'Tech Industry'}
            </p>
            <div className="flex flex-wrap justify-center md:justify-start items-center gap-4 text-xs font-semibold text-slate-500 dark:text-zinc-400 pt-1">
              <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-slate-400" />{company.location || 'N/A'}</span>
              <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5 text-slate-400" />{company.size || 'N/A'} employees</span>
            </div>
          </div>
        </div>

        {/* Website Action */}
        {company.website && (
          <a
            href={company.website}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-5 py-3 border border-slate-200 dark:border-zinc-800 hover:border-primary-500 dark:hover:border-primary-500 text-slate-700 dark:text-zinc-300 font-bold rounded-xl text-sm transition-all"
          >
            Visit Website
            <ArrowUpRight className="w-4 h-4" />
          </a>
        )}
      </div>

      {/* Profile Details Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Side: About corporate details (2 Cols) */}
        <div className="lg:col-span-2 space-y-6 bg-white dark:bg-darkCard border border-slate-200 dark:border-darkBorder rounded-3xl p-8 shadow-premium">
          <h2 className="font-sans font-bold text-lg text-slate-800 dark:text-zinc-150 border-b dark:border-zinc-850 pb-3">
            About Company
          </h2>
          <p className="text-slate-600 dark:text-zinc-300 text-sm leading-relaxed font-medium whitespace-pre-line">
            {company.description || 'No detailed overview page information has been entered for this organization.'}
          </p>
        </div>

        {/* Right Side: Open Jobs Listings (1 Col) */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-darkCard border border-slate-200 dark:border-darkBorder rounded-3xl p-6 shadow-premium space-y-4">
            <h3 className="font-sans font-bold text-sm border-b dark:border-zinc-850 pb-2 flex items-center gap-1.5">
              <Briefcase className="w-4.5 h-4.5 text-primary-500" />
              Open Positions ({company.jobs ? company.jobs.length : 0})
            </h3>
            
            <div className="space-y-4">
              {!company.jobs || company.jobs.length === 0 ? (
                <p className="text-xs text-slate-400 font-medium italic text-center py-4">
                  No active job listings. Check back later!
                </p>
              ) : (
                company.jobs.map((job) => (
                  <div
                    key={job.id}
                    className="border-b last:border-0 dark:border-zinc-850 pb-4 last:pb-0 space-y-2"
                  >
                    <Link
                      to={`/jobs/${job.id}`}
                      className="text-sm font-bold text-slate-800 dark:text-zinc-200 hover:text-primary-600 transition-colors line-clamp-1 block"
                    >
                      {job.title}
                    </Link>
                    <div className="flex flex-wrap items-center gap-2 text-[10px] font-semibold text-slate-500 dark:text-zinc-400">
                      <span className="px-1.5 py-0.5 bg-slate-100 dark:bg-zinc-800 rounded">{job.jobType}</span>
                      <span className="px-1.5 py-0.5 bg-slate-100 dark:bg-zinc-800 rounded">{job.workMode}</span>
                      <span>{job.salary}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}

export default CompanyProfile;
