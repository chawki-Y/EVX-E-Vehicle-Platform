# API Contract

Base path: `/api`

## Catalog reads

- `GET /vehicles`
- `GET /vehicles/hero`
- `GET /vehicles/featured`
- `GET /vehicles/search/suggestions`
- `GET /vehicles/stats/summary`
- `GET /vehicles/:id`
- `GET /accessories`
- `GET /accessories/featured`
- `GET /accessories/search/suggestions`
- `GET /accessories/stats/summary`
- `GET /accessories/:id`
- `GET /items`
- `GET /categories`
- `GET /categories/brands`
- `GET /categories/filters`
- `GET /dealers`
- `GET /dealers/vehicles`
- `GET /dealers/accessories`

List endpoints preserve the Angular response structure:

```json
{
  "success": true,
  "data": [],
  "pagination": {
    "currentPage": 1,
    "totalPages": 0,
    "totalItems": 0,
    "itemsPerPage": 12,
    "hasNextPage": false,
    "hasPrevPage": false
  }
}
```

## Content reads

- `GET /news`
- `GET /news/latest`
- `GET /news/featured`
- `GET /news/meta/categories`
- `GET /news/:identifier`
- `GET /videos`
- `GET /videos/featured`
- `GET /videos/tutorials`
- `GET /videos/meta/categories`
- `GET /videos/:id`
- `GET /courses`
- `GET /courses/featured`
- `GET /courses/workshops`
- `GET /courses/meta/categories`
- `GET /courses/meta/levels`
- `GET /courses/:id`

## Like reads and writes

- `GET /item-likes/user/:userId`
- `POST /item-likes/toggle`
- `GET /item-likes/check/:userId/:itemType/:itemId`
- `POST /item-likes/check-multiple`

`itemType` must be `vehicle` or `accessory`. The deprecated `/api/likes`
vehicle-only endpoints have been removed.

## Operations

- `GET /health`

Database writes are transactional. API startup verifies PostgreSQL connectivity
but never changes schema.
