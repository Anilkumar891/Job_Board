import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import { Toaster } from 'react-hot-toast';

// Pages
import Home from './pages/Home';
import BrowseJobs from './pages/BrowseJobs';
import JobDetails from './pages/JobDetails';
import CompanyProfile from './pages/CompanyProfile';
import Login from './pages/Login';
import Register from './pages/Register';
import ProfilePage from './pages/ProfilePage';
import CandidateDashboard from './pages/CandidateDashboard';
import RecruiterDashboard from './pages/RecruiterDashboard';
import CreateJob from './pages/CreateJob';
import EditJob from './pages/EditJob';
import CreateCompany from './pages/CreateCompany';
import NotFound from './pages/NotFound';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Layout>
            <Routes>
              {/* ── Public Routes ─────────────────────────────── */}
              <Route path="/" element={<Home />} />
              <Route path="/jobs" element={<BrowseJobs />} />
              <Route path="/jobs/:id" element={<JobDetails />} />

              {/* Company profile — supports both /companies/:id and /company/:id */}
              <Route path="/companies/:id" element={<CompanyProfile />} />
              <Route path="/company/:id" element={<CompanyProfile />} />

              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* ── Protected Shared Profile ───────────────────── */}
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <ProfilePage />
                  </ProtectedRoute>
                }
              />

              {/* ── Candidate Routes ───────────────────────────── */}
              <Route
                path="/candidate-dashboard"
                element={
                  <ProtectedRoute allowedRoles={['CANDIDATE']}>
                    <CandidateDashboard />
                  </ProtectedRoute>
                }
              />
              {/* Alias: /candidate/dashboard → /candidate-dashboard */}
              <Route
                path="/candidate/dashboard"
                element={<Navigate to="/candidate-dashboard" replace />}
              />
              {/* Alias: /dashboard (candidates redirected by role in ProtectedRoute) */}

              {/* ── Recruiter Routes ───────────────────────────── */}
              <Route
                path="/recruiter-dashboard"
                element={
                  <ProtectedRoute allowedRoles={['RECRUITER']}>
                    <RecruiterDashboard />
                  </ProtectedRoute>
                }
              />
              {/* Alias: /recruiter/dashboard → /recruiter-dashboard */}
              <Route
                path="/recruiter/dashboard"
                element={<Navigate to="/recruiter-dashboard" replace />}
              />
              <Route
                path="/create-company"
                element={
                  <ProtectedRoute allowedRoles={['RECRUITER']}>
                    <CreateCompany />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/create-job"
                element={
                  <ProtectedRoute allowedRoles={['RECRUITER']}>
                    <CreateJob />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/edit-job/:id"
                element={
                  <ProtectedRoute allowedRoles={['RECRUITER']}>
                    <EditJob />
                  </ProtectedRoute>
                }
              />

              {/* ── Convenience Aliases ────────────────────────── */}
              {/* /find-jobs, /browse, /all-jobs → /jobs */}
              <Route path="/find-jobs" element={<Navigate to="/jobs" replace />} />
              <Route path="/browse" element={<Navigate to="/jobs" replace />} />
              <Route path="/all-jobs" element={<Navigate to="/jobs" replace />} />
              {/* /not-found → 404 page */}
              <Route path="/not-found" element={<NotFound />} />

              {/* ── 404 Catch-All ──────────────────────────────── */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Layout>
        </BrowserRouter>

        {/* Premium Toast Notifications */}
        <Toaster
          position="bottom-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#1f2937',
              color: '#fff',
              fontSize: '0.875rem',
              fontWeight: '600',
              fontFamily: 'Outfit, sans-serif',
              borderRadius: '1rem',
              padding: '12px 24px',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
            },
            success: {
              iconTheme: { primary: '#10b981', secondary: '#fff' },
            },
            error: {
              iconTheme: { primary: '#ef4444', secondary: '#fff' },
            },
          }}
        />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
