import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import { MapPin, Briefcase, DollarSign, Calendar, Bookmark, Share2, ArrowLeft, Building2, Check, AlertTriangle, FileText } from 'lucide-react';

function JobDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, updateResumeUrl } = useAuth();

  // API State
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSaved, setIsSaved] = useState(false);
  const [bookmarkId, setBookmarkId] = useState(null);
  const [hasApplied, setHasApplied] = useState(false);

  // Application Modal state
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [submittingApp, setSubmittingApp] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');
  const [useProfileResume, setUseProfileResume] = useState(true);
  const [uploadedFile, setUploadedFile] = useState(null);

  // Fetch job details and check state
  useEffect(() => {
    const fetchJobDetails = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await api.get(`/jobs/${id}`);
        if (response.data.success) {
          setJob(response.data.data);
          
          // If logged in, check if bookmarked and if applied
          if (user && user.role === 'CANDIDATE') {
            // Check bookmarks
            const bookmarkRes = await api.get('/saved');
            const bookmark = bookmarkRes.data.data.find(item => item.jobId === id);
            if (bookmark) {
              setIsSaved(true);
              setBookmarkId(bookmark.id);
            }

            // Check applications
            const appRes = await api.get('/applications');
            const applied = appRes.data.data.some(app => app.jobId === id);
            setHasApplied(applied);
          }
        }
      } catch (err) {
        console.error('Job details fetch error:', err.message);
        setError(err.response?.data?.message || 'Failed to load job details.');
      } finally {
        setLoading(false);
      }
    };

    fetchJobDetails();
  }, [id, user]);

  // Bookmark / Unbookmark
  const handleSaveToggle = async () => {
    if (!user) {
      toast.error('Please login to bookmark this job.');
      return;
    }
    if (user.role !== 'CANDIDATE') {
      toast.error('Only Candidates can bookmark jobs.');
      return;
    }

    try {
      if (isSaved) {
        const deleteRes = await api.delete(`/saved/${bookmarkId}`);
        if (deleteRes.data.success) {
          setIsSaved(false);
          setBookmarkId(null);
          toast.success('Bookmark removed');
        }
      } else {
        const createRes = await api.post('/saved', { jobId: id });
        if (createRes.data.success) {
          setIsSaved(true);
          setBookmarkId(createRes.data.data.id);
          toast.success('Job saved successfully');
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error updating bookmark');
    }
  };

  // Share link
  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Job link copied to clipboard!');
  };

  // Submit Job Application
  const handleApplySubmit = async (e) => {
    e.preventDefault();
    
    if (!useProfileResume && !uploadedFile) {
      toast.error('Please upload a resume file.');
      return;
    }

    if (useProfileResume && !user.resumeUrl) {
      toast.error('No default profile resume found. Please upload one or select a file.');
      return;
    }

    setSubmittingApp(true);
    try {
      const formData = new FormData();
      formData.append('jobId', id);
      if (coverLetter.trim()) formData.append('coverLetter', coverLetter);
      
      if (!useProfileResume && uploadedFile) {
        formData.append('resume', uploadedFile);
      }

      // API request with multipart headers
      const response = await api.post('/applications/apply', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.success) {
        toast.success('Application submitted successfully!');
        setHasApplied(true);
        setIsApplyModalOpen(false);

        // If a new resume was uploaded, update local profile cache
        if (!useProfileResume && response.data.data.resumeUrl) {
          updateResumeUrl(response.data.data.resumeUrl);
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error submitting application.');
    } finally {
      setSubmittingApp(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 animate-pulse space-y-6">
        <div className="h-6 bg-slate-200 dark:bg-zinc-800 rounded w-16"></div>
        <div className="flex gap-4 items-center">
          <div className="w-16 h-16 bg-slate-200 dark:bg-zinc-800 rounded-xl"></div>
          <div className="space-y-2 flex-grow">
            <div className="h-6 bg-slate-200 dark:bg-zinc-800 rounded w-1/2"></div>
            <div className="h-4 bg-slate-200 dark:bg-zinc-800 rounded w-1/4"></div>
          </div>
        </div>
        <div className="h-64 bg-slate-100 dark:bg-zinc-900 rounded w-full"></div>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center space-y-4">
        <AlertTriangle className="w-12 h-12 text-rose-500 mx-auto" />
        <h2 className="font-sans font-bold text-xl">Could not retrieve job</h2>
        <p className="text-slate-500 text-sm">{error || 'Job not found'}</p>
        <Link to="/jobs" className="inline-flex items-center gap-1 text-primary-600 font-semibold hover:underline">
          <ArrowLeft className="w-4 h-4" /> Back to listings
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      {/* Back Button */}
      <Link
        to="/jobs"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-primary-600 transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Listings
      </Link>

      {/* Main Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Side: Job Content (2 Cols) */}
        <div className="lg:col-span-2 space-y-8 bg-white dark:bg-darkCard border border-slate-200 dark:border-darkBorder rounded-3xl p-8 shadow-premium">
          
          {/* Header Area */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4 border-b dark:border-zinc-800 pb-6">
            <div className="flex gap-4">
              <img
                src={job.company.logo || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&h=100&fit=crop'}
                alt={`${job.company.name} logo`}
                className="w-16 h-16 object-cover rounded-2xl border border-slate-100 dark:border-zinc-800"
              />
              <div className="space-y-1">
                <h1 className="font-sans font-extrabold text-2xl tracking-tight text-slate-800 dark:text-zinc-150">
                  {job.title}
                </h1>
                <p className="text-sm font-semibold text-primary-600 dark:text-primary-400">
                  <Link to={`/companies/${job.companyId}`} className="hover:underline">{job.company.name}</Link>
                </p>
                <div className="flex flex-wrap items-center gap-3 text-xs font-semibold text-slate-500 dark:text-zinc-400 pt-1">
                  <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{job.location}</span>
                  <span className="flex items-center gap-1"><Briefcase className="w-3.5 h-3.5" />{job.jobType}</span>
                </div>
              </div>
            </div>

            {/* Sharing & Saving Buttons */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={handleSaveToggle}
                className={`flex-grow sm:flex-grow-0 p-2.5 rounded-xl border flex items-center justify-center gap-1.5 transition-all text-xs font-bold ${
                  isSaved
                    ? 'bg-primary-50 border-primary-200 text-primary-600 dark:bg-primary-950/20 dark:border-primary-900/40 dark:text-primary-400'
                    : 'bg-white border-slate-200 text-slate-500 hover:text-slate-700 dark:bg-zinc-900 dark:border-zinc-800 dark:hover:text-zinc-200'
                }`}
              >
                <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
                <span>{isSaved ? 'Saved' : 'Save'}</span>
              </button>
              <button
                onClick={handleShare}
                className="p-2.5 rounded-xl border border-slate-200 hover:border-slate-300 dark:border-zinc-800 dark:hover:border-zinc-700 text-slate-500 dark:text-zinc-400 flex justify-center items-center"
                aria-label="Share Job Link"
              >
                <Share2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Job Details Rich Text */}
          <div className="space-y-6 text-slate-600 dark:text-zinc-300 text-sm leading-relaxed font-medium">
            <h3 className="font-sans font-bold text-base text-slate-800 dark:text-zinc-155">Job Description</h3>
            <div className="whitespace-pre-line bg-slate-50 dark:bg-zinc-900/40 p-6 rounded-2xl border dark:border-zinc-850">
              {job.description}
            </div>
            
            {/* Skills chips */}
            {job.skills && job.skills.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-sans font-bold text-sm text-slate-800 dark:text-zinc-100">Required Skills</h4>
                <div className="flex flex-wrap gap-2">
                  {job.skills.map((skill, index) => (
                    <span
                      key={index}
                      className="px-3 py-1.5 bg-primary-50 text-primary-700 dark:bg-primary-950/30 dark:text-primary-300 border border-primary-200/40 dark:border-primary-900/20 text-xs font-bold rounded-lg"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Footer Call to action button */}
          <div className="border-t border-slate-100 dark:border-zinc-850 pt-6 flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">
              Posted on {new Date(job.createdAt).toLocaleDateString()}
            </span>

            {/* Application CTAs */}
            {hasApplied ? (
              <div className="inline-flex items-center gap-1.5 px-5 py-3 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400 rounded-xl font-bold text-sm">
                <Check className="w-4.5 h-4.5" />
                Applied Already
              </div>
            ) : user && user.role === 'RECRUITER' ? (
              <div className="text-xs font-semibold text-amber-500 bg-amber-50 dark:bg-amber-950/20 p-3 rounded-xl border border-amber-200/30">
                Logged in as Recruiter (CRUD only)
              </div>
            ) : (
              <button
                onClick={() => {
                  if (!user) {
                    toast.error('Sign in required to submit application.');
                    navigate('/login', { state: { from: { pathname: `/jobs/${id}` } } });
                    return;
                  }
                  setIsApplyModalOpen(true);
                }}
                className="bg-primary-600 hover:bg-primary-700 text-white font-bold text-sm px-6 py-3.5 rounded-xl transition-all shadow-sm"
              >
                Apply to Position
              </button>
            )}
          </div>
        </div>

        {/* Right Side: Sidebar Metadata (1 Col) */}
        <div className="space-y-6">
          
          {/* Summary Card */}
          <div className="bg-white dark:bg-darkCard border border-slate-200 dark:border-darkBorder rounded-3xl p-6 shadow-premium space-y-4">
            <h3 className="font-sans font-bold text-sm border-b dark:border-zinc-800 pb-2">Overview Details</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <DollarSign className="w-5 h-5 text-slate-400 flex-shrink-0" />
                <div>
                  <div className="text-xs text-slate-400 font-semibold uppercase">Offered Salary</div>
                  <div className="text-sm font-bold text-slate-800 dark:text-zinc-200">{job.salary}</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Briefcase className="w-5 h-5 text-slate-400 flex-shrink-0" />
                <div>
                  <div className="text-xs text-slate-400 font-semibold uppercase">Experience Requirement</div>
                  <div className="text-sm font-bold text-slate-800 dark:text-zinc-200">{job.experience}</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-slate-400 flex-shrink-0" />
                <div>
                  <div className="text-xs text-slate-400 font-semibold uppercase">Location Mode</div>
                  <div className="text-sm font-bold text-slate-800 dark:text-zinc-200">{job.workMode}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Company Details Box */}
          <div className="bg-white dark:bg-darkCard border border-slate-200 dark:border-darkBorder rounded-3xl p-6 shadow-premium space-y-4">
            <h3 className="font-sans font-bold text-sm border-b dark:border-zinc-800 pb-2">Company Overview</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Building2 className="w-5 h-5 text-slate-400 flex-shrink-0" />
                <div className="text-sm font-bold text-slate-800 dark:text-zinc-200 truncate">{job.company.name}</div>
              </div>
              <p className="text-xs text-slate-500 dark:text-zinc-400 leading-relaxed font-semibold line-clamp-3">
                {job.company.description || 'No company overview descriptions available.'}
              </p>
              <div className="pt-2">
                <Link
                  to={`/companies/${job.companyId}`}
                  className="w-full text-center block bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-750 text-slate-700 dark:text-zinc-300 font-bold text-xs py-2.5 rounded-xl transition-all"
                >
                  View Corporate Profile
                </Link>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Interactive Application Modal Overlay */}
      {isApplyModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white dark:bg-darkCard max-w-lg w-full rounded-3xl border border-slate-200 dark:border-darkBorder shadow-premium-hover p-6 space-y-6">
            
            {/* Modal Header */}
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-sans font-extrabold text-lg">Submit Application</h3>
                <p className="text-xs text-slate-400 font-semibold">{job.title} @ {job.company.name}</p>
              </div>
              <button
                onClick={() => setIsApplyModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 text-sm font-bold"
              >
                Close
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleApplySubmit} className="space-y-5">
              
              {/* Resume Selector options */}
              <div className="space-y-3">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                  Select Resume File
                </label>
                
                {user.resumeUrl ? (
                  <div className="space-y-3">
                    <label className="flex items-center gap-2 text-sm font-semibold cursor-pointer">
                      <input
                        type="radio"
                        checked={useProfileResume}
                        onChange={() => setUseProfileResume(true)}
                        className="text-primary-600 w-4.5 h-4.5"
                      />
                      <span className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-zinc-300">
                        <FileText className="w-4 h-4 text-primary-500" />
                        Use profile resume (Jane_CV.pdf)
                      </span>
                    </label>
                    <label className="flex items-center gap-2 text-sm font-semibold cursor-pointer">
                      <input
                        type="radio"
                        checked={!useProfileResume}
                        onChange={() => setUseProfileResume(false)}
                        className="text-primary-600 w-4.5 h-4.5"
                      />
                      <span className="text-xs text-slate-600 dark:text-zinc-300">
                        Upload a new resume file
                      </span>
                    </label>
                  </div>
                ) : (
                  <div className="text-xs font-semibold text-rose-500 bg-rose-50 dark:bg-rose-950/20 p-3 rounded-xl border border-rose-200/20 mb-2">
                    No default profile resume on file. Please upload a new PDF below.
                  </div>
                )}

                {/* Show file uploader if not using profile resume */}
                {(!useProfileResume || !user.resumeUrl) && (
                  <div className="border-2 border-dashed border-slate-200 dark:border-zinc-800 rounded-2xl p-4 text-center">
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={(e) => setUploadedFile(e.target.files[0])}
                      className="hidden"
                      id="modal-resume-file"
                    />
                    <label htmlFor="modal-resume-file" className="cursor-pointer space-y-1 block">
                      <div className="text-xs font-bold text-primary-600 hover:underline">
                        {uploadedFile ? uploadedFile.name : 'Click to select PDF or Word document'}
                      </div>
                      <div className="text-[10px] text-slate-400 font-medium">Max size: 5MB (.pdf, .doc, .docx)</div>
                    </label>
                  </div>
                )}
              </div>

              {/* Cover Letter Input */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                  Cover Letter (Optional)
                </label>
                <textarea
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                  placeholder="Introduce yourself to the recruiter..."
                  rows={4}
                  className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-sm focus:outline-none"
                />
              </div>

              {/* Submit / Cancel Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsApplyModalOpen(false)}
                  className="w-1/2 border border-slate-200 dark:border-zinc-800 hover:border-slate-300 text-slate-700 dark:text-zinc-300 font-bold py-3 rounded-xl text-sm transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingApp}
                  className="w-1/2 bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 rounded-xl text-sm transition-all disabled:opacity-50 flex justify-center items-center"
                >
                  {submittingApp ? 'Submitting...' : 'Submit Application'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}

export default JobDetails;
