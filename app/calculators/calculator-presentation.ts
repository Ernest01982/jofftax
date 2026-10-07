import type { CalculatorDefinition, CalculatorOutcome, CalculatorField } from '../../lib/calculators';
import { calculatorContext, calculatorFields } from '../../lib/calculators';
import { period, type AssessmentYear } from '../../lib/rules';

export function formatValue(value: number | string, format?: string): string {
  if (typeof value === 'string') return value;
  if (format === 'currency') {
    return new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR', maximumFractionDigits: 2 }).format(value);
  }
  if (format === 'percent') return `${new Intl.NumberFormat('en-ZA', { maximumFractionDigits: 2 }).format(value)}%`;
  return new Intl.NumberFormat('en-ZA', { maximumFractionDigits: 4 }).format(value);
}

export function calculatorPack(
  calculator: CalculatorDefinition,
  year: AssessmentYear,
  inputs: Record<string, string>,
  outcome: CalculatorOutcome,
  example: boolean,
) {
  const activeInputs = activeCalculatorInputs(calculator, inputs);
  const context = calculatorContext(calculator, inputs);
  const activeFields = calculatorFields(calculator, inputs).filter((field) => Object.prototype.hasOwnProperty.call(activeInputs, field.id));
  return {
    document: 'Joff Tax free calculator scenario',
    calculatorId: calculator.id,
    title: calculator.title,
    example,
    createdAt: new Date().toISOString(),
    assessmentYear: context.ordinaryPeriod ? year : null,
    ruleYear: context.yearSensitive ? year : null,
    period: outcome.provenance.period || (context.ordinaryPeriod ? period(year) : 'See the entered dates, financial year-end and assumptions for this component.'),
    displayInputs: Object.fromEntries(activeFields.map((field) => [field.id, displayInput(field, activeInputs[field.id] || '')])),
    inputLabels: Object.fromEntries(activeFields.map((field) => [field.id, field.label])),
    inputs: activeInputs,
    outcome,
    notice: 'Illustrative scenario or guide only. This is not a SARS assessment, tax return or submission. No calculator values are stored in your Joff preparation records.',
  };
}

export function calculatorText(pack: ReturnType<typeof calculatorPack>): string {
  return [
    pack.document,
    pack.title,
    ...(pack.example ? ['FICTIONAL EXAMPLE, explicitly selected by the user.'] : []),
    pack.notice,
    `Created: ${pack.createdAt}`,
    `Assessment year: ${pack.assessmentYear ?? 'Not an ordinary-income assessment-year calculation'}`,
    ...(pack.ruleYear !== null && pack.assessmentYear === null ? [`Selected rule year: ${pack.ruleYear}`] : []),
    `Period: ${pack.period}`,
    `Result kind: ${pack.outcome.resultKind}`,
    `Status: ${pack.outcome.status}`,
    '', 'ENTERED INPUTS',
    ...Object.entries(pack.inputs).map(([key, value]) => `${pack.inputLabels[key] || key}: ${pack.displayInputs[key] || (value === '' ? 'Unanswered' : value)}`),
    '', 'RESULTS',
    ...pack.outcome.items.map((item) => `${item.label}: ${formatValue(item.value, item.format)}`),
    '', 'GAPS OR LIMITATIONS',
    ...(pack.outcome.blockers.length ? pack.outcome.blockers : ['No missing or unsupported inputs identified under this tool’s stated scope. This does not validate a tax position.']),
    '', 'EXPLANATION',
    ...(pack.outcome.steps || []),
    '', 'ASSUMPTIONS',
    ...pack.outcome.assumptions,
    '', 'RULES AND OFFICIAL SOURCES',
    `Version: ${pack.outcome.provenance.version}`,
    `Checked: ${pack.outcome.provenance.checked}`,
    ...pack.outcome.provenance.sources.map((source) => `${source.title}: ${source.url}`),
  ].join('\n');
}

export function downloadFile(content: string, filename: string, type = 'text/plain;charset=utf-8') {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 1_000);
}

export function printText(title: string, content: string): boolean {
  const printWindow = window.open('', '_blank');
  if (!printWindow) return false;
  printWindow.document.title = title;
  const style = printWindow.document.createElement('style');
  style.textContent = 'body{font:13px/1.6 system-ui;color:#193d30;padding:32px}h1{font-size:25px}pre{white-space:pre-wrap;overflow-wrap:anywhere;font:inherit}@media print{@page{margin:18mm}body{padding:0}}';
  printWindow.document.head.appendChild(style);
  const heading = printWindow.document.createElement('h1');
  heading.textContent = title;
  const text = printWindow.document.createElement('pre');
  text.textContent = content;
  printWindow.document.body.appendChild(heading);
  printWindow.document.body.appendChild(text);
  printWindow.focus();
  printWindow.print();
  return true;
}

