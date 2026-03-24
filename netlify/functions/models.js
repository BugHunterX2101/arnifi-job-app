const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');
const getSequelize = require('./db');

let modelsCache = null;

function getModels() {
  if (modelsCache) return modelsCache;

  const sequelize = getSequelize();

  const User = sequelize.define(
    'User',
    {
      id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      name: { type: DataTypes.STRING, allowNull: false },
      email: { type: DataTypes.STRING, allowNull: false, unique: true },
      passwordHash: { type: DataTypes.STRING, allowNull: false, field: 'password_hash' },
      role: { type: DataTypes.ENUM('admin', 'user'), allowNull: false },
    },
    {
      tableName: 'users',
      underscored: true,
      hooks: {
        beforeCreate: async (u) => {
          u.passwordHash = await bcrypt.hash(u.passwordHash, 12);
        },
        beforeUpdate: async (u) => {
          if (u.changed('passwordHash')) {
            u.passwordHash = await bcrypt.hash(u.passwordHash, 12);
          }
        },
      },
    }
  );

  User.prototype.comparePassword = function (plain) {
    return bcrypt.compare(plain, this.passwordHash);
  };

  User.prototype.toSafeJSON = function () {
    const v = { ...this.get() };
    delete v.passwordHash;
    return v;
  };

  const Job = sequelize.define(
    'Job',
    {
      id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      title: { type: DataTypes.STRING, allowNull: false },
      company: { type: DataTypes.STRING, allowNull: false },
      location: { type: DataTypes.STRING, allowNull: false },
      type: {
        type: DataTypes.ENUM('full-time', 'part-time', 'contract', 'remote'),
        allowNull: false,
      },
      description: { type: DataTypes.TEXT, allowNull: false },
      compensation: { type: DataTypes.STRING, defaultValue: '' },
      postedById: { type: DataTypes.UUID, allowNull: false, field: 'posted_by' },
    },
    { tableName: 'jobs', underscored: true }
  );

  const Application = sequelize.define(
    'Application',
    {
      id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      jobId: { type: DataTypes.UUID, allowNull: false, field: 'job_id' },
      applicantId: { type: DataTypes.UUID, allowNull: false, field: 'applicant_id' },
      coverLetter: { type: DataTypes.TEXT, defaultValue: '', field: 'cover_letter' },
      status: {
        type: DataTypes.ENUM('pending', 'reviewed', 'accepted', 'rejected'),
        defaultValue: 'pending',
      },
    },
    {
      tableName: 'applications',
      underscored: true,
      indexes: [{ unique: true, fields: ['job_id', 'applicant_id'] }],
    }
  );

  // Associations
  User.hasMany(Job, { foreignKey: 'postedById', as: 'postedJobs' });
  Job.belongsTo(User, { foreignKey: 'postedById', as: 'postedBy' });

  User.hasMany(Application, { foreignKey: 'applicantId', as: 'applications' });
  Application.belongsTo(User, { foreignKey: 'applicantId', as: 'applicant' });

  Job.hasMany(Application, { foreignKey: 'jobId', as: 'applications' });
  Application.belongsTo(Job, { foreignKey: 'jobId', as: 'job' });

  modelsCache = { User, Job, Application, sequelize };
  return modelsCache;
}

module.exports = getModels;
