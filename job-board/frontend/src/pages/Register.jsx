import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import { Briefcase, Mail, Lock, User, Eye, EyeOff, CheckCircle } from 'lucide-react';

function Register() {
  const { register: authRegister } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState('CANDIDATE');

  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    setLoading(true);
    const result = await authRegister(data.name, data.email, data.password, selectedRole);
    setLoading(false);

    if (result.success) {
      toast.success('Account registered successfully!');
      // Navigate to dashboard based on role
      if (selectedRole === 'RECRUITER') {
        navigate('/recruiter-dashboard');
      } else {
        navigate('/candidate-dashboard');
      }
    } else {
      toast.error(result.message);
    }
  };

  return (
    <div className="min-h-[90vh] flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6 bg-white dark:bg-darkCard p-8 rounded-3xl border border-slate-200 dark:border-darkBorder shadow-premium">
        
        {/* Header Title */}
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-2 justify-center">
            <div className="bg-primary-600 text-white p-2 rounded-xl">
              <Briefcase className="w-5 h-5" />
            </div>
            <span className="font-sans font-extrabold text-xl tracking-tight bg-gradient-to-r from-primary-600 to-indigo-500 bg-clip-text text-transparent dark:from-primary-400 dark:to-indigo-300">
              AIGravulate
            </span>
          </Link>
          <h2 className="font-sans font-extrabold text-2xl tracking-tight text-slate-800 dark:text-zinc-100">
            Create an account
          </h2>
          <p className="text-slate-500 dark:text-zinc-400 text-sm font-medium">
            Start tracking application stages or posting jobs.
          </p>
        </div>

        {/* Role Selector Tabs */}
        <div className="grid grid-cols-2 gap-3 bg-slate-100 dark:bg-zinc-900 p-1.5 rounded-2xl">
          <button
            type="button"
            onClick={() => setSelectedRole('CANDIDATE')}
            className={`py-3 text-sm font-bold rounded-xl transition-all ${
              selectedRole === 'CANDIDATE'
                ? 'bg-white dark:bg-darkCard text-primary-600 dark:text-primary-400 shadow-sm'
                : 'text-slate-500 dark:text-zinc-400 hover:text-slate-700 dark:hover:text-zinc-300'
            }`}
          >
            Candidate
          </button>
          <button
            type="button"
            onClick={() => setSelectedRole('RECRUITER')}
            className={`py-3 text-sm font-bold rounded-xl transition-all ${
              selectedRole === 'RECRUITER'
                ? 'bg-white dark:bg-darkCard text-primary-600 dark:text-primary-400 shadow-sm'
                : 'text-slate-500 dark:text-zinc-400 hover:text-slate-700 dark:hover:text-zinc-300'
            }`}
          >
            Recruiter
          </button>
        </div>

        {/* Info card on selection */}
        <div className="px-4 py-3 bg-primary-50 dark:bg-primary-950/20 text-primary-800 dark:text-primary-300 rounded-2xl flex items-start gap-2 text-xs font-semibold leading-relaxed">
          <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>
            {selectedRole === 'CANDIDATE'
              ? 'Register as Candidate to search, save bookmarks, submit resumes, and manage tracking pipelines.'
              : 'Register as Recruiter to create corporate profiles, post jobs, and coordinate status checkrounds.'}
          </span>
        </div>

        {/* Form Registration */}
        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4">
            
            {/* Full Name */}
            <div className="space-y-1">
              <label htmlFor="name" className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <User className="h-4 w-4 text-slate-400" />
                </div>
                <input
                  id="name"
                  type="text"
                  placeholder="Jane Doe"
                  {...register('name', { required: 'Name is required' })}
                  className={`block w-full pl-10 pr-3 py-3 border rounded-xl bg-slate-50 dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 focus:bg-white dark:focus:bg-darkCard focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-500 text-slate-800 dark:text-zinc-100 placeholder-slate-400 text-sm font-medium focus:outline-none transition-all ${
                    errors.name ? 'border-rose-500 focus:ring-rose-500' : 'focus:border-primary-500'
                  }`}
                />
              </div>
              {errors.name && (
                <p className="text-xs text-rose-500 font-semibold mt-1">{errors.name.message}</p>
              )}
            </div>

            {/* Email Address */}
            <div className="space-y-1">
              <label htmlFor="email" className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Mail className="h-4 w-4 text-slate-400" />
                </div>
                <input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  {...register('email', {
                    required: 'Email is required',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Invalid email address'
                    }
                  })}
                  className={`block w-full pl-10 pr-3 py-3 border rounded-xl bg-slate-50 dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 focus:bg-white dark:focus:bg-darkCard focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-500 text-slate-800 dark:text-zinc-100 placeholder-slate-400 text-sm font-medium focus:outline-none transition-all ${
                    errors.email ? 'border-rose-500 focus:ring-rose-500' : 'focus:border-primary-500'
                  }`}
                />
              </div>
              {errors.email && (
                <p className="text-xs text-rose-500 font-semibold mt-1">{errors.email.message}</p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-1">
              <label htmlFor="password" className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-slate-400" />
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  {...register('password', {
                    required: 'Password is required',
                    minLength: {
                      value: 6,
                      message: 'Password must be at least 6 characters'
                    }
                  })}
                  className={`block w-full pl-10 pr-10 py-3 border rounded-xl bg-slate-50 dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 focus:bg-white dark:focus:bg-darkCard focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-500 text-slate-800 dark:text-zinc-100 placeholder-slate-400 text-sm font-medium focus:outline-none transition-all ${
                    errors.password ? 'border-rose-500 focus:ring-rose-500' : 'focus:border-primary-500'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-rose-500 font-semibold mt-1">{errors.password.message}</p>
              )}
            </div>

          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-3.5 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </button>

          <p className="text-center text-sm font-medium text-slate-500 dark:text-zinc-400">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300">
              Sign In
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}

export default Register;
