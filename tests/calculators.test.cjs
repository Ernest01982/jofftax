const { test } = require('node:test');
const assert = require('node:assert/strict');
const { join } = require('node:path');
const { CALCULATORS, evaluateCalculator } = require(join(process.env.JOFF_TEST_BUILD_DIRECTORY, 'calculators.js'));
const close=(actual,expected,tolerance=1e-6)=>assert.ok(Math.abs(actual-expected)<tolerance,`${actual} differs from independent expected ${expected}`);
const item=(out,label)=>{assert.equal(out.status,'supported',JSON.stringify(out));const result=out.items.find(i=>i.label===label);assert.ok(result,`Missing ${label}`);return result.value;};
const example=id=>structuredClone(CALCULATORS.find(c=>c.id===id).example);

test('36-item inventory is truthful: unique IDs, live engines, explicit pending contracts',()=>{
  assert.equal(CALCULATORS.length,36);
  assert.equal(new Set(CALCULATORS.map(c=>c.id)).size,36);
  for(const def of CALCULATORS){assert.ok(def.scopeSummary&&def.comparisonKey);if(def.contractAvailability==='live'){assert.ok(def.fields.length&&def.example);const out=evaluateCalculator(def.id,2026,def.example);assert.equal(out.status,'supported');assert.ok(out.primaryResultLabel&&out.items.some(i=>i.label===out.primaryResultLabel));}else{const out=evaluateCalculator(def.id,2026,{});assert.equal(out.status,'blocked');assert.deepEqual(out.items,[]);assert.ok(out.blockers.length);}}
});
test('salary planning has independent annual/monthly/UIF fixtures and partial-year blocker',()=>{
  for(const [year,tax,net] of [[2026,57397,25039.79666666667],[2027,56172,25141.88]]){
    const a=example('income-tax');const out=evaluateCalculator('income-tax',year,a);
    close(item(out,'Annual taxable remuneration'),360000);close(item(out,'Estimated annual normal tax'),tax);
    close(item(out,'Monthly employee UIF'),177.12);close(item(out,'Monthly employer UIF'),177.12);close(item(out,'Monthly take-home planning amount'),net);
    a.uifEligible='no';close(item(evaluateCalculator('income-tax',year,a),'Monthly take-home planning amount'),year===2026?25216.91666666667:25319);
    a.levelYear='no';assert.equal(evaluateCalculator('income-tax',year,a).status,'blocked');
  }
  const actual=example('tax-bracket');actual.income='90000';assert.equal(item(evaluateCalculator('tax-bracket',2026,actual),'Estimated annual normal tax'),0);
});
test('annual bonus is incremental normal tax, not a new flat rate or withholding promise',()=>{
  for(const [year,tax,net] of [[2026,8775,21225],[2027,8145,21855]]){const out=evaluateCalculator('bonus-tax',year,example('bonus-tax'));assert.equal(item(out,'Incremental annual normal tax'),tax);assert.equal(item(out,'Bonus after this tax component'),net);assert.match(out.assumptions.join(' '),/not a promise/);}
});
test('hourly conversion uses entered paid schedule without hidden52weeks',()=>{
  const out=evaluateCalculator('hourly-to-salary',2026,example('hourly-to-salary'));assert.equal(item(out,'Annual gross pay equivalent'),288000);assert.equal(item(out,'Monthly gross pay equivalent'),24000);
  const a=example('hourly-to-salary');a.weeks='0';assert.equal(item(evaluateCalculator('hourly-to-salary',2027,a),'Annual gross pay equivalent'),0);
});
test('netgross inversion recovers selected-period net at zero, ordinary and upper-bound scenarios',()=>{
  for(const year of [2026,2027])for(const unit of ['monthly','annual'])for(const target of ['0','5000','25000','100000']){
    const a={...example('net-to-gross'),unit,target};const out=evaluateCalculator('net-to-gross',year,a);
    close(item(out,'Recovered take-home in selected period'),Number(target),.010001);
    assert.ok(item(out,'Annual gross equivalent')>=Number(target)*(unit==='monthly'?12:1));
  }
  const a={...example('net-to-gross'),target:'100000000'};assert.equal(evaluateCalculator('net-to-gross',2026,a).status,'invalid');
});
test('UIF independently checks ceiling and VAT direction arithmetic',()=>{
  for(const [monthly,contribution] of [[0,0],[10000,100],[17711,177.11],[17712,177.12],[17713,177.12],[30000,177.12]])close(item(evaluateCalculator('uif',2026,{mode:'contributions',monthly:String(monthly),eligible:'yes'}),'Monthly employee UIF'),contribution);
  for(const [mode,amount] of [['exclusive','100'],['inclusive','115']]){const out=evaluateCalculator('vat',2027,{mode,amount,standard:'yes'});close(item(out,'VAT at 15%'),15);close(item(out,'Amount excluding VAT'),100);close(item(out,'Amount including VAT'),115);}
});
test('every live calculator rejects malformed or forged inputs and missing/unknown gates without results',()=>{
  for(const def of CALCULATORS.filter(c=>c.contractAvailability==='live')){
    assert.equal(evaluateCalculator(def.id,2026,{...def.example,result:'0'}).status,'invalid');
    assert.deepEqual(evaluateCalculator(def.id,2026,{}).items,[]);
    for(const field of def.fields){if(field.visibleWhen&&!field.visibleWhen.values.includes(def.example[field.visibleWhen.field]))continue;const a=example(def.id);a[field.id]='';if(field.required!==false)assert.notEqual(evaluateCalculator(def.id,2026,a).status,'supported');
      if(field.type==='number')for(const value of ['NaN','Infinity',(field.min<0?'-1000':'-1'),'1e4',' 1','100000000000']){const b=example(def.id);b[field.id]=value;const out=evaluateCalculator(def.id,2026,b);assert.equal(out.status,'invalid');assert.deepEqual(out.items,[]);}
      if(field.type==='choice'){const b=example(def.id);b[field.id]='unsure';const out=evaluateCalculator(def.id,2026,b);if(def.mode==='tracker')assert.equal(out.status,'supported');else{assert.equal(out.status,'blocked');assert.deepEqual(out.items,[]);}}
    }
  }
});
test('annual balance does not annualize an entered annual amount or promise a refund',()=>{
  const out=evaluateCalculator('tax-refund',2026,example('tax-refund'));assert.equal(item(out,'Estimated annual normal tax'),57397);assert.equal(item(out,'Possible overpayment'),2603);assert.match(out.assumptions.join(' '),/not a guaranteed refund/);
  const forecast=evaluateCalculator('tax-bracket',2027,example('tax-bracket'));assert.match(forecast.assumptions.join(' '),/subject to legislation/);assert.ok(forecast.provenance.sources.length);
});

