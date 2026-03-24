const { ValidationError, UniqueConstraintError } = require('sequelize');

const errorHandler = (err, _req, res, _next) => {
  console.error(err);
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  if (err instanceof UniqueConstraintError) {
    return res.status(409).json({ message: 'A record with that value already exists.' });
  }

  if (err instanceof ValidationError) {
    const messages = err.errors.map((e) => e.message);
    return res.status(400).json({ message: messages.join('. ') });
  }

  res.status(statusCode).json({ message });
};

module.exports = { errorHandler };
