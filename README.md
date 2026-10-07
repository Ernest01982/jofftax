# Joff Tax

A South African tax toolkit and preparation workspace, built as an original **private preview for validation testing**. The calculator inventory covers 33 calculation/diagnostic entries and three guidance tools with bounded supported paths. It is not a claim of every competitor submode, a complete SARS assessment engine or a production/paid service.

## Working product scope

- `/calculators`: searchable, situation-based hub with accurate availability, tool favourites and explicit fictional examples.
- `/calculators/[slug]`: guided inputs, named eligibility blockers, numeric breakdowns or useful branching guidance, rules/date provenance and official sources.
- Free session comparisons of up to three semantically compatible scenarios, copy, real text/JSON downloads and print. Calculator financial values stay in tab memory; only non-sensitive favourite slugs persist on the device. Refreshing/leaving the calculator area clears monetary scenarios.
- Published/operational deadline calendar downloads are voluntary `.ics` imports, not an active reminder service. A derived future payment date is labelled and excluded from operational export until its source-contract notice check is complete.
- `/workspace`: existing free authenticated preparation, owner-separated D1 saving, evidence checklist, review, preparation-pack export and app-record deletion. Calculator results are never silently added to a saved return.
- `/pricing`: proposed reviewed-service model and a working route to free preparation. All current tools, preparation and exports remain free. R499/from-R999 are unvalidated service-price hypotheses; there is no checkout, booking, paid entitlement or staffed service claim.

The surveyed 36-entry inventory and exact per-entry/submode status are recorded in [calculator-coverage-audit.md](docs/calculator-coverage-audit.md). Source contracts, independent fixtures and Astra stage decisions are in `docs/`. Final release evidence belongs in the verification/code-review records; the commands below do not imply live/browser acceptance has been completed.

## Saved preparation and source structure

The free saved estimate remains a single-employer, adult-resident, full-year employment case. It requires reconciled pre-section-11F income including taxable employer retirement/medical benefits once; current eligible contributions without carryovers/transfers/withdrawals; and registered-scheme premiums with known monthly counts, E=0, no shared payer or disability/impairment, and established entitlement. Unknown or excluded facts suppress the overall result while preserving checklist progress. Standalone calculator components do not expand this saved-return scope.

Durable D1 writes use server identity, owner/year scoping, atomic optimistic revisions and stable record IDs to reject stale replacements. Save failures retain unsaved answers. Account export is independent of unsaved current work. Deletion removes the current owner's all-year Joff preparation records, not ChatGPT identity or SARS records. No certificate files, SARS credentials, identity/tax/bank numbers or diagnoses are collected.

`lib/calculators.ts` is the catalog/schema/evaluation boundary; `calculator-families.ts`, `calculator-personal.ts` and `calculator-specialists.ts` implement the reviewed families. `lib/rules.ts`, `model.ts` and `calculation.ts` retain preparation rules/screening. `repository.ts` contains owner-scoped D1 queries; `api.ts` and `app/api/` enforce guarded account/preparation/export operations. `app/calculators/` supplies the session UI and `app/pricing/` the proposed-service explanation. `app/chatgpt-auth.ts` remains platform-owned auth integration.

## Important calculation boundaries

Income and salary tools distinguish known annual taxable income, twelve equal-month planning, incremental annual tax and a separately labelled full-pay-period withholding illustration. Gross/take-home/partial-year amounts are not interchangeable. A possible overpayment is not a guaranteed refund or SARS account balance.

Retirement contributions require a reconciled pre-section-11F salary-only base and current eligible contributions counted once. Growth projections have explicit financial assumptions and no guaranteed return. Lump-sum tables require complete relevant prior taxable benefits; two-pot withdrawals use a separate ordinary-tax increment. Retrenchment distinguishes qualifying severance from ordinary leave/notice/bonus.

Standalone medical credits can include known qualifying paid unreimbursed expenses under the reviewed no-disability/impairment, no-shared-payer and eligibility gates. The saved preparation retains its narrower E=0 scope. Crypto classification, qualifying expenses and tax eligibility are user-established facts, not automated determinations.

