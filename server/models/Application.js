const { DataTypes } = require('sequelize');
const sequelize = require('../db');

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

module.exports = Application;
