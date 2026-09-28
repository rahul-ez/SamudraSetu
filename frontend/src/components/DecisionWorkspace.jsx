import { useState } from 'react';
import ForecastChart from './ForecastChart';

const money = (value, digits = 2) => Number(value ?? 0).toLocaleString('en-US', { minimumFractionDigits: digits, maximumFractionDigits: digits });
const cost = (value) => Number(value ?? 0).toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
const cleanReason = (reason) => reason.replaceAll('\\$', '$');

function backtestOutcome(value) {
  if (value == null) return 'No backtested cost estimate';
  if (value >= 0) return `$${money(value)}/mt backtested estimated savings`;
  return `$${money(Math.abs(value))}/mt backtested estimated additional cost`;
}

function RationaleCarousel({ reasons = [] }) {
  const [index, setIndex] = useState(0);
  const safeIndex = reasons.length ? index % reasons.length : 0;
  if (!reasons.length) return null;

  return (
    <div className="rationale" aria-live="polite">
      <p>{cleanReason(reasons[safeIndex])}</p>
      <div className="rationale__controls">
        <span>{String(safeIndex + 1).padStart(2, '0')} / {String(reasons.length).padStart(2, '0')}</span>
        <div>
          <button type="button" aria-label="Previous reason" onClick={() => setIndex((current) => (current - 1 + reasons.length) % reasons.length)}>
            <svg aria-hidden="true" viewBox="0 0 20 20"><path d="M16 10H5M9 5l-5 5 5 5" /></svg>
          </button>
          <button type="button" aria-label="Next reason" onClick={() => setIndex((current) => (current + 1) % reasons.length)}>
            <svg aria-hidden="true" viewBox="0 0 20 20"><path d="M4 10h11M11 5l5 5-5 5" /></svg>
          </button>
        </div>
      </div>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="workspace-loading" role="status">
      <span className="loading-mark" aria-hidden="true" />
      <div><strong>Running the decision pipeline</strong><p>Forecasting, constraints, risk, and economics are being calculated.</p></div>
    </div>
  );
}

