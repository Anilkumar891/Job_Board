import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Briefcase,
  Bookmark,
  Calendar,
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  HelpCircle,
  TrendingUp,
  MapPin,
  ChevronRight,
  Edit3,
  Check,
  Eye,
  Sliders
} from 'lucide-react';

// Status colors and display values mapping
const STATUS_CONFIG = {
  WISHLIST: { text: 'Wishlist', bg: 'bg-slate-100 text-slate-700 dark:bg-slate-900/60 dark:text-slate-300', index: 0 },
  APPLIED: { text: 'Applied', bg: 'bg-blue-50 text-blue-700 dark:bg-blue-950/20 dark:text-blue-400', index: 1 },
  SCREENING: { text: 'Screening', bg: 'bg-amber-50 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400', index: 2 },
  ASSESSMENT: { text: 'Assessment', bg: 'bg-purple-50 text-purple-700 dark:bg-purple-950/20 dark:text-purple-400', index: 3 },
  INTERVIEW: { text: 'Interview', bg: 'bg-orange-50 text-orange-700 dark:bg-orange-950/20 dark:text-orange-400', index: 4 },
  HR_ROUND: { text: 'HR Round', bg: 'bg-pink-50 text-pink-700 dark:bg-pink-950/20 dark:text-pink-400', index: 5 },
  OFFER: { text: 'Offer Made', bg: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-400', index: 6 },
  REJECTED: { text: 'Rejected', bg: 'bg-rose-50 text-rose-700 dark:bg-rose-950/20 dark:text-rose-400', index: -1 },
  JOINED: { text: 'Joined', bg: 'bg-teal-100 text-teal-800 dark:bg-teal-950/30 dark:text-teal-400', index: 7 }
};

const PIPELINE_STAGES = [
  'WISHLIST',
  'APPLIED',
  'SCREENING',
  'ASSESSMENT',
  'INTERVIEW',
  'HR_ROUND',
  'OFFER',
  'JOINED'
];

function CandidateDashboard() {
  const { user } = useAuth();
  
  // Tab control: 'applications' or 'bookmarks'
  const [activeTab, setActiveTab] = useState('applications');
  
  // API Data
  const [applications, setApplications] = useState([]);
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);

  // Notes editing state
  const [editingAppId, setEditingAppId] = useState(null);
  const [tempNotes, setTempNotes] = useState('');
  const [savingNotes, setSavingNotes] = useState(false);

  // Selected application for detail drawer
  const [selectedApp, setSelectedApp] = useState(null);

  // Wrap API requests — defined FIRST so fetchData can call it
  const fetchAllData = () =>
    Promise.all([
      api.get('/applications'),
      api.get('/saved')
    ]);

  // Fetch initial data
  const fetchData = async () => {
    setLoading(true);
    try {
      const [appRes, bookmarkRes] = await fetchAllData();
      setApplications(appRes.data.data);
      setBookmarks(bookmarkRes.data.data);
    } catch (err) {
      console.error('Fetch error:', err.message);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Unsave a job
  const handleRemoveBookmark = async (bookmarkId) => {
    try {
      const response = await api.delete(`/saved/${bookmarkId}`);
      if (response.data.success) {
        toast.success('Bookmark removed');
        setBookmarks(prev => prev.filter(item => item.id !== bookmarkId));
      }
    } catch (err) {
      toast.error('Error removing bookmark');
    }
  };

  // Inline notes update
  const handleNotesUpdate = async (appId) => {
    setSavingNotes(true);
    try {
      const response = await api.put(`/applications/${appId}/notes`, { notes: tempNotes });
      if (response.data.success) {
        toast.success('Tracking notes saved');
        setApplications(prev =>
          prev.map(app => (app.id === appId ? { ...app, notes: tempNotes } : app))
        );
        if (selectedApp && selectedApp.id === appId) {
          setSelectedApp(prev => ({ ...prev, notes: tempNotes }));
        }
        setEditingAppId(null);
      }
    } catch (err) {
      toast.error('Failed to update notes');
    } finally {
      setSavingNotes(false);
    }
  };

  // Calculate quick stats counters
  const totalApps = applications.length;
  const interviewsCount = applications.filter(app => app.status === 'INTERVIEW').length;
  const offersCount = applications.filter(app => app.status === 'OFFER' || app.status === 'JOINED').length;
  const rejectionsCount = applications.filter(app => app.status === 'REJECTED').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Welcome Row */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="font-sans font-extrabold text-3xl tracking-tight">Welcome, {user?.name}</h1>
          <p className="text-slate-500 dark:text-zinc-400 text-sm font-medium">
            Manage, organize, and monitor your active application pipelines.
          </p>
        </div>
        <Link
          to="/jobs"
          className="bg-primary-600 hover:bg-primary-700 text-white font-bold text-sm px-5 py-3 rounded-xl transition-all shadow-sm flex items-center gap-1.5"
        >
          <Briefcase className="w-4 h-4" />
          Find More Jobs
        </Link>
      </div>

      {/* Grid Stats Counters */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Applications', count: totalApps, icon: Briefcase, color: 'from-violet-500 to-indigo-500' },
          { label: 'Interviews Scheduled', count: interviewsCount, icon: Clock, color: 'from-orange-500 to-amber-500' },
          { label: 'Offers Received', count: offersCount, icon: CheckCircle2, color: 'from-emerald-500 to-teal-500' },
          { label: 'Rejected Stages', count: rejectionsCount, icon: XCircle, color: 'from-rose-500 to-pink-500' }
        ].map((card, idx) => (
          <div
            key={idx}
            className="bg-white dark:bg-darkCard border border-slate-200 dark:border-darkBorder rounded-2xl p-5 shadow-premium flex items-center justify-between overflow-hidden relative group"
          >
            {/* Color accent line */}
            <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${card.color}`}></div>
            
            <div className="space-y-1">
              <span className="text-xs font-semibold text-slate-400 uppercase">{card.label}</span>
              <h3 className="font-sans font-extrabold text-2xl text-slate-800 dark:text-zinc-100">{card.count}</h3>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-zinc-900 rounded-xl">
              <card.icon className="w-6 h-6 text-slate-400 group-hover:scale-105 transition-transform" />
            </div>
          </div>
        ))}
      </div>

      {/* Tab controls */}
      <div className="flex border-b border-slate-200 dark:border-zinc-800 gap-6">
        <button
          onClick={() => setActiveTab('applications')}
          className={`pb-3 text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'applications'
              ? 'border-primary-600 text-primary-600 dark:border-primary-400 dark:text-primary-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-zinc-200'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          My Applications ({applications.length})
        </button>
        <button
          onClick={() => setActiveTab('bookmarks')}
          className={`pb-3 text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'bookmarks'
              ? 'border-primary-600 text-primary-600 dark:border-primary-400 dark:text-primary-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-zinc-200'
          }`}
        >
          <Bookmark className="w-4 h-4" />
          Saved Bookmarks ({bookmarks.length})
        </button>
      </div>

      {/* Loading Skeletons */}
      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse bg-white dark:bg-darkCard p-6 rounded-2xl border border-slate-200 dark:border-darkBorder h-20"></div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          
          {/* TAB 1: APPLICATIONS */}
          {activeTab === 'applications' && (
            <div className="space-y-4">
              {applications.length === 0 ? (
                <div className="text-center py-16 bg-white dark:bg-darkCard border border-slate-200 dark:border-darkBorder rounded-3xl space-y-4">
                  <Briefcase className="w-16 h-16 text-slate-300 dark:text-zinc-700 mx-auto" />
                  <div>
                    <h3 className="font-sans font-bold text-base">No job applications yet</h3>
                    <p className="text-xs text-slate-400 max-w-xs mx-auto">Submit your resume to top positions to start tracking their statuses.</p>
                  </div>
                  <Link
                    to="/jobs"
                    className="inline-block bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 font-bold text-xs px-5 py-2.5 rounded-xl transition-all"
                  >
                    Browse Jobs
                  </Link>
                </div>
              ) : (
                applications.map((app) => (
                  <div
                    key={app.id}
                    className="bg-white dark:bg-darkCard border border-slate-200 dark:border-darkBorder rounded-2xl p-6 shadow-premium hover:shadow-premium-hover transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                  >
                    {/* Basic details */}
                    <div className="flex items-center gap-4 min-w-0">
                      <img
                        src={app.job.company.logo || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&h=100&fit=crop'}
                        alt={app.job.company.name}
                        className="w-12 h-12 object-cover rounded-xl border border-slate-100 dark:border-zinc-800"
                      />
                      <div className="min-w-0">
                        <Link
                          to={`/jobs/${app.job.id}`}
                          className="font-sans font-extrabold text-base hover:text-primary-600 truncate block"
                        >
                          {app.job.title}
                        </Link>
                        <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-400">
                          <Link to={`/companies/${app.job.companyId}`} className="hover:underline">{app.job.company.name}</Link>
                          <span>•</span>
                          <span className="flex items-center gap-0.5"><MapPin className="w-3 h-3" />{app.job.location}</span>
                        </div>
                      </div>
                    </div>

                    {/* Timeline stage chip and timeline button */}
                    <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-between md:justify-end">
                      
                      {/* Date details */}
                      <div className="text-[10px] font-semibold text-slate-400 flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        Applied {new Date(app.appliedAt).toLocaleDateString()}
                      </div>

                      {/* Colored Status Badge */}
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        STATUS_CONFIG[app.status]?.bg || 'bg-slate-100 text-slate-700'
                      }`}>
                        {STATUS_CONFIG[app.status]?.text || app.status}
                      </span>

                      {/* Detail Drawer Activator */}
                      <button
                        onClick={() => setSelectedApp(app)}
                        className="flex items-center gap-1 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-zinc-850 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-200 rounded-xl font-bold text-xs transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Track Stage
                      </button>

                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 2: BOOKMARKS */}
          {activeTab === 'bookmarks' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {bookmarks.length === 0 ? (
                <div className="md:col-span-2 text-center py-16 bg-white dark:bg-darkCard border border-slate-200 dark:border-darkBorder rounded-3xl space-y-4">
                  <Bookmark className="w-16 h-16 text-slate-300 dark:text-zinc-700 mx-auto" />
                  <div>
                    <h3 className="font-sans font-bold text-base">No saved bookmarks yet</h3>
                    <p className="text-xs text-slate-400 max-w-xs mx-auto">Bookmark postings while browsing to save them for later applications.</p>
                  </div>
                </div>
              ) : (
                bookmarks.map((bookmark) => (
                  <div
                    key={bookmark.id}
                    className="bg-white dark:bg-darkCard border border-slate-200 dark:border-darkBorder rounded-2xl p-6 shadow-premium flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      <div className="flex justify-between items-start gap-2">
                        <div className="flex gap-3">
                          <img
                            src={bookmark.job.company.logo || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&h=100&fit=crop'}
                            alt={bookmark.job.company.name}
                            className="w-10 h-10 object-cover rounded-lg"
                          />
                          <div>
                            <Link to={`/jobs/${bookmark.job.id}`} className="font-sans font-bold text-sm hover:text-primary-600 block line-clamp-1">
                              {bookmark.job.title}
                            </Link>
                            <span className="text-xs text-slate-400 font-semibold">{bookmark.job.company.name}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold">
                        <MapPin className="w-3.5 h-3.5" />
                        <span>{bookmark.job.location} ({bookmark.job.workMode})</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between border-t border-slate-100 dark:border-zinc-850 pt-4 mt-4">
                      <button
                        onClick={() => handleRemoveBookmark(bookmark.id)}
                        className="text-xs font-semibold text-rose-500 hover:underline"
                      >
                        Remove Saved
                      </button>
                      <Link
                        to={`/jobs/${bookmark.job.id}`}
                        className="bg-primary-50 hover:bg-primary-100 dark:bg-primary-950/20 text-primary-600 dark:text-primary-400 font-bold px-3 py-1.5 rounded-lg text-xs"
                      >
                        Apply Now
                      </Link>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

        </div>
      )}

      {/* TRACKING PROGRESS MODAL / TIMELINE DRAWER */}
      <AnimatePresence>
        {selectedApp && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex justify-end">
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="bg-white dark:bg-darkCard w-full max-w-lg h-full p-6 overflow-y-auto space-y-6 flex flex-col justify-between"
            >
              
              {/* Header */}
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b dark:border-zinc-800 pb-3">
                  <div className="flex items-center gap-2">
                    <Sliders className="w-5 h-5 text-primary-500" />
                    <h3 className="font-sans font-extrabold text-lg">Application Journey</h3>
                  </div>
                  <button
                    onClick={() => { setSelectedApp(null); setEditingAppId(null); }}
                    className="text-slate-400 hover:text-slate-600"
                  >
                    <XCircle className="w-6 h-6" />
                  </button>
                </div>

                {/* Job metadata snippet */}
                <div className="bg-slate-50 dark:bg-zinc-900/60 p-4 border dark:border-zinc-850 rounded-2xl space-y-1">
                  <div className="font-bold text-sm text-slate-800 dark:text-zinc-200">{selectedApp.job.title}</div>
                  <div className="text-xs text-slate-500 font-semibold">{selectedApp.job.company.name}</div>
                  {selectedApp.resumeUrl && (
                    <div className="pt-2 flex items-center gap-1 text-[10px] font-bold text-primary-600 dark:text-primary-400">
                      <FileText className="w-3.5 h-3.5" />
                      <span>Resume submitted: </span>
                      <a href={`https://job-board-backend-yzf4.onrender.com${selectedApp.resumeUrl}`} target="_blank" rel="noopener noreferrer" className="underline">View PDF</a>
                    </div>
                  )}
                </div>

                {/* Interactive Status Timeline Progress Tracker */}
                <div className="space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Pipeline Timeline</h4>
                  
                  {/* Current stage indicator */}
                  {selectedApp.status === 'REJECTED' ? (
                    <div className="p-3 bg-rose-50 text-rose-700 dark:bg-rose-950/20 dark:text-rose-400 border border-rose-200/20 rounded-xl text-xs font-bold flex items-center gap-1.5">
                      <XCircle className="w-4 h-4" />
                      Application stage has ended: Rejected by Recruiter
                    </div>
                  ) : (
                    <div className="w-full bg-slate-100 dark:bg-zinc-800 rounded-full h-2">
                      <div
                        className="bg-primary-600 dark:bg-primary-400 h-2 rounded-full transition-all duration-500"
                        style={{
                          width: `${((STATUS_CONFIG[selectedApp.status]?.index + 1) / PIPELINE_STAGES.length) * 100}%`
                        }}
                      ></div>
                    </div>
                  )}

                  {/* Stage Flow Nodes */}
                  <div className="relative pl-6 border-l-2 border-slate-200 dark:border-zinc-850 space-y-4 py-2">
                    {PIPELINE_STAGES.map((stage) => {
                      const isCurrent = selectedApp.status === stage;
                      const isPast = STATUS_CONFIG[selectedApp.status]?.index >= STATUS_CONFIG[stage]?.index && selectedApp.status !== 'REJECTED';
                      
                      return (
                        <div key={stage} className="relative flex items-center gap-3">
                          {/* Circle Node */}
                          <div className={`absolute -left-[31px] w-4.5 h-4.5 rounded-full border-2 flex items-center justify-center bg-white dark:bg-darkCard transition-colors ${
                            isCurrent
                              ? 'border-primary-500 text-primary-500 ring-4 ring-primary-50'
                              : isPast
                              ? 'border-emerald-500 bg-emerald-50 text-emerald-500 dark:bg-emerald-950/20'
                              : 'border-slate-200 dark:border-zinc-800 text-slate-300'
                          }`}>
                            {isPast && !isCurrent ? <Check className="w-2.5 h-2.5" /> : <div className="w-1.5 h-1.5 rounded-full bg-current"></div>}
                          </div>

                          <span className={`text-xs font-bold ${
                            isCurrent ? 'text-slate-800 dark:text-zinc-100' : 'text-slate-400'
                          }`}>
                            {STATUS_CONFIG[stage]?.text || stage}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Candidate Tracking Personal Notes (Editable!) */}
                <div className="space-y-2 border-t dark:border-zinc-800 pt-4">
                  <div className="flex justify-between items-center">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">My Personal Notes</h4>
                    {editingAppId !== selectedApp.id ? (
                      <button
                        onClick={() => {
                          setEditingAppId(selectedApp.id);
                          setTempNotes(selectedApp.notes || '');
                        }}
                        className="text-xs font-bold text-primary-600 flex items-center gap-1"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        Edit Notes
                      </button>
                    ) : (
                      <button
                        onClick={() => handleNotesUpdate(selectedApp.id)}
                        disabled={savingNotes}
                        className="text-xs font-bold text-emerald-600 flex items-center gap-1"
                      >
                        <Check className="w-3.5 h-3.5" />
                        {savingNotes ? 'Saving...' : 'Save'}
                      </button>
                    )}
                  </div>

                  {editingAppId === selectedApp.id ? (
                    <textarea
                      value={tempNotes}
                      onChange={(e) => setTempNotes(e.target.value)}
                      rows={4}
                      className="w-full bg-slate-50 dark:bg-zinc-900 border dark:border-zinc-800 rounded-xl px-3 py-2 text-xs text-slate-700 dark:text-zinc-200 focus:outline-none"
                    />
                  ) : (
                    <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed font-semibold bg-slate-50 dark:bg-zinc-900/40 p-3 rounded-xl border dark:border-zinc-850">
                      {selectedApp.notes || 'No tracking logs added yet. Write details about HR rounds, code challenges, or schedule info.'}
                    </p>
                  )}
                </div>

              </div>

              {/* Action Close */}
              <button
                onClick={() => { setSelectedApp(null); setEditingAppId(null); }}
                className="w-full bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-750 font-bold py-3 rounded-xl text-sm"
              >
                Close Tracking Journey
              </button>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}

export default CandidateDashboard;
