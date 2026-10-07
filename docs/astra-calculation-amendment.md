# Astra calculation-scope amendment

Review date: 7 October 2026 SAST. Reviewer: Astra Extra High. This supplements `astra-plan-review.md` after additional source verification and root's request to support a practical ordinary employee case. It does not remove any authentication, privacy, unsupported-case, source-status or release conditions.

## Decision: CONDITIONAL — these bounded extensions may be implemented

The implementer may add the retirement and medical cases below during the private validation build. The earlier blanket medical/retirement blockers may be replaced **only** by the explicit eligibility/input gates below. Until the implemented gates and reference tests pass code review, keep the broader result disabled or preparation-only. No disability/out-of-pocket medical computation, carry-forward computation or automatic certificate mapping is approved.

## Current-year retirement contribution case

Define `X` as the annual ordinary taxable employment income **before** any section 11F retirement deduction. In this bounded case it must equal both eligible remuneration and pre-section-11F taxable income. It includes taxable salary, bonus and any taxable employer retirement or medical contribution fringe benefit **once**. It is not cost-to-company, take-home pay, or an income amount from which retirement contributions have already been deducted.

Define `C` as total eligible current-year contributions to South African pension, provident and retirement annuity funds, paid personally or deemed paid through employer contributions. Add each contribution once; a certificate total may already include the employer portion. Do not add transfers or historic excess contributions. No unsupported source-code automation may be invented.

Require an explicit confirmation that these amounts reconcile to the user's annual information and that the income is before the deduction. A short, visible explanation is required beside the inputs; an ambiguous generic “salary” field plus a disclaimer is insufficient. “Unsure” routes to preparation-only. For 2027 these are annual projected amounts under clearly stated forecast assumptions, not already-completed certificate facts.

In addition to the base supported-case screens, exclude prior contribution carryovers, retirement lump sums/two-pot/severance/withdrawals, fund transfers treated as contributions, non-qualifying or uncertain funds, other income/deductions/allowances, capital gains, changed residency or shortened/multiple periods of assessment, and unreconciled employer fringe benefits. Existing age/residence/single-employer conditions still apply.

For this case only:

`D = min(C, 0.275 × X, X, annual cap)`

`T = max(0, X − D)`

Cap is R350,000 for 2026 and SARS-published R430,000 for the **2027 forecast subject to legislation**. Display X, C, allowed D and resulting T separately. Excess C−D is “not deducted in this estimate”; do not promise a carry-forward entitlement or silently treat it as permanently lost. Bracket tax and AMTC use T. The app must never subtract the same contribution again elsewhere.

## Ordinary medical scheme contribution case

Support a South African registered medical scheme with known eligible covered-person counts for **each month March through February** and known annual qualifying fees `F`. Allow changing membership through the year; do not multiply year-end membership by twelve. If a reduced input instead assumes unchanged membership, require an explicit confirmation of that restriction and block changes/uncertainty.

The user must have paid the eligible contributions or have taxable employer-paid contributions deemed paid by the employee. Include those employer amounts once in F and in X where required; do not add them again to a total that already includes them. Exclude shared-payment/apportioned-credit arrangements, refunds or entitlement uncertainty, foreign/statutory/non-registered schemes of uncertain qualification, and unreconciled employer benefits.

This extension is restricted to **no additional qualifying out-of-pocket/impairment expenses and no qualifying disability of the taxpayer, spouse or child**. Ask explicit screening questions; do not infer zero expenses from the absence of a typed value or from scheme membership. Any yes/unknown answer preserves the checklist and blocks the overall result. Do not collect diagnoses.

For each eligible month, calculate MTC using first/second covered person and additional covered-person rates for the selected year. Let the annual sum be `M`.

- Age under 65 at year end: `A = 0.25 × max(0, max(0, F − 4M) − 0.075T)`.
- Age 65 or older at year end: `A = 0.333 × max(0, F − 3M)`.
- Additional expense input E is explicitly zero by the approved scope, rather than a missing value treated as zero.

Use **33.3%**, not an exact one-third, to match the published formula. Show MTC and AMTC separately. Normal tax after age rebates, MTC and AMTC is floored at zero; unused credits do not create cash or a carried-forward credit. The annual liability/PAYE comparison remains an estimate, not an assessment or refund promise. 2027 monthly membership and fees are forecasts where months have not elapsed.

## Reference fixtures and required boundary evidence

These independently derived examples use only the above bounded case, one covered person for all 12 eligible months, no extra expenses/disability and no other income or deductions. Round monetary display to cents after retaining calculation precision. SARS assessment rounding may differ.

| Year / age | X | C | F | D / T | MTC / AMTC | Annual tax after rebates and credits |
| --- | ---: | ---: | ---: | --- | --- | ---: |
| 2026 / under 65 | 600,000 | 60,000 | 36,000 | 60,000 / 540,000 | 4,368 / 0 | 109,664.00 |
| 2026 / 65–74 | 600,000 | 60,000 | 36,000 | 60,000 / 540,000 | 4,368 / 7,624.368 | 92,595.63 |
| 2026 / under 65 | 200,000 | 0 | 60,000 | 0 / 200,000 | 4,368 / 6,882 | 7,515.00 |
| 2027 / under 65 | 600,000 | 60,000 | 36,000 | 60,000 / 540,000 | 4,512 / 0 | 106,795.00 |
| 2027 / 65–74 | 600,000 | 60,000 | 36,000 | 60,000 / 540,000 | 4,512 / 7,480.512 | 89,549.49 |
| 2026 / under 65, no scheme | 2,000,000 | 500,000 | 0 | 350,000 / 1,650,000 | 0 / 0 | 558,784.00 |
| 2027 / under 65, no scheme | 2,000,000 | 500,000 | 0 | 430,000 / 1,570,000 | 0 / 0 | 521,993.00 |

Fixtures in `sars-research.md` provide further independent examples, but its example with nonzero E is **out of scope** here and must be blocked. Test each fixture plus contribution zero/actual/27.5%/cap boundaries, medical zero/one/two/three persons and changing months, F at/below/above the AMTC fee and income thresholds, both age regimes including 75+, non-refundable zero floor, and all unknown/exclusion gates. Test forged payloads cannot override eligibility or submit a precomputed result. Expected amounts must not be generated from the module being tested.

## Sources independently checked

- [SARS section 11F limits](https://www.sars.gov.za/latest-news/retirement-fund-contribution-deductions-section-11f2a/) explains the remuneration/taxable-income limits and shortened-assessment restriction.
- [SARS additional medical credit](https://www.sars.gov.za/types-of-tax/personal-income-tax/additional-medical-expenses-tax-credit/) sets out both AMTC regimes, including premium-only eligibility.
- [SARS deemed medical contributions](https://www.sars.gov.za/faq/faq-what-is-deemed-medical-contributions/) confirms employer contributions are taxable benefits and deemed employee contributions.
- [SARS monthly medical credits](https://www.sars.gov.za/types-of-tax/personal-income-tax/medical-credits/) and `sars-research.md` supply year-specific rates; the research documents 2027 legislative status.

This approval establishes a buildable private-validation boundary. Independent local practitioner validation of input wording, certificates, calculations and exports is still required before a paid/public launch.
