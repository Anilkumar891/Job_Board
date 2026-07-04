const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Clean up database
  await prisma.savedJob.deleteMany();
  await prisma.application.deleteMany();
  await prisma.job.deleteMany();
  await prisma.company.deleteMany();
  await prisma.user.deleteMany();

  // Create Passwords
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash('password123', salt);

  // 1. Create Users
  const recruiter = await prisma.user.create({
    data: {
      name: 'John Recruiter',
      email: 'recruiter@example.com',
      password: passwordHash,
      role: 'RECRUITER'
    }
  });

  const candidate = await prisma.user.create({
    data: {
      name: 'Jane Candidate',
      email: 'candidate@example.com',
      password: passwordHash,
      role: 'CANDIDATE',
      resumeUrl: 'https://example.com/resumes/jane_cv.pdf'
    }
  });

  console.log('Users created:');
  console.log(`- Recruiter: ${recruiter.email}`);
  console.log(`- Candidate: ${candidate.email}`);

  // 2. Create Companies
  const techCorp = await prisma.company.create({
    data: {
      name: 'TechCorp Systems',
      logo: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&h=100&fit=crop',
      website: 'https://techcorp.example.com',
      industry: 'Software Engineering',
      location: 'San Francisco, CA',
      size: '501-1000',
      description: 'TechCorp Systems is a leading innovator in cloud services and enterprise infrastructure solution deployment worldwide.'
    }
  });

  const greenGrid = await prisma.company.create({
    data: {
      name: 'GreenGrid Solutions',
      logo: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=100&h=100&fit=crop',
      website: 'https://greengrid.example.com',
      industry: 'Renewable Energy & IoT',
      location: 'Austin, TX',
      size: '51-200',
      description: 'GreenGrid Solutions manufactures and designs IoT devices focused on smart power monitoring and renewable grid integrations.'
    }
  });

  const nexusAI = await prisma.company.create({
    data: {
      name: 'Nexus AI Labs',
      logo: 'https://images.unsplash.com/photo-1614741118887-7a4ee193a5fa?w=100&h=100&fit=crop',
      website: 'https://nexusai.example.com',
      industry: 'Artificial Intelligence',
      location: 'Remote, USA',
      size: '11-50',
      description: 'Nexus AI Labs is a cutting edge machine learning research facility focused on generative AI systems and automated pipeline orchestration.'
    }
  });

  console.log('Companies created.');

  // 3. Create Jobs
  const job1 = await prisma.job.create({
    data: {
      companyId: techCorp.id,
      recruiterId: recruiter.id,
      title: 'Senior Full Stack Engineer',
      description: `We are looking for a Senior Full Stack Engineer to join our core cloud platform team.
      
Responsibilities:
- Build and maintain scalable APIs using Node.js and PostgreSQL.
- Develop immersive, highly responsive interfaces using React, Tailwind CSS, and Framer Motion.
- Mentor junior engineers and champion clean coding practices.
- Collaborate with product and design teams.

Requirements:
- 5+ years of software development experience.
- Deep expertise in JavaScript/Node.js and modern React.
- Solid understanding of SQL, PostgreSQL, and ORMs like Prisma.
- Strong knowledge of responsive web design and accessibility standards.

Benefits:
- Competitive salary ($130k - $160k).
- Full health, dental, and vision insurance.
- 401(k) matching and equity.
- Flexible remote work options.`,
      salary: '$130k - $160k',
      experience: '5+ years',
      location: 'San Francisco, CA',
      jobType: 'Full-time',
      workMode: 'Hybrid',
      skills: ['React', 'Node.js', 'PostgreSQL', 'Prisma', 'Tailwind CSS', 'Docker'],
      status: 'ACTIVE'
    }
  });

  const job2 = await prisma.job.create({
    data: {
      companyId: nexusAI.id,
      recruiterId: recruiter.id,
      title: 'AI Machine Learning Engineer',
      description: `Join Nexus AI Labs to build next-generation large language model workflows.
      
Responsibilities:
- Fine-tune, deploy, and monitor transformer-based language models.
- Build orchestration pipelines for multi-agent autonomous tasks.
- Optimize inference speed and memory footprint of models in production.

Requirements:
- 3+ years experience in Python, PyTorch, and NLP models.
- Experience with FastAPI, Docker, and AWS deployments.
- Strong foundation in linear algebra, statistics, and Deep Learning.

Benefits:
- Competitive salary ($140k - $180k).
- Unlimited PTO.
- Yearly learning and conference stipend.`,
      salary: '$140k - $180k',
      experience: '3+ years',
      location: 'Remote',
      jobType: 'Full-time',
      workMode: 'Remote',
      skills: ['Python', 'PyTorch', 'Transformers', 'FastAPI', 'AWS', 'Docker'],
      status: 'ACTIVE'
    }
  });

  const job3 = await prisma.job.create({
    data: {
      companyId: greenGrid.id,
      recruiterId: recruiter.id,
      title: 'Frontend React Developer',
      description: `GreenGrid Solutions is looking for a UI specialist to design our web monitoring dashboards.
      
Responsibilities:
- Translate Figma designs into pixel-perfect Tailwind CSS web code.
- Implement real-time IoT graphs and metrics using Chart.js or Recharts.
- Maintain top-tier web performance and layout responsiveness.

Requirements:
- 2+ years experience building production React applications.
- Strong control of CSS Grid, Flexbox, and Tailwind.
- Experience with WebSockets or REST integrations.`,
      salary: '$80k - $105k',
      experience: '2+ years',
      location: 'Austin, TX',
      jobType: 'Full-time',
      workMode: 'Onsite',
      skills: ['React', 'Tailwind CSS', 'Recharts', 'HTML5/CSS3', 'REST API'],
      status: 'ACTIVE'
    }
  });

  const job4 = await prisma.job.create({
    data: {
      companyId: techCorp.id,
      recruiterId: recruiter.id,
      title: 'Backend Systems Engineer (Node.js)',
      description: `We need an expert backend engineer to lead architecture scalability efforts on our main cloud service.
      
Responsibilities:
- Design high-concurrency microservices in Express/Fastify.
- Manage PostgreSQL replication, query tuning, and index optimization.
- Secure data flows with OAuth2 and cryptographic hashing protocols.`,
      salary: '$120k - $150k',
      experience: '4+ years',
      location: 'San Francisco, CA',
      jobType: 'Contract',
      workMode: 'Hybrid',
      skills: ['Node.js', 'Express', 'PostgreSQL', 'Prisma', 'Redis', 'Docker'],
      status: 'ACTIVE'
    }
  });

  console.log('Jobs created.');

  // 4. Create Saved Job
  await prisma.savedJob.create({
    data: {
      candidateId: candidate.id,
      jobId: job1.id
    }
  });

  // 5. Create Application
  await prisma.application.create({
    data: {
      candidateId: candidate.id,
      jobId: job3.id,
      resumeUrl: 'https://example.com/resumes/jane_cv.pdf',
      coverLetter: 'I am highly interested in helping GreenGrid Solutions optimize clean energy infrastructure monitoring panels.',
      status: 'INTERVIEW',
      notes: 'Had a quick introductory call. Technical interview scheduled for next Thursday.'
    }
  });

  await prisma.application.create({
    data: {
      candidateId: candidate.id,
      jobId: job2.id,
      resumeUrl: 'https://example.com/resumes/jane_cv.pdf',
      coverLetter: 'I have extensive experience working with PyTorch models and building FastAPI integrations.',
      status: 'APPLIED',
      notes: 'Applied through platform portal.'
    }
  });

  console.log('Saved jobs and applications created.');
  console.log('Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
