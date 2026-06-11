# EVX Backend Integration

The database API lives in `be/`. Angular SSR in `src/server.ts` only renders and
serves the frontend; it does not own database endpoints.

## Local development

1. Start PostgreSQL:
   `cd be && docker compose up -d postgres`
2. Apply versioned migrations:
   `npm run db:migrate`
3. Seed development data when needed:
   `npm run db:seed`
4. Start the API:
   `npm run dev`
5. From the repository root, start Angular:
   `npm start`

Angular sends requests to `/api`. During local development,
`proxy.conf.json` forwards those requests to `http://localhost:3001`.

## Runtime boundaries

- Frontend and SSR: repository root and `src/`
- Database API: `be/src/`
- Sequelize models: `be/models/`
- Versioned migrations: `be/src/database/migrations/`
- Seed scripts: `be/scripts/`

The API does not call `sequelize.sync()` during startup. Schema changes must be
added as a migration and applied with `npm run db:migrate`.

## Persisted features

- Vehicles and accessories
- Catalog filters, categories, and dealers
- News, videos, and courses
- Generic vehicle/accessory likes

Cart, chat, checkout, registrations, and bookings remain frontend-only until
dedicated database modules are implemented.
