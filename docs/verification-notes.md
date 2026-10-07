# Private validation verification

Current status: fresh local implementation and browser checks passed on 7 October 2026; genuine hosted visitor-session acceptance remains pending. All fixtures are fictional. No taxpayer data or live SARS services were used. Historical evidence below is retained separately.

## Current replacement-chat verification — 7 October 2026

Windows / Node 22.20 evidence, reported by the coordinating agent:

| Check | Current result | Evidence / qualification |
| --- | --- | --- |
| Sites dependency installation | Passed | Actual `install-dependencies` workflow via the portable Node dispatcher; pnpm 11.25, frozen lockfile, 639 packages. Network timeouts were recovered through retries/cached packages. |
| Tests and TypeScript | Passed | 83 tests, 0 failures; TypeScript noEmit passed. Includes four focused installation-runtime tests; that runtime-only patch received Astra review. |
| Exact Sites production build | Passed | Current checkout built through the Sites production entrypoint. Packaging/new-version deployment remains pending. |
| Local D1 migrations | Passed locally | Both migration commands passed. This is not hosted persistence evidence. |
| Calculator/navigation browser checks | Passed locally | Playwright using installed Chrome at `127.0.0.1:5173`: 45 unique checks, including all 36 fictional example flows, search/favourites, malformed inputs/result focus, actual JSON/text downloads and clipboard, print popup/PDF, stale-result invalidation on edits/year, three-scenario cap, reload clearing amounts and favourite-only storage, and calendar exclusion of the unconfirmed date. |
| Mobile browser checks | Passed locally | 390px landing/hub/result/sample/pricing checks found no horizontal overflow or page errors. These bounded checks do not claim exhaustive accessibility acceptance. |
| Workspace/API/D1 browser checks | Passed locally | Nine checks using mock identity: anonymous denial/mock sign-in, both-year UI save/reload, failed-save retention, stale revision 409, saved exports versus unsaved work, all-account export, cancellation and typed-confirmation deletion. Report: `work/browser-evidence/workspace/report.json` in the replacement-chat workspace. |
| Hosted v2 read-only HTTP checks | Passed within stated scope | Nine checks through platform service access, **not visitor identity**: `/`, `/calculators`, `/calculators/income-tax`, `/pricing`, `/sample` returned 200; preparation/account/export APIs returned 401 with private/no-store headers; `/workspace` returned 307. |
| Genuine hosted identity/owners | Pending | Actual hosted login/sign-out, durable owner save/reload and two-real-owner read/list/update/export/delete isolation are not established by local mock identities or platform service access. |

Initial browser harness failures were incorrect test assumptions about blank eligibility producing a blocker, Save and continue clearing a message, and exact year-label matching. Corrected checks passed without application changes. The current source changes are installation-runtime only; historical calculation approvals are not rewritten as a new review.

The release remains an owner-only **private preview for validation testing**, not public/paid readiness. Historical sections below describe their original runs; where they say browser capability was unavailable or all browser checks were pending, this current section supplies the later bounded local browser evidence without closing genuine hosted-session gates.

## Evidence

Command: `node tests/run-tests.mjs` (also exposed by the app's `npm test` script).

Latest calculator-expansion verification run: **79 tests passed; 0 failed, skipped or cancelled** on Node v24.19.0; `npm run typecheck` also passed. This includes the original 36 preparation/repository/API regression tests. The harness uses the already installed TypeScript compiler to transpile the actual application calculation/model/export/repository/API modules, route handlers, calculator engines and pure presentation helpers into an automatically removed temporary directory. Root's exact production build passed, and [Astra's final code review](astra-calculator-code-review.md) approved the unchanged frozen source for private validation deployment. Live acceptance remains pending.

| Check | Result | Evidence / qualification |
| --- | --- | --- |
| Seven approved extension fixtures | Passed | Independent expected amounts are transcribed from `astra-calculation-amendment.md`, never read from implementation constants. Both assessment years and both AMTC age regimes are covered. |
| Progressive brackets and age rebates | Passed | Every bracket edge for 2026/2027 is checked below, at and above the edge; all three additive age bands, valid zero income and non-refundable floors are checked. |
| Retirement deduction | Passed | Actual contributions, zero, 27.5% and both annual caps with adjacent cent boundaries; output separates X, C, deduction, T and excess. |
| Medical calculation | Passed | Zero/one/two/three persons, changing paid months, F below/at/above fee and income thresholds, precise 33.3% age65+/75+ AMTC, retirement changing the under65 hurdle, and credits that cannot create cash beyond entered PAYE. |
| Eligibility and strict schema | Passed | Base yes/unknown/unanswered screens, all extension gates, incomplete months, zero/positive inconsistencies, hidden unsupported details conflicting with parent no answers, forged results/ownership, nonzero expense injection, malformed amounts/enums and unexpected nested fields. |
| Review/account/export suppression | Passed | Unsupported facts and unsupported stored rules remove overall liability/balance consistently from evaluated results, account packs and JSON/text exports. Supported exports retain year, schema/rules provenance, inputs, month counts and assumptions. Actual newline text output is checked. |
| Actual repository owner isolation | Passed locally | Real `node:sqlite` executes the committed Drizzle SQL migration and actual repository parameterized statements. Separate fictional owner IDs cannot load/list/update/export-source/delete the other owner's rows. Missing identity is denied. Both years remain separate. This is not deployed D1 or live identity evidence. |
| Atomic revision and stale-record protection | Passed locally | Competing creates and updates admit one winner; the losing operation conflicts and cannot overwrite the winner. A deleted/recreated owner/year record rejects the old record ID despite the repeated revision number. SQL RETURNING supplies the saved record. |
| Actual API handlers | Passed locally | Only the platform identity lookup and DB binding are injected; actual request parsing, guards, strict schemas, repository SQL and exports execute. Covers missing identity 401, wrong origin/type403, malformed/forged payload400, byte limit413, revision conflict409, owner-specific read/list/export/delete, no-store headers and explicit deletion confirmation. |

