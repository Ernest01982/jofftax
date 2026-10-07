'use client';

import { useId, useMemo, useRef, useState, type FormEvent } from 'react';
import Link from 'next/link';
import {
  ArrowLeft, ArrowRight, ArrowUpRight, Calculator, CalendarDays,
  Check, CheckCircle2, CircleHelp, Coins, Copy, Download,
  FileCheck2, FileText, FolderCheck, GitCompareArrows, Home, Leaf,
  Printer, Search, ShieldCheck, SlidersHorizontal, Sparkles, Star, Trash2,
  TriangleAlert, TrendingUp, Wallet, X,
} from 'lucide-react';
import {
  CALCULATORS, evaluateCalculator, calculatorContext, calculatorFields,
  type CalculatorDefinition, type CalculatorField, type CalculatorOutcome,
} from '../../lib/calculators';
import { period, type AssessmentYear } from '../../lib/rules';
import { useCalculatorSession } from './calculator-context';
import { calculatorPack, calculatorText, downloadFile, formatValue, printText, calendarText, displayInput, calculatorWidget, scenarioPeriod, activeCalculatorInputs, clearInactiveInputs } from './calculator-presentation';

const KIND_LABELS: Record<string, string> = {
  annualLiability: 'Annual income-tax scenario',
  incrementalTax: 'Incremental tax component',
  componentTax: 'Tax component estimate',
  deduction: 'Deduction component estimate',
  schedule: 'Allowance schedule',
  projection: 'Illustrative projection',
  guide: 'Official next-step guide',
};

function CategoryIcon({ category }: { category: string }) {
  const text = category.toLowerCase();
  if (/salary|pay/.test(text)) return <Wallet size={22} />;
  if (/retire/.test(text)) return <Coins size={22} />;
  if (/invest|asset/.test(text)) return <TrendingUp size={22} />;
  if (/business|property/.test(text)) return <Home size={22} />;
  if (/deadline|document|guide/.test(text)) return <CalendarDays size={22} />;
  return <SlidersHorizontal size={22} />;
}

function sourceDomain(url: string) {
  try { return new URL(url).hostname.replace(/^www\./, ''); } catch { return 'Official source'; }
}

function blankInputs(calculator: CalculatorDefinition) {
  return Object.fromEntries(calculator.fields.map((field) => [field.id, '']));
}

