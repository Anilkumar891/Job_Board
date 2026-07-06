const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// ── Allowed origins ─────────────────────────────────────────────────────
const ALLOWED_ORIGINS = [
  'https://job-board-dusky-alpha.vercel.app', // Production frontend
  'http://localhost:5173',                     // Local dev
  'http://localhost:4173',                     // Local preview
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (curl, Postman, server-to-server)
    if (!origin) return callback(null, true);
    // Allow any vercel.app subdomain (preview deployments) + explicit list
    if (
      ALLOWED_ORIGINS.includes(origin) ||
      /^https:\/\/[\w-]+(\.vercel\.app)$/.test(origin)
    ) {
      return callback(null, true);
    }
    return callback(new Error(`CORS: origin ${origin} not allowed`));
  },
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static uploads
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
const authRoutes = require('./routes/authRoutes');
const externalJobsRoutes = require('./routes/externalJobsRoutes');
const jobsRoutes = require('./routes/jobsRoutes');
const companiesRoutes = require('./routes/companiesRoutes');
const applicationsRoutes = require('./routes/applicationsRoutes');
const savedJobsRoutes = require('./routes/savedJobsRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/jobs/external', externalJobsRoutes);
app.use('/api/jobs', jobsRoutes);
app.use('/api/companies', companiesRoutes);
app.use('/api/applications', applicationsRoutes);
app.use('/api/saved', savedJobsRoutes);

// Basic health check route
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'AI Job Board API is running' });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
