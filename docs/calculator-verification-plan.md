# Calculator expansion verification plan

Status: implemented under the staged approvals in `astra-calculator-plan-review.md`. This document preserves the historical verification plan; executed evidence is recorded in `verification-notes.md`. The final implementation run passed **79 tests and project typecheck**. All 36 catalog entries execute their approved bounded calculator or guide. Astra final code/release review, root's exact production build and the separately listed live/browser checks remain release gates. The existing preparation estimator and its approved boundaries remain separate.

## Contracts and ownership

Verification owns the pure `lib/calculators.ts` registry/evaluator, calculator tests and test-runner import additions. The application coder owns the calculator frontend. Each definition has its own fields, scope summary, explicit fictional example, related tools and year sensitivity. Inputs are strings, preserving unanswered versus zero. Outcomes are `supported`, `blocked` or `invalid`, with display items, named blockers, assumptions, and source/version/check-date provenance. Unexpected fields are rejected rather than accepted as hidden eligibility overrides.

Session-only scenario outputs must not mutate, aggregate into, or replace the saved preparation estimate. A checker can give conditional guidance without claiming that SARS has determined a status; a tracker must not imply access to SARS records. Failed eligibility removes numerical tax outcomes.

## Independent fixtures already available

These candidate examples use recorded source research; formulas and approved input semantics still control enablement. Expected values will be literal independently checked fixture values, not generated from application constants.

| Family | Independent fixture / verification purpose |
| --- | --- |
| Ordinary annual tax | Preserve all twelve bracket-edge groups, all age rebates and the seven approved medical/retirement fixtures from the existing 36 tests. |
| Equal twelve-month salary | R30,000/month gives R360,000 annual income. 2026 annual liability R57,397; before-UIF monthly take-home R25,216.9167. 2027 liability R56,172; before-UIF take-home R25,319. Scenario only; not a definitive payslip. |
| Bonus normal-tax difference | Add R30,000 to annual ordinary income R360,000: incremental normal tax R8,775 in 2026 or R8,145 in 2027, subject to the approved bonus semantics. |
| Partial employment counterexample | Three months of R30,000 is actual annual income R90,000, with zero annual ordinary liability in either year under65. Dividing tax on an invented R360,000 annual income is a different payroll annualisation scenario; it must not masquerade as the actual annual assessment. |
| UIF contributions | R10,000 monthly eligible remuneration produces R100 employee plus R100 employer. At/above R17,712 each contribution is capped at R177.12. Benefit claims require a separate verified contract. |
| VAT | R115 inclusive at 15% contains R15 VAT and R100 excluding VAT; R100 excluding gives R15 VAT and R115 including. VAT applicability is a user assertion, not automatically determined. |
| Transfer duty | Acquisition in the approved post-1-April-2025 regime, taxable value R2,000,000 gives R33,786 duty. VAT/exception/connected-party complexities must block; legal and bond fees are not inferred statutory tax. |
| Specialist schedules | Subject to official contracts: R100,000 qualifying new/unused manufacturing machinery has 40,000/20,000/20,000/20,000 s12C allowances. Used qualifying machinery has five R20,000 allowances. Eligible SBC manufacturing has R100,000 first-use allowance; eligible accelerated nonmanufacturing has 50,000/30,000/20,000. |

## Required test matrix

| Area | Required evidence |
| --- | --- |
| All 36 inventory entries | Unique stable IDs, registry/frontend coverage, meaningful result or named evidence boundary, exact fields, intentional example, sources and related links. No empty cosmetic form. |
| Input safety | Blanks differ from zero; negative, non-finite, out-of-range, malformed decimal/date, unsupported enum, extra field and incomplete list are invalid. Yes/no/unsure gates never default uncertainty to a favorable assumption. |
| Shared income families | Annual, monthly and hourly units are explicit; age is assessed at year end; additional amounts use incremental tax; reversal checks gross/net residual within cents and must not silently assume UIF eligibility. Actual-income period and annualised payroll period remain distinct. |
| Medical/retirement | Existing approved simple cases retain fixtures. Any broadened disability, expense, shared-payment or income-base case gets separate gate and independent fixture approval. No silent reuse of a simplified formula outside its original bounds. |
| Gains and investment income | Exempt versus taxable amounts, annual aggregation/exclusions, prior losses, natural-person inclusion rate and incremental tax are separate. Crypto classification remains conditional; gross proceeds are not taxed as gains by default. |
| Lump sums and two-pot | Current-table cumulative amount less current-table prior amount, eligible prior histories/dates/types, zero floor and all table boundaries. Two-pot uses normal-tax difference and cannot use the lump-sum table; payout cannot conceal fees, debt or SARS directive uncertainty. |
| Deductions and allowances | Eligibility precedes arithmetic; business/private use, recorded actual costs, allowed asset lives, trade years, caps and effective dates are explicit. Partial-year factors have legal-source support, day/month units and boundary fixtures. Recoveries or early termination are not invented. |
| Provisional tax | Entity/income exceptions, year/payment period, previous assessment baseline, expected PAYE/credits and known payments each need their own contract. A conditional status guide is not an official classification or payment guarantee. |
| Tax-rate families | Test each progressive threshold below/at/above, date/year selection, additive rebates/exemptions, penalty boundaries and supported natural-person versus company/SBC assumptions. |
| Projection families | Compounding frequency, deposit timing, growth/fee/tax assumptions and limits are explicit; zero growth/time and bounded extreme cases yield finite outputs. Nominal projections are not promised returns. |
| Tracker/checklist families | Deduplicated evidence, conditional category-specific dates with sources, no invented 2027 filing deadline, no refund payout promise, and no false authenticated status. |
| Results and exports | Blocked/invalid outputs contain no tax result; supported items stay finite, preserve the exact input/year/provenance and disclose assumptions. Tool outputs do not change saved preparation records or a combined tax balance. |

## Release evidence

The existing Node harness can test actual pure modules without new dependencies and remove its temporary compiled files. Existing repository/API tests remain unchanged and run with new calculator tests. Root retains the final build, Sites deployment/runtime work and acceptance register. Astra reviews concrete formulas, fixtures, gates and final code. Local fictional inputs are not live taxpayer/session validation; browser and practitioner checks remain separate.
