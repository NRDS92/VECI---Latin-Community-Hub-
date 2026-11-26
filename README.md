# Veci platform monorepo

Veci connects Latin Americans living in Europe with local events, businesses and communities. This repository contains the Express API, Expo Mobile client, shared TypeScript/Zod contracts, and a Vite project at apps/landing. The separately maintained Next.js public site is [NRDS92/Veci-web-app](https://github.com/NRDS92/Veci-web-app); the administration client is [NRDS92/Veci---Admin](https://github.com/NRDS92/Veci---Admin).

## Repository map

| Path | Responsibility |
| --- | --- |
| apps/backend | Express REST API, MongoDB persistence, auth, moderation, public content and admin API |
| apps/mobile | Expo Router React Native client |
| apps/landing | Vite/React application in this monorepo; its relationship to the separate Next.js site is not declared by the workspace manifest |
| packages/contracts | Shared Zod schemas and inferred transport types; version 0.6.0 |
| docs | Product notes, ADRs, screenshots and engineering documentation |

The root npm workspace includes packages/contracts and apps/mobile. The root package-lock.json is canonical; install from the repository root.

## Implemented areas

- Authentication: email/password and Google login, email verification, password reset/change, JWT authentication and token-version revocation.
- Events: create/update/delete, public retrieval, attendance/view tracking, attachments, moderation and organizer authorization for Business or Community organizers.
- Businesses: owner create/update, moderation/publication, follow/unfollow and owner aggregate statistics. Current Business behavior events include business_view and menu_download attempt tracking.
- Communities: create/update, discovery, open or approval memberships, member administration, forum posts/comments, reporting, moderation and notifications.
- Discovery/public content: discovery endpoints and published-slug resolution for Business, Event and Community content.
- Admin API: protected dashboard, user, Event, Business and Community operations.

This is an inventory of repository code, not proof of production deployment or external end-to-end execution. See [feature status](docs/FEATURE-STATUS.md).

## Technology from manifests

- Node.js 26.x (.nvmrc and root engines)
- Backend: Express ^5.2.1, Mongoose ^9.2.4, TypeScript 5.9.3, Zod ^4.3.6
- Mobile: Expo ~54.0.33, React Native 0.81.5, React 19.1.0, TypeScript ~5.9.2
- Contracts: @ndrs92/contracts 0.6.0, Zod ^4.3.6
- Tests: root Jest ^30.3.0; Mobile Jest ^30.3.0; Contracts Vitest via root development dependency ^5.1.0

Ranges shown are manifest declarations, not a guarantee about every resolved transitive version.

## Local setup

Prerequisite: Node 26 and npm. From the repository root:

~~~sh
npm ci
npm run dev
~~~

The root dev script starts the Backend and requires local environment configuration, including an isolated MongoDB URI. Start Mobile with:

~~~sh
npm run start --workspace=mobile
~~~

Common checks:

~~~sh
npm run build
npm run test
npm run test --workspace=@ndrs92/contracts
npm test --prefix apps/mobile -- --runInBand
npm run lint --prefix apps/mobile
~~~

The CI Android export runs from apps/mobile using npx --no-install expo export --platform android. See [Development](docs/DEVELOPMENT.md).

## API and architecture

The REST API is mounted under /api/v1. Route definitions are under apps/backend/src/modules and apps/backend/src/shared. Contracts define transport boundaries; Backend owns Mongoose models, business rules, authorization, persistence and DTO mapping. See [Architecture](docs/ARCHITECTURE.md) and [API](docs/API.md).

## CI and release boundary

.github/workflows/ci.yml installs from the root lockfile, builds/tests Contracts and Backend, runs root Jest and Mobile tests, type-checks/lints Mobile, and exports Android. This workflow does not publish Contracts or deploy Backend.

EAS profiles are defined in apps/mobile/eas.json. The checked-in staging and production profiles currently specify the same Render API hostname; that does not represent an isolated staging backend. No checked-in Render service manifest proves live deployment configuration. See [Release](docs/RELEASE.md).

## Documentation

- [Architecture](docs/ARCHITECTURE.md)
- [API](docs/API.md)
- [Development](docs/DEVELOPMENT.md)
- [Feature status](docs/FEATURE-STATUS.md)
- [Release](docs/RELEASE.md)
- [ADRs](docs/decisions/)
