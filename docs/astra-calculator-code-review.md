# Astra calculator expansion code review

Date: 7 October 2026 SAST. Reviewer: Astra Extra High.

**Decision: APPROVED for private validation deployment of the reviewed, frozen source.** No remaining material code blocker was found within the explicitly supported calculator scope. The production build, 79-test suite and type check have passed. This is not approval to sell a practitioner service, submit tax returns, claim complete TaxTim feature parity, or describe the app as publicly validated.

## Reviewed source and evidence

Reviewed the public registry/evaluator, all three family modules, the six specialist schedules, calculator forms/session/comparison/export helpers, proposed-services page, navigation changes and the test harness. The controlling implementation gates are in [astra-calculator-plan-review.md](astra-calculator-plan-review.md), including the final statutory UIF illness correction and no-scheme medical amendment. Existing preparation/authentication/repository contracts remain governed by the prior reviews.

| Gate | Result |
| --- | --- |
| Independent reviewer `npm test` on frozen source | **79 passed; zero failures, skipped or cancelled.** Includes all 36 public calculator/guide examples and meaningful boundary/eligibility tests. |
| Independent reviewer `npm run typecheck` | **Passed**, exit 0. |
| Root independent final test/type check | **Passed**, separately reported on the same frozen source. |
| Exact final Sites production build | **Passed**, helper exit 0 reported by root; all five Vinext/Vite stages completed and calculator/pricing/baseline/API routes built. The framework's unknown static-analysis classification for `/calculators` was nonblocking. |
| Browser, actual user sessions and hosted D1 | **Pending**, not represented as passed. See the validation limits below. |

The test harness executes actual application code. Repository tests run actual committed SQL against SQLite and inject fictional identities only at the authentication/binding boundary; this is meaningful owner-isolation evidence, not a claim about real hosted sessions. Formula fixtures include independent expected amounts, bracket/band boundaries, unknown facts, conflicting declarations and malformed input, rather than only examples copied from evaluator output.

## Material findings closed before approval

- All 36 researched entries resolve to live definitions and evaluator branches. Each public example produces a supported result and an existing explicit primary-result label. Dynamic modes distinguish tax, net pay, credit, deduction, benefit and growth outputs; first-year specialist amounts are highlighted instead of eligible cost.
- Salary, bonus and inversion scenarios retain ordinary-income assumptions. Actual annual assessment and annualised partial-period withholding are separate. UIF is an employee deduction only where explicitly supported; employer UIF/SDL remain employer components. Conflicting SDL liability/exemption declarations block.
- Cumulative retirement/withdrawal history is expressed as taxable benefits before zero-rate bands. Severance is split from ordinary pay; two-pot results do not use the retirement table or promise the directive payout.
- CGT applies current gains/losses, annual exclusion, prior assessed loss and inclusion in the correct order, including current-loss treatment. Donations reject contradictory same-year versus cumulative taxable history. TFSA lifetime breaches retain useful headroom/excess facts while withholding an unsupported combined penalty figure.
- Medical expenses use the reviewed age-specific AMTC, no-scheme cases affirm F=M=0, and contradictory positive fees/month counts block. Credits floor normal tax at zero. Disability/impairment uncertainty, payment ambiguity and unsupported payer arrangements remain outside; the saved preparation retains its separate E=0 scope.
- The UIF illness conflict was resolved using the Act: IRR then 20% for illness, separately from maternity 66%. A discriminating no-leave-pay fixture catches the incorrect substitution. Unknown credit history cannot produce a benefit total. Contribution, illness, maternity and unemployment modes are distinct.
- Travel uses the gazetted 126.9c high-band maintenance figure and correct distance/cap rules. Transfer duty follows acquisition dates; SBC uses financial-year end. Specialist models enforce asset/regime eligibility, no overlapping deduction, lessor-income inclusion, confirmed entitlement, full-month boundaries, zero 11(g) completion-year-end allowance and capped schedule totals.
- Provisional screening includes threshold equality, Commissioner notification and contradictory source answers. Basic-amount uplift is linear and cannot silently omit uplift for an older assessment. Payment illustrations make no penalty-safe-minimum claim.
- Unknown refund amounts no longer become zero or require an invented value. Filing season and assessment year remain distinct. Derived provisional payment dates are not exported as confirmed operational reminders; no unpublished 2027 ITR12 deadline is manufactured.
- The generic `months` widget now distinguishes medical count lists from numeric vehicle/home-office months. Mode changes clear inactive values; inactive amounts are excluded from exports/comparisons. Changed inputs/year invalidate stale result snapshots. Financial/transaction periods are displayed from the actual scenario, not a hidden assessment-year default.
- Calendar events use stable identifiers and date-only values. Comparison requires compatible tool, result meaning and output schema, with explicit ordinary-year comparison. Print output uses text nodes; no user HTML execution path was added. Invalid runtime years return an empty invalid result rather than dereferencing nonexistent rules.

