# AI Job Board API Specification

This document details the REST APIs for the AI Job Board & Candidate Job Tracker.

## Base URL
`/api`

## Authentication Routes
- `POST /api/register`: Register candidate or recruiter
- `POST /api/login`: Authenticate user and return JWT
- `POST /api/logout`: Logout user
- `GET /api/me`: Get current authenticated user details

## Jobs Routes
- `GET /api/jobs`: Get all jobs with filtering and pagination
- `GET /api/jobs/:id`: Get detailed information of a specific job
- `POST /api/jobs`: Create a new job opening (Recruiter only)
- `PUT /api/jobs/:id`: Update an existing job opening (Recruiter only)
- `DELETE /api/jobs/:id`: Delete a job opening (Recruiter only)

## Companies Routes
- `GET /api/companies`: Get all companies
- `GET /api/companies/:id`: Get detailed information of a specific company
- `POST /api/companies`: Register a new company profile
- `PUT /api/companies/:id`: Update company details
- `DELETE /api/companies/:id`: Delete company profile

## Applications Routes
- `POST /api/apply`: Submit job application (Candidate only)
- `GET /api/applications`: Get applications (Recruiter sees applicants to their jobs, Candidate sees their own applications)
- `PUT /api/applications/:id/status`: Update application status (Recruiter only)

## Saved Jobs Routes
- `POST /api/saved`: Save/bookmark a job
- `DELETE /api/saved/:id`: Remove a saved job
- `GET /api/saved`: List saved jobs for candidates
