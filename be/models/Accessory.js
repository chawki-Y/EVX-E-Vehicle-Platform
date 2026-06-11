const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Accessory = sequelize.define('Accessory', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  brand: {
    type: DataTypes.STRING,
    allowNull: false
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    get() {
      const value = this.getDataValue('price');
      return value === null ? null : Number(value);
    }
  },
  originalPrice: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    get() {
      const value = this.getDataValue('originalPrice');
      return value === null ? null : Number(value);
    }
  },
  image: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  images: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: null,
    comment: 'Array of image URLs for the accessory'
  },
  category: {
    type: DataTypes.STRING,
    allowNull: false
  },
  rating: {
    type: DataTypes.DECIMAL(2, 1),
    allowNull: false,
    get() {
      const value = this.getDataValue('rating');
      return value === null ? null : Number(value);
    }
  },
  reviews: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  isCompared: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  badge: {
    type: DataTypes.STRING,
    allowNull: true
  },
  features: {
    type: DataTypes.JSON,
    allowNull: false,
    defaultValue: []
  },
  compatibility: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: []
  },
  dealer: {
    type: DataTypes.JSON,
    allowNull: false,
    defaultValue: {
      name: 'EVX Accessories Store',
      location: 'Downtown',
      phone: '+1-555-0123',
      email: 'accessories@evxauto.com',
      rating: 4.5,
      verified: true
    }
  },
  type: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'accessory'
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
    defaultValue: 'High-quality accessory designed to enhance your electric vehicle experience. Built with premium materials and engineered for optimal performance.'
  }
}, {
  tableName: 'accessories',
  indexes: [
    {
      fields: ['brand']
    },
    {
      fields: ['category']
    },
    {
      fields: ['price']
    },
    {
      fields: ['rating']
    },
    {
      fields: ['type']
    }
  ]
});

module.exports = Accessory;