## Findings resolved during implementation

The verification design identified that a parent retirement/medical `no` answer could conceal explicitly recorded carryovers, transfers, expenses, disability or payer/entitlement uncertainty. The coder made the shared eligibility function block these inconsistent unsupported details; the regression tests pass. The initial update-then-read repository pattern was replaced with atomic SQL RETURNING, and the record ID joins owner/year/revision predicates to prevent a stale tab updating a replacement record.

## Calculator expansion evidence

The registry has **36 unique live entries: 33 calculator/diagnostic entries and three branching guides**. Every declared example runs through the public evaluator and produces a supported output with an existing explicit primary-result label. This is bounded inventory coverage, not every competitor mode or filing capability. The current optional turnover-tax business mode is not implemented; business income tax uses the approved SBC profit contract. Complex cases remain excluded as recorded in the controlling plan and per-tool scope.

| Expansion check | Result | Evidence |
| --- | --- | --- |
| Shared validation and coverage | Passed | All 36 examples; unexpected fields, unsupported runtime years, active-field blanks, malformed bounded amounts/dates/enums and unknown eligibility. Switching modes clears/excludes inactive values rather than hiding uncorrectable errors. |
| Salary and investment families | Passed | Independent salary/bonus/net-to-gross/hourly fixtures; actual annual versus prorated full-pay-period withholding; raise round trip; interest/dividend/rental components; signed CGT loss ordering and assessed-loss preservation; crypto explicit classification. |
| Cumulative/transaction families | Passed | Every retirement/withdrawal table boundary and cross-type prior history; severance versus ordinary pay; two-pot normal tax; transfer acquisition-date/table boundary fixtures; SBC normal financial-year ranges; donations annual exemption/cumulative R30m crossing and contradictory prior history. |
| Benefits, travel and saving | Passed | All gazetted travel band boundaries, 126.9c regression, allowance cap and matching distance period; car benefit/maintenance/business-use ratios; multirow payroll with employer-only SDL and R500k exemption; TFSA annual-only tax with no invented lifetime-breach levy; zero/declining-growth/timing projections. |
| Medical and UIF extensions | Passed | Standalone E>0 and affirmative no-scheme E cases, no-disability/shared-payer gates and non-refundable floors; saved preparation remains E=0. UIF official 1:4 credits, 238/239-day tiers, credit caps, Act-based illness IRR versus maternity 66%, uncapped wage shortfall, full-pay zero, seven-day/history gates and daily-only output when aggregate history is unknown. |
| Six specialist tools | Passed | Ten specialist groups cover actual public registry wiring and fixtures for home office, general 11(e), 12C, SBC 12E, 11(f) and 11(g); financial periods, strict less-than-R7000 concession, asset lives, cost/trade/time caps, lessor-income conditions and reconciled full-month schedules. |
| Guides and pure presentation | Passed | Complete sourced filing/payment context, no exported unconfirmed derived 26 February 2027 reminder, deduplicated checklist and unknown-safe self-reported refund guide; car/medical month-widget discrimination, stable calendar IDs/date-only output, financial/transaction provenance and active-only scenario input handling. |

The primary-law review corrected the initially proposed illness 66% formula before release. The fixture now uses the approved Act-based illness rate (R221.28 first-tier daily at capped remuneration) separately from maternity (R384.33); the exact raw maternity value is R384.3261369863014. Tests also verify the full unemployment tier total R67,455.06016438357, rather than an imprecise copied intermediate figure. No competitor-accuracy claim follows from this correction.

No new dependency, database migration, financial-input persistence, network calculation or preparation-scope change was introduced by the calculator engines. The pure scenario families return distinct result kinds and comparison keys; independently calculated components are not combined into a saved overall assessment.

## Remaining acceptance checks

These are **pending**, not represented by the local passing tests:

- Deployment/runtime verification against the hosted D1 binding and genuine ChatGPT identity.
- Two real signed-in owners: durable save/reload and cross-owner read/list/update/export/delete denial.
- Mobile/desktop layout, keyboard/focus behavior, accessibility announcements, print quality, downloaded file behavior, and deliberate sample versus real-workspace interaction.
- User-visible save-failure recovery and sign-in/sign-out behavior in the deployed session.
- Independent South African practitioner validation of input meanings, certificate reconciliation, rules and export before any paid/public release.

The approved browser/control-browser capability is unavailable in this environment. No browser preview or browser QA was launched. A private release can be described only as a preview **for validation testing**, with these acceptance gaps disclosed and the controlling Astra reviews respected.
