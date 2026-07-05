import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useDebounce } from '../hooks/useDebounce';
import { toast } from 'react-hot-toast';
import {
  Search, MapPin, Briefcase, DollarSign, Calendar, LayoutGrid, List,
  SlidersHorizontal, Bookmark, X, AlertCircle, ExternalLink, Globe,
  RefreshCw, ChevronLeft, ChevronRight, Zap, Building2
} from 'lucide-react';

// ── Source badge color map ─────────────────────────────────────────────────
const SOURCE_COLORS = {
  Recruiter:  { bg: 'bg-violet-100 dark:bg-violet-950/40',  text: 'text-violet-700 dark:text-violet-300',  dot: 'bg-violet-500' },
  LinkedIn:   { bg: 'bg-sky-100 dark:bg-sky-950/40',         text: 'text-sky-700 dark:text-sky-300',         dot: 'bg-sky-500' },
  Indeed:     { bg: 'bg-indigo-100 dark:bg-indigo-950/40',   text: 'text-indigo-700 dark:text-indigo-300',   dot: 'bg-indigo-500' },
  Naukri:     { bg: 'bg-orange-100 dark:bg-orange-950/40',   text: 'text-orange-700 dark:text-orange-300',   dot: 'bg-orange-500' },
  Glassdoor:  { bg: 'bg-emerald-100 dark:bg-emerald-950/40', text: 'text-emerald-700 dark:text-emerald-300', dot: 'bg-emerald-500' },
  Wellfound:  { bg: 'bg-rose-100 dark:bg-rose-950/40',       text: 'text-rose-700 dark:text-rose-300',       dot: 'bg-rose-500' },
  RemoteOK:   { bg: 'bg-cyan-100 dark:bg-cyan-950/40',       text: 'text-cyan-700 dark:text-cyan-300',       dot: 'bg-cyan-500' },
  Remotive:   { bg: 'bg-teal-100 dark:bg-teal-950/40',       text: 'text-teal-700 dark:text-teal-300',       dot: 'bg-teal-500' },
  Arbeitnow:  { bg: 'bg-amber-100 dark:bg-amber-950/40',     text: 'text-amber-700 dark:text-amber-300',     dot: 'bg-amber-500' },
  Adzuna:     { bg: 'bg-lime-100 dark:bg-lime-950/40',       text: 'text-lime-700 dark:text-lime-300',       dot: 'bg-lime-600' },
  JSearch:    { bg: 'bg-fuchsia-100 dark:bg-fuchsia-950/40', text: 'text-fuchsia-700 dark:text-fuchsia-300', dot: 'bg-fuchsia-500' },
};

const getSourceStyle = (source) =>
  SOURCE_COLORS[source] || { bg: 'bg-slate-100 dark:bg-zinc-800', text: 'text-slate-600 dark:text-zinc-300', dot: 'bg-slate-400' };

// ── Source Badge Component ─────────────────────────────────────────────────
function SourceBadge({ source }) {
  const style = getSourceStyle(source);
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${style.bg} ${style.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
      {source}
    </span>
  );
}