TFSA headroom is diagnostic; only an annual-only breach without lifetime breach has the approved excess-tax illustration. A lifetime breach does not produce an invented combined levy. Foreign dividends are a taxable component without unreviewed foreign-credit advice. Property output is verified transfer duty, with no guessed conveyancer/bond fee tariff or full-purchase-cost claim.

Travel requires a matching period/logbook; company-car assessment benefit differs from PAYE inclusion. Payroll aggregates bounded equal-month employee scenarios and separates employee deductions from employer UIF/SDL. UIF illustrates contributions and selected unemployment/illness/maternity components using confirmed eligibility/history; it neither determines entitlement nor submits a claim.

Specialist assets/leases use actual declared full financial years and restricted classes. General 11(e) uses selected new-asset lives, confirmed trade share and an explicit full-month convention, with a separate strictly-below-R7,000 standalone election. Manufacturing/SBC elections cannot be stacked. Leases require lessor-income inclusion, confirmed entitlement/renewals and month-aligned commencement/completion; prior claims, early termination, grants, disposal and uncertain cases route to review.

2026 individual assessment covers 1 March 2025–28 February 2026. 2027 covers 1 March 2026–28 February 2027 and applicable published/proposed amounts retain their legislative/forecast qualification. No unpublished 2027 ITR12 season is invented. Financial-year and acquisition-date rules are not relabelled as individual assessment years.

## Validation and launch gates

Use fictional data during private validation. Local independent fixtures, strict schema checks and real SQLite/API ownership/revision tests establish implementation evidence. Mobile/desktop visuals, keyboard/focus, actual downloads/print, genuine hosted identity, deployed D1 persistence and two-real-owner isolation remain separately recorded as passed/failed/pending. Source inspection or mocked identities do not prove those live checks.

Before public/paid use: independent South African practitioner review, a real legal seller and contracted registered reviewers, scope/capacity/support/refund processes, privacy/security/operator/retention/incident readiness and payment reconciliation/refund tests are required. Actual SARS filing needs a separately authorised practitioner/integration workflow with customer consent and genuine receipts. No SARS affiliation, integration, practitioner status, infrastructure guarantee or POPIA certification is claimed by this repository.

See [commercial-delivery-blueprint.md](docs/commercial-delivery-blueprint.md) for the concrete proposed reviewed outcome, service process, pricing experiments and operational gates.

## Development checks

The calculator completion pass on 7 October 2026 passed **185 tests with 0 failures** and TypeScript checking. Local browser verification passed all 36 examples, 93 additional mode/boundary cases and seven focused interaction/mobile checks. The repairs separate travel and wear-and-tear modes, clarify net-pay increases, correct mode-specific years and exports, and identify missing form answers. See [calculator-functional-verification.md](docs/calculator-functional-verification.md) for build/release evidence and scope. Earlier workspace checks remain recorded separately; genuine hosted sign-in, durable owner persistence and two-real-owner isolation are still pending. Run `npm test`, `npm run typecheck` and the Sites production build entrypoint for the current artifact.

## Vinext / Sites runtime

