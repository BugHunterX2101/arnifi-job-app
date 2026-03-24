const express = require('express');
const { Job, User, Application } = require('../models');
const { authenticateToken, authorizeRole } = require('../middleware/auth');

const router = express.Router();

const JOB_WITH_POSTER = {
  include: [{ model: User, as: 'postedBy', attributes: ['id', 'name', 'email'] }],
};

// GET /api/jobs
router.get('/', async (req, res, next) => {
  try {
    const jobs = await Job.findAll({
      ...JOB_WITH_POSTER,
      order: [['created_at', 'DESC']],
    });
    res.json(jobs);
  } catch (err) {
    next(err);
  }
});

// GET /api/jobs/:id
router.get('/:id', async (req, res, next) => {
  try {
    const job = await Job.findByPk(req.params.id, JOB_WITH_POSTER);
    if (!job) return res.status(404).json({ message: 'Job not found.' });
    res.json(job);
  } catch (err) {
    next(err);
  }
});

// POST /api/jobs — admin only
router.post('/', authenticateToken, authorizeRole('admin'), async (req, res, next) => {
  try {
    const { title, company, location, type, description, compensation } = req.body;

    if (!title || !company || !location || !type || !description) {
      return res.status(400).json({ message: 'All required fields must be provided.' });
    }

    const job = await Job.create({
      title, company, location, type, description,
      compensation: compensation || '',
      postedById: req.user.id,
    });

    const populated = await Job.findByPk(job.id, JOB_WITH_POSTER);
    res.status(201).json(populated);
  } catch (err) {
    next(err);
  }
});

// PUT /api/jobs/:id — admin only
router.put('/:id', authenticateToken, authorizeRole('admin'), async (req, res, next) => {
  try {
    const job = await Job.findByPk(req.params.id);
    if (!job) return res.status(404).json({ message: 'Job not found.' });

    const allowed = ['title', 'company', 'location', 'type', 'description', 'compensation'];
    allowed.forEach((field) => {
      if (req.body[field] !== undefined) job[field] = req.body[field];
    });

    await job.save();
    const populated = await Job.findByPk(job.id, JOB_WITH_POSTER);
    res.json(populated);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/jobs/:id — admin only
router.delete('/:id', authenticateToken, authorizeRole('admin'), async (req, res, next) => {
  try {
    const job = await Job.findByPk(req.params.id);
    if (!job) return res.status(404).json({ message: 'Job not found.' });

    await job.destroy();
    res.json({ message: 'Job deleted successfully.' });
  } catch (err) {
    next(err);
  }
});

// POST /api/jobs/:id/apply — user only
router.post('/:id/apply', authenticateToken, authorizeRole('user'), async (req, res, next) => {
  try {
    const job = await Job.findByPk(req.params.id);
    if (!job) return res.status(404).json({ message: 'Job not found.' });

    const existing = await Application.findOne({
      where: { jobId: job.id, applicantId: req.user.id },
    });
    if (existing) {
      return res.status(409).json({ message: 'You have already applied to this job.' });
    }

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
    next(err);
  }
});

module.exports = router;
