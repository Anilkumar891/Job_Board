import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useDebounce } from '../hooks/useDebounce';
import { toast } from 'react-hot-toast';
import {
  Search, MapPin, Briefcase, DollarSign, Calendar, LayoutGrid, List,
  SlidersHorizontal, Bookmark, X, AlertCircle, ExternalLink,
  RefreshCw, Zap, Globe
} from 'lucide-react';

// ── Keep Render backend awake (prevents cold-start delay for shared users) ─
const BACKEND_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace('/api', '');
const pingBackend = () => {
  fetch(`${BACKEND_URL}/health`, { method: 'GET', cache: 'no-store' }).catch(() => {});
};

// ── Source badge color map ─────────────────────────────────────────────────
const SOURCE_COLORS = {
  Recruiter: { bg: 'bg-violet-100 dark:bg-violet-950/40', text: 'text-violet-700 dark:text-violet-300', dot: 'bg-violet-500' },
  LinkedIn:  { bg: 'bg-sky-100 dark:bg-sky-950/40',       text: 'text-sky-700 dark:text-sky-300',       dot: 'bg-sky-500' },
  Indeed:    { bg: 'bg-indigo-100 dark:bg-indigo-950/40', text: 'text-indigo-700 dark:text-indigo-300', dot: 'bg-indigo-500' },
  Naukri:    { bg: 'bg-orange-100 dark:bg-orange-950/40', text: 'text-orange-700 dark:text-orange-300', dot: 'bg-orange-500' },
  Glassdoor: { bg: 'bg-emerald-100 dark:bg-emerald-950/40', text: 'text-emerald-700 dark:text-emerald-300', dot: 'bg-emerald-500' },
  Wellfound: { bg: 'bg-rose-100 dark:bg-rose-950/40',     text: 'text-rose-700 dark:text-rose-300',     dot: 'bg-rose-500' },
  RemoteOK:  { bg: 'bg-cyan-100 dark:bg-cyan-950/40',     text: 'text-cyan-700 dark:text-cyan-300',     dot: 'bg-cyan-500' },
  Remotive:  { bg: 'bg-teal-100 dark:bg-teal-950/40',     text: 'text-teal-700 dark:text-teal-300',     dot: 'bg-teal-500' },
  Arbeitnow: { bg: 'bg-amber-100 dark:bg-amber-950/40',   text: 'text-amber-700 dark:text-amber-300',   dot: 'bg-amber-500' },
  Adzuna:    { bg: 'bg-lime-100 dark:bg-lime-950/40',     text: 'text-lime-700 dark:text-lime-300',     dot: 'bg-lime-600' },
  JSearch:   { bg: 'bg-fuchsia-100 dark:bg-fuchsia-950/40', text: 'text-fuchsia-700 dark:text-fuchsia-300', dot: 'bg-fuchsia-500' },
};
const getSourceStyle = (source) =>
  SOURCE_COLORS[source] || { bg: 'bg-slate-100 dark:bg-zinc-800', text: 'text-slate-600 dark:text-zinc-300', dot: 'bg-slate-400' };

