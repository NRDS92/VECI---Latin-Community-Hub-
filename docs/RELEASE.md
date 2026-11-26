# Release and deployment

## Monorepo CI

.github/workflows/ci.yml triggers for pushes on main and configured feature/fix/Codex branches, and PRs targeting main. It runs root npm ci, Contracts build/tests, root build/Jest, Mobile tests/type-check/lint and Android export. CI does not publish Contracts or deploy Backend.

## Backend

The source build/start path is root npm run build and npm start. The server connects to MongoDB before listening. No checked-in Render manifest proves the current service branch, commands, database, automatic deploy setting or live commit. Verify those values in the provider before release. Use only an approved commit and isolated staging data for write validation.

## Mobile

EAS profiles live in apps/mobile/eas.json. Development, staging and production are declared. The checked-in staging and production profiles currently name the same Render API host. Therefore the profile does not establish isolated staging. Confirm effective EAS variables and an isolated API/database before write tests or release builds.

## Other clients

Landing and Admin have separate repositories, CI workflows and provider settings. Their build checks do not imply a shared deployment policy. See their README and docs/RELEASE.md.

## Controlled sequence

1. Branch from current origin/main; keep changes focused.
2. Run local checks and review the full diff.
3. Open a PR and require the repository CI.
4. Merge only after review/approval.
5. Verify the built commit in provider preview/staging.
6. Test read flows and isolated write flows.
7. Obtain explicit approval for production promotion through the configured provider.
8. Verify the live commit and health/read-only behavior.
9. Keep a provider-supported rollback path and check database/index compatibility before rollback.

A merged PR is not evidence that the public service runs that commit. Provider settings and current deployment state need independent verification.