export default function CalculatorExperience({ calculatorId }: { calculatorId?: string }) {
  const session = useCalculatorSession();
  const current = CALCULATORS.find((tool) => tool.id === calculatorId);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All tools');
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [comparisonOpen, setComparisonOpen] = useState(false);
  const comparisonRef = useRef<HTMLDivElement>(null);
  const comparisonTrigger = useRef<HTMLElement | null>(null);

  function openComparison() {
    comparisonTrigger.current = document.activeElement as HTMLElement | null;
    setComparisonOpen(true);
    requestAnimationFrame(() => {
      comparisonRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      comparisonRef.current?.focus({ preventScroll: true });
    });
  }
  function closeComparison() {
    setComparisonOpen(false);
    requestAnimationFrame(() => comparisonTrigger.current?.focus());
  }
  const categories = [...new Set(CALCULATORS.map((tool) => tool.category))];
  const liveCount = CALCULATORS.filter((tool) => tool.contractAvailability === 'live').length;
  const results = useMemo(() => {
    const query = search.trim().toLowerCase();
    return CALCULATORS.filter((tool) => {
      const haystack = `${tool.title} ${tool.description} ${tool.category} ${tool.scopeSummary} ${(tool.synonyms || []).join(' ')}`.toLowerCase();
      return (!query || haystack.includes(query))
        && (category === 'All tools' || tool.category === category)
        && (!favoritesOnly || session.favorites.includes(tool.id));
    });
  }, [search, category, favoritesOnly, session.favorites]);

  return (
    <div className="calculator-site">
      <a href="#calculator-main" className="skip-link calc-skip">Skip to calculators</a>
      <header className="calculator-nav">
        <Link className="brand" href="/" aria-label="Joff Tax home">
          <span className="brand-mark"><Leaf size={23} /></span>joff<span className="brand-tax">tax</span>
        </Link>
        <nav aria-label="Joff Tax navigation">
          <Link className="current" href="/calculators">Free calculators</Link>
          <Link href="/pricing">Free & future services</Link>
          <a className="button dark small" href="/workspace" target="_top">My preparation<ArrowUpRight size={16} /></a>
        </nav>
      </header>
      <main id="calculator-main" className="calculator-main">
        {current ? (
          <>
            <div className="calculator-breadcrumb">
              <Link href="/calculators"><ArrowLeft size={15} />All free tools</Link>
              <span>{current.category}</span>
              <button onClick={() => comparisonOpen ? closeComparison() : openComparison()} className="comparison-shortcut">
                <GitCompareArrows size={17} />Compare{session.scenarios.length > 0 && <b>{session.scenarios.length}</b>}
              </button>
            </div>
            <CalculatorTool key={current.id} calculator={current} onCompare={openComparison} />
          </>
        ) : (
          <>
            <section className="calculator-hub-hero">
              <div>
                <span className="eyebrow"><span className="dot" />THE FREE JOFF TAX TOOLKIT</span>
                <h1>A question about tax?<br /><em>Start with clarity.</em></h1>
                <p>Work through the numbers. Compare a few possibilities. Leave with an explanation and a useful next step, without paying for a calculator.</p>
                <div className="hub-proof"><span><CheckCircle2 size={16} />{liveCount} free tools available</span><span><Download size={16} />Free explanations & exports</span><span><ShieldCheck size={16} />Amounts stay in this tab</span></div>
              </div>
              <div className="hub-feature">
                <span className="round-icon"><Calculator size={27} /></span>
                <span className="eyebrow">A GOOD PLACE TO BEGIN</span>
                <h2>Make sense of<br />your salary.</h2>
                <p>Explore an annual tax scenario, then try a bonus, retirement contribution or different year.</p>
                <Link className="button lime" href="/calculators/income-tax">Explore salary tax<ArrowRight size={17} /></Link>
                <span className="small-muted">A scenario is not a SARS assessment.</span>
              </div>
            </section>
            <section className="calculator-toolbox" aria-labelledby="toolbox-title">
              <div className="toolbox-heading">
                <div><span className="eyebrow">A USEFUL TOOL FOR EACH NEXT STEP</span><h2 id="toolbox-title">What are you working on?</h2></div>
                <div className="toolbox-actions">
                  <button className={favoritesOnly ? 'filter-button selected' : 'filter-button'} aria-pressed={favoritesOnly} onClick={() => setFavoritesOnly((value) => !value)}><Star size={16} />Favorites</button>
                  <button className="filter-button" onClick={() => comparisonOpen ? closeComparison() : openComparison()}><GitCompareArrows size={16} />Compare<span>{session.scenarios.length}</span></button>
                </div>
              </div>
              <div className="tool-search">
                <Search size={20} />
                <label className="sr-only" htmlFor="calculator-search">Search tax calculators and guides</label>
                <input id="calculator-search" type="search" placeholder="Try bonus, medical aid, rental, VAT or documents…" value={search} onChange={(event) => setSearch(event.target.value)} />
                {search && <button aria-label="Clear calculator search" onClick={() => setSearch('')}><X size={17} /></button>}
                <span>{results.length} tools</span>
              </div>
              <div className="category-filters" aria-label="Filter by situation">
                {['All tools', ...categories].map((item) => <button key={item} className={category === item ? 'selected' : ''} aria-pressed={category === item} onClick={() => setCategory(item)}>{item}</button>)}
              </div>
              {results.length ? (
                <div className="calculator-card-grid">
                  {results.map((tool) => <CalculatorCard key={tool.id} calculator={tool} />)}
                </div>
              ) : (
                <div className="tool-empty" role="status">
                  <Search size={32} />
                  <h3>{favoritesOnly ? 'Your shortcut list is a fresh page.' : 'No tool matches those filters yet.'}</h3>
                  <p>{favoritesOnly ? 'Use the star beside a tool to add it to your favorites. Only the tool name is remembered.' : 'Try a broader term or another situation. Every mapped tool is also available in the full list.'}</p>
                  <button className="button ghost" onClick={() => { setSearch(''); setCategory('All tools'); setFavoritesOnly(false); }}>Show all tools<ArrowRight size={16} /></button>
                </div>
              )}
              <p className="catalog-coverage">{CALCULATORS.length} calculators and guides in the toolkit. {liveCount} are available today. Each explains what it covers and which circumstances need a separate review.</p>
            </section>
            <section className="calculator-journeys">
              <div><span className="eyebrow">THE NUMBERS ARE A START</span><h2>Build a clearer picture,<br />one useful question at a time.</h2><p>Related tools help you explore a situation without silently adding independent components into a tax return.</p></div>
              <div className="journey-grid">
                <Link href="/calculators/bonus-tax"><Wallet size={24} /><h3>A change in your pay?</h3><p>Explore an annual bonus scenario and compare the difference.</p><span>Try bonus tax<ArrowRight size={16} /></span></Link>
                <Link href="/calculators/tax-return-documents"><FolderCheck size={24} /><h3>Getting ready to file?</h3><p>Build an evidence list from the situations that apply to you.</p><span>Build a document checklist<ArrowRight size={16} /></span></Link>
                <Link href="/calculators/tax-deadlines"><CalendarDays size={24} /><h3>Keeping track of dates?</h3><p>Check published windows and export calendar entries you choose.</p><span>See official deadlines<ArrowRight size={16} /></span></Link>
              </div>
            </section>
            <section className="free-value-banner"><div><span className="eyebrow">FREE HERE MEANS USEFUL</span><h2>Keep the tools. Keep the explanation.</h2><p>Calculations, comparison, downloads and the saved preparation workspace stay free. Review services are planned and not available to purchase yet. Their value would be a named professional’s check of your records and next actions.</p></div><Link className="button ghost" href="/pricing">See free & proposed services<ArrowUpRight size={17} /></Link></section>
          </>
        )}
        {comparisonOpen && <div ref={comparisonRef} tabIndex={-1} className="comparison-focus"><ComparisonPanel onClose={closeComparison} /></div>}
        <div className="calculator-privacy"><ShieldCheck size={18} /><p>Calculator amounts and comparison scenarios live only in this calculator session. Refreshing or leaving the calculator area clears them. Only favorite tool names are remembered on this device. Nothing is silently copied into your saved preparation.</p></div>
      </main>
      <footer className="calculator-footer"><Link className="brand" href="/">joff<span className="brand-tax">tax</span></Link><span>Private validation · Tools are free · No SARS affiliation</span><a href="/workspace" target="_top">Open free preparation<ArrowUpRight size={15} /></a></footer>
    </div>
  );
}

