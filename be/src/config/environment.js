const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

function parseOrigins(value) {
  return value
    .split(',')
    .map(origin => origin.trim())
    .filter(Boolean);
}

const nodeEnv = process.env.NODE_ENV || 'development';
const corsValue = process.env.CORS_ORIGINS ||
  (nodeEnv === 'production'
    ? ''
    : 'http://localhost:4200,http://localhost:4000,http://localhost:3000');

if (nodeEnv === 'production' && !corsValue) {
  throw new Error('CORS_ORIGINS must be configured in production');
}

module.exports = Object.freeze({
  nodeEnv,
  port: Number(process.env.PORT || 3001),
  corsOrigins: parseOrigins(corsValue)
});
