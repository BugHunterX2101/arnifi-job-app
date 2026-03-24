const { DataTypes } = require('sequelize');
const sequelize = require('../db');

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

module.exports = Job;
