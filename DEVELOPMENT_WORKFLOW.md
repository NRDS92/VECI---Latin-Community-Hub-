# Veci development and release workflow

This document describes the safe path from local work to production across the monorepo, Landing, and Admin. Production deployment settings and data are not managed by these repository commands.

## 1. Local development

Use Node.js 26 LTS and npm. Node 26 is supported by Vercel for builds and Functions as of October 29, 2026, and Render lets services select a version through `NODE_VERSION`, `.node-version`, `.nvmrc`, or `engines`. Node 26.13.1 passed the local Monorepo, Landing, and Admin validation gates recorded for this workflow. Confirm the actual provider runtime settings before relying on them. See [Vercel Node 26 availability](https://vercel.com/changelog/node-js-26-lts-is-now-generally-available-on-vercel), [Render Node version selection](https://render.com/docs/node-version), and [Node.js release status](https://nodejs.org/en/about/previous-releases). Each repository pins Node with `.nvmrc`; use `nvm use` or `fnm use` where available, otherwise install Node 26 and ensure it is first on `PATH`. Start from an up-to-date `main`, create a focused `feat/...` or `fix/...` branch, and keep unrelated work in separate branches. Never reset or clean a checkout containing work you need.

Install from the repository root with `npm ci`. In the monorepo, build shared contracts before running the apps:

```sh
npm ci
npm run build --workspace=@ndrs92/contracts
npm run dev
```

Mobile development starts with `npm run start --workspace=mobile`; Landing and Admin use `npm run dev` from their respective repositories. Keep local environment files untracked. Use only a local or staging API and isolated test database for write flows.

Community routes available for local smoke checks:

- Mobile: Communities tab at `apps/mobile/app/(tabs)/communities.tsx`; create flow at `apps/mobile/app/community/create.tsx`.
- Landing: `/es/communities`, `/es/communities/[slug]`, and authenticated `/es/create/community`.
- Admin: `/admin/moderation/communities` (requires an authorized local/staging admin session).

The Mobile EAS `staging` profile currently points to the same API host as `production`, and its Geoapify value is a placeholder. Do not use that profile for writes until a separately provisioned staging API, database, and credentials are configured. No staging resources or costs are provisioned by this workflow.

## 2. Pull request validation

Open a PR against `main`; do not use a local worktree as a release mechanism. The GitHub workflows run tests, static checks, and production-mode builds. Merge only after required checks pass and a reviewer approves. Keep staging credentials and production credentials separate. A preview must point to the staging API before exercising create, update, moderation, membership, or other write paths.

Current automation:

- Monorepo: Contracts build/tests, Backend build/tests, Mobile tests/typecheck/lint, Android JS export.
- Landing: Vitest, TypeScript, ESLint, Next.js production build.
- Admin: TypeScript, ESLint, Next.js production build. No Admin test suite is currently configured.

Repository branch-protection rules are GitHub settings, not workflow files. Require the relevant CI check and a review for `main`; do not weaken existing rules. The available GitHub connection could not read the exact protection configuration, so an administrator must verify required status checks in repository settings.

## 3. Staging validation

Before staging tests, provision and document separate Backend, MongoDB, authentication configuration, and app/API environment settings. Use synthetic accounts and records only. Confirm the API base URL in each client before testing. Never point a preview or test build at production for write operations. Confirm staging health and data isolation before the Community create → moderation → public discovery walkthrough.

Staging infrastructure may incur charges. Obtain cost approval before provisioning it. Do not put secrets or environment values in Git, logs, screenshots, or PR descriptions.

## 4. Production release

Production is a separately approved operation. Preserve preview deployments, but verify in Vercel/Render settings that a PR preview cannot promote to production and that production deployment is manual or gated. Confirm the deployed commit SHA, health check, rollback path, and required environment variable names before release. These provider settings and deployment SHAs are not verifiable from this repository; do not infer their state from a successful CI run.

For every release, record the approved PR and commit SHA, completed checks, staging evidence, release operator, deployment result, health check, and rollback decision. Request explicit approval for each production release. Do not deploy directly from a Codex worktree or use production data for validation.
