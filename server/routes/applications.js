const express = require('express');
const { Application, Job, User } = require('../models');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// GET /api/applications
router.get('/', authenticateToken, async (req, res, next) => {
  try {
    if (req.user.role === 'user') {
      const applications = await Application.findAll({
        where: { applicantId: req.user.id },
        include: [{
          model: Job,
          as: 'job',
          attributes: ['id', 'title', 'company', 'location', 'type', 'compensation'],
        }],
        order: [['created_at', 'DESC']],
      });
      return res.json(
        applications.map((a) => ({
          id: a.id,
          job: a.job,
          status: a.status,
          coverLetter: a.coverLetter,
          createdAt: a.createdAt,
        }))
      );
    }

    if (req.user.role === 'admin') {
      const applications = await Application.findAll({
        include: [
          { model: Job, as: 'job', attributes: ['id', 'title', 'company', 'location', 'type'] },
          { model: User, as: 'applicant', attributes: ['id', 'name', 'email'] },
        ],
        order: [['created_at', 'DESC']],
      });
      return res.json(
        applications.map((a) => ({
          id: a.id,
          job: a.job,
          applicant: a.applicant,
          coverLetter: a.coverLetter,
          status: a.status,
          createdAt: a.createdAt,
        }))
      );
    }

    res.status(403).json({ message: 'Forbidden.' });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/applications/:id/status — admin only
router.patch('/:id/status', authenticateToken, async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only admins can update application status.' });
    }

    const { status } = req.body;
    const allowed = ['pending', 'reviewed', 'accepted', 'rejected'];
    if (!allowed.includes(status)) {
      return res.status(400).json({ message: `Status must be one of: ${allowed.join(', ')}.` });
    }

    const application = await Application.findByPk(req.params.id);
    if (!application) return res.status(404).json({ message: 'Application not found.' });

    application.status = status;
    await application.save();

    res.json({ id: application.id, status: application.status });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