function CalculatorCard({ calculator }: { calculator: CalculatorDefinition }) {
  const session = useCalculatorSession();
  const favorite = session.favorites.includes(calculator.id);
  const pending = calculator.contractAvailability !== 'live';
  return (
    <article className={`calculator-card ${pending ? 'pending' : ''}`}>
      <div className="calculator-card-top"><span className="tool-icon"><CategoryIcon category={calculator.category} /></span><button className="favorite-button" aria-label={`${favorite ? 'Remove' : 'Add'} ${calculator.title} ${favorite ? 'from' : 'to'} favorites`} aria-pressed={favorite} onClick={() => session.toggleFavorite(calculator.id)}><Star size={18} fill={favorite ? 'currentColor' : 'none'} /></button></div>
      <span className="tool-category">{calculator.category}</span>
      <h3><Link href={`/calculators/${calculator.id}`}>{calculator.title}</Link></h3>
      <p>{calculator.description}</p>
      <Link className="tool-card-action" href={`/calculators/${calculator.id}`}>{pending ? 'See what it will cover' : calculator.mode === 'estimate' ? 'Explore calculator' : 'Open useful guide'}<ArrowUpRight size={17} /></Link>
      {pending && <span className="tool-status">Not available yet</span>}
    </article>
  );
}

function CalculatorTool({ calculator, onCompare }: { calculator: CalculatorDefinition; onCompare: () => void }) {
  const session = useCalculatorSession();
  const inputs = session.drafts[calculator.id] || blankInputs(calculator);
  const inputSignature = JSON.stringify(inputs);
  const [snapshot, setSnapshot] = useState<{ signature: string; year: AssessmentYear; outcome: CalculatorOutcome } | null>(null);
  const [message, setMessage] = useState('');
  const [exportError, setExportError] = useState('');
  const [scenarioName, setScenarioName] = useState('');
  const errorRef = useRef<HTMLDivElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);
  const context = calculatorContext(calculator, inputs);
  const fields = calculatorFields(calculator, inputs);
  const outcome = snapshot?.signature === inputSignature && (!context.yearSensitive || snapshot.year === session.year) ? snapshot.outcome : null;
  const activeExample = session.examples[calculator.id] || false;
  const groups = [...new Set(fields.filter((field) => !field.visibleWhen || field.visibleWhen.values.includes(inputs[field.visibleWhen.field])).map((field) => field.section || 'Your scenario'))];
  const pending = calculator.contractAvailability !== 'live';
  const ordinaryPeriod = context.ordinaryPeriod;
  const favorite = session.favorites.includes(calculator.id);
  const preferredLabel: Record<string, string> = { 'income-tax':'Monthly take-home planning amount','tax-refund':'Possible overpayment','bonus-tax':'Incremental annual normal tax','tax-bracket':'Estimated annual normal tax','net-to-gross':'Recovered take-home in selected period','payroll-tax':'Total monthly employee take-home' };
  const primaryIndex = outcome ? Math.max(0, outcome.items.findIndex((item) => item.label === (outcome.primaryResultLabel ?? calculator.primaryResultLabel ?? preferredLabel[calculator.id]) || calculator.id === 'tax-refund' && item.label === 'Estimated amount still payable')) : 0;

  function updateInput(id: string, value: string) {
    session.setDraft(calculator.id, clearInactiveInputs(calculator, { ...inputs, [id]: value }));
    setMessage('');
    setExportError('');
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    setMessage('');
    setExportError('');
    const next = evaluateCalculator(calculator.id, session.year, inputs);
    setSnapshot({ signature: inputSignature, year: session.year, outcome: next });
    requestAnimationFrame(() => (next.status === 'invalid' ? errorRef.current : resultRef.current)?.focus());
  }

  function useExample() {
    session.setDraft(calculator.id, clearInactiveInputs(calculator, { ...blankInputs(calculator), ...calculator.example }));
    session.setExample(calculator.id, true);
    setMessage('Fictional example loaded. Review the assumptions, then calculate.');
    setExportError('');
  }

  function reset() {
    session.setDraft(calculator.id, blankInputs(calculator));
    session.setExample(calculator.id, false);
    setSnapshot(null);
    setMessage('Inputs cleared.');
    setExportError('');
  }

  function addScenario() {
    if (!outcome || outcome.status !== 'supported') return;
    if (session.scenarios.length >= 3) { setExportError('This comparison has three scenarios. Remove one or clear it before adding another.'); onCompare(); return; }
    const first = session.scenarios[0];
    if (first && (first.calculatorId !== calculator.id || first.outcome.comparisonKey !== outcome.comparisonKey || first.outcome.resultKind !== outcome.resultKind || first.outcome.items.map((item) => `${item.label}:${item.format || 'text'}`).join('|') !== outcome.items.map((item) => `${item.label}:${item.format || 'text'}`).join('|'))) { setExportError('These results use a different tool, mode or output meaning. Clear the comparison before exploring this case.'); onCompare(); return; }
    if (first && context.yearSensitive && first.year !== session.year && !session.crossYear) { setExportError('Your comparison uses a different rule or assessment year. Enable the explicit cross-year comparison option first.'); onCompare(); return; }
    session.setScenarios([...session.scenarios, {
      id: crypto.randomUUID(), title: scenarioName.trim() || `Scenario ${session.scenarios.length + 1}`,
      calculatorId: calculator.id, year: session.year, inputs: activeCalculatorInputs(calculator, inputs), outcome,
      createdAt: new Date().toISOString(), example: activeExample,
    }]);
    setScenarioName('');
    setMessage('An exact result snapshot was added to your tab-only comparison.');
    onCompare();
  }

  function exportResult(format: 'text' | 'json' | 'print') {
    if (!outcome) return;
    const pack = calculatorPack(calculator, session.year, inputs, outcome, activeExample);
    const text = calculatorText(pack);
    if (format === 'print') {
      if (!printText(calculator.title, text)) setExportError('Allow a new tab to open the printable scenario, or use the free text download.');
      return;
    }
    downloadFile(format === 'json' ? JSON.stringify(pack, null, 2) : text, `joff-${calculator.id}${context.yearSensitive ? `-${session.year}` : ''}.${format === 'json' ? 'json' : 'txt'}`, format === 'json' ? 'application/json;charset=utf-8' : undefined);
    setMessage('Your scenario and its sources were downloaded.');
  }

  async function copySummary() {
    if (!outcome) return;
    try {
      await navigator.clipboard.writeText(calculatorText(calculatorPack(calculator, session.year, inputs, outcome, activeExample)));
      setMessage('The full scenario summary was copied.');
    } catch { setExportError('Copy was unavailable in this browser. You can download the same summary as text.'); }
  }

  return (
    <>
      <div className="calculator-tool-heading">
        <div><span className="eyebrow">{calculator.category.toUpperCase()} · FREE TOOL</span><h1>{calculator.title}</h1><p>{calculator.description}</p></div>
        <button className={`tool-favorite ${favorite ? 'selected' : ''}`} aria-pressed={favorite} onClick={() => session.toggleFavorite(calculator.id)}><Star size={17} fill={favorite ? 'currentColor' : 'none'} />{favorite ? 'Favorited' : 'Add favorite'}</button>
      </div>
      <div className="calculator-scope-note"><CircleHelp size={20} /><p>{calculator.scopeSummary}</p><span>{KIND_LABELS[context.resultKind] || 'Scenario'}</span></div>
      {context.yearSensitive && <div className="calculator-year-row"><label htmlFor="tool-assessment-year">{calculator.id === 'tax-deadlines' ? 'Published date context' : ordinaryPeriod ? 'Assessment year' : 'Year context'}<select id="tool-assessment-year" value={session.year} onChange={(event) => { session.setYear(Number(event.target.value) as AssessmentYear); setMessage(''); }}><option value={2026}>{calculator.id === 'tax-deadlines' ? '2026 ITR12 filing season' : ordinaryPeriod ? '2026 completed year' : '2026'}</option><option value={2027}>{calculator.id === 'tax-deadlines' ? '2027 provisional payment year' : ordinaryPeriod ? '2027 forecast' : '2027'}</option></select></label><div><strong>{calculator.id === 'tax-deadlines' ? session.year === 2026 ? '2026 return-filing dates' : '2027 provisional-payment dates' : ordinaryPeriod ? period(session.year) : `Selected year: ${session.year}`}</strong><span>{ordinaryPeriod ? session.year === 2027 ? 'Full-year projections using current SARS-published ordinary-income rates, subject to legislation and final assessment.' : 'Enter annual facts for the completed assessment year.' : calculator.id === 'tax-deadlines' ? 'ITR12 filing and IRP6 payment dates are different. No unpublished 2027 return-filing date is supplied.' : 'Use the tool’s published dates and specific transaction or calendar guidance.'}</span></div></div>}
      {!context.yearSensitive && <p className="calculator-period-note">This tool uses its own entered dates, term or planning assumptions. An income assessment-year selector does not determine those rules.</p>}
      {activeExample && <div className="notice calc-example"><Sparkles size={19} /><span>Fictional example selected. You can edit it freely. It is not saved preparation data.</span><button onClick={reset}>Clear example<X size={15} /></button></div>}
      {message && <div className="notice success" role="status"><Check size={18} />{message}</div>}
      {exportError && <div className="notice error" role="alert"><TriangleAlert size={18} />{exportError}</div>}
      {pending ? (
        <div className="tool-pending-panel"><ShieldCheck size={35} /><h2>This tool is not available yet.</h2><p>{calculator.pendingReason || 'This tool’s calculation and eligibility guidance are still being checked. No numerical result is shown yet.'}</p><p>Your preparation can continue with the free document guide and saved workspace.</p><Link className="button dark" href="/calculators/tax-return-documents">Explore the document guide<ArrowRight size={17} /></Link></div>
      ) : (
        <div className="calculator-workbench">
          <form className="calculator-form" onSubmit={submit} noValidate>
            <div className="calculator-form-heading"><div><span className="eyebrow">1 · YOUR INPUTS</span><h2>Set up your scenario.</h2></div>{calculator.example && <button type="button" className="example-button" onClick={useExample}><Sparkles size={15} />Try an example</button>}</div>
            {outcome?.status === 'invalid' && <div className="calculator-error-summary" ref={errorRef} tabIndex={-1} role="alert"><h3>Check the inputs before calculating.</h3><ul>{outcome.blockers.map((blocker) => <li key={blocker}>{blocker}</li>)}{Object.entries(outcome.fieldErrors || {}).map(([id, problem]) => <li key={id}><a href={`#${calculator.id}-${id}`}>{fields.find((field) => field.id === id)?.label || id}: {problem}</a></li>)}</ul></div>}
            {groups.map((group) => <section className="calculator-field-group" key={group}><h3>{group}</h3><div className="calculator-fields">{fields.filter((field) => (field.section || 'Your scenario') === group && (!field.visibleWhen || field.visibleWhen.values.includes(inputs[field.visibleWhen.field]))).map((field) => <CalculatorInput key={field.id} controlId={`${calculator.id}-${field.id}`} field={field} value={inputs[field.id] || ''} onChange={(value) => updateInput(field.id, value)} error={outcome?.fieldErrors?.[field.id]} />)}</div></section>)}
            <div className="calculator-submit-row"><button type="button" className="button ghost" onClick={reset}>Clear inputs</button><button className="button dark" type="submit">{context.resultKind === 'guide' ? 'Get my next step' : 'Calculate scenario'}<ArrowRight size={17} /></button></div>
            <p className="calculator-form-privacy"><ShieldCheck size={15} />No tax numbers, bank details, documents or diagnoses. Amounts are not sent to app storage.</p>
          </form>
          <aside className="calculator-output" ref={resultRef} tabIndex={-1} aria-label="Calculator result" aria-live="polite">
            <div className="calculator-result-heading"><span className="eyebrow">2 · UNDERSTAND THE RESULT</span><FileCheck2 size={22} /></div>
            {!outcome ? <div className="calculator-result-empty"><span className="round-icon"><Calculator size={29} /></span><h2>Your explanation<br />belongs here.</h2><p>{snapshot ? 'Your inputs changed. Calculate again to get a result for the current values.' : 'Complete the short form, or try a clearly labelled example. Zero and unanswered remain different.'}</p><div><CheckCircle2 size={17} />An inspectable breakdown</div><div><CheckCircle2 size={17} />Assumptions and official sources</div><div><CheckCircle2 size={17} />Free download and comparison</div></div> : <>
              <span className={`result-status ${outcome.status}`}>{outcome.status === 'supported' ? KIND_LABELS[outcome.resultKind] : outcome.status === 'blocked' ? 'Separate review or clarification needed' : 'Input corrections needed'}</span>
              {outcome.blockers.length > 0 && <div className="calculator-blockers"><TriangleAlert size={20} /><div><h3>{outcome.status === 'blocked' ? 'A useful boundary.' : 'Check the facts.'}</h3><ul>{outcome.blockers.map((blocker) => <li key={blocker}>{blocker}</li>)}</ul></div></div>}
              {outcome.items.length > 0 && <div className="calculator-result-items">{outcome.items.map((item, index) => <div key={`${item.label}-${index}`} className={index === primaryIndex && outcome.status === 'supported' ? typeof item.value === 'number' ? 'primary' : 'primary primary-text' : ''}><span>{item.label}</span><strong>{formatValue(item.value, item.format)}</strong></div>)}</div>}
              {(outcome.steps || []).length > 0 && <section className="calculator-explanation"><h3>How this was worked out</h3><ol>{outcome.steps?.map((step, index) => <li key={index}>{step}</li>)}</ol></section>}
              <section className="calculator-assumptions"><h3>What would change this result?</h3><ul>{outcome.assumptions.map((assumption, index) => <li key={index}>{assumption}</li>)}</ul></section>
              <div className="calculator-provenance"><span>Rules {outcome.provenance.version}</span><span>Checked {outcome.provenance.checked}</span><span>{scenarioPeriod(calculator, session.year, outcome)}</span></div>
              <div className="calculator-export-actions"><button onClick={() => exportResult('text')}><Download size={16} />Text pack</button><button onClick={() => exportResult('json')}><FileText size={16} />JSON</button><button onClick={() => exportResult('print')}><Printer size={16} />Print</button><button onClick={copySummary}><Copy size={16} />Copy</button></div>
              {outcome.calendarEvents && outcome.calendarEvents.length > 0 && <CalendarExport events={outcome.calendarEvents} />}
              {outcome.status === 'supported' && outcome.resultKind !== 'guide' && <div className="calculator-add-compare"><label htmlFor="scenario-name">Name this scenario, optional<input id="scenario-name" maxLength={60} placeholder="For example, a R5,000 contribution" value={scenarioName} onChange={(event) => setScenarioName(event.target.value)} /></label><button className="button ghost" onClick={addScenario}><GitCompareArrows size={16} />Add to comparison</button></div>}
              <p className="calculator-assessment-notice">This is a scenario or guide based on the entered facts. SARS determines your assessment. It does not establish a filing obligation, approved deduction or guaranteed refund.</p>
            </>}
          </aside>
        </div>
      )}
      {outcome && outcome.provenance.sources.length > 0 && <section className="calculator-source-section"><div><span className="eyebrow">PRIMARY SOURCES YOU CAN INSPECT</span><h2>Follow the rules back to the source.</h2></div><div>{outcome.provenance.sources.map((source) => <a href={source.url} target="_blank" rel="noopener noreferrer" key={source.url}><span><strong>{source.title}</strong><small>{sourceDomain(source.url)}</small></span><ArrowUpRight size={18} /></a>)}</div></section>}
      <RelatedTools calculator={calculator} />
      <section className="calculator-next-step"><span className="round-icon"><FolderCheck size={26} /></span><div><span className="eyebrow">3 · TAKE A USEFUL NEXT STEP</span><h2>Keep the evidence beside the numbers.</h2><p>The saved preparation workspace helps you record your own facts, evidence statuses and scope gaps. Calculator scenarios are separate and never silently overwrite it.</p></div><a className="button dark" href="/workspace" target="_top">Open free preparation<ArrowUpRight size={17} /></a></section>
    </>
  );
}