test('interest/dividend/rental components use independently checked exclusions and tax increments',()=>{
  const interest=example('local-interest');assert.equal(item(evaluateCalculator('local-interest',2026,interest),'Taxable local interest'),6200);interest.age='65to74';assert.equal(item(evaluateCalculator('local-interest',2027,interest),'Taxable local interest'),0);
  const dividend=evaluateCalculator('taxable-foreign-dividends',2026,example('taxable-foreign-dividends'));assert.equal(item(dividend,'Taxable foreign-dividend component'),20000);assert.equal(item(dividend,'Exempt foreign-dividend component'),25000);assert.match(dividend.assumptions.join(' '),/No foreign withholding/);
  for(const [year,tax]of [[2026,27375],[2027,26745]])assert.equal(item(evaluateCalculator('rental-income-tax',year,example('rental-income-tax')),'Incremental annual normal tax'),tax);
  const rental=example('rental-income-tax');rental.expenses='130000';const loss=evaluateCalculator('rental-income-tax',2026,rental);assert.equal(item(loss,'Rental profit / loss component'),-10000);assert.ok(!loss.items.some(i=>i.label.includes('Incremental')));assert.equal(loss.resultKind,'guide');
});
test('cumulative lump-sum fixtures and every published table boundary do not reset tax-free bands',()=>{
  const base=example('retirement-fund-lump-sum-tax');assert.equal(item(evaluateCalculator('retirement-fund-lump-sum-tax',2026,base),'Current benefit table tax'),9000);
  base.amount='100000';base.priorRetirement='500000';assert.equal(item(evaluateCalculator('retirement-fund-lump-sum-tax',2027,base),'Current benefit table tax'),9000);
  base.priorRetirement='0';base.benefit='withdrawal';assert.equal(item(evaluateCalculator('retirement-fund-lump-sum-tax',2027,base),'Current benefit table tax'),13050);
  for(const [type,edges]of [['retirement',[[550000,0,0,.18],[770000,39600,.18,.27],[1155000,143550,.27,.36]]],['withdrawal',[[27500,0,0,.18],[726000,125730,.18,.27],[1089000,223740,.27,.36]]]])for(const [edge,tax,before,after]of edges)for(const delta of [-1,0,1]){
    const a={...example('retirement-fund-lump-sum-tax'),benefit:type,amount:String(edge+delta)};close(item(evaluateCalculator('retirement-fund-lump-sum-tax',2026,a),'Current benefit table tax'),tax+delta*(delta<=0?before:after),.0051);
  }
  const cross={...example('retirement-fund-lump-sum-tax'),amount:'100000',priorRetirement:'200000',priorWithdrawals:'200000',priorSeverance:'100000'};assert.equal(item(evaluateCalculator('retirement-fund-lump-sum-tax',2026,cross),'Current benefit table tax'),9000);
  cross.historyKnown='unsure';assert.deepEqual(evaluateCalculator('retirement-fund-lump-sum-tax',2026,cross).items,[]);
});
test('retrenchment separates severance and ordinary pay; two-pot uses normal tax rather than withdrawal table',()=>{
  const severance=evaluateCalculator('retrenchment-tax',2026,example('retrenchment-tax'));assert.equal(item(severance,'Qualifying severance-table tax'),9000);assert.equal(item(severance,'Separate ordinary-income tax increment'),8775);
  const pot=evaluateCalculator('two-pot-calculator',2026,example('two-pot-calculator'));assert.equal(item(pot,'Incremental annual normal tax'),8775);assert.equal(item(pot,'Withdrawal after this tax component'),21225);assert.match(pot.assumptions.join(' '),/Excludes fund fees/);
});
test('transfer duty follows acquisition dates and SBC follows normal company financial-year ends',()=>{
  const property=example('property-transfer-cost');assert.equal(item(evaluateCalculator('property-transfer-cost',2027,property),'Transfer duty component'),33786);
  property.acquired='2025-03-31';assert.equal(evaluateCalculator('property-transfer-cost',2027,property).status,'blocked');property.acquired='2026-02-30';assert.equal(evaluateCalculator('property-transfer-cost',2026,property).status,'invalid');
  for(const [value,tax]of [[1210000,0],[1663800,13614],[2329300,53544],[2994800,106784],[13310000,1241456],[13310001,1241456.13]]){const a={...example('property-transfer-cost'),value:String(value)};close(item(evaluateCalculator('property-transfer-cost',2026,a),'Transfer duty component'),tax);}
  for(const [yearEnd,tax]of [['2026-03-31',47198],['2026-04-01',46970],['2027-03-31',46970]]){const a={...example('small-business-income-tax'),yearEnd};assert.equal(item(evaluateCalculator('small-business-income-tax',2026,a),'SBC normal tax'),tax);}
  const sbc=example('small-business-income-tax');sbc.normalYear='no';assert.equal(evaluateCalculator('small-business-income-tax',2026,sbc).status,'blocked');
});
test('travel verified cost-scale fixtures, gazetted126.9, allowance cap and matching-period safeguards',()=>{
  const travel=example('travel-allowance');assert.equal(item(evaluateCalculator('travel-allowance',2026,travel),'Illustrative allowance deduction'),68078.5);
  travel.vehicleCost='345000';close(item(evaluateCalculator('travel-allowance',2027,travel),'Illustrative allowance deduction'),72244.5);
  travel.vehicleCost='900000';travel.businessKm='1000';close(item(evaluateCalculator('travel-allowance',2027,travel),'Illustrative allowance deduction'),15353.95);
  travel.allowance='1000';assert.equal(item(evaluateCalculator('travel-allowance',2027,travel),'Illustrative allowance deduction'),1000);
  travel.businessKm='20001';assert.equal(evaluateCalculator('travel-allowance',2027,travel).status,'invalid');
  const actual=example('travel-allowance');actual.method='actual';assert.equal(evaluateCalculator('travel-allowance',2026,actual).status,'invalid');actual.actualCosts='120000';assert.equal(item(evaluateCalculator('travel-allowance',2026,actual),'Illustrative allowance deduction'),60000);
});
test('company-car determined-value maintenance and assessment ratio fixtures differ from withholding',()=>{
  const car=example('company-car-tax');let out=evaluateCalculator('company-car-tax',2026,car);close(item(out,'Monthly gross car benefit'),14000);close(item(out,'Annual gross car benefit'),168000);close(item(out,'Assessment benefit after verified business-use ratio'),126000);
  car.plan='yes';out=evaluateCalculator('company-car-tax',2026,car);close(item(out,'Monthly gross car benefit'),13000);close(item(out,'Annual gross car benefit'),156000);
  car.businessKm='20000';assert.equal(item(evaluateCalculator('company-car-tax',2026,car),'Assessment benefit after verified business-use ratio'),0);
});
test('payroll multiple rows, employer-only SDL and500000 exemption remain separate components',()=>{
  const payroll=example('payroll-tax');payroll.employees='[{"monthly":"30000","age":"under65","uifEligible":"yes"},{"monthly":"10000","age":"75plus","uifEligible":"no"}]';const out=evaluateCalculator('payroll-tax',2026,payroll);close(item(out,'Total monthly employee take-home'),35039.79666666667);assert.equal(item(out,'Employer monthly UIF'),177.12);assert.equal(item(out,'Employer monthly SDL'),0);
  payroll.sdl='liable';payroll.expectedAnnual='500000';assert.equal(evaluateCalculator('payroll-tax',2026,payroll).status,'blocked');payroll.expectedAnnual='500000.01';payroll.leviable='45000';assert.equal(item(evaluateCalculator('payroll-tax',2026,payroll),'Employer monthly SDL'),450);
  payroll.otherSdlExemption='yes';assert.equal(evaluateCalculator('payroll-tax',2026,payroll).status,'blocked');payroll.otherSdlExemption='no';
  payroll.employees='[{"monthly":"30000","age":"under65","uifEligible":"yes","name":"fictional"}]';assert.equal(evaluateCalculator('payroll-tax',2026,payroll).status,'invalid');
});
test('medical and retirement standalone tools preserve approved premium-only/full-reconciliation contracts',()=>{
  const med=example('medical-aid-credits');const out=evaluateCalculator('medical-aid-credits',2026,med);close(item(out,'Annual medical scheme credit (MTC)'),4368);close(item(out,'Additional medical credit (AMTC)'),7624.368);assert.equal(item(out,'Normal tax after these credits'),92595.63);med.expensesKnown='no';assert.equal(evaluateCalculator('medical-aid-credits',2026,med).status,'blocked');
  const ra=evaluateCalculator('retirement-savings',2026,example('retirement-savings'));assert.equal(item(ra,'Allowed deduction'),60000);assert.equal(item(ra,'Taxable income after deduction'),540000);assert.equal(item(ra,'Estimated contribution tax saving'),21600);
});

