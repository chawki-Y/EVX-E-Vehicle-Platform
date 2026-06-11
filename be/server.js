const { startServer } = require('./src/server');

startServer().catch(error => {
  console.error('Backend startup failed:', error);
  process.exit(1);
});
