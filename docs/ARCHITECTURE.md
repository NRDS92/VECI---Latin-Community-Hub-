# Architecture

## System boundary

~~~mermaid
flowchart LR
  Mobile[Expo Mobile] -->|JSON /api/v1| API[Express Backend]
  Landing[Next.js public site repo] -->|JSON /api/v1| API
  Admin[Admin Next.js repo] -->|JSON /api/v1/admin| API
  API --> Mongo[(MongoDB via Mongoose)]
  API --> Cloudinary[Cloudinary uploads]
  API --> Mail[Resend email]
  Mobile -. workspace package .-> Contracts[@ndrs92/contracts]
  API -. workspace package .-> Contracts
  Landing -. npm dependency .-> Contracts
  Admin -. npm dependency .-> Contracts
~~~

The arrows show code integration, not deployment health. A separate Vite app also exists at apps/landing; repository metadata does not define whether it is still used alongside the independently maintained Next.js Landing repository.

## Ownership

- packages/contracts/src owns shared Zod transport schemas and inferred types for auth, Business, Event and Community.
- apps/backend/src owns Express routing, validation, auth/admin middleware, domain rules, Mongoose persistence and response mapping.
- apps/mobile/app and apps/mobile/src own Expo Router screens and feature modules.
- Landing and Admin are separate repositories consuming the REST API. Admin currently declares Contracts 0.5.0 while this monorepo uses 0.6.0.

## Request/data path

1. apps/backend/src/app.ts mounts routers under /api/v1.
2. Route middleware applies authentication, optional authentication, admin authorization and upload handling.
3. Controllers/services validate input and enforce ownership, organizer, membership and moderation rules.
4. Mongoose module models persist entities.
5. Mappers/public-content services create owner, public or admin representations.
6. Clients render transport DTOs; MongoDB documents are not API contracts.

A persisted item is not automatically public. Publication and moderation eligibility are enforced in Backend public-content services.

## Backend modules

- auth: registration, login, Google, verification, recovery/change password and account deletion.
- events: Event CRUD, organizer authorization, attendance, views and attachments.
- business: Business CRUD, follows, behavior tracking and owner stats.
- community: Community lifecycle, membership, forum, reports and notifications.
- admin: dashboard and moderation/user actions.
- discover and shared/discovery: discovery feeds and query rules.
- shared/public-content: publishing, slugs, public DTO resolution and sitemap.
- upload: authenticated image/document endpoints.
- users: profile and favorites.

External integrations in source include MongoDB/Mongoose, Cloudinary, Resend, Google token verification and Geoapify client usage. See [API](API.md) and [Development](DEVELOPMENT.md).
