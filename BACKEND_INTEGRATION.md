# Backend Integration Guide

This guide explains how the EVX Web application has been updated to use a backend API instead of static data.

## What Changed

### 1. Backend API Created

A new Node.js/Express backend has been created in the `/backend` directory with the following features:

- **RESTful API** for vehicle data management
- **Advanced filtering** (price, range, condition, category, brand, year)
- **Search functionality** with suggestions
- **Pagination support**
- **Sorting options** (price, range, rating, year, name)
- **CORS enabled** for frontend integration
- **Security middleware** (Helmet)
- **Request logging** (Morgan)
- **Comprehensive error handling**

### 2. Frontend Service Created

A new Angular service (`VehicleService`) has been created with:

- **HTTP client integration** for API calls
- **TypeScript interfaces** for type safety
- **Observable-based** data handling
- **Error handling** with fallback to mock data
- **Loading states** management
- **Search debouncing** for better performance

### 3. Component Updated

The `AdvancedSearchComponent` has been refactored to:

- **Use the VehicleService** instead of static data
- **Implement server-side filtering** and pagination
- **Handle loading states** and errors gracefully
- **Maintain the same UI/UX** experience
- **Add search debouncing** for better performance

## File Structure

```
EVX-Web/
├── backend/                          # New backend directory
│   ├── data/
│   │   └── vehicles.js               # Vehicle data
│   ├── routes/
│   │   ├── vehicles.js               # Vehicle API routes
│   │   └── categories.js             # Category API routes
│   ├── package.json                  # Backend dependencies
│   ├── server.js                     # Express server
│   ├── .env.example                  # Environment variables template
│   ├── test-api.js                   # API testing script
│   └── README.md                     # Backend documentation
├── src/
│   ├── app/
│   │   ├── services/
│   │   │   └── vehicle.service.ts    # New vehicle service
│   │   └── pages/
│   │       └── advanced-search/
│   │           └── advanced-search.component.ts  # Updated component
│   └── main.ts                       # Updated with HttpClient provider
└── BACKEND_INTEGRATION.md            # This guide
```

## Setup Instructions

### 1. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create environment file (optional)
cp .env.example .env

# Start the development server
npm run dev
```

The backend will start on `http://168.231.106.100:3001/`

### 2. Frontend Setup

The frontend has been updated to include:
- HttpClient provider in `main.ts`
- New VehicleService for API communication
- Updated AdvancedSearchComponent to use the service

```bash
# Start the Angular development server
ng serve
```

The frontend will run on `http://localhost:4200`

### 3. Testing the Integration

```bash
# Test the backend API (optional)
cd backend
node test-api.js
```

## API Endpoints

### Vehicle Endpoints

- `GET /api/vehicles` - Get vehicles with filtering and pagination
- `GET /api/vehicles/hero` - Get hero vehicles for slideshow
- `GET /api/vehicles/:id` - Get single vehicle by ID
- `GET /api/vehicles/search/suggestions` - Get search suggestions
- `GET /api/vehicles/stats/summary` - Get vehicle statistics

### Category Endpoints

- `GET /api/categories` - Get all categories
- `GET /api/categories/brands` - Get all brands
- `GET /api/categories/filters` - Get all filter options

### Health Check

- `GET /api/health` - Backend health status

## Key Features

### 1. Advanced Filtering

The backend supports comprehensive filtering:

```typescript
interface VehicleFilters {
  priceMin?: number;
  priceMax?: number;
  rangeMin?: number;
  rangeMax?: number;
  conditions?: string[];  // ['new', 'used']
  categories?: string[];  // ['SUV', 'Sedan', etc.]
  brands?: string[];      // ['Tesla', 'BMW', etc.]
  yearMin?: number;
  yearMax?: number;
  search?: string;
  isElectric?: boolean;
}
```

### 2. Pagination

Server-side pagination with configurable page size:

```typescript
interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}
```

### 3. Sorting Options

Multiple sorting criteria:
- Price (ascending/descending)
- Range (descending)
- Rating (descending)
- Year (descending)
- Name (ascending)
- Relevance (default)

### 4. Search Functionality

- **Real-time search** with debouncing
- **Search suggestions** based on vehicle names and brands
- **Multi-field search** (name, brand, category)

### 5. Error Handling

- **Graceful degradation** to mock data if backend is unavailable
- **Loading states** for better user experience
- **Comprehensive error logging**

## Development Workflow

### 1. Start Backend
```bash
cd backend
npm run dev
```

### 2. Start Frontend
```bash
ng serve
```

### 3. Development Features

- **Hot reloading** for both frontend and backend
- **CORS configured** for local development
- **Detailed logging** for debugging
- **Mock data fallback** if backend is unavailable

## Production Considerations

### 1. Environment Variables

Update `.env` file for production:

```env
NODE_ENV=production
PORT=3001
ALLOWED_ORIGINS=https://your-frontend-domain.com
```

### 2. Database Integration

The current implementation uses static data. For production:

1. Replace static data with database queries
2. Add database connection configuration
3. Implement proper data validation
4. Add authentication/authorization if needed

### 3. Performance Optimization

- **Caching** for frequently accessed data
- **Database indexing** for search and filter queries
- **Response compression**
- **Rate limiting** for API endpoints

## Troubleshooting

### Backend Not Starting

1. Check if port 3001 is available
2. Verify Node.js version (14+ recommended)
3. Check console for error messages

### Frontend API Errors

1. Ensure backend is running on port 3001
2. Check browser console for CORS errors
3. Verify API endpoints are accessible

### No Data Displayed

1. Check if backend API returns data
2. Verify frontend service is properly injected
3. Check for JavaScript errors in browser console

## Next Steps

1. **Database Integration** - Replace static data with a real database
2. **Authentication** - Add user authentication and authorization
3. **Caching** - Implement Redis or similar for better performance
4. **Testing** - Add unit and integration tests
5. **Deployment** - Set up production deployment pipeline
6. **Monitoring** - Add application monitoring and logging

## Support

For issues or questions:

1. Check the backend logs for errors
2. Use the test script to verify API functionality
3. Review the browser console for frontend errors
4. Refer to the individual README files in each directory