// ── Loading Skeleton ───────────────────────────────────────────────────────
function JobSkeleton({ grid }) {
  return (
    <div className={grid ? 'grid grid-cols-1 md:grid-cols-2 gap-6' : 'space-y-4'}>
      {[...Array(6)].map((_, i) => (
        <div key={i} className="animate-pulse bg-white dark:bg-darkCard p-6 rounded-2xl border border-slate-200 dark:border-darkBorder space-y-4">
          <div className="flex gap-4 items-center">
            <div className="w-12 h-12 bg-slate-200 dark:bg-zinc-800 rounded-xl flex-shrink-0" />
            <div className="space-y-2 flex-grow">
              <div className="h-4 bg-slate-200 dark:bg-zinc-800 rounded w-3/4" />
              <div className="h-3 bg-slate-200 dark:bg-zinc-800 rounded w-1/2" />
            </div>
            <div className="w-20 h-6 bg-slate-200 dark:bg-zinc-800 rounded-full" />
          </div>
          <div className="flex gap-2">
            <div className="h-6 w-20 bg-slate-100 dark:bg-zinc-900 rounded-full" />
            <div className="h-6 w-16 bg-slate-100 dark:bg-zinc-900 rounded-full" />
            <div className="h-6 w-24 bg-slate-100 dark:bg-zinc-900 rounded-full" />
          </div>
          <div className="space-y-2">
            <div className="h-3 bg-slate-100 dark:bg-zinc-900 rounded w-full" />
            <div className="h-3 bg-slate-100 dark:bg-zinc-900 rounded w-5/6" />
          </div>
          <div className="flex justify-between items-center pt-2 border-t border-slate-100 dark:border-zinc-800">
            <div className="h-3 bg-slate-200 dark:bg-zinc-800 rounded w-24" />
            <div className="h-9 bg-slate-200 dark:bg-zinc-800 rounded-xl w-28" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Job Card Component ─────────────────────────────────────────────────────
function JobCard({ job, isGrid, isSaved, onToggleSave, user }) {
  const isExternal = job.source !== 'Recruiter';
  const logo = job.companyLogo ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(job.company)}&background=6d28d9&color=fff&size=64`;
  const dateStr = job.postedDate
    ? new Date(job.postedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    : 'Recently';

  const handleSave = () => {
    if (isExternal) {
      toast.error('Bookmarking is only available for recruiter-posted jobs.');
      return;
    }
    onToggleSave(job.id);
  };

  return (
    <div className={`group bg-white dark:bg-darkCard border border-slate-200 dark:border-darkBorder rounded-2xl p-5 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 flex flex-col justify-between ${isGrid ? '' : 'md:flex-row md:items-center md:gap-6'}`}>

      <div className={`space-y-3 ${isGrid ? '' : 'md:flex-grow'}`}>
        {/* Header row */}
        <div className="flex justify-between items-start gap-3">
          <div className="flex gap-3 min-w-0">
            <img
              src={logo}
              alt={`${job.company} logo`}
              className="w-11 h-11 object-cover rounded-xl border border-slate-100 dark:border-zinc-800 flex-shrink-0"
              onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(job.company)}&background=6d28d9&color=fff&size=64`; }}
            />
            <div className="min-w-0">
              {isExternal ? (
                <a
                  href={job.applyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-extrabold text-sm text-slate-800 dark:text-zinc-100 hover:text-primary-600 dark:hover:text-primary-400 transition-colors line-clamp-1 block"
                >
                  {job.title}
                </a>
              ) : (
                <Link
                  to={`/jobs/${job.originalId || job.id}`}
                  className="font-extrabold text-sm text-slate-800 dark:text-zinc-100 hover:text-primary-600 dark:hover:text-primary-400 transition-colors line-clamp-1 block"
                >
                  {job.title}
                </Link>
              )}
              <span className="text-xs text-slate-500 dark:text-zinc-400 font-semibold">{job.company}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <SourceBadge source={job.source} />
            <button
              onClick={handleSave}
              className={`p-2 rounded-xl transition-all border ${
                isSaved
                  ? 'bg-primary-50 border-primary-200 text-primary-600 dark:bg-primary-950/20 dark:border-primary-900/40 dark:text-primary-400'
                  : 'bg-white border-slate-200 text-slate-400 hover:text-slate-600 dark:bg-zinc-900 dark:border-zinc-800 dark:hover:text-zinc-200'
              }`}
              aria-label="Bookmark Job"
            >
              <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-current' : ''}`} />
            </button>
          </div>
        </div>

        {/* Tag chips */}
        <div className="flex flex-wrap gap-1.5">
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-violet-50 text-violet-700 dark:bg-violet-950/30 dark:text-violet-300">
            {job.employmentType || 'Full-time'}
          </span>
          {job.remote && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300">
              🌐 Remote
            </span>
          )}
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-sky-50 text-sky-700 dark:bg-sky-950/30 dark:text-sky-300">
            <MapPin className="w-3 h-3 mr-1" />
            {job.location}
          </span>
          {job.experience && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-300">
              {job.experience}
            </span>
          )}
        </div>

        {/* Skills preview */}
        {Array.isArray(job.skills) && job.skills.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {job.skills.slice(0, 4).map((skill, i) => (
              <span key={i} className="px-2 py-0.5 bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 text-xs rounded-lg font-medium">
                {skill}
              </span>
            ))}
            {job.skills.length > 4 && (
              <span className="px-2 py-0.5 bg-slate-100 dark:bg-zinc-800 text-slate-500 dark:text-zinc-400 text-xs rounded-lg font-medium">
                +{job.skills.length - 4} more
              </span>
            )}
          </div>
        )}

        {/* Description snippet */}
        <p className="text-xs text-slate-600 dark:text-zinc-400 font-medium leading-relaxed line-clamp-2">
          {(job.description || '').replace(/<[^>]*>/g, '').replace(/[#*_]/g, '').trim()}
        </p>
      </div>

      {/* Footer */}
      <div className={`flex items-center justify-between border-t border-slate-100 dark:border-zinc-800 pt-3 mt-3 ${isGrid ? '' : 'md:border-t-0 md:pt-0 md:mt-0 md:pl-6 md:border-l md:flex-col md:items-end md:gap-3 md:min-w-[160px]'}`}>
        <div className="space-y-0.5">
          <div className="flex items-center gap-1 text-xs font-bold text-slate-700 dark:text-zinc-300">
            <DollarSign className="w-3.5 h-3.5 text-slate-400" />
            <span>{job.salary || 'Undisclosed'}</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-slate-400 dark:text-zinc-500">
            <Calendar className="w-3 h-3" />
            <span>{dateStr}</span>
          </div>
        </div>

        {/* CTA Button */}
        {isExternal ? (
          <a
            href={job.applyUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 dark:bg-zinc-700 dark:hover:bg-zinc-600 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Apply on {job.source}
          </a>
        ) : (
          <Link
            to={`/jobs/${job.originalId || job.id}`}
            className="inline-flex items-center gap-1.5 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all"
          >
            <Zap className="w-3.5 h-3.5" />
            Apply Now
          </Link>
        )}
      </div>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────
const ALL_SOURCES = ['All', 'Recruiter', 'LinkedIn', 'Indeed', 'Naukri', 'Glassdoor', 'Wellfound', 'RemoteOK', 'Remotive', 'Arbeitnow', 'Adzuna', 'JSearch'];

function BrowseJobs() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const loaderRef = useRef(null);

  // Data state
  const [allJobs, setAllJobs] = useState([]);
  const [displayedJobs, setDisplayedJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, totalJobs: 0 });
  const [savedJobIds, setSavedJobIds] = useState(new Set());

  // UI state
  const [isGridView, setIsGridView] = useState(true);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [activeSource, setActiveSource] = useState('All');

  // Filters
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [location, setLocation] = useState(searchParams.get('location') || '');
  const debouncedSearch = useDebounce(search, 500);
  const debouncedLocation = useDebounce(location, 500);
  const [sortBy, setSortBy] = useState(searchParams.get('sortBy') || 'latest');
  const [page, setPage] = useState(parseInt(searchParams.get('page')) || 1);
  const [selectedJobTypes, setSelectedJobTypes] = useState(searchParams.getAll('jobType'));
  const [selectedWorkModes, setSelectedWorkModes] = useState(searchParams.getAll('workMode'));
  const [selectedExperiences, setSelectedExperiences] = useState(searchParams.getAll('experience'));

  // ── Fetch bookmarks ──────────────────────────────────────────────────────
  const fetchBookmarks = useCallback(async () => {
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
  }, [user]);

  // ── Fetch Jobs ───────────────────────────────────────────────────────────
  const fetchJobs = useCallback(async (newPage = 1, append = false) => {
    if (append) setLoadingMore(true);
    else setLoading(true);
    setError(null);

    try {
      const params = {
        search: debouncedSearch.trim() || undefined,
        location: debouncedLocation.trim() || undefined,
        sortBy: sortBy || undefined,
        page: newPage,
        limit: 12
      };
      if (selectedJobTypes.length) params.jobType = selectedJobTypes;
      if (selectedWorkModes.length) params.workMode = selectedWorkModes;
      if (selectedExperiences.length) params.experience = selectedExperiences;

      const response = await api.get('/jobs', { params });
      if (response.data.success) {
        const incoming = response.data.data;
        if (append) {
          setDisplayedJobs(prev => [...prev, ...incoming]);
        } else {
          setDisplayedJobs(incoming);
          setAllJobs(incoming);
        }
        setPagination(response.data.pagination);
      } else {
        setError('Failed to load jobs.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error communicating with server.');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [debouncedSearch, debouncedLocation, sortBy, selectedJobTypes, selectedWorkModes, selectedExperiences]);

  // Trigger on filter change (reset page to 1)
  useEffect(() => {
    setPage(1);
    setDisplayedJobs([]);
    fetchJobs(1, false);
    fetchBookmarks();
  }, [debouncedSearch, debouncedLocation, sortBy, selectedJobTypes, selectedWorkModes, selectedExperiences]);

  // Sync URL params
  useEffect(() => {
    const params = new URLSearchParams();
    if (debouncedSearch.trim()) params.set('search', debouncedSearch.trim());
    if (debouncedLocation.trim()) params.set('location', debouncedLocation.trim());
    if (sortBy !== 'latest') params.set('sortBy', sortBy);
    selectedJobTypes.forEach(t => params.append('jobType', t));
    selectedWorkModes.forEach(m => params.append('workMode', m));
    selectedExperiences.forEach(e => params.append('experience', e));
    setSearchParams(params);
  }, [debouncedSearch, debouncedLocation, sortBy, selectedJobTypes, selectedWorkModes, selectedExperiences]);

  // ── Infinite Scroll Observer ─────────────────────────────────────────────
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loadingMore && !loading && page < pagination.totalPages) {
          const nextPage = page + 1;
          setPage(nextPage);
          fetchJobs(nextPage, true);
        }
      },
      { threshold: 0.1 }
    );
    if (loaderRef.current) observer.observe(loaderRef.current);
    return () => observer.disconnect();
  }, [loadingMore, loading, page, pagination.totalPages, fetchJobs]);

  // ── Checkbox filter helper ───────────────────────────────────────────────
  const handleCheckboxChange = (value, list, setList) => {
    setPage(1);
    if (list.includes(value)) setList(list.filter(i => i !== value));
    else setList([...list, value]);
  };

  // ── Reset all filters ────────────────────────────────────────────────────
  const resetFilters = () => {
    setSearch('');
    setLocation('');
    setSortBy('latest');
    setSelectedJobTypes([]);
    setSelectedWorkModes([]);
    setSelectedExperiences([]);
    setActiveSource('All');
    setPage(1);
    toast.success('Filters cleared');
  };

  // ── Toggle bookmark ──────────────────────────────────────────────────────
  const toggleSaveJob = async (jobId) => {
    if (!user) { toast.error('Please login to bookmark jobs.'); return; }
    if (user.role !== 'CANDIDATE') { toast.error('Only Candidates can bookmark jobs.'); return; }
    try {
      if (savedJobIds.has(jobId)) {
        const res = await api.get('/saved');
        const bookmark = res.data.data.find(item => item.jobId === jobId);
        if (bookmark) {
          await api.delete(`/saved/${bookmark.id}`);
          setSavedJobIds(prev => { const s = new Set(prev); s.delete(jobId); return s; });
          toast.success('Bookmark removed');
        }
      } else {
        await api.post('/saved', { jobId });
        setSavedJobIds(prev => new Set(prev).add(jobId));
        toast.success('Job bookmarked!');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error bookmarking job.');
    }
  };

  // ── Filter displayed jobs by active source tab ───────────────────────────
  const filteredBySource = activeSource === 'All'
    ? displayedJobs
    : displayedJobs.filter(j => j.source === activeSource);

  // Count by source for tab badges
  const sourceCounts = displayedJobs.reduce((acc, j) => {
    acc[j.source] = (acc[j.source] || 0) + 1;
    return acc;
  }, {});
  const availableSources = ['All', ...Object.keys(sourceCounts)].filter(
    s => s === 'All' || ALL_SOURCES.includes(s)
  );

  // ── Filter Panel (reused for desktop & mobile) ───────────────────────────
  const FilterPanel = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b dark:border-zinc-800 pb-3">
        <h3 className="font-bold text-base">Filter Jobs</h3>
        <button onClick={resetFilters} className="text-xs text-rose-500 hover:underline font-semibold">Clear All</button>
      </div>

      {/* Keyword */}
      <div className="space-y-1.5">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">Keywords</label>
        <div className="relative">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="e.g. React, Python..."
            className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl pl-9 pr-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
      </div>

      {/* Location */}
      <div className="space-y-1.5">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">Location</label>
        <div className="relative">
          <MapPin className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={location}
            onChange={(e) => { setLocation(e.target.value); setPage(1); }}
            placeholder="e.g. New York, Remote..."
            className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl pl-9 pr-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
      </div>

      {/* Job Type */}
      <div className="space-y-2">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">Job Type</h4>
        {['Full-time', 'Part-time', 'Contract', 'Internship'].map(type => (
          <label key={type} className="flex items-center gap-2.5 text-sm font-medium cursor-pointer">
            <input
              type="checkbox"
              checked={selectedJobTypes.includes(type)}
              onChange={() => handleCheckboxChange(type, selectedJobTypes, setSelectedJobTypes)}
              className="rounded text-primary-600 focus:ring-primary-500 border-slate-300 w-4 h-4"
            />
            {type}
          </label>
        ))}
      </div>

      {/* Work Mode */}
      <div className="space-y-2">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">Work Mode</h4>
        {['Remote', 'Hybrid', 'Onsite'].map(mode => (
          <label key={mode} className="flex items-center gap-2.5 text-sm font-medium cursor-pointer">
            <input
              type="checkbox"
              checked={selectedWorkModes.includes(mode)}
              onChange={() => handleCheckboxChange(mode, selectedWorkModes, setSelectedWorkModes)}
              className="rounded text-primary-600 focus:ring-primary-500 border-slate-300 w-4 h-4"
            />
            {mode}
          </label>
        ))}
      </div>

      {/* Experience */}
      <div className="space-y-2">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">Experience</h4>
        {['Entry Level', '2-5 years', '5+ years', 'Senior'].map(exp => (
          <label key={exp} className="flex items-center gap-2.5 text-sm font-medium cursor-pointer">
            <input
              type="checkbox"
              checked={selectedExperiences.includes(exp)}
              onChange={() => handleCheckboxChange(exp, selectedExperiences, setSelectedExperiences)}
              className="rounded text-primary-600 focus:ring-primary-500 border-slate-300 w-4 h-4"
            />
            {exp}
          </label>
        ))}
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="font-extrabold text-3xl tracking-tight">Explore Job Openings</h1>
          <p className="text-slate-500 dark:text-zinc-400 text-sm mt-1">
            {loading ? 'Fetching jobs from all providers...' : `${pagination.totalJobs.toLocaleString()} opportunities across all sources`}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => { setSortBy(e.target.value); setPage(1); }}
            className="px-4 py-2 border rounded-xl bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 text-sm font-semibold focus:outline-none"
          >
            <option value="latest">Sort: Latest</option>
            <option value="highest-salary">Sort: Highest Salary</option>
            <option value="lowest-salary">Sort: Lowest Salary</option>
          </select>

          {/* Grid / List toggle */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-zinc-900 p-1 rounded-xl">
            <button
              onClick={() => setIsGridView(true)}
              className={`p-1.5 rounded-lg transition-colors ${isGridView ? 'bg-white dark:bg-darkCard text-primary-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setIsGridView(false)}
              className={`p-1.5 rounded-lg transition-colors ${!isGridView ? 'bg-white dark:bg-darkCard text-primary-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          {/* Mobile filters button */}
          <button
            onClick={() => setShowMobileFilters(true)}
            className="md:hidden flex items-center gap-1.5 px-4 py-2 bg-primary-600 text-white font-bold rounded-xl text-sm"
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filters
          </button>
        </div>
      </div>

      {/* Source Filter Tabs */}
      {!loading && displayedJobs.length > 0 && (
        <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
          {availableSources.map(src => {
            const count = src === 'All' ? displayedJobs.length : sourceCounts[src] || 0;
            const style = src === 'All'
              ? { bg: 'bg-slate-800 dark:bg-zinc-700', text: 'text-white' }
              : getSourceStyle(src);
            const isActive = activeSource === src;
            return (
              <button
                key={src}
                onClick={() => setActiveSource(src)}
                className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${
                  isActive
                    ? `${src === 'All' ? 'bg-slate-800 dark:bg-zinc-700 text-white' : `${style.bg} ${style.text}`} border-transparent shadow-sm`
                    : 'bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-400 hover:border-slate-400'
                }`}
              >
                {src}
                <span className={`px-1.5 py-0.5 rounded-full text-xs font-bold ${isActive ? 'bg-white/20' : 'bg-slate-100 dark:bg-zinc-800'}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* Main Layout: Sidebar + Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

        {/* Desktop Sidebar */}
        <aside className="hidden lg:block">
          <div className="bg-white dark:bg-darkCard border border-slate-200 dark:border-darkBorder rounded-2xl p-6 shadow-sm sticky top-24">
            <FilterPanel />
          </div>
        </aside>

        {/* Job Cards Section */}
        <section className="lg:col-span-3 space-y-6">
          {loading ? (
            <JobSkeleton grid={isGridView} />
          ) : error ? (
            <div className="flex flex-col items-center justify-center p-12 bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-900/40 rounded-2xl text-center gap-3">
              <AlertCircle className="w-10 h-10" />
              <p className="font-semibold text-sm">{error}</p>
              <button
                onClick={() => fetchJobs(1, false)}
                className="inline-flex items-center gap-1.5 bg-rose-600 text-white font-bold text-sm px-4 py-2 rounded-xl hover:bg-rose-700 transition-all"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Retry
              </button>
            </div>
          ) : filteredBySource.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-16 bg-white dark:bg-darkCard border border-slate-200 dark:border-darkBorder rounded-3xl text-center space-y-4">
              <Briefcase className="w-16 h-16 text-slate-300 dark:text-zinc-700" />
              <div className="space-y-1">
                <h3 className="font-extrabold text-lg">No jobs found</h3>
                <p className="text-sm text-slate-500 dark:text-zinc-400 max-w-xs mx-auto">
                  Try clearing your filters or searching with different keywords.
                </p>
              </div>
              <button onClick={resetFilters} className="bg-primary-600 text-white font-bold text-sm px-5 py-2.5 rounded-xl hover:bg-primary-700 transition-colors">
                Clear Filters
              </button>
            </div>
          ) : (
            <>
              <div className={isGridView ? 'grid grid-cols-1 md:grid-cols-2 gap-5' : 'space-y-4'}>
                {filteredBySource.map(job => (
                  <JobCard
                    key={job.id}
                    job={job}
                    isGrid={isGridView}
                    isSaved={savedJobIds.has(job.id)}
                    onToggleSave={toggleSaveJob}
                    user={user}
                  />
                ))}
              </div>

              {/* Infinite scroll trigger */}
              <div ref={loaderRef} className="flex justify-center py-6">
                {loadingMore && (
                  <div className="flex items-center gap-2 text-slate-500 dark:text-zinc-400 text-sm font-medium">
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Loading more jobs...
                  </div>
                )}
                {!loadingMore && page >= pagination.totalPages && displayedJobs.length > 0 && (
                  <p className="text-xs text-slate-400 dark:text-zinc-600 font-medium">
                    ✓ All {pagination.totalJobs.toLocaleString()} jobs loaded
                  </p>
                )}
              </div>
            </>
          )}
        </section>
      </div>

      {/* Mobile Filters Drawer */}
      {showMobileFilters && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex justify-end" onClick={() => setShowMobileFilters(false)}>
          <div
            className="bg-white dark:bg-darkCard w-full max-w-xs h-full p-6 overflow-y-auto flex flex-col gap-6"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-lg">Filters</h2>
              <button onClick={() => setShowMobileFilters(false)}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <FilterPanel />
            <button
              onClick={() => setShowMobileFilters(false)}
              className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 rounded-xl text-sm mt-auto"
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