test('CGT sequence preserves assessed loss against excluded gains and reduces current loss by exclusion',()=>{
  for(const [year,inclusion]of [[2026,64000],[2027,60000]])assert.equal(item(evaluateCalculator('capital-gains-tax',year,example('capital-gains-tax')),'Taxable capital-gain inclusion'),inclusion);
  const gain={...example('capital-gains-tax'),gains:'30000',priorLoss:'100000'};assert.equal(item(evaluateCalculator('capital-gains-tax',2027,gain),'Remaining assessed capital loss'),100000);assert.equal(item(evaluateCalculator('capital-gains-tax',2027,gain),'Taxable capital-gain inclusion'),0);
  gain.gains='0';gain.losses='60000';assert.equal(item(evaluateCalculator('capital-gains-tax',2027,gain),'Remaining assessed capital loss'),110000);
  const crypto={...example('crypto-tax'),classification:'revenue',tradingProfit:'100000'};assert.equal(item(evaluateCalculator('crypto-tax',2026,crypto),'Incremental annual normal tax'),30475);crypto.classification='unsure';assert.equal(evaluateCalculator('crypto-tax',2026,crypto).status,'blocked');
});
test('donor donations annual exemption and cumulative30m boundary use complete gift history',()=>{
  assert.equal(item(evaluateCalculator('donations-tax',2027,example('donations-tax')),'Donor donations tax on this event'),10000);
  const cross={...example('donations-tax'),gift:'400000',priorYearGifts:'150000',priorTaxableGifts:'29900000'};assert.equal(item(evaluateCalculator('donations-tax',2027,cross),'Donor donations tax on this event'),95000);
  const contradiction={...example('donations-tax'),priorYearGifts:'200000',priorTaxableGifts:'0'};assert.equal(evaluateCalculator('donations-tax',2027,contradiction).status,'blocked');
});
test('TFSA annual-only levy never fabricates a combined lifetime-breach tax',()=>{
  const a=example('tfsa-calculator');assert.equal(item(evaluateCalculator('tfsa-calculator',2027,a),'Annual-only excess-tax illustration'),1600);
  a.lifetime='490000';const out=evaluateCalculator('tfsa-calculator',2027,a);assert.equal(item(out,'Current annual contribution excess'),4000);assert.equal(item(out,'Lifetime contribution excess'),40000);assert.ok(!out.items.some(i=>i.label==='Annual-only excess-tax illustration'));assert.match(item(out,'Tax estimate unavailable'),/historic/);
});
test('medical qualifying expenses standalone expand only independent calculator, retaining no-disability gates',()=>{
  const a={...example('medical-aid-credits'),income:'270000',age:'under65',expenses:'20000'};const out=evaluateCalculator('medical-aid-credits',2026,a);assert.equal(item(out,'Additional medical credit (AMTC)'),4569.5);assert.equal(item(out,'Normal tax after these credits'),25059.5);
  a.age='65to74';close(item(evaluateCalculator('medical-aid-credits',2026,a),'Additional medical credit (AMTC)'),14284.368);a.disability='unsure';assert.equal(evaluateCalculator('medical-aid-credits',2026,a).status,'blocked');
});
test('provisional first/second planning and linear basic uplift have explicit credit/history gates',()=>{
  const first=example('provisional-tax');assert.equal(item(evaluateCalculator('provisional-tax',2026,first),'Provisional instalment planning amount'),8698.5);
  const second={...first,period:'second',credits:'20000',firstPaid:'10000'};assert.equal(item(evaluateCalculator('provisional-tax',2026,second),'Provisional instalment planning amount'),27397);second.credits='100000';assert.equal(item(evaluateCalculator('provisional-tax',2026,second),'Provisional instalment planning amount'),0);
  const basic={period:'basic',assessed:'195000',elapsedYears:'4',oldAssessment:'yes',assessmentKnown:'yes'};assert.equal(item(evaluateCalculator('provisional-tax',2027,basic),'Illustrative basic amount'),257400);basic.elapsedYears='0';assert.equal(evaluateCalculator('provisional-tax',2027,basic).status,'blocked');
  const status={...example('am-i-a-provisional-taxpayer'),taxableTotal:'99000',specified:'30001',otherIncome:'yes'};assert.match(item(evaluateCalculator('am-i-a-provisional-taxpayer',2027,status),'Conditional screening outcome'),/exclusion may apply/);status.commissionerNotice='yes';assert.equal(evaluateCalculator('am-i-a-provisional-taxpayer',2027,status).status,'blocked');status.commissionerNotice='no';status.otherIncome='no';assert.equal(evaluateCalculator('am-i-a-provisional-taxpayer',2027,status).status,'blocked');
});
test('retirement/TFSA projections define timing/rates, zero horizon and declining growth explicitly',()=>{
  const a={mode:'growth',opening:'10000',payment:'1000',frequency:'monthly',timing:'end',years:'1',growth:'0',inflation:'0'};for(const id of ['retirement-savings','tfsa-calculator']){assert.equal(item(evaluateCalculator(id,2026,a),'Projected nominal investment balance'),22000);assert.equal(evaluateCalculator(id,2026,a).resultKind,'projection');}
  a.years='0';assert.equal(item(evaluateCalculator('retirement-savings',2026,a),'Projected nominal investment balance'),10000);a.years='1';a.growth='-50';a.payment='0';close(item(evaluateCalculator('retirement-savings',2026,a),'Projected nominal investment balance'),5000);
  a.frequency='annual';a.growth='10';a.payment='1000';a.timing='begin';close(item(evaluateCalculator('retirement-savings',2026,a),'Projected nominal investment balance'),12100);a.timing='end';close(item(evaluateCalculator('retirement-savings',2026,a),'Projected nominal investment balance'),12000);
});
test('partial full-period withholding and actual annual assessment remain separate numbers',()=>{
  const a={mode:'payrollPeriod',periodPay:'90000',fullPeriods:'12',workedPeriods:'3',periodScope:'yes',age:'under65',resident:'yes',simple:'yes'};
  for(const [year,withholding]of [[2026,14349.25],[2027,14043]]){const out=evaluateCalculator('hourly-to-salary',year,a);assert.equal(item(out,'Annual-equivalent ordinary remuneration'),360000);assert.equal(item(out,'Prorated worked-period withholding illustration'),withholding);assert.equal(item(out,'Actual annual assessment if only the entered period remuneration exists'),0);}
  const raise={...example('net-to-gross'),mode:'raise',currentGross:'30000',target:'1000'};close(item(evaluateCalculator('net-to-gross',2026,raise),'Recovered net raise in selected period'),1000,.010001);
});
test('UIF official1:4 unemployment credits and first238/late20% tiers are independently tested',()=>{
  const a={mode:'unemployment',monthly:'17712',eligible:'yes',history:'yes',contributingDays:'1460',requestedDays:'365'};close(item(evaluateCalculator('uif',2026,a),'Estimated benefit for these known days'),67455.06016438357,.00001);
  a.contributingDays='400';assert.equal(item(evaluateCalculator('uif',2026,a),'Illustrated payable days'),100);a.contributingDays='3';assert.equal(item(evaluateCalculator('uif',2026,a),'Estimated benefit for these known days'),0);
  a.contributingDays='1460';a.requestedDays='238';const at238=item(evaluateCalculator('uif',2026,a),'Estimated benefit for these known days');a.requestedDays='239';close(item(evaluateCalculator('uif',2026,a),'Estimated benefit for these known days')-at238,116.462465753425,.00001);
  a.history='unsure';a.contributingDays='';const limited=evaluateCalculator('uif',2026,a);assert.equal(limited.status,'blocked');assert.ok(limited.items.some(i=>i.label.includes('daily')));assert.ok(!limited.items.some(i=>i.label.includes('Estimated benefit')||i.label.includes('credit days')));
});
test('illness Act IRR differs from maternity66%, with uncapped wage shortfall, history and seven-day gates',()=>{
  const illness={mode:'illness',monthly:'30000',leavePay:'0',eligible:'yes',history:'yes',requestedDays:'239',availableDays:'365',certified:'yes'};
  const i=evaluateCalculator('uif',2026,illness);close(item(i,'Illustrative daily wage-shortfall top-up'),221.2786849315,.00001);assert.match(i.provenance.sources[0].title,/Binding UIF/);
  const maternity={mode:'maternity',monthly:'30000',leavePay:'0',eligible:'yes',history:'yes',requestedDays:'365',availableDays:'365',employment13:'yes'};close(item(evaluateCalculator('uif',2026,maternity),'Illustrative daily wage-shortfall top-up'),384.3261369863,.00001);assert.equal(item(evaluateCalculator('uif',2026,maternity),'Known eligible days used'),121);
  illness.leavePay='25000';close(item(evaluateCalculator('uif',2026,illness),'Illustrative daily wage-shortfall top-up'),164.3835616438,.00001);illness.leavePay='30000';assert.equal(item(evaluateCalculator('uif',2026,illness),'Estimated benefit for these known days'),0);illness.requestedDays='6';assert.equal(evaluateCalculator('uif',2026,illness).status,'blocked');
});
test('guides give full published dates, deduplicated evidence and unknown-safe self-reported refund next steps',()=>{
  const deadline=evaluateCalculator('tax-deadlines',2026,{category:'provisional',today:'2026-10-07'});assert.ok(deadline.calendarEvents.some(e=>e.date==='2026-07-13'));assert.ok(deadline.calendarEvents.some(e=>e.date==='2027-01-22'));assert.ok(deadline.calendarEvents.some(e=>e.date==='2026-08-31'));assert.ok(!deadline.calendarEvents.some(e=>e.date==='2027-02-26'));assert.match(deadline.items.map(i=>i.value).join(' '),/derived/);
  const docs=evaluateCalculator('tax-return-documents',2026,example('tax-return-documents'));assert.equal(docs.items.filter(i=>i.label.includes('IRP5')).length,1);assert.ok(docs.items.some(i=>i.label.includes('Medical scheme')));assert.ok(!docs.items.some(i=>i.label.includes('Rental')));
  const submitted=evaluateCalculator('where-is-my-sars-refund',2026,{assessed:'no'});assert.match(item(submitted,'Primary next action'),/No 72-hour countdown/);
  const low={...example('where-is-my-sars-refund'),assessed:'yes',refund:'80'};assert.match(item(evaluateCalculator('where-is-my-sars-refund',2026,low),'Primary next action'),/roll forward/);low.refund='100';assert.match(item(evaluateCalculator('where-is-my-sars-refund',2026,low),'Primary next action'),/exactly R100/);
});
test('unsupported runtime year values return invalid without dereferencing a nonexistent rules object',()=>{
  for(const year of [0,2028,'2026',undefined,null]){const out=evaluateCalculator('income-tax',year,example('income-tax'));assert.equal(out.status,'invalid');assert.deepEqual(out.items,[]);}
});
test('affirmative no-scheme medical costs use F=M=0 without treating unknown or unsupported schemes as absent',()=>{
  const a={...example('medical-aid-credits'),registered:'noScheme',fees:'0',months:'0,0,0,0,0,0,0,0,0,0,0,0',income:'270000',age:'under65',expenses:'30000'};let out=evaluateCalculator('medical-aid-credits',2026,a);assert.equal(item(out,'Annual medical scheme credit (MTC)'),0);assert.equal(item(out,'Additional medical credit (AMTC)'),2437.5);assert.equal(item(out,'Normal tax after these credits'),31559.5);
  a.age='65to74';a.expenses='10000';close(item(evaluateCalculator('medical-aid-credits',2026,a),'Additional medical credit (AMTC)'),3330);a.fees='1';assert.equal(evaluateCalculator('medical-aid-credits',2026,a).status,'blocked');a.fees='0';a.registered='unsure';assert.equal(evaluateCalculator('medical-aid-credits',2026,a).status,'blocked');
});
test('all gazetted travel band boundaries choose the independently transcribed cost scale',()=>{
  const references={2026:[[100000,33940,146.7,47.4],[200000,60688,163.8,59.3],[300000,87497,177.9,65.4],[400000,111273,191.4,71.4],[500000,135048,204.8,83.9],[600000,159934,234.9,98.5],[700000,184867,238.9,110.5],[800000,211121,242.9,122.5],[100000000,211121,242.9,122.5]],2027:[[115000,38344,132.9,49.1],[230000,68487,148.4,61.4],[345000,98689,161.2,67.8],[460000,125393,173.4,74],[575000,152097,185.5,86.9],[690000,180078,212.8,102],[805000,208106,216.5,114.5],[920000,237679,220.1,126.9],[100000000,237679,220.1,126.9]]};
  for(const [year,rows]of Object.entries(references))for(let i=0;i<rows.length-1;i++)for(const delta of [-.01,0,.01]){const selected=delta>0?rows[i+1]:rows[i],expected=selected[1]/10+(selected[2]+selected[3])*10,a={...example('travel-allowance'),vehicleCost:String(rows[i][0]+delta),totalKm:'10000',businessKm:'1000'};close(item(evaluateCalculator('travel-allowance',Number(year),a),'Illustrative allowance deduction'),expected);}
});