function CalculatorInput({ field, value, onChange, error, controlId }: { field: CalculatorField; value: string; onChange: (value: string) => void; error?: string; controlId: string }) {
  const generatedId = useId();
  const id = controlId || generatedId;
  const helpId = `${id}-help`;
  const options = field.options || [{ value: 'yes', label: 'Yes' }, { value: 'no', label: 'No' }, { value: 'unsure', label: 'I’m not sure' }];
  if (calculatorWidget(field) === 'payrollRows') return <PayrollRows controlId={controlId} value={value} onChange={onChange} error={error} />;
  if (calculatorWidget(field) === 'medicalMonths') return <CoveredMonths controlId={controlId} value={value} onChange={onChange} error={error} />;
  if (field.type === 'choice') {
    return <fieldset id={id} tabIndex={-1} className={`calc-field calc-choice ${error ? 'invalid' : ''}`}><legend>{field.label}</legend>{field.help && <p id={helpId}>{field.help}</p>}<div className="calc-choice-options">{options.map((option) => <label key={option.value} className={value === option.value ? 'selected' : ''}><input type="radio" name={id} value={option.value} checked={value === option.value} onChange={() => onChange(option.value)} aria-describedby={field.help ? helpId : undefined} /><span className="choice-dot" />{option.label}</label>)}</div>{error && <span className="calc-field-error">{error}</span>}</fieldset>;
  }
  return (
    <div className={`calc-field ${error ? 'invalid' : ''}`}>
      <label htmlFor={id}>{field.label}{field.required === false && <span>Optional</span>}</label>
      {field.type === 'select' ? <select id={id} value={value} onChange={(event) => onChange(event.target.value)} aria-describedby={helpId} aria-invalid={Boolean(error)}><option value="">Choose an option</option>{options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select> : field.type === 'textarea' ? <textarea id={id} value={value} onChange={(event) => onChange(event.target.value)} aria-describedby={helpId} aria-invalid={Boolean(error)} rows={4} /> : <div className={`calc-input-wrap ${field.format === 'currency' ? 'currency' : ''}`}>{field.format === 'currency' && <span>R</span>}<input id={id} type={field.type === 'date' ? 'date' : 'text'} inputMode={field.type === 'number' ? 'decimal' : undefined} value={value} onChange={(event) => onChange(event.target.value)} placeholder={field.type === 'number' ? 'Enter an amount' : undefined} aria-describedby={helpId} aria-invalid={Boolean(error)} maxLength={field.type === 'number' ? 20 : 1000} /></div>}
      <p id={helpId} className={error ? 'calc-field-error' : ''}>{error || field.help || (field.type === 'number' ? 'Enter zero explicitly if it applies.' : 'Choose the facts for this scenario.')}</p>
    </div>
  );
}

function RelatedTools({ calculator }: { calculator: CalculatorDefinition }) {
  const explicit = calculator.related || [];
  const related = (explicit.length ? CALCULATORS.filter((tool) => explicit.includes(tool.id)) : CALCULATORS.filter((tool) => tool.category === calculator.category && tool.id !== calculator.id)).slice(0, 3);
  if (!related.length) return null;
  return <section className="calculator-related"><div className="toolbox-heading"><div><span className="eyebrow">KEEP EXPLORING</span><h2>Related questions, clearer next steps.</h2></div></div><div>{related.map((tool) => <Link key={tool.id} href={`/calculators/${tool.id}`}><span><strong>{tool.title}</strong><small>{tool.description}</small></span><ArrowUpRight size={19} /></Link>)}</div></section>;
}

function ComparisonPanel({ onClose }: { onClose: () => void }) {
  const session = useCalculatorSession();
  const [message, setMessage] = useState('');
  const first = session.scenarios[0];
  const calculator = CALCULATORS.find((tool) => tool.id === first?.calculatorId);
  const labels = [...new Set(session.scenarios.flatMap((scenario) => scenario.outcome.items.map((item) => item.label)))];
  const comparisonContext = calculator && first ? calculatorContext(calculator, first.inputs) : null;
  const differingInputs = (calculator && first ? calculatorFields(calculator, first.inputs) : []).filter((field) => session.scenarios.some((scenario) => Object.prototype.hasOwnProperty.call(scenario.inputs, field.id)) && new Set(session.scenarios.map((scenario) => scenario.inputs[field.id])).size > 1) || [];

  function comparisonText() {
    return ['Joff Tax tab-only scenario comparison', 'Scenarios from the same tool only. Components are not added into a return estimate.', `Created: ${new Date().toISOString()}`, `Cross-year comparison explicitly allowed: ${session.crossYear ? 'yes' : 'no'}`, '', ...session.scenarios.flatMap((scenario) => {
      const definition = CALCULATORS.find((tool) => tool.id === scenario.calculatorId)!;
      return [`SCENARIO: ${scenario.title}`, `Captured: ${scenario.createdAt}`, calculatorText(calculatorPack(definition, scenario.year, scenario.inputs, scenario.outcome, scenario.example)), ''];
    })].join('\n');
  }

  return (
    <section className="calculator-comparison" aria-labelledby="comparison-title">
      <div className="comparison-heading"><div><span className="eyebrow">TAB-ONLY COMPARISON · UP TO THREE CASES</span><h2 id="comparison-title">See the difference clearly.</h2><p>Compare snapshots from the same tool. These are not a combined tax assessment.</p></div><button className="icon-button" aria-label="Close comparison panel" onClick={onClose}><X size={21} /></button></div>
      {(!calculator || comparisonContext?.yearSensitive) && <label className="cross-year-choice"><input type="checkbox" checked={session.crossYear} onChange={(event) => { if (!event.target.checked && new Set(session.scenarios.map((scenario) => scenario.year)).size > 1) { setMessage('Remove the different-year scenario before disabling cross-year comparison.'); return; } session.setCrossYear(event.target.checked); setMessage(''); }} />Allow an explicitly labelled comparison across {comparisonContext?.ordinaryPeriod ? 'assessment' : 'rule'} years</label>}
      {message && <p className="comparison-message" role="status">{message}</p>}
      {!first ? <div className="comparison-empty"><GitCompareArrows size={33} /><h3>A good comparison starts with one result.</h3><p>Calculate a supported scenario, name it if useful, then select “Add to comparison”. Change an input and calculate again to add another case.</p></div> : <>
        <div className="comparison-scroll"><table><caption>{calculator?.title} · compatible result snapshots</caption><thead><tr><th scope="col">What changes?</th>{session.scenarios.map((scenario) => <th scope="col" key={scenario.id}><strong>{scenario.title}</strong><span>{calculator ? scenarioPeriod(calculator, scenario.year, scenario.outcome) : scenario.outcome.provenance.period} · {KIND_LABELS[scenario.outcome.resultKind]}</span><button onClick={() => session.setScenarios(session.scenarios.filter((item) => item.id !== scenario.id))} aria-label={`Remove ${scenario.title} from comparison`}><Trash2 size={14} />Remove</button></th>)}</tr></thead><tbody>{differingInputs.map((field) => <tr className="comparison-difference" key={field.id}><th scope="row">{field.label}<span>Input difference</span></th>{session.scenarios.map((scenario) => <td key={scenario.id}>{displayInput(field, scenario.inputs[field.id] || '')}</td>)}</tr>)}{labels.map((label) => <tr key={label}><th scope="row">{label}</th>{session.scenarios.map((scenario) => { const item = scenario.outcome.items.find((result) => result.label === label); return <td key={scenario.id}>{item ? formatValue(item.value, item.format) : 'Not part of this case'}</td>; })}</tr>)}<tr><th scope="row">Rule provenance</th>{session.scenarios.map((scenario) => <td className="comparison-rule" key={scenario.id}>{scenario.outcome.provenance.version}<br />Checked {scenario.outcome.provenance.checked}</td>)}</tr></tbody></table></div>
        <div className="comparison-actions"><button className="button dark" onClick={() => downloadFile(comparisonText(), 'joff-tax-scenario-comparison.txt')}><Download size={16} />Download comparison</button><button className="button ghost" onClick={() => downloadFile(JSON.stringify({ document: 'Joff Tax scenario comparison', createdAt: new Date().toISOString(), crossYearExplicitlyAllowed: session.crossYear, scenarios: session.scenarios.map((scenario) => { const definition = CALCULATORS.find((tool) => tool.id === scenario.calculatorId)!; const pack = calculatorPack(definition, scenario.year, scenario.inputs, scenario.outcome, scenario.example); return { ...scenario, year: calculatorContext(definition, scenario.inputs).yearSensitive ? scenario.year : null, assessmentYear: pack.assessmentYear, ruleYear: pack.ruleYear, period: pack.period, inputLabels: pack.inputLabels, displayInputs: pack.displayInputs }; }) }, null, 2), 'joff-tax-scenario-comparison.json', 'application/json;charset=utf-8')}>JSON<FileText size={16} /></button><button className="button ghost" onClick={() => { if (!printText('Joff Tax scenario comparison', comparisonText())) setMessage('Allow a new tab for print, or download the same comparison.'); }}><Printer size={16} />Print</button><button className="text-link" onClick={() => session.setScenarios([])}>Clear comparison<Trash2 size={15} /></button></div>
        <p className="comparison-limit">Each snapshot keeps its input facts, scope assumptions and official sources in the export. Refreshing or leaving calculators clears this comparison. No scenario values enter a URL or saved preparation.</p>
      </>}
    </section>
  );
}

function CoveredMonths({ value, onChange, error, controlId }: { value: string; onChange: (value: string) => void; error?: string; controlId: string }) {
  const [sameCount, setSameCount] = useState('');
  const months = ['March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December', 'January', 'February'];
  const counts = value ? value.split(',') : Array(12).fill('');
  while (counts.length < 12) counts.push('');
  return (
    <fieldset id={controlId} tabIndex={-1} className="calc-months-field">
      <legend>Eligible covered people in each contribution month</legend>
      <p>Enter actual or full-year projected eligible counts from March to February. Include the first person, the second person and further dependants. Enter zero for months without eligible contributions; no member names are needed.</p>
      <div className="calc-month-fill"><label>Same count every month, if applicable<select value={sameCount} onChange={(event) => setSameCount(event.target.value)}><option value="">Choose a count</option>{Array.from({ length: 21 }, (_, index) => <option key={index} value={index}>{index}</option>)}</select></label><button type="button" className="button ghost" disabled={sameCount === ''} onClick={() => onChange(Array(12).fill(sameCount).join(','))}>I confirm unchanged coverage; fill all months</button></div>
      <div className="calc-covered-month-grid">{months.map((month, index) => <label key={month}>{month}<input type="text" inputMode="numeric" value={counts[index] || ''} placeholder="0 to 20" maxLength={2} onChange={(event) => { const next = [...counts]; next[index] = event.target.value; onChange(next.slice(0, 12).join(',')); }} /></label>)}</div>
      {error && <p className="calc-field-error">{error}</p>}
    </fieldset>
  );
}

function PayrollRows({ value, onChange, error, controlId }: { value: string; onChange: (value: string) => void; error?: string; controlId: string }) {
  type Employee = { monthly: string; age: string; uifEligible: string };
  const blank = (): Employee => ({ monthly: '', age: '', uifEligible: '' });
  let rows: Employee[] = [blank()];
  try { if (value) { const parsed = JSON.parse(value); if (Array.isArray(parsed) && parsed.length) rows = parsed; } } catch { /* A reset can recover an invalid local draft. */ }
  function changeRow(index: number, key: keyof Employee, nextValue: string) {
    const next = rows.map((row, rowIndex) => rowIndex === index ? { ...row, [key]: nextValue } : row);
    onChange(JSON.stringify(next));
  }
  return (
    <fieldset id={controlId} tabIndex={-1} className="calc-payroll-field">
      <legend>Employee salary scenarios</legend>
      <p>Add up to 20 equal-month salary rows. No names, employee numbers or identity details. Complete each monthly amount, year-end age and UIF answer.</p>
      <div className="calc-payroll-rows">{rows.map((row, index) => <section key={index} className="calc-payroll-row"><div><h3>Employee {index + 1}</h3><button type="button" disabled={rows.length === 1} aria-label={`Remove employee ${index + 1}`} onClick={() => onChange(JSON.stringify(rows.filter((_, rowIndex) => rowIndex !== index)))}><Trash2 size={15} />Remove</button></div><label>Ordinary monthly taxable remuneration<div className="calc-input-wrap currency"><span>R</span><input type="text" inputMode="decimal" value={row.monthly || ''} maxLength={20} placeholder="Enter monthly amount" onChange={(event) => changeRow(index, 'monthly', event.target.value)} /></div></label><label>Age at assessment year end<select value={row.age || ''} onChange={(event) => changeRow(index, 'age', event.target.value)}><option value="">Choose an age band</option><option value="under65">Adult under 65</option><option value="65to74">65 to 74</option><option value="75plus">75 or older</option></select></label><label>UIF contribution eligibility<select value={row.uifEligible || ''} onChange={(event) => changeRow(index, 'uifEligible', event.target.value)}><option value="">Choose an answer</option><option value="yes">Eligible</option><option value="no">Known statutory exclusion</option><option value="unsure">I’m not sure</option></select></label></section>)}</div>
      <button type="button" className="button ghost calc-add-employee" disabled={rows.length >= 20} onClick={() => onChange(JSON.stringify([...rows, blank()]))}>Add another employee row<ArrowRight size={15} /></button>
      {error && <p className="calc-field-error">{error}</p>}
    </fieldset>
  );
}

function CalendarExport({ events }: { events: NonNullable<CalculatorOutcome['calendarEvents']> }) {
  const [selected, setSelected] = useState<string[]>(events.map((event) => `${event.title}|${event.date}`));
  const chosen = events.filter((event) => selected.includes(`${event.title}|${event.date}`));
  return <div className="calendar-export-card"><fieldset><legend>Choose published dates for your calendar</legend>{events.map((event) => { const key = `${event.title}|${event.date}`; return <label key={key}><input type="checkbox" checked={selected.includes(key)} onChange={(change) => setSelected(change.target.checked ? [...selected, key] : selected.filter((value) => value !== key))} /><span><strong>{event.title}</strong>{event.date} · {event.category}</span></label>; })}</fieldset><button className="button ghost" disabled={!chosen.length} onClick={() => downloadFile(calendarText(chosen), 'joff-published-tax-dates.ics', 'text/calendar;charset=utf-8')}><CalendarDays size={17} />Download selected dates (.ics)</button><p>Import this file into your own calendar. It creates no active Joff reminder and does not decide your filing obligation. Dates use the South African calendar.</p></div>;
}
