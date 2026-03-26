require('dotenv').config();
const express = require('express');
const cors = require('cors');
const sequelize = require('./db');

require('./models');

const authRoutes = require('./routes/auth');
const jobRoutes = require('./routes/jobs');
const applicationRoutes = require('./routes/applications');
const { errorHandler } = require('./middleware/errorHandler');

const app = express();

// ─── Middleware ───────────────────────────────────────────────────────────────
const allowedOrigins = process.env.CLIENT_ORIGIN
  ? process.env.CLIENT_ORIGIN.split(',').map((o) => o.trim())
  : ['http://localhost:5173'];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));
app.use(express.json());

// ─── Routes ──────────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/applications', applicationRoutes);

app.get('/api/health', (_req, res) => res.json({ status: 'ok', service: 'Arnifi Job API' }));

// ─── Error Handler ────────────────────────────────────────────────────────────
app.use(errorHandler);

// ─── Database & Server ────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
const isDev = process.env.NODE_ENV !== 'production';

sequelize
  .authenticate()
  .then(() =>
    // alter:true is useful in development to auto-apply model changes,
    // but MUST NOT be used in production — it can drop/alter columns.
    sequelize.sync({ alter: isDev })
  )
  .then(() => {
    console.log(`PostgreSQL connected & tables synced (alter=${isDev})`);
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error('Database connection error:', err.message);
    process.exit(1);
  });
