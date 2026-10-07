# Astra independent code review

Review date: 7 October 2026 SAST. Reviewer: Astra Extra High. This review follows the separate pre-coding plan approval and bounded-calculation amendment. No application code was edited by the reviewer.

## Decision: APPROVED for private validation deployment

No unresolved blocking code finding remains in the reviewed implementation. The bounded medical and retirement extensions meet the approved implementation conditions and may be enabled in the private preview.

Root may deploy the reviewed source **privately for validation testing with fictional data**, after the exact final source passes the production Sites build. Root reported an earlier production build passed; a new build incorporating the final review fixes is the deployment condition. This approval is not public/paid launch approval and does not represent completed live-session, browser, practitioner, privacy or operational acceptance.

Reviewed source/test fingerprint: SHA-256 `d4f1768ffbbc9c3d76efb8026bf22bf9d50c9a05a42945214883ecf36eef0289`. This covers 33 files under `app`, `lib`, `db`, `drizzle` and `tests`, sorted by relative path, hashing path + NUL + contents + NUL; hidden temporary files excluded. Documentation and hosting metadata are outside this fingerprint. Material code changes require review; a build/runtime failure must be resolved before deployment.

## Evidence and findings

I inspected the application UI source, strict model/scope validation, annual rules, deterministic calculations, server API guards, platform auth integration, repository SQL, exports, migration and test harness. I independently ran `npm test` and `npm run typecheck`: **36 tests passed, 0 failures; typecheck passed**. The later deletion/copy/conflict-banner fixes were inspected directly, and the coder's post-fix typecheck passed. These UI-only fixes do not change the tested calculation or repository paths.

| Area | Review conclusion |
| --- | --- |
| Tax years and values | 2026/2027 dates, progressive brackets and additive age rebates match recorded research. The UI and packs distinguish the in-progress 2027 full-year forecast, including projected PAYE, from the completed 2026 assessment year. No 2027 filing-season deadline is invented. |
| Retirement | Explicit reconciled pre-section-11F income, current contributions counted once, full-year and eligible-fund confirmations. Prior carryovers, transfers/withdrawals, unclear inputs and other income block totals. Actual, percentage and annual-cap limits match the approved formula. X, C, D, T and undeducted excess are separately shown. No carry-forward entitlement is promised. |
| Medical | Explicit fees, registered scheme, payer/reconciliation/entitlement confirmations and twelve monthly counts. E=0 and no disability/impairment are enforced; shared payers, extra expenses and unknowns block. MTC and premium-based AMTC are separate, use the approved age regimes and cannot make annual tax negative. |
| Reference evidence | Seven independently derived amendment fixtures, additional research fixtures, each bracket edge, rebate bands, cap/percentage thresholds, variable member months, both AMTC regimes and zero floors pass. Expected results are separate from implementation constants. |
| Scope enforcement | The same eligibility function governs UI results and server-generated packs. Blank/unknown mandatory answers block. Inconsistent hidden medical/retirement details remain blockers even when a parent answer becomes no. Forged result/ownership fields and unapproved extra expense fields are rejected. |
| Authorization and isolation | APIs require the server's platform identity. Parameterized SQL scopes every load/list/write/delete and export source to owner. Update predicates include stable record ID, year and revision; atomic RETURNING avoids read-after-write races and stale deleted/recreated-record overwrites. Missing and cross-owner requests are covered by actual routes and real SQLite queries. |
| Request/privacy handling | Same-origin JSON mutations, strict bounded schemas and an actual 20,000-byte stream limit; malformed/oversized bodies return 400/413. API responses are private/no-store. Identity-sensitive pages are force-dynamic; framework source maps this to non-shared-cache behavior. Hosted headers remain a live check. No certificate upload, SARS credentials, tax/ID/bank numbers or diagnosis fields. |
| Export and deletion | Saved packs are recomputed on the server from the owner's stored answers, with year, provenance, assumptions and blockers. Text/JSON contain real content. Own-data export includes all saved records independently of the currently edited year. Deletion is owner-scoped and explicitly names its all-year app-record scope. |
| Honest product scope | No checkout, fake practitioner, SARS import/submission, refund guarantee or compliance badge. The workflow remains useful when the estimate is blocked through evidence tasks, official next steps, save/reload and a preparation pack. Fictional sample mode is explicit and is not persisted as the owner's record. |

The API tests inject only fictional platform identity and DB transport, then execute actual route/guard/schema/export/repository code. The repository adapter runs the committed migration and parameterized statements in real Node SQLite. This is meaningful local isolation and revision evidence; it does **not** prove two genuine signed-in users or a deployed D1 session.

## Review fixes verified

- Saved records now return atomically, and a stable record ID prevents stale-tab ABA updates after deletion/recreation.
- Editable content is inert while saving or deleting, so a completed save does not overwrite later typed edits. Save failures preserve local answers.
- The request-body cap is enforced during reading, not after allocating the full body.
- All-account export is independent of unsaved or absent current-year work.
- Print opens its window synchronously before fetching; text is inserted via textContent. Radio groups have names; deletion uses a native modal dialog.
- Deletion clears any stale conflict, and a failed deletion has an error within the dialog.
- Revision conflicts retain a visible Reload action independently of transient errors and section navigation.
- The 2027 review labels PAYE as a full-year projection. Privacy text lists retirement/medical amounts, monthly counts and extension confirmations. Generated TypeScript build state is ignored by Git.

## Remaining checks and release boundary

The following remain pending and must be disclosed with the hosted preview:

1. Exact final production build and successful private deployment/migration result, recorded by root.
2. Genuine hosted ChatGPT sign-in/sign-out, D1 save/reload and two-real-owner isolation; protected HTML and API cache headers in that deployment.
3. Desktop/mobile visual and keyboard/focus checks, failure-recovery interaction, sample-to-real navigation, actual downloads and print readability. No browser or screenshot QA was performed because the approved browser capability is unavailable. Source inspection is not a substitute for these checks.
4. Independent South African practitioner validation of input meanings, certificate reconciliation, rules and packs; legal/privacy/operator/retention/incident/support readiness before public or paid use. No operational security or POPIA certification is conferred by this review.

The final user-facing description must say **private preview for validation testing**, describe the bounded employment scope and remaining acceptance checks, and distinguish any source-publication blocker from work that actually succeeded. A deployment success alone does not close the pending acceptance checks.
