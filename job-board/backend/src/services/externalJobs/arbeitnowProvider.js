const axios = require('axios');

/**
 * Arbeitnow Job Provider
 * Fetches listings from Arbeitnow's public API feed.
 */
class ArbeitnowProvider {
  constructor() {
    this.name = 'Arbeitnow';
    this.apiUrl = 'https://www.arbeitnow.com/api/job-board-api';
  }

  async fetchJobs() {
    try {
      const response = await axios.get(this.apiUrl, { timeout: 8000 });
      if (!response.data || !Array.isArray(response.data.data)) {
        return [];
      }

      return response.data.data.map(job => this.normalize(job));
    } catch (error) {
      console.error(`[${this.name} Provider Error]:`, error.message);
      throw error;
    }
  }

  normalize(rawJob) {
    let expLevel = '2-5 years';
    if (rawJob.title.toLowerCase().includes('senior') || rawJob.title.toLowerCase().includes('lead')) {
      expLevel = 'Senior';
    } else if (rawJob.title.toLowerCase().includes('junior') || rawJob.title.toLowerCase().includes('entry')) {
      expLevel = 'Entry Level';
    }

    const isRemote = rawJob.remote === true || rawJob.title.toLowerCase().includes('remote');

    return {
      id: `arbeitnow-${rawJob.slug}`,
      title: rawJob.title,
      company: rawJob.company_name,
      companyLogo: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=100&h=100&q=80',
      location: rawJob.location || 'Europe',
      salary: 'Salary Undisclosed',
      experience: expLevel,
      employmentType: 'Full-time',
      remote: isRemote,
      skills: Array.isArray(rawJob.tags) ? rawJob.tags : ['General Technologies'],
      description: rawJob.description || 'No description provided.',
      postedDate: new Date(), // Arbeitnow feed does not supply pub date directly
      source: 'Arbeitnow',
      applyUrl: rawJob.url
    };
  }
}

module.exports = new ArbeitnowProvider();
