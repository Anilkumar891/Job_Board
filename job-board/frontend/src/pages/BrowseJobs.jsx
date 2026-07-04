import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useDebounce } from '../hooks/useDebounce';
import { toast } from 'react-hot-toast';
import { Search, MapPin, Briefcase, DollarSign, Calendar, LayoutGrid, List, SlidersHorizontal, Bookmark, X, AlertCircle } from 'lucide-react';

function BrowseJobs() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  // API State
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, totalJobs: 0 });
  const [savedJobIds, setSavedJobIds] = useState(new Set());

  // Layout preference
  const [isGridView, setIsGridView] = useState(true);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Filters State (initialized from URL query params)
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [location, setLocation] = useState(searchParams.get('location') || '');
  
  // Apply Debounce Hook to Search Inputs
  const debouncedSearch = useDebounce(search, 500);
  const debouncedLocation = useDebounce(location, 500);

  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [sortBy, setSortBy] = useState(searchParams.get('sortBy') || 'latest');
  const [page, setPage] = useState(parseInt(searchParams.get('page')) || 1);

  // Filter Arrays
  const [selectedJobTypes, setSelectedJobTypes] = useState(searchParams.getAll('jobType'));
  const [selectedWorkModes, setSelectedWorkModes] = useState(searchParams.getAll('workMode'));
  const [selectedExperiences, setSelectedExperiences] = useState(searchParams.getAll('experience'));

  // Fetch bookmarks if candidate logged in
  const fetchBookmarks = async () => {
    if (!user || user.role !== 'CANDIDATE') return;
    try {
      const response = await api.get('/saved');
      if (response.data.success) {
        const ids = response.data.data.map(item => item.jobId);
        setSavedJobIds(new Set(ids));
      }
    } catch (err) {
      console.error('Error fetching bookmarks:', err.message);
    }
  };

  // Fetch Jobs from backend
  const fetchJobs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        search: debouncedSearch.trim() || undefined,
        location: debouncedLocation.trim() || undefined,
        category: category || undefined,
        sortBy: sortBy || undefined,
        page,
        limit: 6
      };

      // Map filter arrays
      if (selectedJobTypes.length) params.jobType = selectedJobTypes;
      if (selectedWorkModes.length) params.workMode = selectedWorkModes;
      if (selectedExperiences.length) params.experience = selectedExperiences;

      const response = await api.get('/jobs', { params });
      if (response.data.success) {
        setJobs(response.data.data);
        setPagination(response.data.pagination);
      } else {
        setError('Failed to fetch jobs.');
      }
    } catch (err) {
      console.error('API Error:', err.message);
      setError(err.response?.data?.message || 'Error communicating with database.');
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, debouncedLocation, category, sortBy, page, selectedJobTypes, selectedWorkModes, selectedExperiences]);

  // Sync URL search params
  useEffect(() => {
    const params = {};
    if (debouncedSearch.trim()) params.search = debouncedSearch.trim();
    if (debouncedLocation.trim()) params.location = debouncedLocation.trim();
    if (category) params.category = category;
    if (sortBy !== 'latest') params.sortBy = sortBy;
    if (page > 1) params.page = page;

    // We can set searchParams using Vite/Router tools
    const newParams = new URLSearchParams(params);
    selectedJobTypes.forEach(t => newParams.append('jobType', t));
    selectedWorkModes.forEach(m => newParams.append('workMode', m));
    selectedExperiences.forEach(e => newParams.append('experience', e));

    setSearchParams(newParams);
    fetchJobs();
    fetchBookmarks();
  }, [debouncedSearch, debouncedLocation, category, sortBy, page, selectedJobTypes, selectedWorkModes, selectedExperiences, user, setSearchParams]);

  // Handle Multi-checkbox Filter changes
  const handleCheckboxChange = (value, list, setList) => {
    setPage(1); // Reset to page 1 on filter click
    if (list.includes(value)) {
      setList(list.filter(item => item !== value));
    } else {
      setList([...list, value]);
    }
  };

  // Reset all filters
  const resetFilters = () => {
    setSearch('');
    setLocation('');
    setCategory('');
    setSortBy('latest');
    setSelectedJobTypes([]);
    setSelectedWorkModes([]);
    setSelectedExperiences([]);
    setPage(1);
    toast.success('Filters cleared');
  };

  // Toggle saved job bookmark
  const toggleSaveJob = async (jobId) => {
    if (!user) {
      toast.error('Please login as a Candidate to bookmark jobs.');
      return;
    }
    if (user.role !== 'CANDIDATE') {
      toast.error('Only Candidates can bookmark jobs.');
      return;
    }

    try {
      if (savedJobIds.has(jobId)) {
        // Find bookmark record
        const response = await api.get('/saved');
        const bookmark = response.data.data.find(item => item.jobId === jobId);
        if (bookmark) {
          const deleteRes = await api.delete(`/saved/${bookmark.id}`);
          if (deleteRes.data.success) {
            setSavedJobIds(prev => {
              const updated = new Set(prev);
              updated.delete(jobId);
              return updated;
            });
            toast.success('Bookmark removed');
          }
        }
      } else {
        const createRes = await api.post('/saved', { jobId });
        if (createRes.data.success) {
          setSavedJobIds(prev => new Set(prev).add(jobId));
          toast.success('Job saved successfully');
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error bookmarking job.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      {/* Top Title and Actions */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="font-sans font-extrabold text-3xl tracking-tight">Explore Job Openings</h1>
          <p className="text-slate-500 dark:text-zinc-400 text-sm font-medium">
            Showing {pagination.totalJobs} matches worldwide
          </p>
        </div>

        {/* Sorting and Layout Toggles */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Sorting */}
          <select
            value={sortBy}
            onChange={(e) => { setSortBy(e.target.value); setPage(1); }}
            className="px-4 py-2 border rounded-xl bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 text-sm font-semibold focus:outline-none"
          >
            <option value="latest">Sort: Latest Listings</option>
            <option value="highest-salary">Sort: Highest Salary</option>
            <option value="lowest-salary">Sort: Lowest Salary</option>
          </select>

          {/* Grid/List toggles */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-zinc-900 p-1 rounded-xl">
            <button
              onClick={() => setIsGridView(true)}
              className={`p-1.5 rounded-lg transition-colors ${
                isGridView
                  ? 'bg-white dark:bg-darkCard text-primary-600 dark:text-primary-400 shadow-sm'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setIsGridView(false)}
              className={`p-1.5 rounded-lg transition-colors ${
                !isGridView
                  ? 'bg-white dark:bg-darkCard text-primary-600 dark:text-primary-400 shadow-sm'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          {/* Mobile Filter Button */}
          <button
            onClick={() => setShowMobileFilters(true)}
            className="md:hidden flex items-center gap-1.5 px-4 py-2 bg-primary-600 text-white font-bold rounded-xl text-sm"
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filters
          </button>
        </div>
      </div>

      {/* Main Grid: Sidebar + JobListings */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Left Side: Desktop Filters Panel */}
        <aside className="hidden lg:block space-y-6">
          <div className="bg-white dark:bg-darkCard border border-slate-200 dark:border-darkBorder rounded-2xl p-6 shadow-premium space-y-6">
            
            {/* Header */}
            <div className="flex items-center justify-between border-b dark:border-zinc-800 pb-3">
              <h3 className="font-sans font-bold text-base">Filter Parameters</h3>
              <button
                onClick={resetFilters}
                className="text-xs text-rose-500 hover:underline font-semibold"
              >
                Clear All
              </button>
            </div>

            {/* Keyword Search Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                Keywords
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                  placeholder="e.g. Developer, React..."
                  className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl pl-9 pr-3 py-2 text-sm font-medium focus:outline-none"
                />
              </div>
            </div>

            {/* Location Search Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                Location
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={location}
                  onChange={(e) => { setLocation(e.target.value); setPage(1); }}
                  placeholder="e.g. Austin, Remote..."
                  className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl pl-9 pr-3 py-2 text-sm font-medium focus:outline-none"
                />
              </div>
            </div>

            {/* Category Select Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => { setCategory(e.target.value); setPage(1); }}
                className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-sm font-medium focus:outline-none"
              >
                <option value="">All Categories</option>
                <option value="Software Development">Software Development</option>
                <option value="Artificial Intelligence">Artificial Intelligence</option>
                <option value="Product Management">Product Management</option>
                <option value="Design & Creative">Design & Creative</option>
              </select>
            </div>

            {/* Job Types (Checkboxes) */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                Job Type
              </h4>
              <div className="space-y-1.5">
                {['Full-time', 'Part-time', 'Contract', 'Internship'].map((type) => (
                  <label key={type} className="flex items-center gap-2 text-sm font-medium cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedJobTypes.includes(type)}
                      onChange={() => handleCheckboxChange(type, selectedJobTypes, setSelectedJobTypes)}
                      className="rounded text-primary-600 focus:ring-primary-500 border-slate-300 w-4 h-4"
                    />
                    <span>{type}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Work Modes */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                Work Mode
              </h4>
              <div className="space-y-1.5">
                {['Remote', 'Hybrid', 'Onsite'].map((mode) => (
                  <label key={mode} className="flex items-center gap-2 text-sm font-medium cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedWorkModes.includes(mode)}
                      onChange={() => handleCheckboxChange(mode, selectedWorkModes, setSelectedWorkModes)}
                      className="rounded text-primary-600 focus:ring-primary-500 border-slate-300 w-4 h-4"
                    />
                    <span>{mode}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Experience Levels */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                Experience Level
              </h4>
              <div className="space-y-1.5">
                {['Entry Level', '2-5 years', '5+ years', 'Senior'].map((exp) => (
                  <label key={exp} className="flex items-center gap-2 text-sm font-medium cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedExperiences.includes(exp)}
                      onChange={() => handleCheckboxChange(exp, selectedExperiences, setSelectedExperiences)}
                      className="rounded text-primary-600 focus:ring-primary-500 border-slate-300 w-4 h-4"
                    />
                    <span>{exp}</span>
                  </label>
                ))}
              </div>
            </div>

          </div>
        </aside>

        {/* Right Side: Job Listing Cards */}
        <section className="lg:col-span-3 space-y-6">
          {loading ? (
            // Skeleton Loading State
            <div className={isGridView ? 'grid grid-cols-1 md:grid-cols-2 gap-6' : 'space-y-4'}>
              {[...Array(4)].map((_, i) => (
                <div key={i} className="animate-pulse bg-white dark:bg-darkCard p-6 rounded-2xl border border-slate-200 dark:border-darkBorder space-y-4">
                  <div className="flex gap-4 items-center">
                    <div className="w-12 h-12 bg-slate-200 dark:bg-zinc-800 rounded-xl"></div>
                    <div className="space-y-2 flex-grow">
                      <div className="h-4 bg-slate-200 dark:bg-zinc-800 rounded w-2/3"></div>
                      <div className="h-3 bg-slate-200 dark:bg-zinc-800 rounded w-1/3"></div>
                    </div>
                  </div>
                  <div className="h-12 bg-slate-100 dark:bg-zinc-900 rounded w-full"></div>
                  <div className="flex justify-between items-center pt-2">
                    <div className="h-3 bg-slate-200 dark:bg-zinc-800 rounded w-20"></div>
                    <div className="h-8 bg-slate-200 dark:bg-zinc-800 rounded w-24"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center p-12 bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-900/40 rounded-2xl">
              <AlertCircle className="w-10 h-10 mb-2" />
              <p className="font-semibold text-sm">{error}</p>
            </div>
          ) : jobs.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-16 bg-white dark:bg-darkCard border border-slate-200 dark:border-darkBorder rounded-3xl text-center space-y-4">
              <Briefcase className="w-16 h-16 text-slate-300 dark:text-zinc-700" />
              <div className="space-y-1">
                <h3 className="font-sans font-bold text-lg">No active jobs found</h3>
                <p className="text-sm text-slate-500 dark:text-zinc-400 max-w-xs mx-auto">
                  Try clearing some filter checkboxes or adjusting your keyword query.
                </p>
              </div>
              <button
                onClick={resetFilters}
                className="bg-primary-600 text-white font-bold text-sm px-5 py-2.5 rounded-xl hover:bg-primary-700 transition-colors"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            // Cards Grid or List
            <div className={isGridView ? 'grid grid-cols-1 md:grid-cols-2 gap-6' : 'space-y-4'}>
              {jobs.map((job) => (
                <div
                  key={job.id}
                  className="bg-white dark:bg-darkCard border border-slate-200 dark:border-darkBorder rounded-2xl p-6 shadow-premium hover:shadow-premium-hover transition-all duration-300 flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    {/* Header */}
                    <div className="flex justify-between items-start gap-3">
                      <div className="flex gap-4">
                        <img
                          src={job.company.logo || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&h=100&fit=crop'}
                          alt={`${job.company.name} logo`}
                          className="w-12 h-12 object-cover rounded-xl border border-slate-100 dark:border-zinc-800"
                        />
                        <div>
                          <Link
                            to={`/jobs/${job.id}`}
                            className="font-sans font-extrabold text-base text-slate-800 dark:text-zinc-200 hover:text-primary-600 dark:hover:text-primary-400 transition-colors line-clamp-1"
                          >
                            {job.title}
                          </Link>
                          <Link
                            to={`/companies/${job.companyId}`}
                            className="text-xs text-slate-500 dark:text-zinc-400 font-semibold hover:underline"
                          >
                            {job.company.name}
                          </Link>
                        </div>
                      </div>
                      <button
                        onClick={() => toggleSaveJob(job.id)}
                        className={`p-2 rounded-xl transition-all border ${
                          savedJobIds.has(job.id)
                            ? 'bg-primary-50 border-primary-200 text-primary-600 dark:bg-primary-950/20 dark:border-primary-900/40 dark:text-primary-400'
                            : 'bg-white border-slate-200 text-slate-400 hover:text-slate-600 dark:bg-zinc-900 dark:border-zinc-800 dark:hover:text-zinc-200'
                        }`}
                        aria-label="Bookmark Job"
                      >
                        <Bookmark className={`w-4 h-4 ${savedJobIds.has(job.id) ? 'fill-current' : ''}`} />
                      </button>
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-2">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-violet-50 text-violet-700 dark:bg-violet-950/30 dark:text-violet-300">
                        {job.jobType}
                      </span>
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300">
                        {job.workMode}
                      </span>
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-sky-50 text-sky-700 dark:bg-sky-950/30 dark:text-sky-300">
                        {job.location}
                      </span>
                    </div>

                    {/* Description excerpt */}
                    <p className="text-xs text-slate-600 dark:text-zinc-400 font-medium leading-relaxed line-clamp-2">
                      {job.description.replace(/[#*_-]/g, '')}
                    </p>
                  </div>

                  {/* Footer metadata */}
                  <div className="flex items-center justify-between border-t border-slate-100 dark:border-zinc-850 pt-4 mt-4">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-zinc-300">
                      <DollarSign className="w-3.5 h-3.5 text-slate-400" />
                      <span>{job.salary}</span>
                    </div>
                    <Link
                      to={`/jobs/${job.id}`}
                      className="bg-primary-100 hover:bg-primary-200 dark:bg-primary-950/40 dark:hover:bg-primary-950/60 text-primary-700 dark:text-primary-300 px-4 py-2 rounded-xl text-xs font-bold transition-all"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-6">
              <button
                disabled={page === 1 || loading}
                onClick={() => setPage(prev => Math.max(prev - 1, 1))}
                className="px-4 py-2 border rounded-xl text-sm font-semibold bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 disabled:opacity-50"
              >
                Previous
              </button>
              <span className="text-xs font-bold text-slate-500 dark:text-zinc-400">
                Page {pagination.currentPage} of {pagination.totalPages}
              </span>
              <button
                disabled={page === pagination.totalPages || loading}
                onClick={() => setPage(prev => Math.min(prev + 1, pagination.totalPages))}
                className="px-4 py-2 border rounded-xl text-sm font-semibold bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </section>

      </div>

      {/* Mobile Filters Drawer Overlay */}
      {showMobileFilters && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex justify-end">
          <div className="bg-white dark:bg-darkCard w-full max-w-xs h-full p-6 overflow-y-auto space-y-6 flex flex-col justify-between">
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b dark:border-zinc-800 pb-3">
                <h3 className="font-sans font-bold text-base">Filters</h3>
                <button onClick={() => setShowMobileFilters(false)}>
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Duplicate Inputs for Mobile */}
              <div className="space-y-4">
                <input
                  type="text"
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                  placeholder="Keywords..."
                  className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl px-3 py-2.5 text-sm"
                />
                <input
                  type="text"
                  value={location}
                  onChange={(e) => { setLocation(e.target.value); setPage(1); }}
                  placeholder="Location..."
                  className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl px-3 py-2.5 text-sm"
                />
              </div>
            </div>

            <button
              onClick={() => setShowMobileFilters(false)}
              className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 rounded-xl text-sm"
            >
              Apply Filters
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

export default BrowseJobs;
