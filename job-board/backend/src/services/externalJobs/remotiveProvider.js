const axios = require('axios');

/**
 * Remotive Job Provider
 * Fetches remote jobs from public JSON feed and normalizes them.
 */
class RemotiveProvider {
  constructor() {
    this.name = 'Remotive';
    this.apiUrl = 'https://remotive.com/api/remote-jobs?limit=20';
  }

  async fetchJobs() {
    try {
      const response = await axios.get(this.apiUrl, { timeout: 8000 });
      if (!response.data || !Array.isArray(response.data.jobs)) {
        return [];
      }

      return response.data.jobs.map(job => this.normalize(job));
    } catch (error) {
      console.error(`[${this.name} Provider Error]:`, error.message);
      throw error; // Rethrow to let manager handle retry logic
    }
  }

  normalize(rawJob) {
    // Map Remotive categories to unified format
    let expLevel = '2-5 years';
    if (rawJob.title.toLowerCase().includes('senior') || rawJob.title.toLowerCase().includes('lead')) {
      expLevel = 'Senior';
    } else if (rawJob.title.toLowerCase().includes('junior') || rawJob.title.toLowerCase().includes('entry')) {
      expLevel = 'Entry Level';
    }

    return {
      id: `remotive-${rawJob.id}`,
      title: rawJob.title,
      company: rawJob.company_name,
      companyLogo: rawJob.company_logo || 'https://images.unsplash.com/photo-1549923746-c502d488b3ea?auto=format&fit=crop&w=100&h=100&q=80',
      location: rawJob.candidate_required_location || 'Remote',
      salary: rawJob.salary || 'Salary Undisclosed',
      experience: expLevel,
      employmentType: rawJob.job_type ? rawJob.job_type.replace('_', '-') : 'Full-time',
      remote: true,
      skills: Array.isArray(rawJob.tags) ? rawJob.tags : ['Software Development'],
      description: rawJob.description || 'No description provided by the external board.',
      postedDate: rawJob.publication_date ? new Date(rawJob.publication_date) : new Date(),
      source: 'Remotive',
      applyUrl: rawJob.url
    };
  }
}

module.exports = new RemotiveProvider();
