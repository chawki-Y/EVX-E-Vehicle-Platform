const sequelize = require('../config/database');
const Vehicle = require('./Vehicle');
const Accessory = require('./Accessory');
const User = require('./User');
const UserItemLike = require('./UserItemLike');
const News = require('./News');
const Video = require('./Video');
const Course = require('./Course');

User.hasMany(UserItemLike, { foreignKey: 'userId', as: 'itemLikes' });
UserItemLike.belongsTo(User, { foreignKey: 'userId', as: 'user' });

const testConnection = async () => {
  await sequelize.authenticate();
  return true;
};

module.exports = {
  Vehicle,
  Accessory,
  User,
  UserItemLike,
  News,
  Video,
  Course,
  sequelize,
  testConnection
};
