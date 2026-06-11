# Database

EVX uses PostgreSQL 13 through Sequelize.

## Local PostgreSQL

```powershell
docker compose up -d postgres
```

Defaults from `.env.example`:

- Host: `localhost`
- Port: `5432`
- Database: `evx_db`
- User: `evx_user`

Copy `.env.example` to `.env` and change credentials outside source control.

## Tables

- `vehicles`
- `accessories`
- `users`
- `user_item_likes`
- `news`
- `videos`
- `courses`
- `SequelizeMeta`

Older installations may also contain `user_vehicle_likes`. Migration
`002-consolidate-item-likes` copies its records into `user_item_likes`.
It intentionally does not drop the legacy table.

## Migrations

```powershell
npm run db:migrate
```

Executed migration names are stored in `SequelizeMeta`. The API server does not
run migrations or `sequelize.sync()` during startup.

New schema changes belong in `src/database/migrations/` and must have a unique,
ordered name.

## Seeding

```powershell
npm run db:seed
```

Additional content seeders remain in `scripts/`.

## Production

- Use unique database credentials.
- Set `CORS_ORIGINS` to the deployed frontend origin.
- Do not commit `.env`.
- Run migrations as a deployment step before starting the API.
- Back up PostgreSQL before applying destructive migrations.
