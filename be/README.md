# EVX Backend API

This is the backend API for the EVX Web application, providing vehicle data and filtering capabilities.

## Features

- RESTful API for vehicle data
- Advanced filtering and sorting
- Pagination support
- Search functionality
- Category and brand management
- CORS enabled for frontend integration
- Security middleware (Helmet)
- Request logging
- Error handling

## API Endpoints

### Vehicles

- `GET /api/vehicles` - Get vehicles with filtering, sorting, and pagination
  - Query parameters:
    - `page` (number): Page number (default: 1)
    - `limit` (number): Items per page (default: 12)
    - `sortBy` (string): Sort option (default: 'name_asc')
    - `priceMin` (number): Minimum price filter
    - `priceMax` (number): Maximum price filter
    - `rangeMin` (number): Minimum range filter
    - `rangeMax` (number): Maximum range filter
    - `conditions` (string): Comma-separated conditions (new,used)
    - `categories` (string): Comma-separated categories
    - `brands` (string): Comma-separated brands
    - `yearMin` (number): Minimum year filter
    - `yearMax` (number): Maximum year filter
    - `search` (string): Search query
    - `isElectric` (boolean): Filter by electric vehicles

- `GET /api/vehicles/hero` - Get hero vehicles for slideshow
- `GET /api/vehicles/:id` - Get single vehicle by ID
- `GET /api/vehicles/search/suggestions` - Get search suggestions
- `GET /api/vehicles/stats/summary` - Get vehicle statistics

### Categories

- `GET /api/categories` - Get all categories
- `GET /api/categories/brands` - Get all brands
- `GET /api/categories/filters` - Get all filter options

### Health Check

- `GET /api/health` - Health check endpoint

## Installation

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create environment file:
   ```bash
   cp .env.example .env
   ```

4. Update the `.env` file with your configuration (optional, defaults work for development)

5. Start PostgreSQL database:
   ```bash
   docker-compose up -d
   ```

6. Run database migration:
   ```bash
   npm run db:migrate
   ```

7. Seed database with sample data:
   ```bash
   npm run db:seed
   ```

## Running the Server

### Development Mode
```bash
npm run dev
```
This will start the server with nodemon for auto-reloading on file changes.

### Production Mode
```bash
npm start
```

### Available Scripts

- `npm start` - Start the server in production mode
- `npm run dev` - Start the server in development mode with nodemon
- `npm run db:migrate` - Create database tables
- `npm run db:seed` - Populate database with sample data
- `npm test` - Run tests (placeholder)

## Configuration

The server can be configured using environment variables in the `.env` file:

- `PORT` - Server port (default: 3001)
- `NODE_ENV` - Environment (development/production)
- `ALLOWED_ORIGINS` - CORS allowed origins
- `API_VERSION` - API version
- `API_PREFIX` - API prefix path
- `DB_HOST` - Database host (default: localhost)
- `DB_PORT` - Database port (default: 5432)
- `DB_NAME` - Database name (default: evx_db)
- `DB_USER` - Database username (default: evx_user)
- `DB_PASSWORD` - Database password (default: evx_password)

## Database

The application uses PostgreSQL with Sequelize ORM. The database stores vehicle data, categories, and brands dynamically.

### Database Setup

1. **PostgreSQL 13** runs in a Docker container
2. **Sequelize ORM** handles database operations
3. **Automatic migration** creates tables on startup
4. **Seed script** populates initial data

For detailed database setup instructions, see [DATABASE.md](./DATABASE.md).

## Data Structure

### Vehicle Object
```typescript
interface Vehicle {
  id: number;
  name: string;
  brand: string;
  price: number;
  originalPrice?: number;
  image: string;
  range: number;
  year: number;
  condition: 'new' | 'used';
  category: string;
  rating: number;
  reviews: number;
  isLiked: boolean;
  isCompared: boolean;
  isElectric?: boolean;
  badge?: string;
  features: string[];
  batterySize: string;
  chargingTime: string;
}
```

## CORS Configuration

The server is configured to accept requests from:
- `http://localhost:4200` (Angular dev server)
- `http://localhost:3000` (Alternative frontend port)

## Error Handling

The API returns consistent error responses:
```json
{
  "success": false,
  "error": "Error message",
  "details": "Additional error details"
}
```

## Success Responses

All successful responses follow this format:
```json
{
  "success": true,
  "data": "Response data",
  "pagination": "Pagination info (for paginated endpoints)"
}
```

## Development Notes

- The server uses Express.js with modern ES6+ syntax
- Static vehicle data is stored in `/data/vehicles.js`
- Routes are modularized in the `/routes` directory
- Middleware includes helmet for security, cors for cross-origin requests, and morgan for logging
- The server includes comprehensive error handling and 404 routes

## Frontend Integration

The Angular frontend should be configured to make requests to `http://168.231.106.100:3001/api` when the backend is running locally.

Make sure to start the backend server before running the Angular application for full functionality.