A clean full-stack starter running on [vinext](https://github.com/cloudflare/vinext), with optional Cloudflare D1 and Drizzle support.

## Prerequisites

- Node.js `>=22.13.0`
- Portable: Windows, macOS, or Linux; no Bash required
- Managed Linux: managed Linux runtime with Bash, `flock`, `curl`, `sha256sum`, and GNU `timeout`
- Git is required only for publishing

## Sites Lifecycle

The Sites initializer copies the shared starter and selects managed-linux only when `SITES_MANAGED_LINUX_CONTAINER=1`; otherwise it selects portable. It saves the selection only in ignored `.sites-runtime/execution-profile.json`. Both profiles copy/configure first, then use the plugin's separate `install-dependencies.mjs` step to measure installation independently. Edit source under `app/` and follow the Sites skill for installation, preview, builds, and publishing.

Run `node <plugin-root>/scripts/configure-execution-profile.mjs` only when the profile is unknown for the current checkout and environment. Profile changes do not alter tracked source or require reinstalling otherwise-valid dependencies; restart an existing preview to use the new selection. Do not commit or upload `.sites-runtime/`.

This starter does not use `wrangler.jsonc`.

This configured checkout pins pnpm 11.25.0. `install:ci` uses a Node dispatcher: the portable branch runs on Windows without Bash, while the managed branch retains the existing `scripts/install-pnpm.sh` helper and its project-owned store/home and installation locks. The Sites dependency-install workflow successfully installed 639 packages from the frozen lockfile on Windows after network timeouts and cached retries. Use that workflow for a new checkout; do not run overlapping installers or replace the established lockfile/package-manager configuration.

- **Portable:** Preserve host HOME, npm cache, registry, proxy, temporary paths, retry/concurrency settings, and lifecycle-script policy. Use `--prefer-offline --no-audit --no-fund`.
- **Managed Linux:** Use the existing project-local HOME/cache/tmp setup and Linux install lock, tarball preflight, and timeout. Restore the image-seeded npm cache only when its lockfile hash matches; retain network fallback. Builds keep their existing timeout. These helpers are not invoked by the portable profile.

`scripts/sites-env.mjs` preserves the caller's HOME, npm cache, proxy, XDG, and temporary-directory configuration while defaulting Wrangler and Miniflare state to the checkout. If npm reports an unwritable cache, select a writable path with `npm_config_cache` for that install. The `dev` and `start` scripts also keep Wrangler logs inside the checkout. Generated `.sites-runtime/` and `.wrangler/` directories are disposable and ignored by Git.

On portable, `npm run dev` uses `vinext dev` with HMR, starting at port 5173. Vinext records the running server in ignored `.vinext/` state, rejects an ordinary duplicate launch, and recovers stale state after a stopped process; exactly simultaneous starts can race. Pass `--port <port>` or `--hostname <host>` after `npm run dev --` when needed; keep portable previews on loopback.

For browser QA on managed Linux, use `sites-preview start`. The project's dev script runs Vite and accepts the supervisor's `--host 0.0.0.0 --port 4173 --strictPort` arguments. The internal browser uses `http://terminal.local:4173/`; it is not a user-facing URL. The supervisor owns the preview lifecycle. The ignored local profile survives the supervisor's cleared process environment.

The portable profile simulates ChatGPT sign-in only for loopback development requests. Visit `/signin-with-chatgpt?return_to=/` to sign in as `local_seedy` (`seedy@sites.test`, display name `Seedy`) and `/signout-with-chatgpt?return_to=/` to sign out. The development cookie preserves that identity across server restarts. Mock auth is disabled in the managed-linux profile and is not included in production builds; hosted authentication remains dispatch-owned.

The Worker uses `vinext/server/fetch-handler`, including Vinext's config-aware image handling. After building, `npm start` runs that Worker locally through Wrangler on `127.0.0.1`, sharing `.wrangler/state` with dev preview and local D1 migrations; it does not deploy the site or simulate sign-in. Use the URL printed by the server. Pass `npm start -- --port <port>` to select a different built-preview port.

Local previews use Miniflare's placeholder `Request.cf` metadata without a network lookup. Set `CLOUDFLARE_CF_FETCH_ENABLED=true` to opt into fetching preview metadata; this setting does not change hosted request metadata.

Local tool usage metrics are disabled by default. Set `WRANGLER_SEND_METRICS=true` to opt in.

## Included Shape

- edit site code under `app/`
- `app/chatgpt-auth.ts` provides optional dispatch-owned ChatGPT sign-in helpers
- `.openai/hosting.json` declares optional Sites D1 and R2 bindings
- `vite.config.ts` simulates declared bindings for local development
- `db/index.ts` reads the D1 binding from the Cloudflare Worker environment
- `db/schema.ts` declares the owner-separated preparation table and owner/year uniqueness
- `@cloudflare/workers-types` provides Worker types; `cloudflare-env.d.ts` declares optional `DB`/`BUCKET` bindings—update these declarations if binding names change
- `examples/d1/` contains an optional D1 example surface
- `drizzle.config.ts` supports local migration generation when needed

## Workspace Auth Headers

Signed-in visitors receive both `oai-authenticated-user-id` and `oai-authenticated-user-email`. Private Sites require every visitor to sign in; public Sites may also have anonymous visitors, for whom neither header is present.

The user ID is stable for the same user on the same Site and different across Sites. Use it as the durable user key; use email and name for display or contact purposes.

SIWC-authenticated workspace sites may also receive `oai-authenticated-user-full-name` when the user's SIWC profile has a non-empty `name` claim. The full-name value is percent-encoded UTF-8 and is accompanied by `oai-authenticated-user-full-name-encoding: percent-encoded-utf-8`.

Treat the full name as optional and fall back to email when it is absent:

```tsx
import { headers } from "next/headers";

export default async function Home() {
  const requestHeaders = await headers();
  const userId = requestHeaders.get("oai-authenticated-user-id");
  const email = requestHeaders.get("oai-authenticated-user-email");
  const encodedFullName = requestHeaders.get("oai-authenticated-user-full-name");
  const fullName =
    encodedFullName &&
    requestHeaders.get("oai-authenticated-user-full-name-encoding") ===
      "percent-encoded-utf-8"
      ? decodeURIComponent(encodedFullName)
      : null;

  const displayName = fullName ?? email;
  // ...
}
```

## Optional Dispatch-Owned ChatGPT Sign-In

Import the ready-to-use helpers from `app/chatgpt-auth.ts` when the site needs optional or required ChatGPT sign-in:

- Use `getChatGPTUser()` for optional signed-in UI.
- Use the returned `userId` as the stable user key for user-owned records; do not use email as a durable identifier.
- Use `requireChatGPTUser(returnTo)` for server-rendered pages that should send anonymous visitors through Sign in with ChatGPT.
- In a Server Component, start sign-in with `<a href={chatGPTSignInPath(returnTo)} target="_top">`. The auth helper module is server-only; do not import it into a Client Component.
- Do not use `fetch`, XHR, a client-side router, or a framework link that can prefetch the sign-in route. SIWC must start as a top-level navigation.
- Never request the AuthAPI authorization endpoint directly. The dispatch-owned `/signin-with-chatgpt` route must start the SIWC flow.
- Use `chatGPTSignOutPath(returnTo)` for browser sign-out links or actions.
- Pass a same-origin relative `returnTo` path for the destination after sign-in or sign-out. The helper validates and safely encodes it.
- Mark protected pages with `export const dynamic = "force-dynamic"` because they depend on per-request identity headers.

Dispatch owns `/signin-with-chatgpt`, `/signout-with-chatgpt`, `/callback`, the OAuth cookies, and identity header injection. Do not implement app routes for those reserved paths. Routes that do not import and call the helper remain anonymous-compatible.

SIWC establishes identity only; it does not prove workspace membership. Use the Sites hosting platform's access policy controls for workspace-wide restrictions, or enforce explicit server-side membership or allowlist checks.

Use SIWC for account pages, user-specific dashboards, saved records, and write actions tied to the current ChatGPT user. Leave public content anonymous.

## Local D1 migrations

For a D1-backed local preview, generate SQL with `npm run db:generate`. Build once through the Sites skill's build entrypoint (or `npm run build` for standalone use) to generate `dist/server/wrangler.json`, rebuilding if bindings change. From the project root, apply each pending migration in order:

```sh
node --import ./scripts/sites-env.mjs ./node_modules/wrangler/bin/wrangler.js d1 execute DB --local --config dist/server/wrangler.json --persist-to .wrangler/state --file drizzle/0000_example.sql
```

Replace the filename with the pending migration and `DB` with your D1 binding name if different. Use `.wrangler/state`, not `.wrangler/state/v3`; Wrangler adds the versioned directories. Do not replay migrations already applied locally. This updates only the preview database; publishing applies production migrations separately.

## Diagnostic Commands

- `npm run install:ci`: perform the one locked dependency install
- `npm run dev`: start the Vite/Vinext development server
- `npm run build`: build the deployable Sites artifact
- `npm run start`: preview the built Worker locally with D1/R2 support
- `npm run db:generate`: generate Drizzle migrations after schema changes

When using the Sites plugin, follow its skill instructions for installation, builds, and publishing. These npm commands remain available for standalone use.

The portable build runs Vinext directly without a host `timeout` command. The managed-linux build uses `scripts/build-verified.sh` and its existing `SITES_BUILD_TIMEOUT` setting.

## Learn More

- [vinext Documentation](https://github.com/cloudflare/vinext)
- [Drizzle D1 Guide](https://orm.drizzle.team/docs/get-started/d1-new)
