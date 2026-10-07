# Complete calculator coverage audit

Final implementation snapshot: 7 October 2026 SAST. The surveyed TaxTim hub inventory contains **29 core calculators, 4 specialist calculators and 3 tools: 36 entries**. Actual execution of the current registry/evaluator confirms **36 unique entries, 36 live bounded paths and 36 supported fictional examples**, with no pending inventory card. Verification reports **79/79 local tests passing and TypeScript passing**, including all six specialist fixtures through the public catalog/evaluator. Root confirms the exact final tests/typecheck and production build passed, with Astra's final code approval recorded. Deployment/runtime and live/browser acceptance remain separate checks.

This records bounded coverage of every surveyed entry, **not full feature parity with every competitor submode or all possible tax circumstances**. Input classifications and eligibility confirmations are user assertions. No tool creates a SARS assessment, return submission, claim entitlement or practitioner review.

## Implemented entry coverage

Every row below has a live evaluator or branching guide and an approved bounded contract. Sources, exclusions, exact inputs and rule provenance are displayed by the tool and exported with its result. Independent fixtures and strict-input/unknown checks execute in the committed tests.

| # | Entry | Actual supported path and important limit |
| --- | --- | --- |
| 1 | Income tax | Twelve equal ordinary taxable salary months, annual normal tax, employee/employer UIF and monthly planning net. Real payslip/YTD/irregular remuneration is outside this model. |
| 2 | Tax refund | Known final ordinary taxable income and PAYE, with explicit no-unmodelled-credit/adjustment gates; indicative balance, not SARS refund/account status. |
| 3 | Retirement fund lump-sum tax | Retirement and withdrawal tables with complete cumulative prior taxable retirement/withdrawal/severance history. Actual directives/benefit classification remain external facts. |
| 4 | Two-pot | Confirmed savings-component withdrawal, incremental annual normal tax and amount after that component. Fees, debt and actual directive differences excluded. |
| 5 | Capital gains tax | Recognised aggregate current-year gains/losses, annual exclusion, prior assessed-loss ordering, 40% inclusion and separate ordinary-tax increment. Special relief/disposal cases excluded. |
| 6 | Travel allowance | One fixed-allowance/logbook case, gazetted deemed-cost scales or independently known actual-cost comparison, matching periods and allowance cap. Separate reimbursive-payment regimes are not implied. |
| 7 | Medical aid credits | Standalone MTC/AMTC with known final taxable income, eligible paid member-months/fees and known qualifying unreimbursed expenses. No disability/impairment/shared payer or unknown entitlement. Saved preparation remains E=0. |
| 8 | Provisional tax | First/second planning instalment with period-specific nonoverlapping credits; separate known adjusted basic-amount/linear-uplift illustration. Not a penalty-safe minimum or submitted IRP6. |
| 9 | Home office expenses | Eligible employee premises costs, exclusive area, more-than-50%-duties and one-time period proration. No mortgage interest, capital/equipment allocation or automatic overall-return inclusion. |
| 10 | Wear and tear | Selected new-owned asset lives, confirmed trade share, explicit full-month straight-line schedule, and one-time strictly-below-R7,000 standalone election. Used/personal-to-trade/unsupported categories excluded. |
| 11 | Retirement savings | Reconciled current-year section 11F deduction/tax-saving **and** separately assumed contribution/growth projection. No carryover/withdrawal calculation or guaranteed growth. |
| 12 | Local interest | Confirmed SA interest, age-based exemption/taxable component and separately bounded ordinary-tax increment. Foreign interest and TFSA returns excluded. |
| 13 | Taxable foreign dividends | Confirmed under-10% ordinary partial-exemption component. No automatic exemptions/CFC classification, foreign-credit or net-tax calculation. |
| 14 | Bonus tax | Annual normal-tax increment and bonus after that component. Not definitive payslip withholding. |
| 15 | Tax bracket | Known annual taxable amount, progressive tax, additive age rebates and marginal/effective rates. Gross/take-home is not inferred as taxable income. |
| 16 | Hourly to salary | Explicit-schedule gross conversion, separately bounded annual net, and separate full-pay-period annualised withholding illustration. Monthly equivalents are not actual payslips. |
| 17 | Net to gross | Bounded monthly/annual salary/UIF inverse model, forward residual and same-model current-gross raise comparison. Unmodelled payslip deductions/benefits excluded. |
| 18 | Rental income tax | Known revenue rent/allowable expenses, profit/loss component and positive-profit increment under a complete base. No automatic salary offset/refund from losses. |
| 19 | Retrenchment tax | Qualified cumulative severance-table component **and** separate ordinary leave/notice/bonus increment. Zero-rate band never applied to the entire package indiscriminately. |
| 20 | UIF | Contributions plus selected unemployment, illness and maternity rate/total illustrations with mode-specific history/eligibility gates. No application, entitlement decision or unimplemented benefit category implied. |
| 21 | Crypto tax | Explicit confirmed capital/revenue scenario, approved CGT ordering or independently known trading profit. No automated classification or staking/mining/DeFi valuation. |
| 22 | Donations tax | Resident-natural-person non-exempt gift, annual exemption and cumulative taxable-gift rate split. Not section 18A income-tax relief or exempt/entity-gift advice. |
| 23 | Company car tax | Confirmed determined value, maintenance-plan rate, full-month employer-owned benefit and verified business-use assessment ratio; separate ordinary-tax increment. No operating-lease/employee-cost or PAYE inclusion conflation. |
| 24 | Property transfer cost | Verified transfer **duty** by acquisition date and confirmed standard transaction/value. No invented legal/bond/municipal tariff or total purchase cost. |
| 25 | VAT | Confirmed 15% standard-rated inclusive/exclusive arithmetic. No vendor registration, zero-rated/exempt classification or input-credit entitlement determination. |
| 26 | Small-business income tax | Confirmed eligible SBC profit table by actual ordinary financial-year end. Registered turnover-tax submode is **not implemented**, and no automatic lowest-tax election is made. |
| 27 | Payroll tax | Anonymous equal-month employee rows aggregated, each age/UIF scenario, separate employer UIF and confirmed SDL. A planning tool, not a production payroll engine. |
| 28 | Am I a provisional taxpayer? | Conditional natural-person questionnaire, Commissioner-notice/business/registered-employer and taxable-aggregate exclusions. Not a definitive SARS status or filing-obligation decision. |
| 29 | TFSA | Annual/lifetime headroom and separate growth projection; annual-only excess-tax case. Lifetime-breach combined penalty is deliberately unavailable pending historical facts. Withdrawals do not restore headroom. |
| 30 | Section 12C wear and tear | Confirmed direct-manufacturing new 40/20/20/20 or used five-times-20% schedule, arm's-length cost cap. Draft-guidance part-year qualification retained; no R&D/hotel/lessor/private/grant scenario. |
| 31 | SBC wear and tear | Established SBC at acquisition/first use, manufacturing 100% or explicit other-asset 50/30/20 election. No stacking, grant/disposal/private-use or uncertain-status result. |
| 32 | Section 11(f) lease premium | Actually paid premium, lessor-income inclusion, documented full-month entitlement/renewals, 25-year cap and first/last-year allocations. No early remainder write-off or partial-month rounding. |
| 33 | Section 11(g) leasehold improvements | Enforceable obligation, actual/contractual or documented fair-value cap, lessor-income inclusion, month-end completion and remaining entitlement. Zero at year-end completion; no unreviewed early-termination/cession calculation. |
| 34 | Tax deadlines | Confirmed category/year, published dates, explicitly derived dates and permitted calendar entries. No invented 2027 ITR12 season; derived February provisional date is not exported before the operational notice gate. |
| 35 | Tax return documents | Situation-dependent deduplicated evidence checklist with print/export and official next steps. No document upload, validation or assertion that possession establishes a filing requirement. |
| 36 | Where is my SARS refund? | Self-reported assessment/bank/verification/audit/debt/payment-status branches with official actions. No live SARS status or promised countdown/payment date. |

