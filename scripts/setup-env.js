const { copyFileSync, existsSync } = require('node:fs');
const { join } = require('node:path');

const backendDirectory = join(__dirname, '..', 'be');
const environmentFile = join(backendDirectory, '.env');
const exampleFile = join(backendDirectory, '.env.example');

if (existsSync(environmentFile)) {
  console.log('Backend environment file already exists.');
} else {
  copyFileSync(exampleFile, environmentFile);
  console.log('Created be/.env from be/.env.example.');
}

console.log('Setup complete. Start PostgreSQL, migrate, seed, then run npm run dev.');
