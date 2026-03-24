const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');
const sequelize = require('../db');

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

module.exports = User;
