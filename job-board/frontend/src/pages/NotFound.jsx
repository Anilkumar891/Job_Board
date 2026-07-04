import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, ArrowLeft, Frown } from 'lucide-react';

function NotFound() {
  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-16">
      <div className="text-center space-y-6 max-w-md">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 100 }}
          className="mx-auto w-24 h-24 bg-primary-100 dark:bg-primary-950/40 text-primary-600 dark:text-primary-400 rounded-full flex items-center justify-center"
        >
          <Frown className="w-12 h-12" />
        </motion.div>

        <h1 className="font-sans font-extrabold text-7xl text-primary-600 dark:text-primary-400 tracking-tight">
          404
        </h1>

        <div className="space-y-2">
          <h2 className="font-sans font-bold text-2xl text-slate-800 dark:text-zinc-150">
            Page Not Found
          </h2>
          <p className="text-slate-500 dark:text-zinc-400 text-sm font-medium leading-relaxed">
            The page you are looking for doesn't exist or has been moved. Use the navigation above or buttons below to return.
          </p>
        </div>

        <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center items-center">
          <button
            onClick={() => window.history.back()}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 border border-slate-200 dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700 text-slate-700 dark:text-zinc-300 rounded-xl text-sm font-bold transition-all hover:bg-slate-50 dark:hover:bg-zinc-900"
          >
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </button>
          <Link
            to="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-sm font-bold transition-all shadow-sm"
          >
            <Home className="w-4 h-4" />
            Return Home
          </Link>
        </div>
      </div>
    </div>
  );
}

export default NotFound;
