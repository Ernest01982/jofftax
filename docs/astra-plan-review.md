# Astra plan review

Review date: 7 October 2026 SAST. Reviewer: Astra Extra High. Reviewed `product-plan.md`, `sars-research.md` and `market-research.md` before application coding. This is an independent implementation gate, not South African practitioner or legal sign-off.

## Decision: CONDITIONAL — implementation may begin

The plan is approved for implementation of a **private validation product**, subject to the mandatory scope and verification conditions below. This is explicit permission to start coding the approved scope now. It is not approval to sell, launch publicly, promise production readiness or claim all acceptance criteria have passed. Final code and private-release review are separate gates.

The product decision is sound: a durable preparation workspace, tailored evidence checklist, candid scope screening and useful export offer more than a calculator. Sources distinguish assessment years, filing seasons, enacted 2026 rates and SARS-published 2027 proposals. The proposed owner-scoped storage and deferred payments/integrations are appropriate. Competitor prices and suggested Joff prices are evidence and hypotheses, respectively.

## Mandatory implementation conditions

1. **First numeric scope is intentionally narrow.** Implement resident, single-employer, ordinary annual taxable employment income, age rebate and PAYE comparison. Any retirement contributions (employee or employer), carryovers, withdrawals, uncertainty about pre/post-deduction income, or other retirement complexities block the personalized overall estimate. No section 11F deduction is approved in this first pass. Retain preparation questions and evidence tasks. A separately reviewed expansion can be approved later without delaying the basic build.

2. **Do not mistake basic MTC for a complete medical calculation.** Additional medical expenses tax credit (AMTC) can arise from scheme premiums alone. No out-of-pocket expenses does not imply zero AMTC. For the first pass, any medical scheme contributions, medical expense claims, disability-related claims or uncertainty must block the personalized overall liability/PAYE balance. A clearly separate educational MTC illustration is permissible, but it must not become the case total in the dashboard, review or export. Alternatively, submit a bounded medical extension with exact inputs, formulas and independent reference fixtures for review before enabling it. Simple scheme-credit monthly counts alone are insufficient.

3. **Incomplete screening cannot masquerade as supported.** Use explicit unanswered/yes/no/unsure semantics or an equally clear affirmative eligibility confirmation. Do not default every unsupported circumstance to “no.” Require the supported residence/year/age/income assumptions and all mandatory screens before a personalized total. Unknowns block the result while preserving progress. Empty income/PAYE is distinct from zero. Apply the same deterministic screening on the server and in exports; a crafted request must not bypass it.

4. **Versions and dates must survive storage and export.** Persist separate 2026 and 2027 records with explicit periods, schema/rules version and timestamp. Show 2027 as a forecast using current SARS-published rates, subject to legislation and assessment, with no invented filing-season date. If a saved rules version is no longer supported, flag the case for review; do not silently relabel an old calculation or exported result. Never imply the readiness count decides a filing obligation.

5. **Apply record authorization at every operation.** Server identity is authoritative; use its stable `userId`. Scope reads, updates, exports and deletes to owner and record/year. Reject missing identity and ignore or reject client ownership fields. Enforce bounded strict input parsing, parameterized SQL, same-origin mutation checks and private/no-store responses. The optimistic revision predicate and update must be atomic. Save success must reflect a successful database write. Logs and errors must not expose financial answers, identifiers or packs.

6. **Minimize collection and be clear before saving.** Use age band, high-level scope facts and necessary amounts/checklist states. Do not collect ID/tax numbers, bank details, SARS credentials, names of dependants, medical diagnoses or document contents. A short visible notice must explain the private validation purpose, what is stored, and that deletion removes Joff preparation records rather than the ChatGPT identity. Do not invent a responsible entity, support channel, policy approval, encryption/residency guarantee or POPIA certification. Use fictional data in verification; paid/public processing remains behind the plan's operational and privacy gates.

7. **Deliver the workflow, not only the estimate.** Supported and unsupported users must be able to save/reload answers, see useful evidence tasks and gaps, obtain official next-step guidance, export a readable pack and delete their records. No fake upload, checkout, practitioner help, SARS connection, submission or confirmation. If a sample is offered, label it explicitly and do not persist it as the owner's real preparation without a deliberate action.

## Verification and release wording

The plan's acceptance criteria are targets, not a statement of completed verification. The current managed environment has no approved browser QA capability. Build, type checks, independent numeric fixtures, API/schema tests and meaningful repository owner-isolation/concurrency tests can establish implementation evidence, but cannot prove responsive layout, keyboard/print usability, live ChatGPT identity or deployed D1 persistence.

Record each check as passed, failed or pending. Test unauthorized access and cross-owner list/read/update/export/delete behavior using the actual repository/query paths; test real atomic revision behavior where the runtime permits. Do not describe mocked identities as two real signed-in owners. The final private preview may be released **for validation testing** only if code blockers are resolved and remaining live-session/browser checks are explicitly disclosed. It must not be called a completed acceptance-tested release while those checks are pending.

Required final gates: Astra code review; private deployment/runtime verification within available capabilities; an honest pending-check register; source/migration/review records committed with no secrets or user tax data. GitHub publication and real-session/browser QA blockers must be reported rather than simulated.

## Independent source spot checks

- [SARS medical credits](https://www.sars.gov.za/types-of-tax/personal-income-tax/medical-credits/) confirms monthly, non-refundable MTC and separate AMTC.
- [SARS additional medical expenses tax credit](https://www.sars.gov.za/types-of-tax/personal-income-tax/additional-medical-expenses-tax-credit/) confirms that AMTC includes premium-based excess: broadly 33.3% above three times MTC for age 65+/qualifying disability, and the four-times-MTC plus taxable-income-threshold computation for other people. This makes a basic-credit-only overall estimate incomplete for some ordinary scheme members.
- [SARS individual tax rates](https://www.sars.gov.za/tax-rates/income-tax/rates-of-tax-for-individuals/) was opened alongside the research. Exact constants and legislative-status distinctions remain recorded in `sars-research.md`; tests must independently check the implemented tables rather than compute expected answers from the implementation's own constants.

## Optional expansion route

To broaden medical support, propose the exact contribution eligibility, premium amounts, month-by-month person counts, disability/expense boundaries, year-end age handling, non-refundable floors and AMTC formulas, then bring reference fixtures for independent review. A bounded no-disability/no-out-of-pocket scheme-premium case may be practical. For retirement, first resolve remuneration versus taxable income, employer contributions already included in employment income, carryovers and double-deduction prevention. Neither extension is approved merely because the formula is small.

The planner should incorporate these conditions into `product-plan.md`; this review controls where the earlier plan allowed a broader calculation.
