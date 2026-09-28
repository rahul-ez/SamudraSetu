import { useState } from 'react';

const number = (value) => value == null
  ? 'Unavailable'
  : Number(value).toLocaleString('en-US', { maximumFractionDigits: 2 });
const usdRate = (value) => value == null ? 'Unavailable' : `$${number(value)}`;

function backtestHeadline(value) {
  if (value == null) return 'No savings estimate available.';
  if (value >= 0) return `${usdRate(value)}/mt estimated savings.`;
  return `${usdRate(Math.abs(value))}/mt estimated additional cost.`;
}

function ScopeList({ scope }) {
  return Object.entries(scope ?? {}).map(([key, value]) => (
    <span key={key}><i>{key.replaceAll('_', ' ')}</i><strong>{value}</strong></span>
  ));
}

function MetricList({ metrics = {} }) {
  return Object.entries(metrics).map(([key, value]) => (
    <span key={key}><i>{key.replaceAll('_', ' ')}</i><strong>{number(value)}</strong></span>
  ));
}

function EvidenceAccordion({ model, backtest }) {
  const [active, setActive] = useState(0);
  const panels = [
    {
      title: 'Model scope',
      short: 'Where the artifact applies',
      content: <div className="accordion-facts"><ScopeList scope={model.trained_scope} /><span><i>data cutoff</i><strong>{model.data_cutoff}</strong></span></div>,
    },
    {
      title: 'Validation',
      short: 'Observed test metrics',
      content: <div className="accordion-facts"><MetricList metrics={model.metrics} /><span><i>backtest points</i><strong>{backtest?.n_points ?? 'Unavailable'}</strong></span></div>,
    },
    {
      title: 'Known limits',
      short: 'What to challenge',
      content: <ul className="limitation-list">{(model.known_limitations ?? ['No documented limitation was returned.']).map((item) => <li key={item}>{item}</li>)}</ul>,
    },
  ];

  return (
    <div className="evidence-accordion" data-enter>
      {panels.map((panel, index) => (
        <section className={active === index ? 'is-active' : ''} key={panel.title}>
          <button type="button" aria-expanded={active === index} onClick={() => setActive(index)} onMouseEnter={() => setActive(index)}>
            <span>{panel.title}</span><i>{panel.short}</i>
          </button>
          <div className="accordion-content">{panel.content}</div>
        </section>
      ))}
    </div>
  );
}

export default function EvidenceSection({ result }) {
  if (!result) return null;
  const forecast = result.forecast;
  const model = { ...forecast.model, metrics: forecast.metrics };
  const backtest = result.backtest;
  const portPrediction = result.risk.port_model_prediction;

  return (
    <section className="evidence page-frame" id="evidence" aria-labelledby="evidence-title">
      <div className="evidence__rail">
        <p className="eyebrow">Evidence before confidence</p>
        <h2 id="evidence-title">The output shows its workings.</h2>
        <p>Model identity, validation context, interval quality, and fallback behavior stay attached to the decision.</p>
      </div>

      <div className="evidence__story">
        <article className="evidence-block evidence-block--dark">
          <p className="card-kicker" data-reveal-line>Model execution</p>
          <h3 data-reveal-line>{model.name}</h3>
          <p data-reveal-line>
            {model.fallback_used
              ? 'This route sits outside the trained artifact scope, so the pipeline used its documented statistical baseline.'
              : 'The requested route and horizon matched a committed trained artifact; no model fallback was used.'}
          </p>
          <dl data-reveal-line>
            <div><dt>Execution</dt><dd>{model.kind.replaceAll('_', ' ')}</dd></div>
            <div><dt>Data cutoff</dt><dd>{model.data_cutoff}</dd></div>
            <div><dt>Artifact</dt><dd>{model.artifact || 'Statistical baseline, no binary artifact'}</dd></div>
            <div><dt>Data provenance</dt><dd>{model.data_provenance}</dd></div>
          </dl>
        </article>

        <article className="evidence-block evidence-block--sand">
          <p className="card-kicker" data-reveal-line>Uncertainty</p>
          <h3 data-reveal-line>Range first, point estimate second.</h3>
          <p data-reveal-line>The day {forecast.horizon_days} median is {usdRate(forecast.p50_usd_per_mt)}/mt, bounded by an indicative P10–P90 range of {usdRate(forecast.p10_usd_per_mt)} to {usdRate(forecast.p90_usd_per_mt)}.</p>
          <p className="evidence-callout" data-reveal-line>{model.interval_method}. {model.interval_calibrated ? 'The interval is calibrated.' : 'The interval is not calibrated and should be treated as indicative.'}</p>
        </article>

        <article className="evidence-block evidence-block--mint">
          <p className="card-kicker" data-reveal-line>Decision validation</p>
          <h3 data-reveal-line>{backtestHeadline(backtest.avg_savings_per_mt)}</h3>
          <p data-reveal-line>{backtest.note}</p>
          <dl data-reveal-line>
            <div><dt>Method</dt><dd>{backtest.method}</dd></div>
            <div><dt>Decision points</dt><dd>{backtest.n_points}</dd></div>
            <div><dt>Charter now / wait</dt><dd>{backtest.decisions.charter_now} / {backtest.decisions.wait_monitor}</dd></div>
          </dl>
        </article>

        {portPrediction && (
          <article className="evidence-block evidence-block--blue">
            <p className="card-kicker" data-reveal-line>Port signal</p>
            <h3 data-reveal-line>{portPrediction.scope.destination} congestion is model-backed.</h3>
            <p data-reveal-line>The trained port regressors estimate a congestion index of {number(portPrediction.congestion_index_0_100)}/100 and a vessel wait of {number(portPrediction.wait_hours)} hours for the current feature row.</p>
            <p className="evidence-callout" data-reveal-line>Post-processing: {portPrediction.postprocessing}</p>
          </article>
        )}
      </div>

      <EvidenceAccordion model={model} backtest={backtest} />
    </section>
  );
}
