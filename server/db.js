const { Sequelize } = require('sequelize');

if (!process.env.DATABASE_URL) {
  console.error('ERROR: DATABASE_URL environment variable is not set!');
  process.exit(1);
}

if (!process.env.DATABASE_URL.startsWith('postgresql://') &&
    !process.env.DATABASE_URL.startsWith('postgres://')) {
  console.error('ERROR: DATABASE_URL must start with postgresql:// or postgres://');
  process.exit(1);
}

let sequelize;

if (process.env.NODE_ENV === 'production') {
  try {
    const url = new URL(process.env.DATABASE_URL);
    sequelize = new Sequelize(
      url.pathname.substring(1),
      url.username,
      url.password,
      {
        dialect: 'postgres',
        host: url.hostname,
        port: parseInt(url.port) || 5432,
        logging: false,
        dialectOptions: {
          ssl: {
            require: true,
            rejectUnauthorized: false,
          },
        },
        pool: { max: 5, min: 0, acquire: 30000, idle: 10000 },
      }
    );
  } catch (err) {
    console.error('Failed to parse DATABASE_URL:', err.message);
    process.exit(1);
  }
} else {
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    logging: false,
    dialectOptions: {},
    pool: { max: 5, min: 0, acquire: 30000, idle: 10000 },
  });
}

module.exports = sequelize;
