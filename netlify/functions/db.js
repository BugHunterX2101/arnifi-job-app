const { Sequelize } = require('sequelize');

let sequelize;

function getSequelize() {
  if (sequelize) return sequelize;

  const dbUrl = process.env.DATABASE_URL;

  if (!dbUrl) {
    throw new Error('DATABASE_URL environment variable is not set');
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
