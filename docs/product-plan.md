# Joff Tax product and commercial plan

Plan date: 7 October 2026, South Africa. Status: conditionally approved for base-scope implementation by Astra Extra High before application coding; see `astra-plan-review.md`. That review controls the base scope and release gates below. A subsequent **conditional** retirement/medical extension is controlled by `astra-calculation-amendment.md`, with exact UI input semantics in `estimator-extension-plan.md`; it replaces the blanket base blockers only after its eligibility gates and tests pass code review. All base privacy/authentication/release conditions remain. Initial release: a private preview for validation testing, not a paid production service or a claim of completed acceptance. Owner decision: build a useful preparation product now, then earn the right to charge after tax, privacy, security and service reviews.

## Product decision

Joff Tax helps a South African salary earner understand their position, collect the right evidence and prepare a clear pack for their own SARS eFiling session or practitioner. Its promise is "Get your tax organised. Understand your next step." The first release provides guided preparation, a conditional document checklist, an explained estimate for a narrow supported case, durable progress and an export. It does not submit a return, import SARS records, take payment or provide practitioner review.

A calculator alone is insufficient differentiation: SARS filing is free and TaxTim already offers guided filing and a free auto-assessment checker. The commercial opportunity to validate is auto-assessment preparation/review of user-entered facts, a useful evidence inventory and a clear SARS/practitioner handover with explicit gaps. User interviews must establish whether people value this enough to pay while filing remains separate. See `market-research.md` for evidence and commercial qualifications.

Primary user: an adult South African resident with employment income who currently assembles certificates in email, spreadsheets and WhatsApp before tax season. Secondary user: a salary earner with side income who needs to discover that additional preparation or practitioner help is necessary. The latter receives a preparation checklist and a clear scope boundary, not an unsupported numeric result.

## Competitive evidence and pricing hypotheses

The official TaxTim pricing page reviewed for this plan lists Lite R215, Smart R565 and Ultra R895 per individual return submission, and Individual IRP6 R600. Its own website advertises guided questions, SARS import/submission and human support. The expert-filing page lists a starting price of R1,299. Those are capabilities Joff Tax must not imply it currently offers. Other TaxTim pages show conflicting starting amounts; recheck the live pricing page before publishing any comparison. These observations come from the competitor's own claims, not an independent quality assessment.

Pricing experiments, not actual offers:

| Candidate | Hypothesis | What must exist before sale |
| --- | --- | --- |
| Free | Eligibility screening, educational estimate, starter checklist | Reviewed rules, clear scope, privacy controls |
| Prep Pack | R149 per assessment year | Complete supported preparation workflow, export, durable progress, responsive support, fair refund terms |
| Annual Readiness | R249 per year | Preparation plus meaningful recurring check-ins and document organisation, with explicit renewal consent |
| Practitioner Review | Separately quoted | Contracted registered practitioner, disclosed identity and scope, secure handover, capacity and service terms |

Do not put fake checkout or a simulated successful purchase in the initial app. A pricing page may show "Planned pricing, under validation" and invite feedback. No card details are collected. Do not compete solely on lower price than a provider that actually files returns. Test prep-only willingness to pay and the desire for filing separately; lack of prep demand is a reason to change strategy.

Commercial validation targets are decisions, not forecasts: interview 10 to 15 target users; observe at least 8 completing a realistic preparation task; seek at least 5 explicit purchase-intent responses at a stated price with the prep-only scope understood. Before taking any payment, measure real completion, support time and refunds in an approved small paid pilot. Track acquisition cost, payment fees, support cost and revenue per completed assessment year to determine margin. Avoid an annual subscription until recurring benefit is demonstrated.

Potential acquisition channels: employer financial-wellness partnerships, educational searches about required documents, and referrals from practitioners needing better client preparation. Partnerships and testimonial claims are roadmap items until agreements and permissions exist. The October 2026 filing deadline may make an honest readiness workflow timely, but urgency must never promise that Joff Tax can file before the deadline.

## First release scope

