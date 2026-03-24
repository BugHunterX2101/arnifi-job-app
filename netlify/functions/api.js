const express = require('express');
const serverless = require('serverless-http');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const getModels = require('./models');

const app = express();

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(express.json());
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

// ── Helpers ───────────────────────────────────────────────────────────────────
const jwtSign = (user) =>
  jwt.sign(
    { id: user.id, name: user.name, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '30d' }
  );

const authenticate = (req, res, next) => {
  const header = req.headers['authorization'];
  const token = header?.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ message: 'No token provided.' });
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ message: 'Invalid or expired token.' });
  }
};

const authorize = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user?.role)) {
    return res.status(403).json({ message: `Requires role: ${roles.join(' or ')}.` });
  }
  next();
};

const syncDb = async () => {
  const { sequelize } = getModels();
  await sequelize.sync({ alter: false });
};

// ── Health ────────────────────────────────────────────────────────────────────
app.get('/api/health', (_, res) => res.json({ status: 'ok', service: 'Arnifi Job API' }));

// ── Auth ──────────────────────────────────────────────────────────────────────
app.post('/api/auth/signup', async (req, res) => {
  try {
    await syncDb();
    const { User } = getModels();
    const { name, email, password, role } = req.body;
    if (!name || !email || !password || !role)
      return res.status(400).json({ message: 'All fields are required.' });
    if (!['admin', 'user'].includes(role))
      return res.status(400).json({ message: 'Role must be admin or user.' });
    const existing = await User.findOne({ where: { email } });
    if (existing)
      return res.status(409).json({ message: 'An account with that email already exists.' });
    const user = await User.create({ name, email, passwordHash: password, role });
    res.status(201).json({ token: jwtSign(user), user: user.toSafeJSON() });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message || 'Signup failed.' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    await syncDb();
    const { User } = getModels();
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: 'Email and password are required.' });
    const user = await User.findOne({ where: { email } });
    if (!user || !(await user.comparePassword(password)))
      return res.status(401).json({ message: 'Invalid credentials.' });
    res.json({ token: jwtSign(user), user: user.toSafeJSON() });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message || 'Login failed.' });
  }
});

// ── Jobs ──────────────────────────────────────────────────────────────────────
const JOB_INCLUDE = (User) => ({
  include: [{ model: User, as: 'postedBy', attributes: ['id', 'name', 'email'] }],
});

app.get('/api/jobs', async (req, res) => {
  try {
    await syncDb();
    const { Job, User } = getModels();
    const jobs = await Job.findAll({ ...JOB_INCLUDE(User), order: [['created_at', 'DESC']] });
    res.json(jobs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

app.get('/api/jobs/:id', async (req, res) => {
  try {
    await syncDb();
    const { Job, User } = getModels();
    const job = await Job.findByPk(req.params.id, JOB_INCLUDE(User));
    if (!job) return res.status(404).json({ message: 'Job not found.' });
    res.json(job);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post('/api/jobs', authenticate, authorize('admin'), async (req, res) => {
  try {
    await syncDb();
    const { Job, User } = getModels();
    const { title, company, location, type, description, compensation } = req.body;
    if (!title || !company || !location || !type || !description)
      return res.status(400).json({ message: 'All required fields must be provided.' });
    const job = await Job.create({
      title, company, location, type, description,
      compensation: compensation || '',
      postedById: req.user.id,
    });
    const populated = await Job.findByPk(job.id, JOB_INCLUDE(User));
    res.status(201).json(populated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

app.put('/api/jobs/:id', authenticate, authorize('admin'), async (req, res) => {
  try {
    await syncDb();
    const { Job, User } = getModels();
    const job = await Job.findByPk(req.params.id);
    if (!job) return res.status(404).json({ message: 'Job not found.' });
    ['title', 'company', 'location', 'type', 'description', 'compensation'].forEach((f) => {
      if (req.body[f] !== undefined) job[f] = req.body[f];
    });
    await job.save();
    const populated = await Job.findByPk(job.id, JOB_INCLUDE(User));
    res.json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.delete('/api/jobs/:id', authenticate, authorize('admin'), async (req, res) => {
  try {
    await syncDb();
    const { Job } = getModels();
    const job = await Job.findByPk(req.params.id);
    if (!job) return res.status(404).json({ message: 'Job not found.' });
    await job.destroy();
    res.json({ message: 'Job deleted successfully.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post('/api/jobs/:id/apply', authenticate, authorize('user'), async (req, res) => {
  try {
    await syncDb();
    const { Job, Application } = getModels();
    const job = await Job.findByPk(req.params.id);
    if (!job) return res.status(404).json({ message: 'Job not found.' });
    const existing = await Application.findOne({
      where: { jobId: job.id, applicantId: req.user.id },
    });
    if (existing) return res.status(409).json({ message: 'You have already applied to this job.' });
    const application = await Application.create({
      jobId: job.id,
      applicantId: req.user.id,
      coverLetter: req.body.coverLetter || '',
    });
    res.status(201).json({
      applicationId: application.id,
      jobId: job.id,
      applicantId: req.user.id,
      status: application.status,
      appliedAt: application.createdAt,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

// ── Applications ──────────────────────────────────────────────────────────────
app.get('/api/applications', authenticate, async (req, res) => {
  try {
    await syncDb();
    const { Application, Job, User } = getModels();
    if (req.user.role === 'user') {
      const apps = await Application.findAll({
        where: { applicantId: req.user.id },
        include: [{ model: Job, as: 'job', attributes: ['id', 'title', 'company', 'location', 'type', 'compensation'] }],
        order: [['created_at', 'DESC']],
      });
      return res.json(apps.map((a) => ({
        id: a.id, job: a.job, status: a.status,
        coverLetter: a.coverLetter, createdAt: a.createdAt,
      })));
    }
    if (req.user.role === 'admin') {
      const apps = await Application.findAll({
        include: [
          { model: Job, as: 'job', attributes: ['id', 'title', 'company', 'location', 'type'] },
          { model: User, as: 'applicant', attributes: ['id', 'name', 'email'] },
        ],
        order: [['created_at', 'DESC']],
      });
      return res.json(apps.map((a) => ({
        id: a.id, job: a.job, applicant: a.applicant,
        coverLetter: a.coverLetter, status: a.status, createdAt: a.createdAt,
      })));
    }
    res.status(403).json({ message: 'Forbidden.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

app.patch('/api/applications/:id/status', authenticate, authorize('admin'), async (req, res) => {
  try {
    await syncDb();
    const { Application } = getModels();
    const { status } = req.body;
    const allowed = ['pending', 'reviewed', 'accepted', 'rejected'];
    if (!allowed.includes(status))
      return res.status(400).json({ message: `Status must be one of: ${allowed.join(', ')}.` });
    const app = await Application.findByPk(req.params.id);
    if (!app) return res.status(404).json({ message: 'Application not found.' });
    app.status = status;
    await app.save();
    res.json({ id: app.id, status: app.status });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports.handler = serverless(app);
