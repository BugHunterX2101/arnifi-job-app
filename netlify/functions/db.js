// Load .env when running locally outside the Netlify CLI
// (e.g. direct `node` invocations or unit tests).
// In production / netlify dev the env vars are already injected by the platform.
try {
  require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
} catch {
  // dotenv is not available in the Netlify production bundle — that's fine.
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
      max: 2,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  });

  return sequelize;
}

module.exports = getSequelize;
