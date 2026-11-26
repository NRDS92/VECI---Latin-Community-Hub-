# Feature status inventory

This records code visible in the current monorepo and companion repository baselines, not production availability. Test references are repository tests, not proof of deployed-system E2E.

| Feature | Backend | Landing | Mobile | Admin | Tests and known limits |
| --- | --- | --- | --- | --- | --- |
| Authentication | Implemented: email/Google, verification, reset/change | Implemented: localized account and password flows | Implemented: login/register/forgot password | Implemented: admin login/guard | Backend auth HTTP/E2E-named tests; Landing Vitest; Mobile Jest. External email provider not certified. |
| User profiles | Implemented: current user, update, image, favorites | Partial: profile/favorites pages | Implemented: profile/favorites modules | Partial: user management screens | Coverage is module-specific, not complete workflow E2E. |
| Events | Implemented: CRUD, organizer checks, moderation, public DTO | Implemented: discovery, create/owner and public detail | Implemented: discovery, detail, create/edit, attendance | Implemented: moderation | Backend organizer tests, Landing tests, Mobile API tests. Real deployed lifecycle not shown by these tests. |
| Businesses | Implemented: CRUD, DTOs, moderation, follow, view/menu attempt stats | Implemented: public pages, create/edit, follow, owner stats | Implemented: discovery, detail, create and owner list | Implemented: moderation | Backend HTTP/service/persistence tests and client tests. No contact-click analytics claim. |
| Communities | Implemented: lifecycle, membership, forum, reports, moderation, notifications | Implemented: create, public discovery/detail | Implemented: create/detail/manage/membership/forum/notifications | Implemented: moderation | Backend HTTP and E2E-named tests; Landing create/public tests; Mobile Communities API tests. Does not certify production Mongo E2E. |
| Discovery | Implemented: feed and public content services | Implemented: Business/Event/Community public views | Implemented: feed and filters | Not applicable | Backend, Landing and Mobile unit/component tests exist. |
| Admin moderation | Implemented at /api/v1/admin with auth and admin guard | Not applicable | No Admin console | Implemented: Event/Business/Community/user operations | Admin package has no test script. |
| Public content | Implemented: publication resolver, sitemap and DTOs | Implemented: slug content pages and adapters | Partial: public resource screens | Not applicable | Resolver/sitemap and client tests. Revalidation can briefly serve cached data. |
| Analytics | Partial: Event stats and Business behavior aggregates | Partial: Business tracking/stats UI and conditional Google Analytics | Partial: Event/Business tracking APIs | Partial: dashboard aggregates | No visitor identity exposure or time series claim. |
| Notifications | Implemented: Community notification persistence/read paths | Partial: notification provider/components; full route coverage varies | Implemented: Community notification API/screen | Not applicable | Backend Community and Mobile API tests. No push/email delivery claim. |

## Status definitions

Implemented means source includes a connected implementation layer for the stated capability. Partial means only part of the flow is present or external verification is incomplete. Planned means no completed implementation is visible in the inspected source. None of these labels implies production deployment.
