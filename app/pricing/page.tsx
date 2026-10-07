import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, ArrowUpRight, Check, FileCheck2, FolderCheck, Leaf, ShieldCheck, Users, X } from 'lucide-react';
import { getChatGPTUser, chatGPTSignInPath } from '../chatgpt-auth';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = {
  title: 'Free tools & proposed review services | Joff Tax',
  description: 'All current calculators, comparisons, exports and preparation are free. Explore the proposed value of a named practitioner’s accountable review, clearly separate from today’s tools.',
};

export default async function PricingPage() {
  const user = await getChatGPTUser();
  const preparationPath = user ? '/workspace' : chatGPTSignInPath('/workspace');
  return (
    <div className="calculator-site pricing-site">
      <header className="calculator-nav">
        <Link className="brand" href="/" aria-label="Joff Tax home"><span className="brand-mark"><Leaf size={23} /></span>joff<span className="brand-tax">tax</span></Link>
        <nav aria-label="Joff Tax navigation"><Link href="/calculators">Free calculators</Link><Link className="current" href="/pricing">Free & future services</Link><a className="button dark small" href={preparationPath} target="_top">My preparation<ArrowUpRight size={16} /></a></nav>
      </header>
      <main className="pricing-main">
        <section className="pricing-hero">
          <span className="eyebrow"><span className="dot" />CLEAR VALUE. HONEST BOUNDARIES.</span>
          <h1>The tools are free.<br /><em>A reviewed outcome is different.</em></h1>
          <p>Keep the calculators, comparisons and preparation pack. Future paid value would come from a named professional who checks your records, resolves the gaps and owns a clearly scoped review.</p>
          <div className="pricing-validation-note"><ShieldCheck size={18} /><span>Private validation release. Proposed services below are not staffed, purchasable or available for booking.</span></div>
        </section>
        <section className="pricing-cards" aria-label="Current free features and proposed future services">
          <article className="pricing-card current-plan">
            <span className="pricing-badge">AVAILABLE NOW · FREE</span>
            <h2>Joff Tools</h2>
            <p>A useful starting point, with an explanation you can take with you.</p>
            <div className="pricing-amount">R0<span>No calculator or export paywall</span></div>
            <ul><li><Check size={17} />All enabled calculators and official guides</li><li><Check size={17} />Scenario comparisons and full explanations</li><li><Check size={17} />Text, JSON, print and calendar exports</li><li><Check size={17} />Saved preparation and evidence checklist</li><li><Check size={17} />Own-data export and deletion controls</li></ul>
            <Link className="button dark" href="/calculators">Explore the free toolkit<ArrowRight size={17} /></Link>
            <a className="text-link" href={preparationPath} target="_top">Build my free readiness pack<ArrowUpRight size={15} /></a>
          </article>
          <article className="pricing-card proposed-plan">
            <span className="pricing-badge">PROPOSED REVIEW · NOT FOR SALE</span>
            <h2>Reviewed Readiness</h2>
            <p>A named registered practitioner’s check of a supported employment-income case.</p>
            <div className="pricing-amount">R499<span>Price hypothesis · One case, one assessment year</span></div>
            <ul><li><Users size={17} />A named reviewer accountable for the scope</li><li><FileCheck2 size={17} />Employment, retirement and medical reconciliation</li><li><FolderCheck size={17} />Checked discrepancies and evidence gaps</li><li><Check size={17} />A reviewed action plan and self-filing handover</li><li><Check size={17} />One defined clarification round</li></ul>
            <div className="proposed-notice">This would require contracted registered people, secure document intake, service terms and independent tax/privacy review before sale.</div>
            <a className="button ghost" href={preparationPath} target="_top">Start with free preparation<ArrowRight size={17} /></a>
          </article>
          <article className="pricing-card proposed-plan">
            <span className="pricing-badge">PROPOSED COMPLEX REVIEW</span>
            <h2>A scope that fits.</h2>
            <p>Added income, assets or an unusual circumstance may need a separately scoped professional review.</p>
            <div className="pricing-amount">From R999<span>Price hypothesis · Written scope and quote first</span></div>
            <ul><li><Users size={17} />A suitably qualified reviewer for the case</li><li><Check size={17} />Agreed questions, evidence and responsibility</li><li><FileCheck2 size={17} />A clear review and handover</li><li><X size={17} />No automatic acceptance of every case</li><li><X size={17} />No filing or SARS response service implied</li></ul>
            <div className="proposed-notice">Assisted filing would be a separate future service, with actual authorisation, customer approval and a genuine submission receipt.</div>
            <Link className="button ghost" href="/calculators/tax-return-documents">Find the evidence you need<ArrowRight size={17} /></Link>
          </article>
        </section>
        <section className="pricing-difference">
          <div><span className="eyebrow">WHY WOULD ANYONE PAY?</span><h2>For checked facts.<br />For a responsible human.</h2><p>Storage, a generic summary or access to a number is not the proposed paid advantage. The service to validate is a checked tax-year record and specific next actions, owned by a named qualified reviewer.</p></div>
          <div className="pricing-comparison-scroll"><table><caption>Current free tools versus a proposed accountable review</caption><thead><tr><th scope="col">What you receive</th><th scope="col">Free today</th><th scope="col">Proposed review</th></tr></thead><tbody><tr><th scope="row">Calculator scenarios and sources</th><td>Included</td><td>Remain free</td></tr><tr><th scope="row">Preparation pack and evidence statuses</th><td>User-entered</td><td>Reviewed within agreed scope</td></tr><tr><th scope="row">Certificate reconciliation</th><td>No certificate review</td><td>Named professional’s check</td></tr><tr><th scope="row">Unsupported-case resolution</th><td>Scope boundary and next steps</td><td>Scoped professional review</td></tr><tr><th scope="row">Responsibility for filing</th><td>You file with SARS, if required</td><td>You file with SARS, unless separately contracted</td></tr><tr><th scope="row">Guaranteed refund or tax outcome</th><td>None</td><td>None</td></tr></tbody></table></div>
        </section>
        <section className="review-deliverable-preview">
          <div className="review-preview-copy"><span className="eyebrow">PROPOSED DELIVERABLE STRUCTURE</span><h2>A pack with decisions,<br />not just a total.</h2><p>A future reviewed pack would distinguish checks actually completed from unresolved matters. It would contain the agreed scope, reconciled inputs, discrepancies, evidence gaps and a clear plan for your next SARS step.</p><a className="button dark" href={preparationPath} target="_top">Build my free readiness pack<ArrowRight size={17} /></a></div>
          <div className="review-preview-sheet"><span className="pill">ILLUSTRATIVE STRUCTURE · NO REVIEW PERFORMED</span><h3>Reviewed readiness pack</h3><ol><li><span>01</span><div><strong>Scope and named reviewer</strong><p>What was agreed, and who owns the review.</p></div></li><li><span>02</span><div><strong>Input reconciliation</strong><p>Records checked and differences requiring attention.</p></div></li><li><span>03</span><div><strong>Evidence and unresolved matters</strong><p>What is complete and what still needs a decision.</p></div></li><li><span>04</span><div><strong>Your action plan</strong><p>A reviewed self-filing or practitioner handover.</p></div></li></ol><p className="review-preview-footnote">A proposed service structure, not an issued review, SARS assessment or filing confirmation.</p></div>
        </section>
        <section className="pricing-now-banner"><div><span className="eyebrow">A USEFUL NEXT STEP, TODAY</span><h2>Get organised for free.</h2><p>There is no payment, unlock or booking here. Start with a calculator or prepare your own evidence pack during private validation.</p></div><a className="button lime" href={preparationPath} target="_top">Build my free readiness pack<ArrowUpRight size={17} /></a></section>
      </main>
      <footer className="calculator-footer"><Link className="brand" href="/">joff<span className="brand-tax">tax</span></Link><span>Private validation · No SARS affiliation · No live paid service</span><Link href="/calculators">Explore free tools<ArrowUpRight size={15} /></Link></footer>
    </div>
  );
}