export default function DecisionWorkspace({ result, requirement, loading, error }) {
  const forecast = result?.forecast;
  const recommendation = result?.recommendation;
  const feasibility = result?.feasibility;
  const risk = result?.risk;
  const backtest = result?.backtest;
  const costs = recommendation?.costs;
  const strategies = costs ? [
    { name: 'Spot market', rate: costs.avg_spot_rate, total: costs.spot_cost_usd },
    { name: 'Short-term multi-voyage', rate: costs.multi_voyage_rate, total: costs.multi_voyage_cost_usd },
    { name: 'Medium-term fixed', rate: costs.contract_rate, total: costs.contract_cost_usd },
  ] : [];
  const cheapest = strategies.length ? Math.min(...strategies.map((item) => item.total)) : null;
  const riskPercent = risk ? (risk.total_score / risk.max_score) * 100 : 0;

  return (
    <section className="workspace page-frame" id="forecast" aria-labelledby="workspace-title">
      <header className="section-heading" data-enter>
        <div>
          <p className="eyebrow">Decision workspace</p>
          <h2 id="workspace-title">One scenario, read from market signal to action.</h2>
        </div>
        <p>{requirement.origin} to {requirement.destination} · {requirement.vessel_class} · {Number(requirement.cargo_quantity_mt).toLocaleString('en-US')} mt</p>
      </header>

      {loading && !result && <LoadingState />}
      {error && !result && <p className="workspace-error" role="alert">{error}</p>}

      {result && (
        <div className={`decision-grid ${loading ? 'is-refreshing' : ''}`} aria-busy={loading}>
          <article className="decision-card decision-card--forecast" data-enter>
            <div className="card-heading">
              <div><p className="card-kicker">Freight outlook</p><h3>P50 forecast</h3></div>
              <span className={`model-state ${forecast.model.fallback_used ? 'model-state--fallback' : ''}`}>
                {forecast.model.fallback_used ? 'Baseline fallback' : 'Trained model'}
              </span>
            </div>
            <div className="forecast-summary">
              <div>
                <strong>${money(forecast.p50_usd_per_mt)}</strong><span>per mt at day {forecast.horizon_days}</span>
              </div>
              <div className={forecast.expected_pct_change >= 0 ? 'change-up' : 'change-down'}>
                {forecast.expected_pct_change >= 0 ? '+' : ''}{forecast.expected_pct_change.toFixed(1)}%
                <span>from ${money(forecast.current_rate_usd_per_mt)}</span>
              </div>
            </div>
            <ForecastChart forecast={forecast} />
            <div className="forecast-bounds">
              <span><i>Low case</i><strong>${money(forecast.p10_usd_per_mt)}</strong></span>
              <span><i>Probability of increase</i><strong>{(forecast.probability_increase * 100).toFixed(0)}%</strong></span>
              <span><i>High case</i><strong>${money(forecast.p90_usd_per_mt)}</strong></span>
            </div>
          </article>

          <article className="decision-card decision-card--recommendation" data-enter>
            <div className="card-heading"><div><p className="card-kicker">Recommended action</p><h3>{recommendation.decision}</h3></div></div>
            <p className="recommendation-copy">Use a <strong>{recommendation.contract_strategy.toLowerCase()}</strong> structure for this scenario.</p>
            <div className="decision-facts">
              <span><i>Risk</i><strong>{recommendation.risk_level}</strong></span>
              <span><i>Port fit</i><strong>{recommendation.selected_feasibility}</strong></span>
            </div>
            <RationaleCarousel reasons={recommendation.reasons} />
          </article>

          <article className="decision-card decision-card--feasibility" data-enter>
            <div className="card-heading"><div><p className="card-kicker">Port feasibility</p><h3>{feasibility.selected.vessel_class} at {feasibility.port}</h3></div></div>
            <div className="constraint-list">
              {feasibility.selected.checks.map((check) => (
                <div key={check.constraint} className="constraint-row">
                  <span className={`status-dot status-dot--${check.status}`} aria-hidden="true" />
                  <strong>{check.constraint}</strong>
                  <span>{check.vessel_value} / {check.port_limit ?? 'Not published'}</span>
                  <i>{check.status === 'pass' ? 'Pass' : check.status === 'fail' ? 'Fail' : 'Open'}</i>
                </div>
              ))}
            </div>
          </article>

          <article className="decision-card decision-card--risk" data-enter>
            <div className="card-heading"><div><p className="card-kicker">Composite risk</p><h3>{risk.level}</h3></div><strong className="risk-score">{risk.total_score}<i>/{risk.max_score}</i></strong></div>
            <div className="risk-meter" role="meter" aria-label="Composite risk score" aria-valuemin="0" aria-valuemax={risk.max_score} aria-valuenow={risk.total_score}>
              <span style={{ width: `${riskPercent}%` }} />
            </div>
            <div className="risk-factors">
              {risk.factors.map((factor) => <span key={factor.name}><i>{factor.name.replace(' (illustrative, user-set)', '').replace(' (CoV, recent window)', '')}</i><strong>{factor.value}</strong></span>)}
            </div>
            <p className="source-note">{risk.source}</p>
          </article>

          <article className="decision-card decision-card--economics" data-enter>
            <div className="card-heading"><div><p className="card-kicker">Contract economics</p><h3>Comparable options</h3></div></div>
            <div className="strategy-list">
              {strategies.map((strategy) => (
                <div className={strategy.total === cheapest ? 'is-cheapest' : ''} key={strategy.name}>
                  <span><strong>{strategy.name}</strong>{strategy.total === cheapest && <i>Lowest modeled cost</i>}</span>
                  <span><i>${money(strategy.rate)}/mt</i><strong>{cost(strategy.total)}</strong></span>
                </div>
              ))}
            </div>
            {backtest && <p className="backtest-note"><strong>{backtestOutcome(backtest.avg_savings_per_mt)}</strong> across {backtest.n_points} walk-forward points.</p>}
          </article>
        </div>
      )}
    </section>
  );
}
