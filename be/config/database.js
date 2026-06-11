const { Sequelize } = require('sequelize');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

function databaseValue(name, developmentDefault) {
  const value = process.env[name];
  if (value) {
    return value;
  }
  if (process.env.NODE_ENV === 'production') {
    throw new Error(`${name} must be configured in production`);
  }
  return developmentDefault;
}

const sequelize = new Sequelize({
  dialect: 'postgres',
  host: databaseValue('DB_HOST', 'localhost'),
  port: Number(databaseValue('DB_PORT', 5432)),
  database: databaseValue('DB_NAME', 'evx_db'),
  username: databaseValue('DB_USER', 'evx_user'),
  password: databaseValue('DB_PASSWORD', 'evx_password'),
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  },
  define: {
    timestamps: true,
    underscored: true,
    freezeTableName: true
  }
});

module.exports = sequelize;