export function displayInput(field: CalculatorField, value: string): string {
  if (value === '') return 'Unanswered';
  if (calculatorWidget(field) === 'medicalMonths') {
    const names = ['March','April','May','June','July','August','September','October','November','December','January','February'];
    return value.split(',').map((count, index) => `${names[index] || index + 1}: ${count === '' ? 'Unanswered' : count}`).join('; ');
  }
  if (calculatorWidget(field) === 'payrollRows') {
    try {
      const rows = JSON.parse(value) as {monthly:string;age:string;uifEligible:string}[];
      return rows.map((row, index) => `Employee ${index + 1}: monthly remuneration R${row.monthly || 'Unanswered'}, age ${({'under65':'adult under 65','65to74':'65 to 74','75plus':'75 or older'} as Record<string,string>)[row.age] || 'Unanswered'}, UIF eligibility ${row.uifEligible || 'Unanswered'}`).join('\n');
    } catch { return 'Employee rows need correction'; }
  }
  return field.options?.find((option) => option.value === value)?.label || value;
}

export function calendarText(events: NonNullable<CalculatorOutcome['calendarEvents']>) {
  const escape = (value: string) => value.replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/;/g, '\\;').replace(/,/g, '\\,');
  const stamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z');
  const lines = ['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Joff Tax//Published Tax Dates//EN','CALSCALE:GREGORIAN','METHOD:PUBLISH','X-WR-CALNAME:Joff Tax published tax dates','X-WR-TIMEZONE:Africa/Johannesburg'];
  for (const event of events) {
    const date = new Date(`${event.date}T00:00:00Z`);
    if (!Number.isFinite(date.getTime()) || date.toISOString().slice(0, 10) !== event.date) continue;
    const end = new Date(date.getTime() + 86400000).toISOString().slice(0, 10).replace(/-/g, '');
    lines.push('BEGIN:VEVENT',`UID:${stableEventUid(event)}@joff-tax`, `DTSTAMP:${stamp}`, `DTSTART;VALUE=DATE:${event.date.replace(/-/g, '')}`, `DTEND;VALUE=DATE:${end}`, `SUMMARY:${escape(event.title)}`, `DESCRIPTION:${escape(`Published category: ${event.category}. Official source: ${event.sourceUrl}. Voluntary calendar import, not an active reminder service.`)}`, `URL:${event.sourceUrl}`, 'END:VEVENT');
  }
  lines.push('END:VCALENDAR');
  return lines.map((line) => line.match(/.{1,70}/g)?.join('\r\n ') || '').join('\r\n') + '\r\n';
}

export function calculatorWidget(field: Pick<CalculatorField, 'id' | 'type'>) {
  if (field.id === 'months' && field.type === 'text') return 'medicalMonths';
  if (field.id === 'employees' && field.type === 'textarea') return 'payrollRows';
  return 'standard';
}

export function stableEventUid(event: { title: string; date: string; sourceUrl: string; category: string }) {
  const key = `${event.sourceUrl}|${event.date}|${event.title}|${event.category}`;
  let first = 2166136261, second = 2246822519;
  for (let index = 0; index < key.length; index++) {
    first = Math.imul(first ^ key.charCodeAt(index), 16777619);
    second = Math.imul(second ^ key.charCodeAt(index), 3266489917);
  }
  return `joff-${(first >>> 0).toString(16)}${(second >>> 0).toString(16)}-${event.date.replace(/-/g, '')}`;
}

export function scenarioPeriod(calculator: CalculatorDefinition, year: AssessmentYear, outcome: CalculatorOutcome) {
  return outcome.provenance.period || (calculator.yearSensitive && (calculator.yearPolicy || 'ordinaryAssessment') === 'ordinaryAssessment' ? `${year} · ${period(year)}` : 'Entered transaction, financial-year or planning period');
}

export function activeCalculatorInputs(calculator: CalculatorDefinition, inputs: Record<string, string>) {
  return Object.fromEntries(calculator.fields
    .filter((field) => !field.visibleWhen || field.visibleWhen.values.includes(inputs[field.visibleWhen.field]))
    .map((field) => [field.id, inputs[field.id] || '']));
}

export function clearInactiveInputs(calculator: CalculatorDefinition, inputs: Record<string, string>) {
  const next = { ...inputs };
  for (const field of calculator.fields) {
    if (field.visibleWhen && !field.visibleWhen.values.includes(next[field.visibleWhen.field])) next[field.id] = '';
  }
  return next;
}
