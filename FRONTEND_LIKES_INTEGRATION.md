# Frontend Likes Integration

Angular uses `LikesService` for vehicle and accessory likes.

## Data flow

1. `UserContextService` creates a stable guest user ID for the browser.
2. `LikesService` reads the current user's records from
   `GET /api/item-likes/user/:userId`.
3. Toggling a like calls `POST /api/item-likes/toggle`.
4. The backend persists both vehicle and accessory likes in
   `user_item_likes`.
5. A user-specific browser cache keeps the UI usable during temporary network
   failures.

Angular calls the relative `/api` path. `proxy.conf.json` forwards local
development requests to `http://localhost:3001`.

## Current identity model

The guest ID prevents all browsers from sharing hardcoded user `1`. It is not
authentication. When authentication is introduced, replace
`UserContextService.getUserId()` with the authenticated user identity and derive
the user from backend middleware rather than accepting arbitrary user IDs.

## Supported API

- `GET /api/item-likes/user/:userId`
- `POST /api/item-likes/toggle`
- `GET /api/item-likes/check/:userId/:itemType/:itemId`
- `POST /api/item-likes/check-multiple`

The older vehicle-only `/api/likes` API has been removed.