| Capability | Working implementation now | Boundary |
| --- | --- | --- |
| Sign in and workspace | ChatGPT identity through the Sites starter; private hosted access | No separate password system or invented email verification |
| Assessment year | Separate 2026 preparation and 2027 planning workspaces | 2027 is an in-progress forecast, not a completed-year return |
| Guided preparation | Profile, income screening, evidence checklist, review and export | Answering questions does not establish that a return has been submitted |
| Salary estimate | Verified progressive brackets and age rebates; taxable employment total and PAYE already paid | Annual assessment estimate, not a payroll withholding calculator |
| Medical preparation | Record whether contributions, expense claims or uncertainty exist and generate evidence tasks | Any medical contributions, claims, disability-related claims or uncertainty block the first-pass overall estimate; a separate educational MTC illustration cannot become the case total |
| Retirement preparation | Record current-year employee/employer contributions, carryovers, withdrawals or uncertainty and generate evidence tasks | Any such circumstance blocks the first-pass overall estimate; no section 11F deduction is approved |
| Auto-assessment next steps | Record whether received and show official check/correct/filing next steps with source | No access to assessment, automated correctness verdict or confirmation that filing is unnecessary |
| Side income | Record its presence, explain review need, generate document suggestions | Block an overall tax estimate for unsupported income; do not guess business profit or provisional status |
| Checklist | User can mark missing, ready or not applicable and add short notes | Metadata only; no document upload in this release |
| Sources | Year-specific official links, date checked and plain-language scope | No unsourced chatbot advice |
| Export | Printable preparation pack plus a real downloaded text/JSON summary if feasible | No generated ITR12, XML filing payload, assessment or SARS confirmation |
| Progress | Save and reload from owner-scoped D1 records with visible status | No false "saved" message if the server fails |
| Account controls | Export own data and delete own preparation records | Explain precisely whether this deletes app records or also external identity |

One sustained implementation session is best spent completing this narrow end-to-end workflow. Defer file uploads, OCR, live SARS integrations, arbitrary AI tax answers, payments, collaboration, complex deduction calculations and operational reminders. Ship fewer supported calculations with correct boundaries, persistence and a useful export.

## Tax scope and rules

The 2026 assessment year runs from 1 March 2025 to 28 February 2026. The 2027 assessment year runs from 1 March 2026 to 28 February 2027. Show both the year and its date range everywhere a user enters values or views a result. Never infer a completed-year amount from monthly take-home pay. Do not silently carry amounts between years.

Use an explicit, versioned rules object for each year with brackets, rebates, source URLs, publication status and a checked date. Arithmetic is deterministic and shared by the UI and server validation. The research agent's verified rule table is the implementation source of truth and must be reviewed before coding. This product plan intentionally does not duplicate all numeric tax constants.

For 2027, describe the result as a forecast using currently published SARS rates. The SARS employer guide describes Budget 2026 rate proposals while its payroll tables apply from March 2026; do not label the eventual assessment legislation as finally enacted without verification. There is no published 2027 filing-season deadline to show. Recheck legal status before a paid release and any rules update.

Supported first calculation: adult resident salary-only case from a single South African employer; known ordinary annual taxable employment income including taxable bonus, no allowances/fringe benefits/directives, no other income or unmodelled deductions, no retirement or medical circumstances, and age band assessed at the relevant year end. Calculate bracket tax, subtract eligible additive age rebates, and floor final income tax at zero. No retirement deduction, MTC or AMTC is applied to the first-pass personalised total. Compare that estimate with the entered annual PAYE as an illustrative balance. Label positive balance "Estimated amount still payable" and negative balance "Possible overpayment", accompanied by assumptions and a clear statement that SARS determines the assessment. Never guarantee a refund. An annual effective rate is tax divided by positive annual taxable income; zero income must yield a valid zero-rate display.

The conservative medical boundary is essential: additional medical expenses tax credit can arise from scheme premiums alone, so zero out-of-pocket expenses does not prove that the basic scheme credit is the complete calculation. All medical contributions, medical expense claims, disability-related claims and uncertainty route to preparation-only in the first pass. An optional later extension requires exact premium and monthly member inputs, eligibility, year-end age, no-disability/no-out-of-pocket boundaries, reviewed MTC and AMTC formulas and independent reference fixtures before enabling it. A retirement extension separately requires reviewed remuneration/taxable-income semantics, current-year employee and employer contribution handling, carryover exclusion and explicit double-deduction prevention. Neither extension is approved by this base-scope plan; it must receive a recorded Astra scope review before code enabling the additional total is released.

