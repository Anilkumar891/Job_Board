/**
 * Mock Job Providers
 * Simulated normalized listings for platforms requiring enterprise API credentials.
 */

const mockCompanies = ['Stripe', 'Netflix', 'Airbnb', 'HubSpot', 'Shopify', 'Slack', 'Linear', 'Vercel'];
const mockTitles = [
  'Senior React Engineer',
  'DevOps Infrastructure Architect',
  'Product Design Lead',
  'Data Science Specialist',
  'Junior Frontend Developer',
  'Full-Stack Node.js Engineer',
  'Staff Security Engineer',
  'iOS Mobile Developer'
];
const mockLocations = ['San Francisco, CA', 'New York, NY', 'Austin, TX', 'Remote', 'London, UK', 'Berlin, Germany'];
const mockSalaries = ['$120k - $150k', '$160k - $190k', '$100k - $130k', '$80k - $100k', '€90k - €110k'];
const mockSkills = [
  ['React', 'TypeScript', 'TailwindCSS'],
  ['AWS', 'Kubernetes', 'Docker', 'Terraform'],
  ['Figma', 'UI/UX Design', 'Prototyping'],
  ['Python', 'SQL', 'Pandas', 'Machine Learning'],
  ['JavaScript', 'HTML', 'CSS', 'Vue.js'],
  ['Node.js', 'Express', 'PostgreSQL', 'Redis'],
  ['Security Auditing', 'OAuth', 'Penetration Testing'],
  ['Swift', 'iOS SDK', 'UIKit', 'SwiftUI']
];

class MockProviders {
  async fetchJobs(sourceName) {
    // Return a randomized list of jobs representing the source
    const count = 5; // Return 5 jobs per source
    const jobs = [];

    for (let i = 0; i < count; i++) {
      const companyIndex = Math.floor(Math.random() * mockCompanies.length);
      const titleIndex = Math.floor(Math.random() * mockTitles.length);
      const locationIndex = Math.floor(Math.random() * mockLocations.length);
      const salaryIndex = Math.floor(Math.random() * mockSalaries.length);

      const location = mockLocations[locationIndex];
      const isRemote = location === 'Remote';

      const daysAgo = Math.floor(Math.random() * 5);
      const postedDate = new Date();
      postedDate.setDate(postedDate.getDate() - daysAgo);

      jobs.push({
        id: `mock-${sourceName.toLowerCase()}-${i}-${companyIndex}-${titleIndex}`,
        title: mockTitles[titleIndex],
        company: mockCompanies[companyIndex],
        companyLogo: `https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=100&h=100&q=80`,
        location: location,
        salary: mockSalaries[salaryIndex],
        experience: titleIndex === 4 ? 'Entry Level' : titleIndex > 5 ? 'Senior' : '2-5 years',
        employmentType: 'Full-time',
        remote: isRemote,
        skills: mockSkills[titleIndex],
        description: `This is a sample listing pulled from ${sourceName}. Responsibilities include software development, product ownership, and deploying production code. Requirements are proficiency in ${mockSkills[titleIndex].join(', ')}.`,
        postedDate: postedDate,
        source: sourceName,
        applyUrl: `https://${sourceName.toLowerCase()}.com/jobs`
      });
    }

    return jobs;
  }
}

module.exports = new MockProviders();
