const { test }=require('node:test');
const assert=require('node:assert/strict');
const { join }=require('node:path');
const { CALCULATORS,evaluateCalculator }=require(join(process.env.JOFF_TEST_BUILD_DIRECTORY,'calculators.js'));
const { calculatorWidget,displayInput,stableEventUid,calendarText,calculatorPack,scenarioPeriod,activeCalculatorInputs,clearInactiveInputs }=require(join(process.env.JOFF_TEST_BUILD_DIRECTORY,'calculator-presentation.js'));
test('widget routing uses field type to keep car months numeric and medical months structured',()=>{
  assert.equal(calculatorWidget({id:'months',type:'text'}),'medicalMonths');assert.equal(calculatorWidget({id:'months',type:'number'}),'standard');assert.equal(calculatorWidget({id:'employees',type:'textarea'}),'payrollRows');
  assert.equal(displayInput({id:'months',type:'number'},'12'),'12');assert.match(displayInput({id:'months',type:'text'},'1,0,2,0,0,0,0,0,0,0,0,0'),/March: 1; April: 0; May: 2/);
});
test('calendar uses stable identities and date-only dates without timezone shift',()=>{
  const e={title:'2026 filing deadline',date:'2026-10-23',category:'nonprovisional',sourceUrl:'https://www.sars.gov.za/types-of-tax/personal-income-tax/filing-season/'};
  assert.equal(stableEventUid(e),stableEventUid({...e}));assert.notEqual(stableEventUid(e),stableEventUid({...e,date:'2027-01-22'}));
  const calendar=calendarText([e]).replace(/\r\n /g,'');assert.match(calendar,/DTSTART;VALUE=DATE:20261023/);assert.match(calendar,/DTEND;VALUE=DATE:20261024/);assert.match(calendar,new RegExp(`UID:${stableEventUid(e)}@joff-tax`));assert.doesNotMatch(calendar,/DTSTART;TZID/);
});
test('exports use actual financial/transaction period and retain supported or blocked scenario provenance',()=>{
  for(const id of ['property-transfer-cost','small-business-income-tax']){const d=CALCULATORS.find(c=>c.id===id),o=evaluateCalculator(id,2026,d.example),pack=calculatorPack(d,2026,d.example,o,true);assert.equal(pack.assessmentYear,null);assert.equal(pack.period,o.provenance.period);assert.equal(scenarioPeriod(d,2026,o),o.provenance.period);assert.equal(pack.example,true);}
  const d=CALCULATORS.find(c=>c.id==='tax-bracket'),o=evaluateCalculator(d.id,2027,d.example),pack=calculatorPack(d,2027,d.example,o,false);assert.equal(pack.assessmentYear,2027);assert.match(pack.period,/1 March 2026.*28 February 2027/);
});
test('switching modes clears inactive values and exported active inputs cannot include hidden monetary scenarios',()=>{
  const d=CALCULATORS.find(c=>c.id==='retirement-savings'),a={...d.example,mode:'taxSaving',opening:'not-a-number',payment:'999999'};
  const cleared=clearInactiveInputs(d,a),active=activeCalculatorInputs(d,cleared);
  assert.equal(cleared.opening,'');assert.equal(cleared.payment,'');assert.equal(active.opening,undefined);assert.equal(active.payment,undefined);
  assert.equal(evaluateCalculator(d.id,2026,a).status,'supported','Only active declared fields enter the selected mode; forged unknown keys still fail separately.');
});