If the user does not know their taxable employment total, help them locate the appropriate information without inventing an IRP5 source-code mapping. Gross salary, taxable remuneration, retirement deductions and take-home pay are distinct. Certificate mappings require official evidence and review. An educational scenario tool may accept a hypothetical taxable amount, but must not represent it as a prepared return.

Mandatory screens before an overall estimate: residency/foreign income, other income or multiple employers, all retirement employee/employer contributions/carryovers and lump sums/two-pot withdrawals, travel or employer car benefits, home-office or commission claims, donations, capital gains/crypto, rental/business income, all medical contributions/expenses/disability, community-property complications and other special circumstances. Every screen uses explicit unanswered/yes/no/unsure semantics, with no default "no". Require affirmative supported residence/year/age/income assumptions and completed screening before a personalised total. Any unsupported answer, uncertainty or unanswered required screen blocks that total consistently in UI, server, dashboard and export. Preserve the checklist and explain the blocker. A separate hypothetical salary-only scenario must be visibly educational and cannot become the case summary.

For 2026 filing season, currently verified SARS dates are auto-assessments 1 to 12 July 2026, non-provisional individuals 13 July to 23 October 2026, and provisional individuals 13 July 2026 to 22 January 2027. Display a deadline only with its category and source. Side income is a reason to check provisional-tax rules; it is not by itself a final legal classification. Do not say that every user must file or that every side earner is provisional. Preparation completion is independent of a legal filing obligation.

## User journey and design

Use an original Joff Tax identity rather than copying TaxTim's character, marks, wording or screen layouts. Premium forest green, warm ivory and restrained lime highlights, a clear Joff Tax wordmark, strong type hierarchy and generous space should make financial information legible. Prioritise mobile cards/task navigation and keyboard use. A first workspace is empty and useful; sample records appear only through an explicit example button. No fabricated trust logos, security badges, customer counts, testimonials or savings statistics.

1. Landing page states the preparation promise and private validation status. "Start preparation" opens the genuine signed-in workspace. "Try a sample" opens a clearly labelled example without saving sample records as the user's own work.
2. Dashboard shows active assessment year, readiness count, saved timestamp, current blockers and one next useful action. A preparation status such as "4 of 7 evidence items ready" never says "return filed" or "SARS ready".
3. A short eligibility and income screen tailors the workflow, including whether a SARS auto-assessment was received. Explain that users should check the underlying facts against their certificates, and link to official corrective/filing guidance without claiming Joff Tax checked the actual assessment. Keep contextual help close to unfamiliar terms and allow "I'm not sure"; uncertainty becomes a blocker or a document task. Before saving, show a short notice explaining private validation purpose, the minimal preparation data stored, and that deletion removes Joff preparation records rather than the ChatGPT identity. Do not invent an operator entity or approved privacy/support claim.
4. Each step asks for a small group of related facts and explains why they matter. User can move back without losing saved answers. Empty and invalid monetary inputs remain different from zero.
5. Checklist groups employment, medical and any flagged additional evidence. Marking a document ready asserts user-reported availability, not upload, validation or tax acceptance.
6. Review screen repeats year, values, blockers and assumptions. Supported first-pass cases see a breakdown of bracket tax, age rebates, annual liability and PAYE comparison. Unsupported cases see preparation progress and next steps without a personalised tax balance.
7. Export produces a readable pack with year/date range, entered facts, checklist, gaps, calculation where supported, assumptions, rules version, sources and creation timestamp. Each page identifies it as a preparation document.

Provide explicit loading, empty, unavailable, validation and retry states. Preserve typed values on save failure and show a truthful unsaved state. Account deletion uses a confirmation with the precise records affected. Success/error announcements should be accessible. Use semantic controls, visible focus, adequate contrast and labels that remain visible when fields contain values.

## Engineering architecture

Use the already selected Sites Vinext starter with TypeScript and the existing D1 `DB` binding. Import server-only `getChatGPTUser()` / `requireChatGPTUser()` from `app/chatgpt-auth.ts`; use the stable `userId`, not email, as the ownership key. Protected pages are `force-dynamic` and private responses are not shared-cached. Sign-in uses a top-level link to the dispatch-owned route. Do not implement the starter's reserved auth routes.

