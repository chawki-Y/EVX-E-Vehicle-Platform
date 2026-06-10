# Database Setup Guide

This guide explains how to set up and use the PostgreSQL database for the EVX Backend API.

## Prerequisites

- Docker and Docker Compose installed
- Node.js and npm installed

## Quick Start

### 1. Start PostgreSQL Database

```bash
# Start PostgreSQL container
docker-compose up -d

# Check if container is running
docker-compose ps
```

### 2. Install Dependencies

```bash
# Install new database dependencies
npm install
```

### 3. Set Environment Variables

Copy the `.env.example` file to `.env` and update if needed:

```bash
cp .env.example .env
```

The default database configuration:
- **Host**: localhost
- **Port**: 5432
- **Database**: evx_db
- **Username**: evx_user
- **Password**: evx_password

### 4. Run Database Migration

```bash
# Create database tables
npm run db:migrate
```

### 5. Seed Database with Sample Data

```bash
# Populate database with vehicle data
npm run db:seed
```

### 6. Start the Server

```bash
# Start in development mode
npm run dev

# Or start in production mode
npm start
```

## Database Schema

### Vehicles Table

The `vehicles` table contains the following columns:

| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER | Primary key, auto-increment |
| name | STRING | Vehicle name |
| brand | STRING | Vehicle brand |
| price | DECIMAL(10,2) | Price in currency units |
| originalPrice | DECIMAL(10,2) | Original price (optional) |
| image | TEXT | Image URL |
| range | INTEGER | Range in miles/km |
| year | INTEGER | Manufacturing year |
| condition | ENUM | 'new' or 'used' |
| category | STRING | Vehicle category |
| rating | DECIMAL(2,1) | Rating (0.0-5.0) |
| reviews | INTEGER | Number of reviews |
| isCompared | BOOLEAN | Comparison status |
| isElectric | BOOLEAN | Electric vehicle flag |
| badge | STRING | Special badge (optional) |
| features | JSON | Array of features |
| batterySize | STRING | Battery capacity |
| chargingTime | STRING | Charging time description |
| createdAt | TIMESTAMP | Record creation time |
| updatedAt | TIMESTAMP | Last update time |

### Users Table

The `users` table contains the following columns:

| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER | Primary key, auto-increment |
| name | STRING | User name (optional) |
| email | STRING | User email (optional, unique) |
| createdAt | TIMESTAMP | Record creation time |
| updatedAt | TIMESTAMP | Last update time |

### User Vehicle Likes Table

The `user_vehicle_likes` table manages the many-to-many relationship between users and their liked vehicles:

| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER | Primary key, auto-increment |
| userId | INTEGER | Foreign key to users table |
| vehicleId | INTEGER | Foreign key to vehicles table |
| likedAt | TIMESTAMP | When the vehicle was liked |

**Indexes:**
- Unique constraint on (userId, vehicleId) to prevent duplicate likes
- Index on userId for efficient user queries
- Index on vehicleId for efficient vehicle queries

## Like Functionality

The application now supports user likes for vehicles through a dedicated API:

### Like API Endpoints

- `GET /api/likes/user/:userId` - Get user's liked vehicles with pagination
- `POST /api/likes/toggle` - Toggle like status for a vehicle
- `GET /api/likes/check/:userId/:vehicleId` - Check if user likes a specific vehicle
- `POST /api/likes/check-multiple` - Check like status for multiple vehicles

### Vehicle API Updates

All vehicle endpoints now support an optional `userId` query parameter to include like status:

- `GET /api/vehicles?userId=1` - Get vehicles with like status for user 1
- `GET /api/vehicles/hero?userId=1` - Get hero vehicles with like status
- `GET /api/vehicles/featured?userId=1` - Get featured vehicles with like status
- `GET /api/vehicles/:id?userId=1` - Get single vehicle with like status

### Default User

The seed script creates a default user with ID 1. For now, all like operations use userId=1.

## Database Operations

### Available Scripts

- `npm run db:migrate` - Create database tables
- `npm run db:seed` - Populate with sample data and create default user

### Manual Database Access

```bash
# Connect to PostgreSQL container
docker exec -it evx-postgres psql -U evx_user -d evx_db

# List tables
\dt

# View vehicles table structure
\d vehicles

# Query vehicles
SELECT * FROM vehicles LIMIT 5;

# Exit
\q
```

### Reset Database

To completely reset the database:

```bash
# Stop and remove containers
docker-compose down -v

# Start fresh
docker-compose up -d

# Recreate tables and seed data
npm run db:migrate
npm run db:seed
```

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| DB_HOST | localhost | Database host |
| DB_PORT | 5432 | Database port |
| DB_NAME | evx_db | Database name |
| DB_USER | evx_user | Database username |
| DB_PASSWORD | evx_password | Database password |

## Troubleshooting

### Connection Issues

1. **Database not accessible**:
   ```bash
   # Check if PostgreSQL container is running
   docker-compose ps
   
   # Check container logs
   docker-compose logs postgres
   ```

2. **Permission denied**:
   ```bash
   # Restart containers
   docker-compose restart
   ```

3. **Port already in use**:
   - Change the port in `docker-compose.yml`
   - Update `DB_PORT` in `.env` file

### Migration Issues

1. **Tables already exist**:
   ```bash
   # Drop and recreate tables
   docker exec -it evx-postgres psql -U evx_user -d evx_db -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"
   npm run db:migrate
   ```

2. **Seeding fails**:
   ```bash
   # Clear existing data and reseed
   npm run db:seed
   ```

## Production Considerations

1. **Security**:
   - Change default passwords
   - Use environment variables for sensitive data
   - Enable SSL connections

2. **Performance**:
   - Add appropriate indexes
   - Configure connection pooling
   - Monitor query performance

3. **Backup**:
   - Set up regular database backups
   - Test restore procedures

4. **Monitoring**:
   - Monitor database connections
   - Set up alerts for failures
   - Log slow queries