# REST API reference

Backend mounts routes below under /api/v1 (apps/backend/src/app.ts). Auth means authMiddleware; optional-auth means the route accepts optional authentication; Admin means the parent router applies authentication and requireAdmin. Services can enforce additional rules. For exact request/response shapes use the referenced controllers and packages/contracts schemas.

## Authentication: /auth

| Method | Path | Access |
| --- | --- | --- |
| GET | /me | Auth |
| POST | /register, /login, /google | Public |
| GET | /verify/:token | Public |
| DELETE | /me | Auth |
| POST | /forgot-password, /reset-password | Public; rate limited |
| PATCH | /change-password | Auth |

Schemas: packages/contracts/src/auth/password.schema.ts; route file: apps/backend/src/modules/auth/auth.routes.ts.

## Events: /events

| Method | Path | Access |
| --- | --- | --- |
| GET | /, /nearby | Public |
| GET | /me, /organizers | Auth |
| GET | /:id | Optional auth |
| POST | / | Auth; organizer authorization in service |
| POST | /:id/attend | Auth |
| POST | /:id/attachment | Auth; PDF upload |
| POST | /:id/view | Route is public |
| DELETE | /:id | Auth |
| PATCH | /:id | Auth |

Request schemas: packages/contracts/src/event/event.request.schema.ts. Public DTO schemas: packages/contracts/src/event/event.schema.ts.

## Businesses: /business

| Method | Path | Access |
| --- | --- | --- |
| GET | /followed | Auth |
| POST, DELETE | /:id/follow | Auth |
| GET | /:id/follow-status | Auth |
| POST | /:id/behavior | Optional auth plus rate limit |
| GET | /:id/stats | Auth; ownership checked by service |
| GET | /me | Auth |
| GET | /:id | Auth |
| POST | / | Auth |
| PUT | /:id | Auth; ownership checked by service |
| DELETE | /:id | Auth |

Static /followed and /me routes precede /:id in business.routes.ts. Business request/public/owner/engagement schemas are in packages/contracts/src/business. Current behavior event schema identifiers include business_view and menu_download.

## Communities: /communities

| Method | Path | Access |
| --- | --- | --- |
| GET | /discover, /slug/:slug | Public |
| GET | /me, /notifications | Auth |
| PATCH | /notifications/:notificationId/read | Auth |
| POST | / | Auth |
| GET | /:communityId/owner | Auth plus owner check |
| PATCH | /:communityId | Auth; authorization in domain layer |
| GET | /:communityId/membership | Auth |
| POST, DELETE | /:communityId/membership | Auth |
| DELETE | /:communityId/membership/request | Auth |
| GET | /:communityId/membership/requests, /:communityId/members | Auth; privileged checks |
| PATCH | /:communityId/membership/:userId | Auth; role check |
| GET, POST | /:communityId/posts | Auth plus Community visibility/role rules |
| PATCH, DELETE | /:communityId/posts/:postId | Auth and author/role rules |
| GET, POST | /:communityId/posts/:postId/comments | Community rules |
| POST | /:communityId/reports | Auth |
| GET | /:communityId/reports | Auth; privileged |
| PATCH | /:communityId/reports/:reportId | Auth; privileged |
| POST | /:communityId/moderate-content | Auth; role check |

See apps/backend/src/modules/community/community.routes.ts, community.controller.ts and community.service.ts for detailed policy.

## Discovery, public content and sitemap

- GET /discover, /discover/categories, /discover/suggestions
- GET /public/content/:slug (also GET /communities/slug/:slug)
- GET /public/events, /public/businesses, /public/communities/:id/events
- GET /public/sitemap.xml, /public/sitemap/:entityType.xml

The mounted paths combine apps/backend/src/app.ts with route files in modules/discover and shared/public-content.

## Admin: /admin

All listed routes require authenticated admin authorization.

| Resource | Routes |
| --- | --- |
| Dashboard | GET /dashboard |
| Events | GET /events, GET /events/pending, PATCH /events/:id/approve, PATCH /events/:id/reject |
| Businesses | GET /businesses, GET /businesses/pending, PATCH /businesses/:id/approve, PATCH /businesses/:id/reject |
| Communities | GET /communities, GET /communities/pending; POST /communities/:communityId/approve, reject, suspend, block, restore; GET /communities/reports; PATCH /communities/reports/:reportId; POST /communities/:communityId/moderate-content |
| Users | GET /users, GET /users/:id, PATCH /users/:id/role, DELETE /users/:id |

## Users, uploads and health

- /users favorites/profile routes are authenticated (apps/backend/src/modules/users/user.routes.ts).
- POST /upload and POST /upload/document require authentication; image/PDF handling is in apps/backend/src/modules/upload/upload.routes.ts.
- GET / returns a basic API-running response.

A route inventory does not prove every route has a corresponding client flow.
