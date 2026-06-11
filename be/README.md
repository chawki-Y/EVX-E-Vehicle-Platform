# EVX Database API

Node.js and Express API backed by PostgreSQL and Sequelize.

## Start locally

```powershell
docker compose up -d postgres
npm install
npm run db:migrate
npm run db:seed
npm run dev
```

The API listens on `http://localhost:3001`. Angular uses `/api` and forwards it
through the repository root `proxy.conf.json`.

## Commands

- `npm run dev` - API with nodemon
- `npm start` - API without file watching
- `npm run db:migrate` - apply pending versioned migrations
- `npm run db:seed` - seed catalog and content data
- `npm run db:test` - verify database reads
- `npm test` - run API contract tests

## Layout

```text
be/
  src/
    app.js
    server.js
    config/
    middleware/
    services/
    database/migrations/
  models/
  routes/
  scripts/
  tests/
```

API startup only verifies the PostgreSQL connection. It never creates or
changes tables. Use migrations for schema work.

See [API_CONTRACT.md](./API_CONTRACT.md) for endpoint details and
[DATABASE.md](./DATABASE.md) for persistence details.
