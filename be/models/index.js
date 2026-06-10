const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Vehicle = require('./Vehicle');
const Accessory = require('./Accessory');
const User = require('./User');
const UserVehicleLike = require('./UserVehicleLike');
const UserItemLike = require('./UserItemLike');
const News = require('./News');
const Video = require('./Video');
const Course = require('./Course');

// Define associations
User.belongsToMany(Vehicle, {
  through: UserVehicleLike,
  foreignKey: 'userId',
  otherKey: 'vehicleId',
  as: 'likedVehicles'
});

Vehicle.belongsToMany(User, {
  through: UserVehicleLike,
  foreignKey: 'vehicleId',
  otherKey: 'userId',
  as: 'likedByUsers'
});

// Direct associations for easier querying
User.hasMany(UserVehicleLike, { foreignKey: 'userId', as: 'likes' });
Vehicle.hasMany(UserVehicleLike, { foreignKey: 'vehicleId', as: 'likes' });
UserVehicleLike.belongsTo(User, { foreignKey: 'userId', as: 'user' });
UserVehicleLike.belongsTo(Vehicle, { foreignKey: 'vehicleId', as: 'vehicle' });

// New generic item likes associations
User.hasMany(UserItemLike, { foreignKey: 'userId', as: 'itemLikes' });
UserItemLike.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// Initialize models
const models = {
  Vehicle,
  Accessory,
  User,
  UserVehicleLike,
  UserItemLike,
  News,
  Video,
  Course,
  sequelize
};

// Test database connection
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully.');
  } catch (error) {
    console.error('❌ Unable to connect to the database:', error);
  }
};

// Sync database (create tables if they don't exist)
const syncDatabase = async (force = false) => {
  try {
    await sequelize.sync({ force });
    console.log('✅ Database synchronized successfully.');
  } catch (error) {
    console.error('❌ Error synchronizing database:', error);
  }
};

module.exports = {
  ...models,
  testConnection,
  syncDatabase
};