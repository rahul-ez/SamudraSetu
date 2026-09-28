import { useCallback, useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import Navigation from './components/Navigation';
import RequirementForm from './components/RequirementForm';
import DecisionWorkspace from './components/DecisionWorkspace';
import EvidenceSection from './components/EvidenceSection';
import { runPipeline } from './api';

gsap.registerPlugin(useGSAP, ScrollTrigger);

const DEFAULT_REQUIREMENT = {
  origin: 'Australia',
  destination: 'Paradip',
  vessel_class: 'Capesize',
  cargo_type: 'Coal',
  cargo_quantity_mt: 150000,
  horizon_days: 7,
  congestion_level: 'Medium',
  availability_level: 'Medium',
};

function ArrowIcon() {
  return <svg aria-hidden="true" viewBox="0 0 20 20"><path d="M4 10h11M11 5l5 5-5 5" /></svg>;
}

export default function App() {
  const pageRef = useRef(null);
  const [requirement, setRequirement] = useState(DEFAULT_REQUIREMENT);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const executePipeline = useCallback(async (nextRequirement) => {
    setRequirement(nextRequirement);
    setLoading(true);
    setError('');
    try {
      setResult(await runPipeline(nextRequirement));
    } catch (pipelineError) {
      setError(pipelineError instanceof Error ? pipelineError.message : 'The pipeline could not complete this request.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    runPipeline(DEFAULT_REQUIREMENT)
      .then((initialResult) => {
        if (active) setResult(initialResult);
      })
      .catch((pipelineError) => {
        if (active) setError(pipelineError instanceof Error ? pipelineError.message : 'The pipeline could not complete this request.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, []);

  useGSAP(() => {
    const media = gsap.matchMedia();
    media.add({ allowMotion: '(prefers-reduced-motion: no-preference)' }, (context) => {
      if (!context.conditions.allowMotion) return;

      gsap.from('[data-hero-reveal]', {
        y: 28,
        opacity: 0,
        duration: 0.8,
        stagger: 0.09,
        ease: 'power3.out',
      });
    });
    return () => media.revert();
  }, { scope: pageRef });

  useGSAP(() => {
    if (!result) return undefined;
    const media = gsap.matchMedia();
    media.add({ allowMotion: '(prefers-reduced-motion: no-preference)', desktop: '(min-width: 960px)' }, (context) => {
      if (!context.conditions.allowMotion) return;

      gsap.utils.toArray('[data-enter]').forEach((element) => {
        gsap.from(element, {
          y: 28,
          opacity: 0,
          duration: 0.65,
          ease: 'power2.out',
          scrollTrigger: { trigger: element, start: 'top 88%', once: true },
        });
      });

      gsap.utils.toArray('[data-reveal-line]').forEach((line) => {
        gsap.fromTo(line, { opacity: 0.18, y: 14 }, {
          opacity: 1,
          y: 0,
          ease: 'none',
          scrollTrigger: { trigger: line, start: 'top 84%', end: 'top 58%', scrub: 0.5 },
        });
      });

      if (context.conditions.desktop) {
        ScrollTrigger.create({
          trigger: '.evidence',
          start: 'top 112px',
          end: 'bottom bottom-=80',
          pin: '.evidence__rail',
          pinSpacing: false,
        });
      }
    });
    return () => media.revert();
  }, { scope: pageRef, dependencies: [result], revertOnUpdate: true });

  const scrollToBrief = () => document.querySelector('#brief')?.scrollIntoView({ behavior: 'smooth', block: 'start' });

  return (
    <div ref={pageRef} className="site-shell">
      <Navigation onRunClick={scrollToBrief} loading={loading} />
      <main>
        <section className="hero page-frame" aria-labelledby="hero-title">
          <div className="hero__copy">
            <p className="eyebrow" data-hero-reveal>Freight intelligence for bulk procurement</p>
            <h1 id="hero-title" data-hero-reveal>Plan chartering with the market in view.</h1>
            <p className="hero__lede" data-hero-reveal>
              Turn a route requirement into a probabilistic freight outlook, port feasibility check, and an explainable contract decision.
            </p>
            <button className="text-link" type="button" onClick={() => document.querySelector('#forecast')?.scrollIntoView({ behavior: 'smooth' })} data-hero-reveal>
              Review the decision workspace <ArrowIcon />
            </button>
          </div>
          <div className="hero__brief" id="brief" data-hero-reveal>
            <RequirementForm requirement={requirement} loading={loading} error={error} onRun={executePipeline} />
          </div>
        </section>

        <div className="marquee" aria-label="Pipeline capabilities">
          <div className="marquee__track">
            {[0, 1].map((copy) => (
              <div className="marquee__set" aria-hidden={copy === 1} key={copy}>
                <span>Probabilistic freight forecast</span>
                <span>Port constraint validation</span>
                <span>Risk-weighted recommendation</span>
                <span>Walk-forward evidence</span>
              </div>
            ))}
          </div>
        </div>

        <DecisionWorkspace result={result} requirement={requirement} loading={loading} error={error} />
        <EvidenceSection result={result} />

        <section className="closing page-frame" id="decision" data-enter>
          <div>
            <p className="eyebrow">Update the scenario</p>
            <h2>A better chartering conversation starts with visible assumptions.</h2>
          </div>
          <button className="primary-button primary-button--light" type="button" onClick={scrollToBrief}>
            Run another forecast <ArrowIcon />
          </button>
        </section>
      </main>

      <footer className="footer page-frame">
        <a className="brand brand--footer" href="#top" aria-label="SamudraSetu home">
          <span className="brand__mark" aria-hidden="true"><i /><i /><i /></span>
          <span>SamudraSetu</span>
        </a>
        <p>Decision support for maritime freight procurement.</p>
        <p>Model outputs are indicative, not financial guarantees.</p>
      </footer>
    </div>
  );
}