Every read, write, calculation persistence, export and deletion validates the current server identity. Reject missing identity. Scope SQL by both record ID and owner ID; client-supplied ownership fields are ignored. Private site access restricts visitors but does not replace record-level authorization. Accept mutations only from the same origin and validate method, content type, payload shape, supported years, enums, string lengths and finite bounded amounts. Use parameterised statements. Do not use browser storage as the durable record source.

Suggested data model: `preparations(id, owner_id, assessment_year, schema_version, rules_version, answers_json, checklist_json, revision, created_at, updated_at)`, with uniqueness appropriate to one active preparation per owner/year. Store only needed fields: age band rather than date of birth, high-level income flags and entered amounts, checklist metadata. No ID number, tax reference, bank details, document binaries, medical diagnosis or dependent identity. Owner fields never appear in user-editable payloads. Make migrations idempotent where appropriate and commit migration files.

Use optimistic revisions to avoid silently overwriting a second tab, with the revision predicate and update in one atomic database operation. Save confirmation appears only after D1 succeeds, includes the persisted update time and survives reload. Server calculates or independently validates exported persisted calculations against the stored selected rules version. Saved cases retain rules/version provenance; updating rules must not silently alter a previously exported result. If a saved rules version is no longer supported, flag it for review instead of relabelling the calculation. Identity-dependent pages and API responses must be private/no-store.

Keep modules separate for year rules, tax calculation, scope screening, questionnaire/checklist definitions, server data access and UI. Avoid introducing a general AI adviser or an external service dependency. Error logs contain status and request identifiers, not answers, tax amounts or exported packs. Do not claim verified infrastructure encryption, backups, residency or service guarantees without platform evidence and an operational check.

## Acceptance criteria for the private validation release

The following are acceptance targets, not completed verification claims. Record every check as passed, failed or pending with its evidence. The current managed environment has no approved browser QA capability. Build/type checks, independent numeric fixtures and actual repository/API/schema tests provide implementation evidence; they do not prove responsive layout, print/keyboard usability, live ChatGPT identity or deployed D1 persistence. A private preview may be released for validation testing after code blockers are resolved, Astra code review is completed and pending live/browser checks are disclosed. Full acceptance requires the remaining deployed/session checks below.

- Target live check: a real signed-in owner can create a 2026 preparation, save an answer/checklist, reload and recover it. A separate owner cannot list, load, update, export or delete that record. Missing identity yields a denied response. Owner IDs inserted into payloads never change ownership. Actual repository/query-path isolation tests may pass separately; mocked identities must never be reported as two real signed-in owners.
- The site has working landing, dashboard, guided preparation, checklist, estimate/review, sources, account controls and a real export. All advertised buttons have working outcomes or are explicitly labelled future features.
- 2026 and 2027 selection changes date range, rules and context, and stores independent data. 2027 says forecast and has no invented filing deadline.
- A supported example shows a transparent bracket/rebate/PAYE breakdown. Independently derived reference fixtures cover every bracket boundary just below/at/above, rebate ages, zero income, negative/invalid entries and zero tax. Reference answers must not be generated from the implementation's own constants. Retirement and medical first-pass tests verify every related yes/unsure/unanswered answer blocks the overall total; a separate educational MTC illustration never appears as case liability or balance.
- Every unsupported screening category blocks the personalised overall estimate consistently in UI, server and export. A user cannot bypass this by manipulating the request body. Unsupported answers remain useful checklist inputs.
- PAYE comparison is an estimate with the correct direction and assumptions. No screen reports an official refund, ITR12 submission or SARS assessment.
- Save failures do not claim success; reload verifies server persistence. Two-tab updates cannot silently discard another saved revision. Deletion removes only the current owner's app records and subsequent reads fail.
- Export contains exactly the user's selected year and values with blockers, provenance and source links; it contains no other user's data or misleading filing confirmation. Print layout is readable and a download creates a real file.
- Target browser checks confirm mobile/desktop complete path, keyboard controls, validation errors, focus and readable print output; retain these as pending when capability is unavailable. Build and type checks pass independently. Authentication-sensitive HTML has no shared-cache leak. Record deployed runtime persistence and live-session evidence separately from local tests.
- Repository contains the plan, verified research, Astra decisions, implementation, migrations and verification record. No auth bypass tokens, secrets, tax records, build artefacts or runtime state are committed. Report any GitHub publishing blocker honestly.
- Final delivery labels the hosted URL as a private preview for validation testing, lists supported calculation scope, passed checks and pending live/browser/GitHub checks, and does not describe it as acceptance-complete, payment-ready or production-ready. Source/migrations/reviews are committed with no secrets or user tax data; any publication blocker is disclosed.

