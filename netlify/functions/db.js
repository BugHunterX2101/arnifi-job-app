// Load .env when running locally outside the Netlify CLI
try {
  require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
} catch {
  // dotenv not available in production bundle — env vars injected by platform
}

const { Sequelize } = require('sequelize');

let sequelize;

function getSequelize() {
  if (sequelize) return sequelize;

  const dbUrl = process.env.DATABASE_URL;

  if (!dbUrl) {
    throw new Error(
      'DATABASE_URL environment variable is not set. ' +
      'Copy .env.example → .env in the repo root and fill in the value.'
    );
  }

  // Supabase supports two connection modes:
  // 1. Direct:  db.PROJECT.supabase.co:5432        — for persistent servers
  // 2. Pooler:  aws-0-REGION.pooler.supabase.com:6543 — for serverless (Netlify functions)
  //
  // We detect which mode is in use and configure accordingly.
  const isPooler = dbUrl.includes('.pooler.supabase.com');

  sequelize = new Sequelize(dbUrl, {
    dialect: 'postgres',
    logging: false,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    },
    pool: {
      // Keep pool small — each serverless invocation is short-lived
      max: isPooler ? 1 : 2,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  });

  return sequelize;
}

module.exports = getSequelize;
