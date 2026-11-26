# Veci Mobile

The Mobile client is a React Native application built with Expo SDK 54 and Expo Router. It shares the root npm workspace with packages/contracts; install dependencies from the monorepo root, not from apps/mobile.

## Implemented screens and modules

File-based routes in app include discovery tabs, profile/favorites, Event detail/create/owned Event screens, Business detail/create/My Businesses/public slug detail, and Community discovery/detail/create/manage/edit/notifications screens. Feature modules under src/features contain API clients, form helpers, auth, discovery, Event and Community behavior.

This inventory describes source files; it does not certify backend deployment or full external E2E flows.

## Requirements and commands

Use Node.js 26.x and npm. From the monorepo root:

~~~sh
npm ci
npm run start --workspace=mobile
npm test --prefix apps/mobile -- --runInBand
npx tsc --noEmit -p apps/mobile/tsconfig.json
npm run lint --prefix apps/mobile
~~~

For Android bundle export, from apps/mobile:

~~~sh
npx --no-install expo export --platform android
~~~

EAS profiles are in eas.json. The checked-in staging and production profiles currently name the same Render API host; do not treat staging as an isolated backend without independently verified configuration.

## API and environment

EXPO_PUBLIC_API_URL configures the Backend API base and EXPO_PUBLIC_GEOAPIFY_API_KEY supports location lookup. Google sign-in identifiers are declared in the Expo app configuration and profile environment. Check the effective profile before testing; never write production data from development/staging builds unless explicitly intended and authorized.

The root package-lock.json is canonical for this npm workspace. Mobile postinstall builds the local Contracts package. CI builds Contracts before tests and Android export.
