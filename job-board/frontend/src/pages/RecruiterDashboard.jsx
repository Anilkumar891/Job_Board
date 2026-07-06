import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Briefcase,
  Users,
  Clock,
  CheckCircle,
  FileText,
  MapPin,
  Calendar,
  XCircle,
  Edit,
  Trash2,
  ExternalLink,
  ChevronDown,
  Search,
  Filter,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';

const STATUS_OPTIONS = [
  { value: 'WISHLIST', label: 'Wishlist' },
  { value: 'APPLIED', label: 'Applied' },
  { value: 'SCREENING', label: 'Screening' },
  { value: 'ASSESSMENT', label: 'Assessment' },
  { value: 'INTERVIEW', label: 'Interview' },
  { value: 'HR_ROUND', label: 'HR Round' },
  { value: 'OFFER', label: 'Offer' },
  { value: 'REJECTED', label: 'Rejected' },
  { value: 'JOINED', label: 'Joined' }
];

const STATUS_STYLES = {
  WISHLIST: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-zinc-300',
  APPLIED: 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400',
  SCREENING: 'bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400',
  ASSESSMENT: 'bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400',
  INTERVIEW: 'bg-orange-50 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400',
  HR_ROUND: 'bg-pink-50 text-pink-700 dark:bg-pink-900/20 dark:text-pink-400',
  OFFER: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-400',
  REJECTED: 'bg-rose-50 text-rose-700 dark:bg-rose-900/20 dark:text-rose-400',
  JOINED: 'bg-teal-100 text-teal-855 dark:bg-teal-900/20 dark:text-teal-400'
};

function RecruiterDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('jobs');
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search/Filters for applicants
  const [applicantSearch, setApplicantSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [jobsRes, appsRes] = await Promise.all([
        api.get('/jobs/my-postings'),
        api.get('/applications')
      ]);
      setJobs(jobsRes.data.data);
      setApplications(appsRes.data.data);
    } catch (error) {
      console.error('Error loading recruiter dashboard:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  // Update applicant status
  const handleStatusChange = async (appId, newStatus) => {
    try {
      const response = await api.put(`/applications/${appId}/status`, { status: newStatus });
      if (response.data.success) {
        toast.success(`Status updated to ${newStatus}`);
        setApplications(prev =>
          prev.map(app => (app.id === appId ? { ...app, status: newStatus } : app))
        );
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || 'Error updating status');
    }
  };

  // Toggle Job Status (ACTIVE / CLOSED)
  const handleToggleJobStatus = async (jobId, currentStatus) => {
    const nextStatus = currentStatus === 'ACTIVE' ? 'CLOSED' : 'ACTIVE';
    try {
      const response = await api.put(`/jobs/${jobId}`, { status: nextStatus });
      if (response.data.success) {
        toast.success(`Job is now ${nextStatus.toLowerCase()}`);
        setJobs(prev =>
          prev.map(job => (job.id === jobId ? { ...job, status: nextStatus } : job))
        );
      }
    } catch (error) {
      toast.error('Failed to update job status');
    }
  };

  // Delete Job Posting
  const handleDeleteJob = async (jobId) => {
    if (!window.confirm('Are you sure you want to delete this job posting permanently?')) return;
    try {
      const response = await api.delete(`/jobs/${jobId}`);
      if (response.data.success) {
        toast.success('Job posting deleted successfully');
        setJobs(prev => prev.filter(job => job.id !== jobId));
        // Remove associated applications from view
        setApplications(prev => prev.filter(app => app.jobId !== jobId));
      }
    } catch (error) {
      toast.error('Failed to delete job posting');
    }
  };

  // Calculate Metrics
  const totalJobs = jobs.length;
  const activeJobs = jobs.filter(job => job.status === 'ACTIVE').length;
  const closedJobs = jobs.filter(job => job.status === 'CLOSED').length;
  const totalApplicants = applications.length;
  const interviewsCount = applications.filter(app => app.status === 'INTERVIEW').length;
  const offersCount = applications.filter(app => app.status === 'OFFER' || app.status === 'JOINED').length;

  // Filtered applicants list
  const filteredApplicants = applications.filter(app => {
    const matchesSearch =
      app.candidate.name.toLowerCase().includes(applicantSearch.toLowerCase()) ||
      app.candidate.email.toLowerCase().includes(applicantSearch.toLowerCase()) ||
      app.job.title.toLowerCase().includes(applicantSearch.toLowerCase());
    const matchesStatus = statusFilter ? app.status === statusFilter : true;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Title / Action Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-sans font-extrabold text-3xl tracking-tight">Recruiter Dashboard</h1>
          <p className="text-slate-500 dark:text-zinc-400 text-sm font-medium">
            Manage your listings and review incoming candidates.
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            to="/create-job"
            className="bg-primary-600 hover:bg-primary-700 text-white font-bold text-sm px-5 py-3 rounded-xl transition-all shadow-sm flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            Post a New Job
          </Link>
        </div>
      </div>

      {/* Grid Stats Widget */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        {[
          { label: 'Total Postings', count: totalJobs, icon: Briefcase, color: 'text-violet-500 bg-violet-50 dark:bg-violet-950/20' },
          { label: 'Active Listings', count: activeJobs, icon: Briefcase, color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/20' },
          { label: 'Closed Jobs', count: closedJobs, icon: XCircle, color: 'text-slate-400 bg-slate-50 dark:bg-zinc-900/60' },
          { label: 'Total Applicants', count: totalApplicants, icon: Users, color: 'text-primary-500 bg-primary-50 dark:bg-primary-950/20' },
          { label: 'Interviews Scheduled', count: interviewsCount, icon: Clock, color: 'text-orange-500 bg-orange-50 dark:bg-orange-950/20' },
          { label: 'Offers Handed', count: offersCount, icon: CheckCircle, color: 'text-pink-500 bg-pink-50 dark:bg-pink-950/20' }
        ].map((stat, idx) => (
          <div key={idx} className="bg-white dark:bg-darkCard border border-slate-200 dark:border-darkBorder rounded-2xl p-4 shadow-premium space-y-2 flex flex-col justify-between">
            <div className={`p-2.5 rounded-lg w-fit ${stat.color}`}>
              <stat.icon className="w-4.5 h-4.5" />
            </div>
            <div className="space-y-0.5">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{stat.label}</div>
              <div className="text-xl font-extrabold text-slate-800 dark:text-zinc-150">{stat.count}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Tab Selectors */}
      <div className="flex border-b border-slate-200 dark:border-zinc-800 gap-6">
        <button
          onClick={() => setActiveTab('jobs')}
          className={`pb-3 text-sm font-bold border-b-2 transition-all flex items-center gap-1.5 ${
            activeTab === 'jobs'
              ? 'border-primary-600 text-primary-600 dark:border-primary-400 dark:text-primary-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-zinc-200'
          }`}
        >
          <Briefcase className="w-4.5 h-4.5" />
          Active Job Listings ({jobs.length})
        </button>
        <button
          onClick={() => setActiveTab('applicants')}
          className={`pb-3 text-sm font-bold border-b-2 transition-all flex items-center gap-1.5 ${
            activeTab === 'applicants'
              ? 'border-primary-600 text-primary-600 dark:border-primary-400 dark:text-primary-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-zinc-200'
          }`}
        >
          <Users className="w-4.5 h-4.5" />
          Review Candidates ({applications.length})
        </button>
      </div>

      {/* Content Render panels */}
      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse bg-white dark:bg-darkCard p-6 rounded-2xl border border-slate-200 dark:border-darkBorder h-24"></div>
          ))}
        </div>
      ) : (
        <div>
          {/* TAB 1: LISTINGS */}
          {activeTab === 'jobs' && (
            <div className="space-y-4">
              {jobs.length === 0 ? (
                <div className="text-center py-16 bg-white dark:bg-darkCard border border-slate-200 dark:border-darkBorder rounded-3xl space-y-4">
                  <Briefcase className="w-16 h-16 text-slate-300 dark:text-zinc-700 mx-auto" />
                  <div>
                    <h3 className="font-sans font-bold text-base">No job postings created</h3>
                    <p className="text-xs text-slate-400 max-w-xs mx-auto">Get started by creating your first corporate job post.</p>
                  </div>
                  <Link
                    to="/create-job"
                    className="inline-block bg-primary-600 text-white font-bold text-xs px-5 py-2.5 rounded-xl hover:bg-primary-700 transition-colors"
                  >
                    Post a Job
                  </Link>
                </div>
              ) : (
                jobs.map((job) => (
                  <div
                    key={job.id}
                    className="bg-white dark:bg-darkCard border border-slate-200 dark:border-darkBorder rounded-2xl p-6 shadow-premium hover:shadow-premium-hover transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                  >
                    {/* Info */}
                    <div className="flex gap-4">
                      <div className="p-3 bg-slate-50 dark:bg-zinc-900 rounded-xl h-fit border dark:border-zinc-850">
                        <Briefcase className="w-6 h-6 text-primary-500" />
                      </div>
                      <div>
                        <h3 className="font-sans font-bold text-base text-slate-800 dark:text-zinc-150">
                          {job.title}
                        </h3>
                        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400 font-semibold mt-1">
                          <span>{job.company.name}</span>
                          <span>•</span>
                          <span>{job.location}</span>
                          <span>•</span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            job.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600 dark:bg-zinc-800 dark:text-zinc-400'
                          }`}>{job.status}</span>
                        </div>
                        <div className="text-[10px] text-slate-400 font-bold mt-2">
                          {job._count?.applications || 0} Submissions received
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 w-full md:w-auto justify-end">
                      
                      {/* Active/Closed toggle */}
                      <button
                        onClick={() => handleToggleJobStatus(job.id, job.status)}
                        className={`p-2 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-colors ${
                          job.status === 'ACTIVE'
                            ? 'bg-emerald-50 border-emerald-250 text-emerald-600 dark:bg-emerald-950/20'
                            : 'bg-slate-50 border-slate-200 text-slate-400 dark:bg-zinc-900'
                        }`}
                        title={job.status === 'ACTIVE' ? 'Close Job Posting' : 'Reopen Job Posting'}
                      >
                        {job.status === 'ACTIVE' ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                        <span>{job.status === 'ACTIVE' ? 'Active' : 'Closed'}</span>
                      </button>

                      {/* Edit Button */}
                      <button
                        onClick={() => navigate(`/edit-job/${job.id}`)}
                        className="p-2 rounded-xl border border-slate-200 hover:border-primary-500 text-slate-500 hover:text-primary-600 dark:border-zinc-800 dark:hover:border-primary-550 flex items-center justify-center"
                        title="Edit Job details"
                      >
                        <Edit className="w-4.5 h-4.5" />
                      </button>

                      {/* Delete Button */}
                      <button
                        onClick={() => handleDeleteJob(job.id)}
                        className="p-2 rounded-xl border border-slate-200 hover:border-rose-500 text-slate-400 hover:text-rose-600 dark:border-zinc-800 dark:hover:border-rose-950/40 flex items-center justify-center"
                        title="Delete posting permanently"
                      >
                        <Trash2 className="w-4.5 h-4.5" />
                      </button>

                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 2: CANDIDATE APPLICATIONS */}
          {activeTab === 'applicants' && (
            <div className="space-y-6">
              
              {/* Search/Filter Controls Bar */}
              <div className="flex flex-col md:flex-row gap-4 bg-white dark:bg-darkCard border border-slate-200 dark:border-darkBorder rounded-2xl p-4 shadow-premium">
                <div className="relative flex-grow">
                  <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={applicantSearch}
                    onChange={(e) => setApplicantSearch(e.target.value)}
                    placeholder="Search by candidate name, email, or position..."
                    className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl pl-9 pr-3 py-2 text-sm focus:outline-none"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-slate-400 flex-shrink-0" />
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-sm focus:outline-none"
                  >
                    <option value="">All Statuses</option>
                    {STATUS_OPTIONS.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Applicants List */}
              {filteredApplicants.length === 0 ? (
                <div className="text-center py-16 bg-white dark:bg-darkCard border border-slate-200 dark:border-darkBorder rounded-3xl">
                  <Users className="w-16 h-16 text-slate-300 dark:text-zinc-700 mx-auto mb-2" />
                  <h3 className="font-sans font-bold text-base">No applicants matching criteria</h3>
                  <p className="text-xs text-slate-400">Try adjusting your filters or search keywords.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredApplicants.map((app) => (
                    <div
                      key={app.id}
                      className="bg-white dark:bg-darkCard border border-slate-200 dark:border-darkBorder rounded-2xl p-6 shadow-premium hover:shadow-premium-hover transition-all flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6"
                    >
                      {/* Candidate info + job target */}
                      <div className="space-y-3 min-w-0 flex-grow">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-primary-100 dark:bg-primary-950/40 text-primary-650 dark:text-primary-400 rounded-full flex items-center justify-center font-sans font-extrabold text-sm">
                            {app.candidate.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <h4 className="font-sans font-bold text-sm text-slate-800 dark:text-zinc-200">{app.candidate.name}</h4>
                            <p className="text-xs text-slate-400 font-semibold">{app.candidate.email}</p>
                          </div>
                        </div>

                        {/* Job target */}
                        <div className="bg-slate-50 dark:bg-zinc-900/40 p-3 rounded-xl border dark:border-zinc-850 space-y-1">
                          <div className="text-[10px] text-slate-400 font-semibold uppercase">Applied Position</div>
                          <div className="text-xs font-bold text-slate-700 dark:text-zinc-300 truncate">{app.job.title}</div>
                        </div>

                        {/* Candidate Cover Letter preview if exists */}
                        {app.coverLetter && (
                          <p className="text-xs text-slate-500 dark:text-zinc-400 italic line-clamp-2 leading-relaxed bg-slate-50/50 p-2.5 rounded-lg">
                            Cover Letter: "{app.coverLetter}"
                          </p>
                        )}
                      </div>

                      {/* Status management & resume actions */}
                      <div className="flex flex-wrap lg:flex-col items-end gap-3 w-full lg:w-auto justify-between lg:justify-end border-t lg:border-t-0 pt-4 lg:pt-0">
                        {/* Date applied */}
                        <div className="text-[10px] font-semibold text-slate-400 flex items-center gap-1 self-start lg:self-auto">
                          <Calendar className="w-3.5 h-3.5" />
                          Applied {new Date(app.appliedAt).toLocaleDateString()}
                        </div>

                        {/* Select dropdown status manager */}
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-slate-400 font-bold uppercase">Status</span>
                          <select
                            value={app.status}
                            onChange={(e) => handleStatusChange(app.id, e.target.value)}
                            className={`px-3 py-1.5 border rounded-xl text-xs font-bold focus:outline-none border-slate-200 dark:border-zinc-800 ${
                              STATUS_STYLES[app.status] || ''
                            }`}
                          >
                            {STATUS_OPTIONS.map(opt => (
                              <option key={opt.value} value={opt.value} className="bg-white dark:bg-zinc-900 text-slate-800 dark:text-zinc-200">
                                {opt.label}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Resume File URL */}
                        {app.resumeUrl && (
                          <a
                            href={`https://job-board-backend-yzf4.onrender.com${app.resumeUrl}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-250 dark:bg-zinc-800 text-slate-700 dark:text-zinc-350 font-bold rounded-lg text-xs"
                          >
                            <FileText className="w-3.5 h-3.5 text-primary-500" />
                            View CV
                            <ExternalLink className="w-3 h-3 text-slate-400" />
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

            </div>
          )}
        </div>
      )}

    </div>
  );
}

export default RecruiterDashboard;
