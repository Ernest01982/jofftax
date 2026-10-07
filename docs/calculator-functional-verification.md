# Calculator completion verification — 7 October 2026

The owner requested that all calculators work. This pass checked the existing 36-tool inventory and selected alternate modes, repaired concrete input/mode defects, and preserved the tools' established calculation boundaries. All fixtures are fictional. No taxpayer records or SARS account services were used.

## Repairs

- Travel actual-cost mode now asks for the matching allowance, distances, qualifying actual costs and logbook/scope confirmation. Deemed vehicle value, days and fuel/maintenance questions are conditional on the deemed method. Calculation, output rows, explanation, exported inputs and sources follow the chosen method. Established costs of R60,000 allocated over 10,000 business kilometres out of 20,000 total produce R30,000 before the allowance cap; a R20,000 allowance limits the deduction to R20,000. Unknown cost eligibility is not automatically determined by the app.
- Straight-line wear-and-tear no longer requires standalone-small-item facts. The standalone condition remains required for the immediate election, and the strict below-R7,000 boundary remains enforced. Inactive fields cannot block or leak into the selected scenario's export.
- Net-to-gross raise mode labels its target as the desired take-home increase; absolute mode labels the total target. The form, error summary and exports use the same meaning.
- Retirement/TFSA growth and hourly gross conversion use their actual projection/schedule context, with no unused assessment year in controls, provenance or downloaded filenames. Tax modes retain their applicable year. Result badges, exports and comparisons use the selected mode; year-dependent comparisons require an explicit cross-year choice.
- Missing active required answers produce linked field errors and correction focus. Unknown eligibility remains a separate review blocker; valid zero values remain distinct from unanswered fields.

The travel correction follows [SARS travel logbook guidance](https://www.sars.gov.za/types-of-tax/personal-income-tax/travel-e-log-book/), which separates cost-scale and actual-cost methods. The wear-and-tear correction follows the distinction between ordinary write-off and the small-item concession in [SARS Interpretation Note 47, Issue 5](https://www.sars.gov.za/lapd-intr-in-2012-47-wear-and-tear-depreciation-allowance/), sections 4.3.3 and 4.3.5. No new tax rate or statutory formula was introduced by this pass.

## Evidence

| Check | Result and scope |
| --- | --- |
| Integrated tests | 185 passed, zero failures. Includes 93 explicit mode/boundary fixtures with independently recorded expected amounts and guide/calendar expectations, plus focused repairs and the existing calculation/storage/API tests. |
| TypeScript and targeted lint | TypeScript passed; all six changed calculator source files passed ESLint with zero errors and warnings. Existing misleading helper/icon patterns were clarified without changing tax formulas. |
| Local calculator browser | 129 passed: all 36 selectable fictional examples plus 93 mode/boundary cases, entered through actual forms and downloaded as JSON. No browser JavaScript errors. |
| Focused browser interactions | Seven passed: blank-form error focus and links, salary-target meaning, travel switching, independent growth comparisons, explicit TFSA cross-year comparisons, wear-and-tear switching, and changed forms/results at 390px. Native filename follow-up passed. |
| Hosted baseline | All 36 examples and actual JSON downloads passed on v3 before these repairs, with no JavaScript errors. This established that the remaining defects concerned alternate modes and forms, rather than all hosted calculators failing to load. |
| Production build | Exact Sites production build passed on the final implementation. Native version/deployment and artifact identifiers are recorded separately at publication. |
| Hosted repaired artifact | Post-publication results are recorded with the native version/deployment receipt and GitHub review. Pre-publication local checks are not represented as hosted results. |

The specialist strict-schema test originally assumed every default-example field was active. It was updated to inspect active fields, while separate tests retain the mandatory standalone checks for the small-item election. Six initial scratch matrix expectations used incomplete output labels; their independently expected amounts were unchanged when the labels were corrected.

Browser evidence lives in the replacement-chat workspace under `work/calculator-functional-evidence/` and `work/calculator-interaction-evidence/`; these local reports/screenshots/downloads are not embedded in the repository. Reusable mode fixtures and their test runner are committed in `tests/calculator-mode-cases.json` and `tests/calculator-coverage.test.cjs`.

## Retained boundaries

The inventory remains 33 bounded calculator/diagnostic entries and three guides. This evidence does not assert every possible fact combination, every competitor feature or professional tax validation. Explicit unsupported cases remain explained instead of returning invented numbers. Calculator amounts remain in tab memory and are not written to saved preparation records. All current tools and exports stay free.

Genuine hosted preparation sign-in, durable owner saves and two-real-owner isolation are separate pending acceptance checks. No authentication, persistence, database migration, dependency version, paid service or sharing change is part of these calculator repairs. The publication audience remains owner-only.
