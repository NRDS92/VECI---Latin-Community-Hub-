# Development

## Requirements and install

Use Node 26.x as declared in root .nvmrc and package.json, plus npm. Install at the root because packages/contracts and apps/mobile are npm workspaces:

~~~sh
npm ci
~~~

Backend:

~~~sh
npm run dev
~~~

The API defaults to port 5000 and connects to MongoDB before listening. Configure a dedicated local/test database; never direct write tests to production.

Mobile:

~~~sh
npm run start --workspace=mobile
~~~

Android bundle export (CI runs this from apps/mobile):

~~~sh
npx --no-install expo export --platform android
~~~

## Environment variable names

Names below are referenced in source. Do not put secret values in documentation or commit them.

| Name | Use |
| --- | --- |
| MONGO_URI | Backend database and seed/reconciliation scripts |
| PORT | Backend port, default 5000 |
| JWT_SECRET | JWT signing/verification and engagement deduplication |
| JWT_EXPIRES_IN | JWT expiry configuration |
| LANDING_BASE_URL | Validated password reset link destination |
| RESEND_API_KEY, EMAIL_FROM | Email provider and sender |
| GOOGLE_WEB_CLIENT_ID | Backend Google token verification |
| CLOUDINARY_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET | Backend uploads |
| PUBLIC_SITE_URL | Sitemap base URL |
| RENDER | When true, Backend trusts one immediate proxy hop |
| EXPO_PUBLIC_API_URL | Mobile API base URL |
| EXPO_PUBLIC_GEOAPIFY_API_KEY | Mobile location lookup |
| EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID, EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID | Mobile Google sign-in |

EAS profile environment is in apps/mobile/eas.json. The committed staging and production profiles both point to the same Render API host; do not treat that as isolated staging.

## Checks

~~~sh
npm run build
npm run test
npm run build --workspace=@ndrs92/contracts
npm run test --workspace=@ndrs92/contracts
npm test --prefix apps/mobile -- --runInBand
npx tsc --noEmit -p apps/mobile/tsconfig.json
npm run lint --prefix apps/mobile
~~~

These scripts exist in manifests/workflow. Review individual test setup before labeling a test as database-backed or external E2E. Root CI additionally exports Android.

## Safe local work

- Confirm MONGO_URI targets an isolated database before running write tests or scripts.
- Avoid sharing tokens, reset links, credentials, API keys or environment values in logs.
- Confirm effective EAS variables before any staging write test.
- A local passing check is not evidence of provider deployment.
