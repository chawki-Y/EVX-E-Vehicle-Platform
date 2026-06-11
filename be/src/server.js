const environment = require('./config/environment');
const sequelize = require('../config/database');
const { createApp } = require('./app');

async function startServer() {
  await sequelize.authenticate();

  const app = createApp();
  const server = app.listen(environment.port, () => {
    console.log(`EVX API listening on http://localhost:${environment.port}`);
  });

  const shutdown = signal => {
    console.log(`${signal} received, shutting down`);
    server.close(async () => {
      await sequelize.close();
      process.exit(0);
    });
  };

  process.once('SIGINT', () => shutdown('SIGINT'));
  process.once('SIGTERM', () => shutdown('SIGTERM'));

  return server;
}

if (require.main === module) {
  startServer().catch(error => {
    console.error('Backend startup failed:', error);
    process.exit(1);
  });
}

module.exports = { startServer };