## Privacy, security and product boundaries

Source inspection found no new network/storage path for calculator amounts: monetary drafts and comparisons use client session state; persistent favorites contain only tool slugs. Exports and clipboard/print actions are explicit. The calculators do not silently update saved preparation, request SARS credentials, fabricate integrations or collect documents/diagnoses. Existing owner-scoped APIs, strict input checks, same-origin writes, no-store responses, atomic revision predicates and export/deletion paths continue to pass regression tests.

All implemented tools and exports remain free. The paid page clearly marks the R499/from R999 concepts as proposed, unstaffed and unavailable to buy/book, with no checkout or invented practitioner completion. It explains a concrete future review deliverable without suggesting it has been performed.

Coverage means **33 bounded calculators and three useful guides**, not every competitor submode. Deliberate limits include transfer-duty-only property cost, no automatic primary-residence CGT relief, no disability medical calculation, no full TFSA lifetime-penalty/taxable-account comparison, and no SARS account access or filing. Optional registered-turnover-tax arithmetic was approved as a possible extension but was **not implemented**; the small-business tool is the qualifying SBC table. See [calculator-parity-review.md](calculator-parity-review.md) for the honest entry-versus-mode distinction.

## Validation limits and release conditions

This approval permits a **private preview for validation**. Browser rendering, responsive layouts, keyboard/screen-reader interaction, actual clipboard/print/calendar import, navigation persistence and real sign-in/owner-separated hosted-D1 read/save/export/delete still require live checks. Source review and pure presentation tests do not replace these. Public reliability, practitioner/legal sign-off, current legislative enactment beyond the cited checked sources, service operations and paid launch are not certified here. Keep 2027 proposal/forecast qualifications and unsupported-case boundaries visible.

Deploy only the reviewed source represented by the manifest below and the passed production build. Any implementation change requires appropriate tests and a new build before deployment; documents may be updated without altering this source fingerprint. No additional confirmation from the reviewer is needed to package this unchanged build and publish it privately under the already authorized workflow.

## Frozen-source fingerprint

- Baseline commit before expansion packaging: `4f40888a0a4a624e60d4a49f56029e74aad0c593`.
- Manifest: [astra-calculator-source-manifest.sha256](astra-calculator-source-manifest.sha256), covering 149 repository-visible non-document files, including application, tests, configuration, migrations, assets and build/runtime support.
- SHA256 of the manifest's UTF-8 bytes: `ac4d08cd232f7d24007359d5d274715840fa7908a0374f8a74a5774b27e02fc4`.
- Construction: sorted unique files from `git ls-files --cached --others --exclude-standard`, excluding `docs/` and `.md` files; each line is the file's SHA256, two spaces, relative path and newline. Generated ignored build/dependency state is not part of the manifest. This makes document-only completion independent of the reviewed runtime source.

**Final release gate: APPROVED for the unchanged private validation preview; live acceptance remains pending as stated.**
