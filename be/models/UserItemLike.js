const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const UserItemLike = sequelize.define('UserItemLike', {
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
  itemId: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'item_id'
  },
  itemType: {
    type: DataTypes.ENUM('vehicle', 'accessory'),
    allowNull: false,
    field: 'item_type'
  },
  likedAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    field: 'liked_at'
  }
}, {
  tableName: 'user_item_likes',
  timestamps: false,
  indexes: [
    {
      unique: true,
      fields: ['user_id', 'item_id', 'item_type']
    },
    {
      fields: ['user_id']
    },
    {
      fields: ['item_id']
    },
    {
      fields: ['item_type']
    }
  ]
});

module.exports = UserItemLike;