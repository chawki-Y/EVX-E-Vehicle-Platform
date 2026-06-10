const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const UserVehicleLike = sequelize.define('UserVehicleLike', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'user_id',
    references: {
      model: 'users',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  vehicleId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'vehicle_id',
    references: {
      model: 'vehicles',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  likedAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'user_vehicle_likes',
  timestamps: false,
  indexes: [
    {
      unique: true,
      fields: ['user_id', 'vehicle_id']
    },
    {
      fields: ['user_id']
    },
    {
      fields: ['vehicle_id']
    }
  ]
});

module.exports = UserVehicleLike;