## Staged path to a paid launch

| Stage | Deliverable | Exit decision |
| --- | --- | --- |
| 0: Reviewed plan | Product scope, sources, implementation sequence, risk boundaries | Conditional Astra extra-high base-scope approval recorded in `astra-plan-review.md`; first-pass medical/retirement exclusions control |
| 1: Private validation | The functioning scope above, source repository, hosted review URL | Astra code review, available runtime/isolation evidence and honest pending-check register; preview is for validation until live/browser acceptance is completed |
| 2: Tax review and supported preparation | Independent South African practitioner validates rules, certificate mapping, question wording and exports; add retirement contributions and common simple medical cases only after tested review | Signed-off supported-case matrix and reference fixtures; no unexplained divergence from official examples |
| 3: Operational/privacy readiness | Responsible entity, support process, privacy/terms, data map, retention/deletion policy, incident plan, vendor agreements and verified hosting posture | Legal/privacy/security review and independent penetration assessment approve a limited paid pilot |
| 4: Payments and pilot | Appropriate payment provider, server-created orders, signed/validated webhooks, idempotent entitlements, refund handling, tax invoices and transparent price/renewal terms | Payment sandbox plus reconciliation/refund evidence, viable support economics, informed customers complete real cases |
| 5: Broader filing service | Contracted registered practitioners or an explicitly authorised SARS integration with consent, audit trails and reviewed workflows | Regulatory/service review, integration approval and reliable end-to-end submission/receipt evidence |

POPIA work is a launch gate, not a footer badge. Confirm the responsible party and Information Officer registration/duties, assess lawful processing purpose, minimise collection, provide clear notice and access/correction/deletion processes, review retention and cross-border hosting/operator arrangements, and separate optional marketing consent from service access. Obtain qualified review rather than treating a generated policy as compliance. Avoid uploads of special personal information until the need and controls are established.

Security readiness includes a documented threat model, least-privilege operator access, authenticated owner-scoped endpoints, rate limiting, dependency review, secure headers, secret management, redacted logs, tested backups/restore, deletion behaviour and incident response. Verify platform facilities before promising them. Prepare a process for security-compromise notification consistent with Information Regulator guidance; incident investigation must not become an excuse for indefinite delay.

Commercial readiness includes a real legal seller and contact details, service scope, support capacity, cancellation/refund handling, truthful price inclusive/exclusive tax treatment as legally reviewed, complaints process and the ability to handle a customer who falls outside the supported case. No refund-maximisation guarantee. No practitioner/service claim without the contracted registered professional behind it.

## Sources and ownership of updates

Official sources reviewed by the research/planning team, current for the plan date. The implementation must use the separate verified rule research document for exact constants and legal-status qualifications.

- [SARS tax rates and assessment-year ranges](https://www.sars.gov.za/tax-rates/)
- [SARS filing season](https://www.sars.gov.za/types-of-tax/personal-income-tax/filing-season/)
- [SARS employer deduction tables](https://www.sars.gov.za/guide-for-employers-in-respect-of-tax-deduction-tables/)
- [SARS employer guide for 2027](https://www.sars.gov.za/guide-for-employers-in-respect-of-employees-tax-2027/)
- [TaxTim official pricing page](https://www.taxtim.com/za/services/?order=28)
- [TaxTim expert-filing offering](https://www.taxtim.com/za/services/let-our-human-experts-file-for-you)
- [Information Regulator POPIA guidance](https://inforegulator.org.za/popia/)
- [Information Regulator security-compromise guidance](https://inforegulator.org.za/2025/08/19/fact-sheet-handling-of-security-compromises/)

Assign a tax-rules owner before paid launch. Record source changes, independent review, release date and affected supported cases. Recheck tax-year rates and filing dates before each seasonal release, after announced legislation changes and before showing deadline prompts. Assign operational owners for privacy requests, incidents, payments and customer support before inviting paying customers.