## Free shared experience and genuine boundaries

Source implements hub search/situation categories, truthful availability, non-sensitive tool favourites, grouped conditional forms, contextual help, deliberate fictional examples, invalidated stale results, result/error focus, clear primary answer, rules/source explanation, related tools and existing free preparation links. Session comparison permits at most three compatible cases: same tool/output schema, comparison key and result kind; ordinary cross-year comparison is explicit. It never adds independent components to a return.

Copy, text/JSON download, print and permitted `.ics` generation produce actual content/files. Only favourite slugs use local persistence; monetary inputs/comparisons remain tab memory, with no financial analytics/network/save requests. Existing ChatGPT-authenticated owner-scoped D1 preparation remains separate and unchanged. Its medical scope is E=0 even though the standalone calculator supports known qualifying expenses.

The proposed paid-service page and `commercial-delivery-blueprint.md` give a concrete checked/reconciled review outcome, process and price experiments. All live tools/preparation/exports stay free. There is no checkout, booking, paid entitlement, existing reviewer-capacity claim or validation of demand.

## Approval, evidence and remaining checks

Controlling pre-coding gates: `astra-calculator-plan-review.md`, Stages 1 to 4 and the specialist ownership amendment. Exact sources: `calculator-rules-research.md`, `specialist-calculator-contracts.md`, `travel-payroll-contracts.md`, `uif-benefit-contract.md`, `tool-guides-contracts.md` and existing preparation research/amendments. Legal proposal, transaction-date, financial-year and ordinary assessment regimes remain separate.

`tests/calculators.test.cjs` and `tests/calculator-specialists.test.cjs` include independent numeric/boundary/eligibility fixtures; existing preparation/API/repository regressions continue. Verification's final reported freeze is **79 passed, 0 failed; TypeScript passed**. Earlier illness fixture precision mismatch was reconciled to the approved source formula before this freeze. Root subsequently confirmed the exact final tests/typecheck and production build passed and Astra final source approval was recorded. These are local/review release evidence, not proof of browser or genuine hosted-session acceptance.

Browser/mobile visual, keyboard/focus, actual download/print interaction, genuine hosted identity, deployed D1 persistence and two-real-owner acceptance remain pending when capability is unavailable. No browser/screenshot QA is inferred from source inspection. Independent practitioner/legal/privacy/security/service/payment readiness remains a paid/public launch gate. The hosted release is a **private preview for validation testing**, not acceptance-complete or production/payment-ready.
