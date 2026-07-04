import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Sun, Moon, Menu, X, User, LogOut, Briefcase, LayoutDashboard } from 'lucide-react';

function Navbar() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navLinks = [
    { path: '/', label: 'Home' },
    { path: '/jobs', label: 'Browse Jobs' },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full transition-all duration-300 border-b glassmorphism border-slate-200/50 dark:border-zinc-800/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="bg-primary-600 text-white p-2 rounded-xl group-hover:scale-105 transition-transform duration-300">
                <Briefcase className="w-5 h-5" />
              </div>
              <span className="font-sans font-extrabold text-xl tracking-tight bg-gradient-to-r from-primary-600 to-indigo-500 bg-clip-text text-transparent dark:from-primary-400 dark:to-indigo-300">
                AIGravulate
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {navLinks.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                className={({ isActive }) =>
                  `font-sans font-medium text-sm transition-colors duration-200 ${
                    isActive
                      ? 'text-primary-600 dark:text-primary-400'
                      : 'text-slate-600 hover:text-primary-600 dark:text-zinc-400 dark:hover:text-primary-400'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}

            {user && (
              <NavLink
                to={user.role === 'RECRUITER' ? '/recruiter-dashboard' : '/candidate-dashboard'}
                className={({ isActive }) =>
                  `font-sans font-medium text-sm flex items-center gap-1.5 transition-colors duration-200 ${
                    isActive
                      ? 'text-primary-600 dark:text-primary-400'
                      : 'text-slate-600 hover:text-primary-600 dark:text-zinc-400 dark:hover:text-primary-400'
                  }`
                }
              >
                <LayoutDashboard className="w-4 h-4" />
                Dashboard
              </NavLink>
            )}
          </div>

          {/* Action Buttons (Auth, Theme, Mobile Toggle) */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-slate-500 hover:text-primary-600 dark:text-zinc-400 dark:hover:text-primary-400 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
              aria-label="Toggle Theme"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            {user ? (
              <div className="flex items-center gap-3">
                <Link
                  to="/profile"
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-zinc-800 hover:border-primary-500 hover:text-primary-600 dark:hover:text-primary-400 transition-colors text-slate-700 dark:text-zinc-300"
                >
                  <User className="w-4 h-4" />
                  <span className="text-sm font-medium">{user.name.split(' ')[0]}</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 dark:bg-rose-950/20 dark:text-rose-400 dark:hover:bg-rose-950/40 transition-colors text-sm font-medium"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="text-slate-600 hover:text-primary-600 dark:text-zinc-400 dark:hover:text-primary-400 px-4 py-2 text-sm font-medium transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors shadow-sm"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center gap-3 md:hidden">
            <button
              onClick={toggleTheme}
              className="p-1.5 rounded-lg text-slate-500 hover:text-primary-600 dark:text-zinc-400 dark:hover:text-primary-400 transition-colors"
              aria-label="Toggle Theme"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:text-zinc-400 dark:hover:text-zinc-200 dark:hover:bg-zinc-800 transition-colors"
              aria-label="Toggle Mobile Menu"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden glassmorphism border-b border-slate-200/50 dark:border-zinc-800/40 px-4 pt-2 pb-4 space-y-2">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => setIsOpen(false)}
              className="block px-3 py-2 rounded-lg text-base font-medium text-slate-700 hover:text-primary-600 hover:bg-slate-100 dark:text-zinc-300 dark:hover:text-primary-400 dark:hover:bg-zinc-800 transition-colors"
            >
              {link.label}
            </Link>
          ))}

          {user && (
            <Link
              to={user.role === 'RECRUITER' ? '/recruiter-dashboard' : '/candidate-dashboard'}
              onClick={() => setIsOpen(false)}
              className="block px-3 py-2 rounded-lg text-base font-medium text-slate-700 hover:text-primary-600 hover:bg-slate-100 dark:text-zinc-300 dark:hover:text-primary-400 dark:hover:bg-zinc-800 transition-colors"
            >
              Dashboard
            </Link>
          )}

          <div className="border-t border-slate-200 dark:border-zinc-800 pt-3 flex flex-col gap-2">
            {user ? (
              <>
                <Link
                  to="/profile"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-slate-700 hover:text-primary-600 hover:bg-slate-100 dark:text-zinc-300 dark:hover:text-primary-400 dark:hover:bg-zinc-800"
                >
                  <User className="w-5 h-5" />
                  My Profile ({user.name.split(' ')[0]})
                </Link>
                <button
                  onClick={() => {
                    setIsOpen(false);
                    handleLogout();
                  }}
                  className="flex w-full items-center gap-2 px-3 py-2 rounded-lg text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 text-left font-medium"
                >
                  <LogOut className="w-5 h-5" />
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => setIsOpen(false)}
                  className="block text-center px-3 py-2 rounded-lg border border-slate-200 dark:border-zinc-800 text-slate-700 hover:text-primary-600 dark:text-zinc-300 dark:hover:text-primary-400"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setIsOpen(false)}
                  className="block text-center bg-primary-600 hover:bg-primary-700 text-white px-3 py-2 rounded-xl font-medium"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navbar;
