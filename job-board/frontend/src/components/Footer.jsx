import React from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, Twitter, Github, Linkedin, Globe } from 'lucide-react';

function Footer() {
  return (
    <footer className="bg-white border-t border-slate-200 dark:bg-darkBg dark:border-zinc-800/80 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="xl:grid xl:grid-cols-3 xl:gap-8">
          {/* Brand Column */}
          <div className="space-y-4 xl:col-span-1">
            <Link to="/" className="flex items-center gap-2">
              <div className="bg-primary-600 text-white p-2 rounded-xl">
                <Briefcase className="w-5 h-5" />
              </div>
              <span className="font-sans font-extrabold text-xl bg-gradient-to-r from-primary-600 to-indigo-500 bg-clip-text text-transparent dark:from-primary-400 dark:to-indigo-300">
                AIGravulate
              </span>
            </Link>
            <p className="text-slate-500 dark:text-zinc-400 text-sm max-w-xs">
              Connecting elite recruiters with high-caliber candidates through intelligent application pipelines. Organize and track your job search.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-slate-400 hover:text-primary-500 dark:hover:text-primary-400 transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="text-slate-400 hover:text-primary-500 dark:hover:text-primary-400 transition-colors">
                <Github className="w-5 h-5" />
              </a>
              <a href="#" className="text-slate-400 hover:text-primary-500 dark:hover:text-primary-400 transition-colors">
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links Column */}
          <div className="mt-12 grid grid-cols-2 gap-8 xl:mt-0 xl:col-span-2">
            <div className="md:grid md:grid-cols-2 md:gap-8">
              <div>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-200 tracking-wider uppercase">
                  Platform
                </h3>
                <ul className="mt-4 space-y-2">
                  <li>
                    <Link to="/jobs" className="text-sm text-slate-500 hover:text-primary-600 dark:text-zinc-400 dark:hover:text-primary-400 transition-colors">
                      Browse All Jobs
                    </Link>
                  </li>
                  <li>
                    <Link to="/login" className="text-sm text-slate-500 hover:text-primary-600 dark:text-zinc-400 dark:hover:text-primary-400 transition-colors">
                      Candidate Sign In
                    </Link>
                  </li>
                  <li>
                    <Link to="/register" className="text-sm text-slate-500 hover:text-primary-600 dark:text-zinc-400 dark:hover:text-primary-400 transition-colors">
                      Post a Job Opening
                    </Link>
                  </li>
                </ul>
              </div>
              <div className="mt-12 md:mt-0">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-200 tracking-wider uppercase">
                  Resources
                </h3>
                <ul className="mt-4 space-y-2">
                  <li>
                    <a href="#" className="text-sm text-slate-500 hover:text-primary-600 dark:text-zinc-400 dark:hover:text-primary-400 transition-colors">
                      Help & Support
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-sm text-slate-500 hover:text-primary-600 dark:text-zinc-400 dark:hover:text-primary-400 transition-colors">
                      Privacy Policy
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-sm text-slate-500 hover:text-primary-600 dark:text-zinc-400 dark:hover:text-primary-400 transition-colors">
                      Terms of Service
                    </a>
                  </li>
                </ul>
              </div>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-200 tracking-wider uppercase">
                Enterprise
              </h3>
              <ul className="mt-4 space-y-2">
                <li>
                  <a href="#" className="text-sm text-slate-500 hover:text-primary-600 dark:text-zinc-400 dark:hover:text-primary-400 transition-colors">
                    Hiring Solutions
                  </a>
                </li>
                <li>
                  <a href="#" className="text-sm text-slate-500 hover:text-primary-600 dark:text-zinc-400 dark:hover:text-primary-400 transition-colors">
                    Company Directory
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-12 border-t border-slate-200 dark:border-zinc-800/80 pt-8 flex items-center justify-between">
          <p className="text-xs text-slate-400 dark:text-zinc-500">
            &copy; {new Date().getFullYear()} AIGravulate. All rights reserved. Built for production.
          </p>
          <div className="flex items-center gap-1 text-slate-400 text-xs dark:text-zinc-500">
            <Globe className="w-3.5 h-3.5" />
            <span>English (US)</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
