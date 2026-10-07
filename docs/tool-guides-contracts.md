# Contracts for three guidance tools

Snapshot: 7 October 2026. These tools explain public SARS processes. They do not access an individual's SARS account, determine eligibility conclusively, submit documents, or track a live refund. Show the source and “checked 7 October 2026” with dated rules. Recheck SARS before carrying any calendar into a new filing season.

## 1. SARS Tax Deadlines

Offer filters for non-provisional individual, provisional individual, trust and employer. Each event should contain an ISO date or date range, tax year/filing season, audience, action, official source URL and an explanation of whether it is a return filing window, a provisional **payment and IRP6 return**, or an employer reconciliation. The 2026 filing season concerns the **2026 year of assessment (1 March 2025 to 28 February 2026)**, while the August 2026 and February 2027 provisional instalments relate to the **2027 year of assessment (1 March 2026 to 28 February 2027)**. Keep both concepts visibly separate.

| Event | Date(s), South African calendar | Filter and action | Official source |
| --- | --- | --- | --- |
| Auto-assessment notices | **1–12 July 2026** | Individual: wait for notice, review the assessment; if correct, no return/action is required. Certain provisional taxpayers can also be auto-assessed. | [SARS 2026 changes](https://www.sars.gov.za/latest-news/changes-for-filing-season-2026/) |
| Individual ITR12 opens | **13 July 2026** | Individual non-provisional/provisional: file a 2026 ITR12 if not auto-assessed or if correcting an assessment. | [SARS Filing Season](https://www.sars.gov.za/types-of-tax/personal-income-tax/filing-season/) |
| First 2027 IRP6 period | **31 August 2026, Monday** | Provisional individual with a February year-end: first return/payment for 2027 assessment year. Do not apply a fixed August date to a company with another approved year-end. | [SARS provisional tax guide](https://www.sars.gov.za/guide-to-provisional-tax/) |
| Trust ITR12T opens | **19 September 2026, Saturday** | Trust: opens 2026 trust return filing. | [SARS Filing Season](https://www.sars.gov.za/types-of-tax/personal-income-tax/filing-season/) |
| Employer interim EMP501 | **21 September–31 October 2026** | Employer: reconcile 1 March–31 August 2026 payroll period. The published end date is Saturday 31 October; do not silently move a filing deadline without a SARS notice. | [SARS PAYE page](https://www.sars.gov.za/types-of-tax/pay-as-you-earn/) |
| Optional 2026 provisional top-up | **30 September 2026, Wednesday** | February year-end provisional payer: optional third payment for the prior 2026 assessment year, where applicable. This is **not** the second 2027 instalment. | [SARS provisional tax FAQ](https://www.sars.gov.za/faq/faq-when-must-provisional-tax-be-paid/) |
| Non-provisional ITR12 closes | **23 October 2026, Friday** | Non-provisional individual: final published 2026 filing date. | [SARS Filing Season](https://www.sars.gov.za/types-of-tax/personal-income-tax/filing-season/) |
| Provisional individual ITR12 and trust ITR12T close | **22 January 2027, Friday** | Provisional individual/trust: published 2026 annual-return filing date. | [SARS Filing Season](https://www.sars.gov.za/types-of-tax/personal-income-tax/filing-season/) |
| Second 2027 IRP6 period | **28 February 2027, Sunday**, period end; **26 February 2027, Friday**, payment deadline derived from SARS's preceding-business-day rule | February year-end provisional payer: second return/payment for 2027 assessment year. Show the period end and adjusted payment date distinctly; confirm any SARS operational notice before publishing an .ics reminder. | [SARS provisional tax FAQ](https://www.sars.gov.za/faq/faq-when-must-provisional-tax-be-paid/), [guide](https://www.sars.gov.za/guide-to-provisional-tax/) |

The weekday checks above are calendar arithmetic in SAST, not separate SARS publications. SARS says that if a provisional **payment** due date falls on a Saturday, Sunday or public holiday, payment must be made on the last business day before it. Calendar downloads should use date-only .ics events with the source and assessment year in the description, and event IDs stable enough to avoid duplicate imports. Past events remain visible as “elapsed”; do not pretend to send reminders unless a reminder service is implemented. Avoid generic company IRP6, VAT or monthly EMP201 dates without asking the taxpayer's year-end, VAT period and applicable category. The 2027 **filing season** dates are not yet published here and must not be invented from 2026 dates.

### Calendar acceptance cases

- On 7 October 2026, 23 October is upcoming for non-provisional individuals; 31 August and 30 September have elapsed; 22 January remains upcoming for provisional ITR12.
- The August 2026 and February 2027 IRP6 events say “2027 assessment year,” while the October 2026 ITR12 says “2026 assessment year.”
- A correct auto-assessed individual sees “review; no return if correct,” not a mandatory 23 October filing action.
- The trust/employer filter does not display individual deadlines as if applicable; “all” can display every event.
- An .ics export retains dates as date-only and does not shift a deadline by timezone.

## 2. Tax Return Documents Checklist

Ask for the **assessment year** first, then applicable situations: employment/annuity, investments, medical scheme and out-of-pocket costs, retirement fund, business travel or employer vehicle, donations, rental/freelance/business income, capital disposals, disability and home office. Provide a deduplicated checklist grouped as “usually needed for your situation” and “may be needed.” Cite [SARS's ITR12 supporting-material list](https://www.sars.gov.za/individuals/how-do-i-send-sars-my-return/how-to-submit-an-income-tax-return-itr12-in-respect-of-individuals/), [2026 preparation list](https://www.sars.gov.za/monthly-digest/monthly-tax-digest-june-2026/) and [home-office evidence FAQ](https://www.sars.gov.za/faq/what-documents-will-be-required-in-order-to-enable-the-employee-to-submit-their-returns-accurately/).

| Selected situation | Checklist item and useful instruction |
| --- | --- |
| All filing users | Banking details and any SARS assessment/correspondence; check prepopulated data rather than assuming it is complete. |
| Salary/annuity | Each employer/fund IRP5 or IT3(a). |
| Interest/investments | Each IT3(b) and applicable foreign interest/dividend certificate; capital gain transaction records if assets disposed. |
| Medical | Medical scheme tax certificate plus invoices/receipts and proof for qualifying expenses not reimbursed; ITR-DD confirmation if claiming disability treatment. |
| Retirement | Pension/retirement annuity contribution certificates and applicable lump-sum/tax-directive records. |
| Business travel/company car | Contemporaneous logbook, allowance/vehicle details and costs if using actual-cost method. [SARS travel logbook](https://www.sars.gov.za/types-of-tax/personal-income-tax/travel-e-log-book/). |
| Donations | Section 18A receipt from an approved organisation for a claimed donation. |
| Rental, freelance or business | Income and expense records, invoices and financial statements where applicable. |
| Home office | Employer remote-work letter, floor plan/area calculation, photos of exclusively equipped space, duties/workdays schedule, actual invoices and payments, and deduction apportionment. |

The tool should not say every item is mandatory for every return. SARS says taxpayers **normally keep** supporting material rather than send it with the ITR12; submit the specific items only if SARS requests them. [SARS's upload FAQ](https://www.sars.gov.za/faq/how-do-i-upload-submit-supporting-documents/) says the correspondence letter identifies what is required and offers eFiling, MobiApp and SOQS routes. [SARS retention guidance](https://www.sars.gov.za/faq/faq-for-how-long-am-i-expected-to-keep-the-supporting-documents/) states at least five years from return submission; an ongoing audit or objection can require longer retention under [SARS record-keeping guidance](https://www.sars.gov.za/client-segments/record-keeping/). Do not collect identity numbers or upload documents to Joff merely to generate a checklist. Provide a printable/exportable result only if actually implemented.

### Checklist acceptance cases

- Selecting salary plus medical outputs one IRP5 item and both medical certificate and unreimbursed-cost evidence; no unrelated rental records.
- Selecting travel adds a logbook and distinguishes the extra actual-cost evidence when applicable.
- Selecting home office includes eligibility/evidence prompts and does not simply claim a deduction from floor area.
- Selecting nothing produces a useful basic preparation list and a prompt to check the SARS prefilled return.

## 3. Where Is My SARS Refund?

This must be a **self-reported status decoder**, headed “Check your actual status with SARS.” Link [SARS's refund-status instructions](https://www.sars.gov.za/latest-news/how-to-check-your-tax-refund-status/): MobiApp Home Screen → Refund Status; SARS WhatsApp **0800 11 7277** → “Hi” → Refund Status and authenticate in SARS's own channel; USSD **\*134\*7277#** → Option 3; [SOQS Tax Return Status Dashboard](https://www.sars.gov.za/guide-to-the-sars-online-query-system-soqs/) shows submission, verification/audit and refund processing for personal income tax, current and previous years. The user should enter ID/tax-reference data **only on the official SARS channel**, never into a Joff status form.

Ask a short sequence, with “I don't know” available: Has SARS completed an assessment/ITA34? Does it show a refund of R100 or more? Did SARS request banking verification, return verification/audit, supporting documents, or note outstanding returns/debt? Has the official status displayed a payment date? Show one primary next action and links, not an invented payout ETA:

| Self-reported branch | Guidance to display |
| --- | --- |
| Return not assessed, or status unknown | Check SARS return status/ITA34 in SOQS, eFiling or MobiApp. The 72-hour service target does **not** start at submission; [SARS says it begins after assessment is completed](https://www.sars.gov.za/faq/if-im-getting-a-refund-when-does-the-72-hours-start/), subject to conditions. |
| No amount due or amount below R100 | Check the ITA34/Income Tax Statement of Account. [SARS's auto-assessment page](https://www.sars.gov.za/types-of-tax/personal-income-tax/filing-season/how-does-auto-assessment-work/) says sub-R100 credits roll forward until the balance exceeds R100. |
| Bank details wrong or selected for verification | Update/check banking details **on eFiling/MobiApp**, respond to SARS's request with the required documents. [SARS delay FAQ](https://www.sars.gov.za/faq/what-could-delay-my-refund-from-being-paid-to-me/) describes up to 21 business days **after all requested material is received**, then a 72-hour payment target after validation. |
| Return selected for verification | Read SARS correspondence, submit only requested evidence via [official upload routes](https://www.sars.gov.za/faq/how-do-i-upload-submit-supporting-documents/) and check the case status. SARS describes up to 21 business days after complete material, followed by a 72-hour payment target if released. |
| Audit or multiple verified years | Follow SARS case correspondence. SARS describes up to 90 business days after complete supporting material in the applicable audit cases, subject to communicated arrangements. Do not promise a date. |
| Outstanding return or debt | Check outstanding returns and statement of account through SARS; submit missing returns. SARS may offset tax debt against a refund before release. |
| Assessed R100 or more, bank validated, no audit/verification, no debt or missing returns | SARS aims to pay nine out of ten due refunds within 72 hours **after assessment**. If not received, check official Refund Status and the [Income Tax Statement of Account](https://www.sars.gov.za/faq/faq-can-i-see-my-refund-amount-and-payment-date-or-the-payment-due-date-of-the-amount-owed-by-me-to-sars-on-efiling/) for a payment date; use [SOQS](https://www.sars.gov.za/contact-us/send-us-a-query/) or the [SARS Contact Centre](https://www.sars.gov.za/contact-us/contact-centre/) if the status remains unclear. SARS's published pages vary between “R100 or more” and “more than R100” for the target, so at exactly R100 avoid a promised timeframe and check the official status. |

The 72-hour figure is a service target, **not a guarantee**. The questionnaire must not display a “live” SARS status, claim a direct connection, ask for credentials, or imply SARS guarantees any refund. SARS warns against password, OTP and banking PIN requests in its [2026 filing page](https://www.sars.gov.za/types-of-tax/personal-income-tax/filing-season/). Do not name a specific verification/audit completion date from the user's assessment date because the clock depends on receipt of complete material.

### Refund acceptance cases

- Submitted yesterday but not assessed → no 72-hour countdown.
- Assessed R80 credit → rollover explanation, not “late refund.”
- Assessed R2,000, verification requested but no documents supplied → act on SARS letter, no 21-day countdown yet.
- Assessed R2,000, no blocker, 72 hours passed → official status/statement and query route, with no promised payout.
- Multiple blockers → show SARS case/correspondence and most actionable item, not contradictory generic timing.
