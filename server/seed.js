require('dotenv').config();
const sequelize = require('./db');
const { User, Job, Application } = require('./models');

async function seed() {
  console.log('Connecting to PostgreSQL...');
  await sequelize.authenticate();
  console.log('Connected.\n');

  await sequelize.sync({ force: true });
  console.log('Tables synced (force reset).\n');

  const admin = await User.create({
    name: 'Victoria Hargrove',
    email: 'admin@sovereign.com',
    passwordHash: 'Password123!',
    role: 'admin',
  });

  const user = await User.create({
    name: 'Alexander Sterling',
    email: 'user@sovereign.com',
    passwordHash: 'Password123!',
    role: 'user',
  });

  console.log('Admin  ->  admin@sovereign.com  |  Password123!');
  console.log('User   ->  user@sovereign.com   |  Password123!\n');

  const jobsData = [
    {
      title: 'Global Director of Operations',
      company: 'Sovereign Capital Group',
      location: 'Zurich, Switzerland (On-site)',
      type: 'full-time',
      compensation: '$450K – $520K',
      description: `Managing Director role leading global operations across 14 jurisdictions.\n\nCore Mandates:\n• Scale Architecture — Design and execute growth frameworks across EMEA & APAC\n• Capital Allocation — Oversee $2B+ annual capital deployment\n• Elite Mentorship — Lead and develop a senior team of 80+\n• Risk Mitigation — Build institutional-grade risk frameworks\n\nRequirements:\n• 10+ years in senior operations or C-suite roles\n• Fortune 500 background preferred\n• Bilingual (DE / EN strongly preferred)\n• MBA or equivalent institutional credential`,
      postedById: admin.id,
    },
    {
      title: 'VP of Digital Sovereignty',
      company: 'Emerald Executive Partners',
      location: 'London, UK (Hybrid)',
      type: 'full-time',
      compensation: '$380K – $420K',
      description: `Lead the firm's digital transformation mandate across all business units.\n\nResponsibilities:\n• Define and own the 5-year technology roadmap\n• Partner with the CTO and Board on enterprise architecture decisions\n• Spearhead AI adoption and automation across legacy workflows\n• Drive cybersecurity posture and data sovereignty compliance\n\nRequirements:\n• 8+ years in digital leadership\n• Experience with enterprise-scale transformations (>$500M revenue organisations)\n• Deep knowledge of cloud, AI, and data governance frameworks`,
      postedById: admin.id,
    },
    {
      title: 'Chief Design Officer',
      company: 'Prestige Ventures',
      location: 'New York, USA (On-site)',
      type: 'full-time',
      compensation: '$350K – $400K',
      description: `Define the aesthetic and experience vision for a global luxury brand portfolio.\n\nResponsibilities:\n• Own brand identity across all consumer and institutional touchpoints\n• Lead a team of 30 designers across 4 studios\n• Collaborate with CEO and CMO on brand strategy and market positioning\n\nRequirements:\n• 12+ years in senior design leadership\n• Portfolio demonstrating luxury, prestige brand work`,
      postedById: admin.id,
    },
    {
      title: 'Managing Director, Sustainable Energy',
      company: 'Atlas Green Capital',
      location: 'Dubai, UAE (On-site)',
      type: 'full-time',
      compensation: '$500K – $600K',
      description: `Lead our sustainable energy investment and advisory practice in the GCC region.\n\nResponsibilities:\n• Source and structure renewable energy deals ($50M–$500M range)\n• Build and maintain relationships with sovereign wealth funds and institutional LPs\n\nRequirements:\n• Deep expertise in energy markets, particularly renewables\n• 10+ years in investment banking, PE, or energy advisory`,
      postedById: admin.id,
    },
    {
      title: 'Head of AI Research & Ethics',
      company: 'Nexus Intelligence Group',
      location: 'Singapore (Hybrid)',
      type: 'full-time',
      compensation: '$320K – $380K',
      description: `Lead the firm's AI research agenda with an emphasis on responsible and ethical deployment.\n\nResponsibilities:\n• Establish the firm's AI ethics framework and governance protocols\n• Publish research and represent the firm at global AI policy forums\n\nRequirements:\n• PhD in AI, ML, Computer Science, or related discipline preferred\n• 7+ years in applied AI research`,
      postedById: admin.id,
    },
    {
      title: 'Chief Risk Officer',
      company: 'Fortis Financial Holdings',
      location: 'Zürich, Switzerland (On-site)',
      type: 'contract',
      compensation: '$280K – $320K',
      description: `Interim CRO engagement to lead enterprise risk transformation over 18 months.\n\nResponsibilities:\n• Conduct full enterprise risk audit across credit, market, operational, and liquidity dimensions\n• Design and implement a next-generation risk framework\n• Present to Board Risk Committee on a quarterly basis\n\nRequirements:\n• Former CRO or senior risk executive background\n• Expertise in Swiss / European regulatory environment`,
      postedById: admin.id,
    },
  ];

  const jobs = await Job.bulkCreate(jobsData);
  console.log(`Seeded ${jobs.length} executive job listings.\n`);

  await Application.create({
    jobId: jobs[0].id,
    applicantId: user.id,
    coverLetter: `I am writing to express my strong interest in the Global Director of Operations role at Sovereign Capital Group. With over 12 years of experience leading cross-border operations and having delivered $1.8B in capital initiatives across EMEA, I am uniquely positioned to advance your firm's strategic mandate.`,
    status: 'reviewed',
  });

  console.log('Created 1 sample application (reviewed status).\n');
  console.log('Seeding complete!\n');
  console.log('Test Credentials:');
  console.log('  Admin  ->  admin@sovereign.com  /  Password123!');
  console.log('  User   ->  user@sovereign.com   /  Password123!\n');

  await sequelize.close();
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
