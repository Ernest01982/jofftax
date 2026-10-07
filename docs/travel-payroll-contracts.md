# Travel, company-car and payroll research contracts

Checked 7 October 2026. Research by root for Astra plan/formula review; these contracts are not implementation approval by themselves.

## Travel deduction

Primary 2026 schedule (Notice 5936, GG52199, effective 1 March 2025): https://www.sars.gov.za/wp-content/uploads/Legal/SecLegis/Legal-LSec-IT-GN-2025-03-Notice-5936-GG-52199-Budget-2025-Rates-per-Kilometre-28-February-2025.pdf

Primary 2027 notice schedule, linked by SARS Legal Counsel, effective 1 March 2026: https://www.sars.gov.za/wp-content/uploads/IncomeTaxNotices/Legal-LSec-IT-GN-2026-03-Budget-2026-Rate-per-kilometre-iro-motor-vehicles-27-February-2026.pdf

Publication notice: https://www.sars.gov.za/latest-news/legal-counsel-secondary-legislation-income-tax-notices-2026-2/ identifies Notice 7182, GG54218, 27 February 2026. The linked schedule has a blank cover notice number; preserve that provenance distinction.

Table rows are inclusive upper vehicle value, annual fixed rand, fuel cents/km, maintenance cents/km:

| 2026 upper value | Fixed | Fuel | Maintenance |
|---|---|---|---|
|100000|33940|146.7|47.4|
|200000|60688|163.8|59.3|
|300000|87497|177.9|65.4|
|400000|111273|191.4|71.4|
|500000|135048|204.8|83.9|
|600000|159934|234.9|98.5|
|700000|184867|238.9|110.5|
|800000|211121|242.9|122.5|
|Above800000|211121|242.9|122.5|

| 2027 upper value | Fixed | Fuel | Maintenance |
|---|---|---|---|
|115000|38344|132.9|49.1|
|230000|68487|148.4|61.4|
|345000|98689|161.2|67.8|
|460000|125393|173.4|74.0|
|575000|152097|185.5|86.9|
|690000|180078|212.8|102.0|
|805000|208106|216.5|114.5|
|920000|237679|220.1|126.9|
|Above920000|237679|220.1|126.9|

Conflict: employer annex revision19 prints 126.1 for the 805000–920000 maintenance band; the notice schedule prints 126.9 in every language. Prefer the notice schedule and retain a regression fixture for 126.9. Do not silently copy the conflicting guide.

Supported educational cost-scale model: one personally owned vehicle, fixed travel allowance, verified logbook. Enter vehicle original acquisition cost including VAT but excluding finance charges, annual allowance, total kilometres for matching use period, business kilometres excluding commute, days available for business use (1–365), whether recipient bore all fuel and all maintenance costs. Eligibility/records answers blank or unsure block the deduction. Business distance must not exceed total; zero total cannot divide. Annual fixed component is prorated by days/365, divided by total distance; add eligible fuel and maintenance cents divided by100. Deduction illustration=min(allowance,businessKm*(proratedFixed/totalKm+fuelRand+maintenanceRand)). Show cost amount separately from capped allowance deduction. No final overall tax refund or guarantee.

Independent fixtures: 2026 costR300000,365days,total20000,business10000,bothcosts borne,allowance100000 => fixed/km4.37485+1.779+.654=6.80785; cost/deduction68078.50. 2027 cost345000 same distance =>4.93445+1.612+.678=7.22445;72244.50. 2027 cost900000,total20000,business1000,bothcosts,365days =>15353.95 (11883.95+2201+1269). Test allowance cap and all band boundaries.

Actual-cost comparison can accept independently verified qualifying total costs for matching period and multiply by business/total then cap at allowance, with clear input requirement. Do not invent financing/depreciation eligibility or claim max of methods automatically legal. Simplified reimbursive rate is4.76 in2026 and4.95 in2027; NOT automatically a second deduction against a fixed allowance. Its strict separate condition excludes additional compensation other than parking/tolls.

Context: https://www.sars.gov.za/tax-rates/employers/rates-per-kilometre/ and https://www.sars.gov.za/types-of-tax/personal-income-tax/travel-e-log-book/

## Employer-owned car benefit

Primary source: https://www.sars.gov.za/guide-for-employers-in-respect-of-fringe-benefits/ section Right of use of a Motor Vehicle.

Safest supported calculator receives the already correctly determined value (including any pre-grant 15% reducing balance allowance for each completed12months), not silently assumes a retail purchase price is determined value. Non-operating-lease employer-owned car only, full-month equivalent1–12, no employee consideration or personally borne fuel/maintenance adjustments, no multiplecars/sharedpool/exemption. Monthly benefit=value*0.035, or*0.0325 only if maintenance plan was included in purchase price at acquisition. Annual gross benefit=monthly*months. Optional assessment business-use reduction uses independently kept logbook business/total; compare benefit before/after only under narrow no-adjustment facts. Do not present benefit as tax: incremental estimated annual tax may be T(otherTaxableIncome+benefit)-T(otherTaxableIncome), separate from actual PAYE. Full benefit used for assessment; PAYE inclusion80% or20% is not finalassessment tax. Values/answer unknown block relevant estimate.

Independent fixtures: determined400000,12fullmonths,no maintenance plan=>14000/month,168000/year; withplan=>13000/month,156000/year. No-plan25%business verifiedlogbook=>126000 assessment benefit. Zero/100%business endpoints. Costs paid by employee need separate reviewed extension.

## UIF and payroll

Primary source: https://www.sars.gov.za/types-of-tax/unemployment-insurance-fund/ current page updated19August2026. Eligible employee and employer each pay1% of monthly UIF-liable remuneration capped17712. Thus each max177.12/month; combined354.24. One employer relationship. Excluded: employment less24hours/month, specified national/provincial government employees/publicoffice roles. Need eligibility answer, do not infer everyoneeligible. Contribution calculator is not unemploymentbenefit estimation. R10000=>100each;R17712=>177.12each;R30000=>177.12each. Zero0. 2026 and2027same.

SDL official detailed page: https://www.sars.gov.za/types-of-tax/skills-development-levy/ exemption where leviable remuneration for all employees over next12months will not exceed500000. Employer statutory SDL exclusions may apply. 1% of eligible leviable monthly amount only if liable. Detailed employer guide says deduct permitted retirement/donation contributions from relevant remuneration and exclude exempt components: https://www.sars.gov.za/guide-for-employers-in-respect-of-employees-tax-2027/ . Do not treat all gross cash as universal SDL base. Best UI takes confirmed SDL liability plus explicitly defined leviable amount; if simple salary payroll model, restrict to unchanged ordinary salaries and no deductions/benefits. Employer SDL is not employee deduction. Exactly500000 future leviable total falls within exemption under detailed source, despite loose FAQ wording less-than.

Salary/netgross/hourly/bonus/payload tax: existing approved annual brackets may be reused only with explicit equal12month ordinary salary scenario and ageband. Annualtax/12 is a level-year monthly planning estimate, not a universal payslip rule for partialyear or irregularperiods. Gross-to-net includes only stated PAYEandUIF; pensions, medical, other deductions require their own scope. Do not annualise already actual annual income for refundestimate. Bonus tax is T(annualsalary+bonus)-T(annualsalary), incremental scenario before othercredits/deductions, not directive calculation.
