const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Vehicle = sequelize.define('Vehicle', {
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
    comment: 'Array of image URLs for the vehicle'
  },
  range: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  year: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  condition: {
    type: DataTypes.ENUM('new', 'used'),
    allowNull: false
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
  isElectric: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
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
  batterySize: {
    type: DataTypes.STRING,
    allowNull: false
  },
  chargingTime: {
    type: DataTypes.STRING,
    allowNull: false
  },
  dealer: {
    type: DataTypes.JSON,
    allowNull: false,
    defaultValue: {
      name: 'EVX Auto Dealer',
      location: 'Downtown',
      phone: '+1-555-0123',
      email: 'contact@evxauto.com',
      rating: 4.5,
      verified: true
    }
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
    defaultValue: 'Experience the future of driving with this exceptional electric vehicle. Featuring cutting-edge technology, superior performance, and eco-friendly design.'
  }
}, {
  tableName: 'vehicles',
  indexes: [
    {
      fields: ['brand']
    },
    {
      fields: ['category']
    },
    {
      fields: ['condition']
    },
    {
      fields: ['price']
    },
    {
      fields: ['rating']
    },
    {
      fields: ['year']
    }
  ]
});

module.exports = Vehicle;
