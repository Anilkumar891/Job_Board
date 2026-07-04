import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { toast } from 'react-hot-toast';
import { User, Mail, Shield, FileText, Upload, Download, RefreshCw } from 'lucide-react';

function ProfilePage() {
  const { user, reloadUser } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState(null);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleResumeSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      toast.error('Please select a file to upload');
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('resume', file);

    try {
      // We will make a POST to /apply or let's upload via a profile resume update endpoint.
      // Wait, is there a profile update endpoint? Let's check: POST /apply handles resume updates if a file is uploaded,
      // but let's check if we can make a direct backend API endpoint, or just create a user profile upload route!
      // In AuthController, let's see if we should create a profile resume upload API. In authController, we have register and login,
      // and in getMe we check details. But we can build a PUT /auth/profile/resume endpoint in backend or let's use Multer in a new auth route.
      // Wait, let's look at the database schema: Users has a `resumeUrl` field.
      // Let's create an API endpoint: PUT /auth/resume which uploads a resume and updates the user's `resumeUrl`.
      // Yes! That's extremely clean. Let's make sure the backend endpoint exists, and then call it.
      // We can implement PUT /auth/resume in backend/routes/authRoutes.js first or write it in authController!
      // Wait, let's double-check. Yes! Let's check what auth APIs are there: in authController we can add `uploadResume` controller.
      // But let's check what we can call: we can call PUT /api/auth/resume!
      // Let's call it from the frontend:
      const response = await api.put('/auth/resume', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.success) {
        toast.success('Resume updated successfully!');
        setFile(null);
        await reloadUser();
      }
    } catch (err) {
      console.error('Resume upload error:', err.message);
      toast.error(err.response?.data?.message || 'Error uploading file.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <h1 className="font-sans font-extrabold text-3xl tracking-tight">Account Settings</h1>
        <p className="text-slate-500 dark:text-zinc-400 text-sm font-medium">
          Manage your personal details and resume files.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Profile Sidebar */}
        <div className="bg-white dark:bg-darkCard border border-slate-200 dark:border-darkBorder rounded-3xl p-6 shadow-premium h-fit text-center space-y-4">
          <div className="mx-auto w-20 h-20 bg-primary-100 dark:bg-primary-950/40 text-primary-600 dark:text-primary-400 rounded-full flex items-center justify-center font-sans font-extrabold text-2xl">
            {user?.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h3 className="font-sans font-bold text-base">{user?.name}</h3>
            <p className="text-xs font-semibold text-slate-400">{user?.role}</p>
          </div>
        </div>

        {/* Profile Info Columns */}
        <div className="md:col-span-2 space-y-6">
          {/* Personal Details */}
          <div className="bg-white dark:bg-darkCard border border-slate-200 dark:border-darkBorder rounded-3xl p-6 shadow-premium space-y-4">
            <h3 className="font-sans font-bold text-sm border-b dark:border-zinc-800 pb-2">Profile Details</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <User className="w-5 h-5 text-slate-400" />
                <div>
                  <div className="text-[10px] text-slate-400 font-semibold uppercase">Full Name</div>
                  <div className="text-sm font-bold text-slate-800 dark:text-zinc-200">{user?.name}</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-slate-400" />
                <div>
                  <div className="text-[10px] text-slate-400 font-semibold uppercase">Email Address</div>
                  <div className="text-sm font-bold text-slate-800 dark:text-zinc-200">{user?.email}</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5 text-slate-400" />
                <div>
                  <div className="text-[10px] text-slate-400 font-semibold uppercase">Role Permissions</div>
                  <div className="text-sm font-bold text-slate-800 dark:text-zinc-200">{user?.role}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Resume Upload Module for Candidates */}
          {user?.role === 'CANDIDATE' && (
            <div className="bg-white dark:bg-darkCard border border-slate-200 dark:border-darkBorder rounded-3xl p-6 shadow-premium space-y-6">
              <h3 className="font-sans font-bold text-sm border-b dark:border-zinc-800 pb-2 flex items-center gap-2">
                <FileText className="w-4.5 h-4.5 text-primary-500" />
                Curriculum Vitae (CV) / Resume
              </h3>

              {user.resumeUrl ? (
                <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-50 dark:bg-zinc-900/40 p-4 border dark:border-zinc-850 rounded-2xl">
                  <div className="flex items-center gap-2">
                    <FileText className="w-8 h-8 text-primary-500" />
                    <div>
                      <div className="text-xs font-bold truncate max-w-xs">Jane_CV.pdf</div>
                      <div className="text-[10px] text-slate-400 font-semibold">Active default profile resume</div>
                    </div>
                  </div>
                  <a
                    href={`http://localhost:5000${user.resumeUrl}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary-100 hover:bg-primary-200 dark:bg-primary-950/20 text-primary-700 dark:text-primary-300 font-bold rounded-lg text-xs"
                  >
                    <Download className="w-3.5 h-3.5" />
                    View/Download
                  </a>
                </div>
              ) : (
                <div className="text-xs font-semibold text-amber-500 bg-amber-50 dark:bg-amber-950/20 p-4 border border-amber-250/20 rounded-2xl">
                  You haven't uploaded a default resume yet. Please submit your CV to enable instant applications.
                </div>
              )}

              {/* Upload Form */}
              <form onSubmit={handleResumeSubmit} className="space-y-4">
                <div className="border-2 border-dashed border-slate-200 dark:border-zinc-800 rounded-2xl p-6 text-center">
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleFileChange}
                    className="hidden"
                    id="profile-resume-file"
                  />
                  <label htmlFor="profile-resume-file" className="cursor-pointer space-y-2 block">
                    <Upload className="w-8 h-8 text-slate-400 mx-auto" />
                    <div className="text-sm font-bold text-primary-600 hover:underline">
                      {file ? file.name : 'Click to select resume file'}
                    </div>
                    <div className="text-xs text-slate-400 font-semibold">Only PDF, DOC, DOCX up to 5MB</div>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={uploading}
                  className="w-full flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 rounded-xl text-sm transition-all disabled:opacity-50"
                >
                  <RefreshCw className={`w-4 h-4 ${uploading ? 'animate-spin' : ''}`} />
                  {uploading ? 'Uploading File...' : 'Upload/Replace Resume'}
                </button>
              </form>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

export default ProfilePage;
