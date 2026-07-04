import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, MapPin, Briefcase, ArrowRight, Star, Building2, Users, Trophy, ChevronRight } from 'lucide-react';

const CATEGORIES = [
  { name: 'Software Development', count: '140+ jobs', icon: Briefcase, color: 'bg-violet-100 text-violet-600 dark:bg-violet-950/40 dark:text-violet-400' },
  { name: 'Artificial Intelligence', count: '45+ jobs', icon: Building2, color: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400' },
  { name: 'Product Management', count: '30+ jobs', icon: Users, color: 'bg-sky-100 text-sky-600 dark:bg-sky-950/40 dark:text-sky-400' },
  { name: 'Design & Creative', count: '65+ jobs', icon: Trophy, color: 'bg-amber-100 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400' }
];

const COMPANIES = [
  { name: 'TechCorp Systems', industry: 'Enterprise Cloud', location: 'San Francisco, CA', logoUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&h=100&fit=crop' },
  { name: 'Nexus AI Labs', industry: 'Generative AI', location: 'Remote', logoUrl: 'https://images.unsplash.com/photo-1614741118887-7a4ee193a5fa?w=100&h=100&fit=crop' },
  { name: 'GreenGrid Solutions', industry: 'IoT Grid Systems', location: 'Austin, TX', logoUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=100&h=100&fit=crop' }
];

const TESTIMONIALS = [
  {
    name: 'Sarah Connor',
    role: 'Full Stack Engineer',
    company: 'TechCorp',
    content: 'AIGravulate revolutionized my job hunt! The application tracking system allowed me to view notes and stages in one dashboard. I received a senior offer within weeks!',
    stars: 5,
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop'
  },
  {
    name: 'David Lightman',
    role: 'Hiring Manager',
    company: 'Nexus AI Labs',
    content: 'As a recruiter, finding candidate resumes and managing pipeline status cards has never been this seamless. This is a top-tier design system.',
    stars: 5,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop'
  }
];

function Home() {
  const [search, setSearch] = useState('');
  const [location, setLocation] = useState('');
  const navigate = useNavigate();

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const queryParams = [];
    if (search.trim()) queryParams.push(`search=${encodeURIComponent(search.trim())}`);
    if (location.trim()) queryParams.push(`location=${encodeURIComponent(location.trim())}`);
    
    navigate(`/jobs${queryParams.length ? '?' + queryParams.join('&') : ''}`);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } }
  };

  return (
    <div className="space-y-24 pb-20">
      {/* 1. Hero Section */}
      <section className="relative overflow-hidden pt-12 md:pt-20 lg:pt-28">
        {/* Glow effect background */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary-300/20 dark:bg-primary-950/20 rounded-full filter blur-3xl -z-10 animate-pulse"></div>
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-indigo-300/10 dark:bg-indigo-950/10 rounded-full filter blur-3xl -z-10"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-50 border border-primary-200 text-primary-700 dark:bg-primary-950/30 dark:border-primary-900/40 dark:text-primary-300 text-xs font-semibold"
          >
            <span className="flex h-2 w-2 rounded-full bg-primary-500 animate-ping"></span>
            Seamless Candidate Tracking Enabled
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="font-sans font-extrabold text-4xl sm:text-5xl md:text-6xl tracking-tight max-w-4xl mx-auto leading-tight"
          >
            Discover Your Next Career Move With{' '}
            <span className="bg-gradient-to-r from-primary-600 to-indigo-500 bg-clip-text text-transparent dark:from-primary-400 dark:to-indigo-300">
              AIGravulate
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-slate-600 dark:text-zinc-400 text-lg sm:text-xl max-w-2xl mx-auto font-medium"
          >
            Browse high-growth job opportunities and track application stages live on a visual Kanban timeline pipeline.
          </motion.p>

          {/* Search Bar Widget */}
          <motion.form
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            onSubmit={handleSearchSubmit}
            className="bg-white dark:bg-darkCard shadow-premium rounded-2xl md:rounded-full border border-slate-200 dark:border-darkBorder max-w-3xl mx-auto p-2.5 flex flex-col md:flex-row gap-3 items-center justify-between"
          >
            <div className="flex items-center w-full px-3 gap-2 border-b md:border-b-0 md:border-r border-slate-200 dark:border-zinc-800 pb-3 md:pb-0">
              <Search className="text-slate-400 w-5 h-5 flex-shrink-0" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Job title, keywords, or company name..."
                className="w-full bg-transparent border-none text-slate-800 dark:text-zinc-100 placeholder-slate-400 focus:outline-none focus:ring-0 text-sm font-medium"
              />
            </div>
            <div className="flex items-center w-full px-3 gap-2 pb-3 md:pb-0">
              <MapPin className="text-slate-400 w-5 h-5 flex-shrink-0" />
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="City, state, or Remote..."
                className="w-full bg-transparent border-none text-slate-800 dark:text-zinc-100 placeholder-slate-400 focus:outline-none focus:ring-0 text-sm font-medium"
              />
            </div>
            <button
              type="submit"
              className="w-full md:w-auto flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-semibold text-sm px-6 py-3.5 rounded-xl md:rounded-full transition-all flex-shrink-0 shadow-sm"
            >
              Search Jobs
              <ArrowRight className="w-4 h-4" />
            </button>
          </motion.form>
        </div>
      </section>

      {/* 2. Stats Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid grid-cols-2 md:grid-cols-4 gap-6 bg-white dark:bg-darkCard border border-slate-200 dark:border-darkBorder rounded-3xl p-8 shadow-premium"
        >
          {[
            { value: '1,200+', label: 'Active Jobs', color: 'text-violet-600 dark:text-violet-400' },
            { value: '450+', label: 'Elite Companies', color: 'text-emerald-600 dark:text-emerald-400' },
            { value: '9,800+', label: 'Placements Made', color: 'text-sky-600 dark:text-sky-400' },
            { value: '99.4%', label: 'Retention Rate', color: 'text-amber-600 dark:text-amber-400' }
          ].map((stat, idx) => (
            <motion.div key={idx} variants={itemVariants} className="text-center space-y-1.5">
              <div className={`font-sans font-extrabold text-3xl md:text-4xl ${stat.color}`}>
                {stat.value}
              </div>
              <div className="text-slate-500 dark:text-zinc-400 text-xs md:text-sm font-medium">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* 3. Job Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="text-center space-y-2">
          <h2 className="font-sans font-extrabold text-3xl tracking-tight">Popular Job Categories</h2>
          <p className="text-slate-500 dark:text-zinc-400 max-w-md mx-auto text-sm font-medium">
            Explore diverse opportunities across hot industry sectors.
          </p>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {CATEGORIES.map((cat, idx) => (
            <motion.div
              key={idx}
              variants={itemVariants}
              whileHover={{ y: -5 }}
              onClick={() => navigate(`/jobs?category=${encodeURIComponent(cat.name)}`)}
              className="bg-white dark:bg-darkCard border border-slate-200 dark:border-darkBorder rounded-2xl p-6 shadow-premium hover:shadow-premium-hover cursor-pointer transition-all duration-300 flex flex-col justify-between h-48"
            >
              <div className={`p-3 rounded-xl w-fit ${cat.color}`}>
                <cat.icon className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="font-sans font-bold text-base text-slate-800 dark:text-zinc-200">{cat.name}</h3>
                <div className="text-xs text-slate-400 font-semibold flex items-center gap-1">
                  <span>{cat.count}</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* 4. Top Companies */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 border-b border-slate-200 dark:border-zinc-800/80 pb-6">
          <div className="space-y-1 text-center md:text-left">
            <h2 className="font-sans font-extrabold text-3xl tracking-tight">Meet Top Companies</h2>
            <p className="text-slate-500 dark:text-zinc-400 text-sm font-medium">
              We partner with industry-shaping organizations.
            </p>
          </div>
          <Link
            to="/jobs"
            className="flex items-center gap-1.5 text-primary-600 dark:text-primary-400 font-semibold text-sm hover:underline"
          >
            View Open Jobs
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {COMPANIES.map((company, idx) => (
            <motion.div
              key={idx}
              variants={itemVariants}
              whileHover={{ y: -4 }}
              className="bg-white dark:bg-darkCard border border-slate-200 dark:border-darkBorder rounded-2xl p-6 shadow-premium hover:shadow-premium-hover transition-all flex items-center gap-4"
            >
              <img
                src={company.logoUrl}
                alt={`${company.name} logo`}
                className="w-16 h-16 rounded-xl object-cover border border-slate-100 dark:border-zinc-850"
              />
              <div className="space-y-1 min-w-0">
                <h3 className="font-sans font-bold text-slate-800 dark:text-zinc-200 text-base truncate">{company.name}</h3>
                <p className="text-xs text-slate-400 font-semibold truncate">{company.industry}</p>
                <div className="text-xs font-semibold text-slate-500 dark:text-zinc-400 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 flex-shrink-0 text-slate-400" />
                  <span className="truncate">{company.location}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* 5. Testimonials */}
      <section className="bg-slate-100 dark:bg-zinc-950 py-16 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-2">
            <h2 className="font-sans font-extrabold text-3xl tracking-tight">Candidate Success Stories</h2>
            <p className="text-slate-500 dark:text-zinc-400 max-w-sm mx-auto text-sm font-medium">
              Read what job seekers and recruiters say about us.
            </p>
          </div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 gap-8"
          >
            {TESTIMONIALS.map((test, idx) => (
              <motion.div
                key={idx}
                variants={itemVariants}
                className="bg-white dark:bg-darkCard border border-slate-200 dark:border-darkBorder rounded-2xl p-8 shadow-premium flex flex-col justify-between"
              >
                <p className="text-slate-600 dark:text-zinc-300 italic text-sm md:text-base leading-relaxed mb-6">
                  "{test.content}"
                </p>
                <div className="flex items-center gap-4">
                  <img
                    src={test.avatar}
                    alt={test.name}
                    className="w-12 h-12 rounded-full object-cover border border-slate-200 dark:border-zinc-800"
                  />
                  <div className="space-y-0.5">
                    <h4 className="font-sans font-bold text-slate-800 dark:text-zinc-200 text-sm">{test.name}</h4>
                    <p className="text-xs font-semibold text-slate-500 dark:text-zinc-400">
                      {test.role} @ <span className="text-primary-600 dark:text-primary-400">{test.company}</span>
                    </p>
                    <div className="flex gap-0.5 text-amber-500 mt-1">
                      {[...Array(test.stars)].map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-current" />
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* 6. CTA Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-gradient-to-r from-primary-600 to-indigo-600 rounded-3xl p-12 text-center text-white space-y-6 shadow-premium relative overflow-hidden"
        >
          {/* Blur graphics */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full filter blur-2xl -z-10 translate-x-20 -translate-y-20"></div>
          
          <h2 className="font-sans font-extrabold text-3xl sm:text-4xl tracking-tight max-w-xl mx-auto">
            Ready to Take Control of Your Career Tracker?
          </h2>
          <p className="text-primary-100 max-w-md mx-auto text-base">
            Create an account today. Register as a Candidate to save/apply to jobs, or as a Recruiter to post openings.
          </p>
          <div className="pt-4 flex flex-wrap gap-4 items-center justify-center">
            <Link
              to="/register"
              className="bg-white hover:bg-slate-100 text-primary-700 font-semibold px-6 py-3.5 rounded-xl transition-colors text-sm shadow-md"
            >
              Sign Up Free
            </Link>
            <Link
              to="/jobs"
              className="border border-white/40 hover:bg-white/10 px-6 py-3.5 rounded-xl transition-colors text-sm font-semibold"
            >
              Browse Listings
            </Link>
          </div>
        </motion.div>
      </section>
    </div>
  );
}

export default Home;