function SourceBadge({ source }) {
  const s = getSourceStyle(source);
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${s.bg} ${s.text} whitespace-nowrap`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {source}
    </span>
  );
}

// ── Loading Skeleton ───────────────────────────────────────────────────────
function JobSkeleton({ count = 6, grid = true }) {
  return (
    <div className={grid ? 'grid grid-cols-1 md:grid-cols-2 gap-5' : 'space-y-4'}>
      {[...Array(count)].map((_, i) => (
        <div key={i} className="animate-pulse bg-white dark:bg-darkCard p-5 rounded-2xl border border-slate-200 dark:border-darkBorder space-y-4">
          <div className="flex gap-4 items-center">
            <div className="w-11 h-11 bg-slate-200 dark:bg-zinc-800 rounded-xl flex-shrink-0" />
            <div className="space-y-2 flex-grow">
              <div className="h-4 bg-slate-200 dark:bg-zinc-800 rounded w-3/4" />
              <div className="h-3 bg-slate-200 dark:bg-zinc-800 rounded w-1/2" />
            </div>
            <div className="w-20 h-6 bg-slate-200 dark:bg-zinc-800 rounded-full flex-shrink-0" />
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

// ── Job Card ───────────────────────────────────────────────────────────────
function JobCard({ job, isGrid, isSaved, onToggleSave }) {
  const isExternal = job.source !== 'Recruiter';
  const logo = job.companyLogo ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(job.company)}&background=6d28d9&color=fff&size=64`;
  const dateStr = job.postedDate
    ? new Date(job.postedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    : 'Recently';

  const handleSave = () => {
    if (isExternal) { toast.error('Bookmarking is only for recruiter-posted jobs.'); return; }
    onToggleSave(job.id);
  };

  const TitleEl = isExternal ? (
    <a
      href={job.applyUrl || '#'}
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
  );

  return (
    <div className={`group bg-white dark:bg-darkCard border border-slate-200 dark:border-darkBorder rounded-2xl p-5 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 flex flex-col justify-between gap-3 ${isGrid ? '' : 'md:flex-row md:items-center md:gap-6'}`}>

      <div className={`space-y-3 ${isGrid ? '' : 'md:flex-grow'}`}>
        {/* Header */}
        <div className="flex justify-between items-start gap-2">
          <div className="flex gap-3 min-w-0">
            <img
              src={logo}
              alt={`${job.company} logo`}
              className="w-11 h-11 object-cover rounded-xl border border-slate-100 dark:border-zinc-800 flex-shrink-0"
              onError={e => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(job.company)}&background=6d28d9&color=fff&size=64`; }}
            />
            <div className="min-w-0">
              {TitleEl}
              <span className="text-xs text-slate-500 dark:text-zinc-400 font-semibold truncate block">{job.company}</span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <SourceBadge source={job.source} />
            <button
              onClick={handleSave}
              className={`p-2 rounded-xl transition-all border ${
                isSaved
                  ? 'bg-primary-50 border-primary-200 text-primary-600 dark:bg-primary-950/20 dark:border-primary-900/40 dark:text-primary-400'
                  : 'bg-white border-slate-200 text-slate-400 hover:text-slate-600 dark:bg-zinc-900 dark:border-zinc-800 dark:hover:text-zinc-200'
              }`}
              title={isSaved ? 'Remove bookmark' : 'Bookmark job'}
            >
              <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-current' : ''}`} />
            </button>
          </div>
        </div>

        {/* Chips */}
        <div className="flex flex-wrap gap-1.5">
          <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-violet-50 text-violet-700 dark:bg-violet-950/30 dark:text-violet-300">
            {job.employmentType || 'Full-time'}
          </span>
          {job.remote && (
            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300">
              🌐 Remote
            </span>
          )}
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-sky-50 text-sky-700 dark:bg-sky-950/30 dark:text-sky-300">
            <MapPin className="w-3 h-3 mr-1" />{job.location}
          </span>
          {job.experience && (
            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-300">
              {job.experience}
            </span>
          )}
        </div>

        {/* Skills */}
        {Array.isArray(job.skills) && job.skills.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {job.skills.slice(0, 4).map((sk, i) => (
              <span key={i} className="px-2 py-0.5 bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 text-xs rounded-lg font-medium">{sk}</span>
            ))}
            {job.skills.length > 4 && (
              <span className="px-2 py-0.5 bg-slate-100 dark:bg-zinc-800 text-slate-400 text-xs rounded-lg">+{job.skills.length - 4}</span>
            )}
          </div>
        )}

        {/* Description */}
        <p className="text-xs text-slate-600 dark:text-zinc-400 font-medium leading-relaxed line-clamp-2">
          {(job.description || '').replace(/<[^>]*>/g, '').replace(/[#*_]/g, '').trim()}
        </p>
      </div>

      {/* Footer */}
      <div className={`flex items-center justify-between border-t border-slate-100 dark:border-zinc-800 pt-3 ${isGrid ? '' : 'md:border-t-0 md:pt-0 md:border-l md:pl-5 md:flex-col md:items-end md:gap-3 md:min-w-[170px]'}`}>
        <div>
          <div className="flex items-center gap-1 text-xs font-bold text-slate-700 dark:text-zinc-200">
            <DollarSign className="w-3.5 h-3.5 text-slate-400" />
            <span>{job.salary || 'Undisclosed'}</span>
          </div>
          <div className="flex items-center gap-1 mt-0.5 text-xs text-slate-400">
            <Calendar className="w-3 h-3" />
            <span>{dateStr}</span>
          </div>
        </div>

        {isExternal ? (
          <a
            href={job.applyUrl || '#'}
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
function BrowseJobs() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const loaderRef = useRef(null);

  // ── Phase 1: Recruiter jobs (fast) ──────────────────────────────────────
  const [recruiterJobs, setRecruiterJobs] = useState([]);
  const [recruiterLoading, setRecruiterLoading] = useState(true);
  const [recruiterError, setRecruiterError] = useState(null);
  const [recruiterPagination, setRecruiterPagination] = useState({ currentPage: 1, totalPages: 1, totalJobs: 0 });
  const [recruiterPage, setRecruiterPage] = useState(1);

  // ── Phase 2: External jobs (lazy) ───────────────────────────────────────
  const [externalJobs, setExternalJobs] = useState([]);
  const [externalLoading, setExternalLoading] = useState(false);
  const [externalPage, setExternalPage] = useState(1);
  const [externalPagination, setExternalPagination] = useState({ currentPage: 1, totalPages: 1, totalJobs: 0 });
  const [externalLoadMore, setExternalLoadMore] = useState(false);

  // ── Active source tab ────────────────────────────────────────────────────
  const [activeSource, setActiveSource] = useState('All');

  // ── Saved jobs ───────────────────────────────────────────────────────────
  const [savedJobIds, setSavedJobIds] = useState(new Set());

  // ── UI toggles ───────────────────────────────────────────────────────────
  const [isGridView, setIsGridView] = useState(true);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // ── Filters ──────────────────────────────────────────────────────────────
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [location, setLocation] = useState(searchParams.get('location') || '');
  const debouncedSearch = useDebounce(search, 500);
  const debouncedLocation = useDebounce(location, 500);
  const [sortBy, setSortBy] = useState(searchParams.get('sortBy') || 'latest');
  const [selectedJobTypes, setSelectedJobTypes] = useState(searchParams.getAll('jobType'));
  const [selectedWorkModes, setSelectedWorkModes] = useState(searchParams.getAll('workMode'));
  const [selectedExperiences, setSelectedExperiences] = useState(searchParams.getAll('experience'));

  // ── Ping backend on mount to wake Render cold start ─────────────────────
  useEffect(() => { pingBackend(); }, []);

  // ── Build filter params helper ───────────────────────────────────────────
  const buildParams = useCallback((page, limit = 12) => {
    const p = {
      search: debouncedSearch.trim() || undefined,
      location: debouncedLocation.trim() || undefined,
      sortBy: sortBy || undefined,
      page,
      limit,
    };
    if (selectedJobTypes.length) p.jobType = selectedJobTypes;
    if (selectedWorkModes.length) p.workMode = selectedWorkModes;
    if (selectedExperiences.length) p.experience = selectedExperiences;
    return p;
  }, [debouncedSearch, debouncedLocation, sortBy, selectedJobTypes, selectedWorkModes, selectedExperiences]);

  // ── PHASE 1: Fetch recruiter jobs (instant DB query) ────────────────────
  const fetchRecruiterJobs = useCallback(async (page = 1, append = false) => {
    if (!append) setRecruiterLoading(true);
    setRecruiterError(null);
    try {
      const res = await api.get('/jobs', { params: buildParams(page) });
      if (res.data.success) {
        const incoming = res.data.data;
        setRecruiterJobs(prev => append ? [...prev, ...incoming] : incoming);
        setRecruiterPagination(res.data.pagination);
      }
    } catch (err) {
      setRecruiterError(err.response?.data?.message || 'Failed to load jobs. Please try again.');
    } finally {
      setRecruiterLoading(false);
    }
  }, [buildParams]);

  // ── PHASE 2: Fetch external jobs (lazy, non-blocking) ───────────────────
  const fetchExternalJobs = useCallback(async (page = 1, append = false) => {
    if (!append) setExternalLoading(true);
    else setExternalLoadMore(true);
    try {
      const res = await api.get('/jobs/external', { params: buildParams(page, 20) });
      if (res.data.success) {
        const incoming = res.data.data;
        setExternalJobs(prev => append ? [...prev, ...incoming] : incoming);
        setExternalPagination(res.data.pagination);
      }
    } catch (err) {
      console.error('[External jobs]', err.message);
      // Silently fail — recruiter jobs still show
    } finally {
      setExternalLoading(false);
      setExternalLoadMore(false);
    }
  }, [buildParams]);

  // ── Reset & reload on filter change ──────────────────────────────────────
  useEffect(() => {
    setRecruiterJobs([]);
    setExternalJobs([]);
    setRecruiterPage(1);
    setExternalPage(1);
    setActiveSource('All');
    fetchRecruiterJobs(1, false);
    // Delay external fetch so recruiter jobs render first
    const t = setTimeout(() => fetchExternalJobs(1, false), 300);
    return () => clearTimeout(t);
  }, [debouncedSearch, debouncedLocation, sortBy, selectedJobTypes, selectedWorkModes, selectedExperiences]);

  // ── Fetch bookmarks ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!user || user.role !== 'CANDIDATE') return;
    api.get('/saved').then(res => {
      if (res.data.success) setSavedJobIds(new Set(res.data.data.map(i => i.jobId)));
    }).catch(() => {});
  }, [user]);

  // ── Sync URL params ──────────────────────────────────────────────────────
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

  // ── Infinite scroll observer for external jobs ───────────────────────────
  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      if (
        entries[0].isIntersecting &&
        !externalLoadMore &&
        !externalLoading &&
        externalPage < externalPagination.totalPages
      ) {
        const next = externalPage + 1;
        setExternalPage(next);
        fetchExternalJobs(next, true);
      }
    }, { threshold: 0.1 });
    if (loaderRef.current) observer.observe(loaderRef.current);
    return () => observer.disconnect();
  }, [externalLoadMore, externalLoading, externalPage, externalPagination.totalPages, fetchExternalJobs]);

  // ── Filter helpers ───────────────────────────────────────────────────────
  const handleCheckbox = (val, list, setList) => {
    if (list.includes(val)) setList(list.filter(i => i !== val));
    else setList([...list, val]);
  };

  const resetFilters = () => {
    setSearch(''); setLocation(''); setSortBy('latest');
    setSelectedJobTypes([]); setSelectedWorkModes([]); setSelectedExperiences([]);
    setActiveSource('All');
    toast.success('Filters cleared');
  };

  // ── Toggle bookmark ──────────────────────────────────────────────────────
  const toggleSaveJob = async (jobId) => {
    if (!user) { toast.error('Please login to bookmark jobs.'); return; }
    if (user.role !== 'CANDIDATE') { toast.error('Only Candidates can bookmark jobs.'); return; }
    try {
      if (savedJobIds.has(jobId)) {
        const res = await api.get('/saved');
        const bm = res.data.data.find(i => i.jobId === jobId);
        if (bm) {
          await api.delete(`/saved/${bm.id}`);
          setSavedJobIds(prev => { const s = new Set(prev); s.delete(jobId); return s; });
          toast.success('Bookmark removed');
        }
      } else {
        await api.post('/saved', { jobId });
        setSavedJobIds(prev => new Set(prev).add(jobId));
        toast.success('Job bookmarked!');
      }
    } catch (err) { toast.error('Error bookmarking job.'); }
  };

  // ── Merged job list for display ──────────────────────────────────────────
  const allJobs = [...recruiterJobs, ...externalJobs];
  const displayJobs = activeSource === 'All'
    ? allJobs
    : allJobs.filter(j => j.source === activeSource);

  // Source tab counts
  const sourceCounts = allJobs.reduce((acc, j) => {
    acc[j.source] = (acc[j.source] || 0) + 1;
    return acc;
  }, {});
  const totalCount = recruiterPagination.totalJobs + externalPagination.totalJobs;

  // ── Filter panel (shared desktop + mobile) ───────────────────────────────
  const FilterPanel = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b dark:border-zinc-800 pb-3">
        <h3 className="font-bold text-base">Filter Jobs</h3>
        <button onClick={resetFilters} className="text-xs text-rose-500 hover:underline font-semibold">Clear All</button>
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">Keywords</label>
        <div className="relative">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text" value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="e.g. React, Python..."
            className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl pl-9 pr-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">Location</label>
        <div className="relative">
          <MapPin className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text" value={location}
            onChange={e => setLocation(e.target.value)}
            placeholder="e.g. New York, Remote..."
            className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl pl-9 pr-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
      </div>

      <div className="space-y-2">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">Job Type</h4>
        {['Full-time', 'Part-time', 'Contract', 'Internship'].map(t => (
          <label key={t} className="flex items-center gap-2.5 text-sm font-medium cursor-pointer">
            <input type="checkbox" checked={selectedJobTypes.includes(t)}
              onChange={() => handleCheckbox(t, selectedJobTypes, setSelectedJobTypes)}
              className="rounded text-primary-600 focus:ring-primary-500 border-slate-300 w-4 h-4" />
            {t}
          </label>
        ))}
      </div>

      <div className="space-y-2">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">Work Mode</h4>
        {['Remote', 'Hybrid', 'Onsite'].map(m => (
          <label key={m} className="flex items-center gap-2.5 text-sm font-medium cursor-pointer">
            <input type="checkbox" checked={selectedWorkModes.includes(m)}
              onChange={() => handleCheckbox(m, selectedWorkModes, setSelectedWorkModes)}
              className="rounded text-primary-600 focus:ring-primary-500 border-slate-300 w-4 h-4" />
            {m}
          </label>
        ))}
      </div>

      <div className="space-y-2">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">Experience</h4>
        {['Entry Level', '2-5 years', '5+ years', 'Senior'].map(e => (
          <label key={e} className="flex items-center gap-2.5 text-sm font-medium cursor-pointer">
            <input type="checkbox" checked={selectedExperiences.includes(e)}
              onChange={() => handleCheckbox(e, selectedExperiences, setSelectedExperiences)}
              className="rounded text-primary-600 focus:ring-primary-500 border-slate-300 w-4 h-4" />
            {e}
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
          <p className="text-slate-500 dark:text-zinc-400 text-sm mt-1 flex items-center gap-2">
            {recruiterLoading
              ? <><RefreshCw className="w-3.5 h-3.5 animate-spin" /> Fetching jobs...</>
              : <>{totalCount.toLocaleString()} opportunities across all sources
                {externalLoading && <span className="inline-flex items-center gap-1 text-xs text-primary-500"><RefreshCw className="w-3 h-3 animate-spin" /> loading more...</span>}
              </>
            }
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
            className="px-4 py-2 border rounded-xl bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 text-sm font-semibold focus:outline-none"
          >
            <option value="latest">Sort: Latest</option>
            <option value="highest-salary">Sort: Highest Salary</option>
            <option value="lowest-salary">Sort: Lowest Salary</option>
          </select>

          <div className="flex items-center gap-1 bg-slate-100 dark:bg-zinc-900 p-1 rounded-xl">
            <button onClick={() => setIsGridView(true)}
              className={`p-1.5 rounded-lg transition-colors ${isGridView ? 'bg-white dark:bg-darkCard text-primary-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button onClick={() => setIsGridView(false)}
              className={`p-1.5 rounded-lg transition-colors ${!isGridView ? 'bg-white dark:bg-darkCard text-primary-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>
              <List className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={() => setShowMobileFilters(true)}
            className="md:hidden flex items-center gap-1.5 px-4 py-2 bg-primary-600 text-white font-bold rounded-xl text-sm"
          >
            <SlidersHorizontal className="w-4 h-4" />Filters
          </button>
        </div>
      </div>

      {/* Source tabs */}
      {!recruiterLoading && allJobs.length > 0 && (
        <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-1">
          {['All', ...Object.keys(sourceCounts)].map(src => {
            const count = src === 'All' ? allJobs.length : sourceCounts[src] || 0;
            const isActive = activeSource === src;
            const style = getSourceStyle(src);
            return (
              <button key={src} onClick={() => setActiveSource(src)}
                className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${
                  isActive
                    ? src === 'All'
                      ? 'bg-slate-800 dark:bg-zinc-700 text-white border-transparent'
                      : `${style.bg} ${style.text} border-transparent shadow-sm`
                    : 'bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 text-slate-500 dark:text-zinc-400 hover:border-slate-400'
                }`}
              >
                {src}
                <span className={`px-1.5 py-0.5 rounded-full text-xs font-bold ${isActive ? 'bg-black/10 dark:bg-white/10' : 'bg-slate-100 dark:bg-zinc-800'}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

        {/* Desktop Sidebar */}
        <aside className="hidden lg:block">
          <div className="bg-white dark:bg-darkCard border border-slate-200 dark:border-darkBorder rounded-2xl p-6 shadow-sm sticky top-24">
            <FilterPanel />
          </div>
        </aside>

        {/* Jobs section */}
        <section className="lg:col-span-3 space-y-4">

          {/* Phase 1 loading */}
          {recruiterLoading ? (
            <JobSkeleton count={6} grid={isGridView} />
          ) : recruiterError ? (
            <div className="flex flex-col items-center justify-center p-12 bg-rose-50 dark:bg-rose-950/20 text-rose-600 border border-rose-100 dark:border-rose-900/40 rounded-2xl text-center gap-3">
              <AlertCircle className="w-10 h-10" />
              <p className="font-semibold text-sm">{recruiterError}</p>
              <button onClick={() => fetchRecruiterJobs(1)}
                className="inline-flex items-center gap-1.5 bg-rose-600 text-white font-bold text-sm px-4 py-2 rounded-xl hover:bg-rose-700">
                <RefreshCw className="w-3.5 h-3.5" /> Retry
              </button>
            </div>
          ) : displayJobs.length === 0 && !externalLoading ? (
            <div className="flex flex-col items-center justify-center p-16 bg-white dark:bg-darkCard border border-slate-200 dark:border-darkBorder rounded-3xl text-center space-y-4">
              <Briefcase className="w-16 h-16 text-slate-300 dark:text-zinc-700" />
              <div className="space-y-1">
                <h3 className="font-extrabold text-lg">No jobs found</h3>
                <p className="text-sm text-slate-500 dark:text-zinc-400 max-w-xs mx-auto">
                  Try different keywords or clear your filters.
                </p>
              </div>
              <button onClick={resetFilters} className="bg-primary-600 text-white font-bold text-sm px-5 py-2.5 rounded-xl hover:bg-primary-700">
                Clear Filters
              </button>
            </div>
          ) : (
            <>
              {/* Job grid */}
              <div className={isGridView ? 'grid grid-cols-1 md:grid-cols-2 gap-5' : 'space-y-4'}>
                {displayJobs.map(job => (
                  <JobCard
                    key={job.id}
                    job={job}
                    isGrid={isGridView}
                    isSaved={savedJobIds.has(job.id)}
                    onToggleSave={toggleSaveJob}
                  />
                ))}
              </div>

              {/* Phase 2 skeleton — external loading for first time */}
              {externalLoading && externalJobs.length === 0 && (
                <div className="mt-2">
                  <div className="flex items-center gap-2 mb-4 text-xs font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">
                    <Globe className="w-4 h-4" />
                    Loading external job boards...
                  </div>
                  <JobSkeleton count={4} grid={isGridView} />
                </div>
              )}

              {/* Recruiter pagination (if not using infinite scroll for recruiter) */}
              {!externalLoading && recruiterPagination.totalPages > 1 && activeSource === 'Recruiter' && (
                <div className="flex items-center justify-center gap-2 pt-4">
                  <button disabled={recruiterPage === 1}
                    onClick={() => { const p = recruiterPage - 1; setRecruiterPage(p); fetchRecruiterJobs(p, false); }}
                    className="px-4 py-2 border rounded-xl text-sm font-semibold bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 disabled:opacity-50">
                    Previous
                  </button>
                  <span className="text-xs font-bold text-slate-500 dark:text-zinc-400">
                    Page {recruiterPagination.currentPage} of {recruiterPagination.totalPages}
                  </span>
                  <button disabled={recruiterPage === recruiterPagination.totalPages}
                    onClick={() => { const p = recruiterPage + 1; setRecruiterPage(p); fetchRecruiterJobs(p, true); }}
                    className="px-4 py-2 border rounded-xl text-sm font-semibold bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 disabled:opacity-50">
                    Next
                  </button>
                </div>
              )}

              {/* Infinite scroll trigger for external */}
              <div ref={loaderRef} className="flex justify-center py-6">
                {externalLoadMore && (
                  <div className="flex items-center gap-2 text-slate-500 dark:text-zinc-400 text-sm font-medium">
                    <RefreshCw className="w-4 h-4 animate-spin" />Loading more jobs...
                  </div>
                )}
                {!externalLoading && !externalLoadMore && externalPage >= externalPagination.totalPages && allJobs.length > 0 && (
                  <p className="text-xs text-slate-400 dark:text-zinc-600 font-medium">
                    ✓ All {allJobs.length.toLocaleString()} jobs loaded
                  </p>
                )}
              </div>
            </>
          )}
        </section>
      </div>

      {/* Mobile filters drawer */}
      {showMobileFilters && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex justify-end"
          onClick={() => setShowMobileFilters(false)}>
          <div className="bg-white dark:bg-darkCard w-full max-w-xs h-full p-6 overflow-y-auto flex flex-col gap-6"
            onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-lg">Filters</h2>
              <button onClick={() => setShowMobileFilters(false)}><X className="w-5 h-5" /></button>
            </div>
            <FilterPanel />
            <button onClick={() => setShowMobileFilters(false)}
              className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 rounded-xl text-sm mt-auto">
              Apply Filters
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default BrowseJobs;
