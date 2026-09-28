import { useState } from 'react';

function ArrowIcon() {
  return <svg aria-hidden="true" viewBox="0 0 20 20"><path d="M4 10h11M11 5l5 5-5 5" /></svg>;
}

const unique = (values) => [...new Set(values)];

export default function RequirementForm({ config, requirement, loading, error, onRun }) {
  const [form, setForm] = useState(requirement);
  const scenarios = config.supported_scenarios;
  const constraints = config.input_constraints;
  const origins = unique(scenarios.map((scenario) => scenario.origin));
  const destinations = unique(scenarios.filter((scenario) => scenario.origin === form.origin).map((scenario) => scenario.destination));
  const vessels = unique(scenarios.filter((scenario) => scenario.origin === form.origin && scenario.destination === form.destination).map((scenario) => scenario.vessel_class));
  const activeScenario = scenarios.find((scenario) => (
    scenario.origin === form.origin
    && scenario.destination === form.destination
    && scenario.vessel_class === form.vessel_class
  ));
  const horizons = activeScenario?.horizons_days ?? [];

  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }));
  const updateOrigin = (origin) => {
    const scenario = scenarios.find((candidate) => candidate.origin === origin);
    setForm((current) => ({
      ...current,
      origin,
      destination: scenario.destination,
      vessel_class: scenario.vessel_class,
      cargo_type: scenario.cargo_type,
      horizon_days: scenario.horizons_days[0],
    }));
  };
  const updateDestination = (destination) => {
    const scenario = scenarios.find((candidate) => candidate.origin === form.origin && candidate.destination === destination);
    setForm((current) => ({
      ...current,
      destination,
      vessel_class: scenario.vessel_class,
      cargo_type: scenario.cargo_type,
      horizon_days: scenario.horizons_days[0],
    }));
  };
  const updateVessel = (vesselClass) => {
    const scenario = scenarios.find((candidate) => (
      candidate.origin === form.origin
      && candidate.destination === form.destination
      && candidate.vessel_class === vesselClass
    ));
    setForm((current) => ({
      ...current,
      vessel_class: vesselClass,
      cargo_type: scenario.cargo_type,
      horizon_days: scenario.horizons_days[0],
    }));
  };
  const submit = (event) => { event.preventDefault(); onRun(form); };
  const cargoMinimum = constraints.cargo_quantity_mt.exclusive_minimum + 1;

  return (
    <form className="brief-card" onSubmit={submit}>
      <div className="brief-card__head">
        <div>
          <p className="eyebrow">Procurement brief</p>
          <h2>Build a route scenario</h2>
        </div>
        <span className="live-status"><i /> Backend {config.service_status}</span>
      </div>
      <div className="form-grid">
        <label className="field field--wide">
          <span>Origin</span>
          <select value={form.origin} onChange={(event) => updateOrigin(event.target.value)}>
            {origins.map((option) => <option key={option}>{option}</option>)}
          </select>
        </label>
        <label className="field field--wide">
          <span>Destination port</span>
          <select value={form.destination} onChange={(event) => updateDestination(event.target.value)}>
            {destinations.map((option) => <option key={option}>{option}</option>)}
          </select>
        </label>
        <label className="field">
          <span>Vessel class</span>
          <select value={form.vessel_class} onChange={(event) => updateVessel(event.target.value)}>
            {vessels.map((option) => <option key={option}>{option}</option>)}
          </select>
        </label>
        <label className="field">
          <span>Cargo quantity</span>
          <span className="input-suffix">
            <input
              type="number"
              min={cargoMinimum}
              max={constraints.cargo_quantity_mt.maximum}
              step={constraints.cargo_quantity_mt.step}
              value={form.cargo_quantity_mt}
              onChange={(event) => update('cargo_quantity_mt', Number(event.target.value))}
            />
            <i>mt</i>
          </span>
        </label>
        <fieldset className="field field--wide horizon-field">
          <legend>Forecast horizon</legend>
          <div className="segmented-control" style={{ '--segment-count': horizons.length }}>
            {horizons.map((horizon) => (
              <button key={horizon} type="button" className={form.horizon_days === horizon ? 'is-active' : ''} onClick={() => update('horizon_days', horizon)}>
                {horizon} {horizon === 1 ? 'day' : 'days'}
              </button>
            ))}
          </div>
        </fieldset>
        <label className="field">
          <span>Port congestion</span>
          <select value={form.congestion_level} onChange={(event) => update('congestion_level', event.target.value)}>
            {constraints.congestion_levels.map((option) => <option key={option}>{option}</option>)}
          </select>
        </label>
        <label className="field">
          <span>Vessel availability</span>
          <select value={form.availability_level} onChange={(event) => update('availability_level', event.target.value)}>
            {constraints.availability_levels.map((option) => <option key={option}>{option}</option>)}
          </select>
        </label>
      </div>
      <p className="form-provenance">Available choices are limited to trained artifacts reported by the backend.</p>
      {error && <p className="form-error" role="alert">{error}</p>}
      <button className="primary-button primary-button--submit" type="submit" disabled={loading}>
        {loading ? <span className="loading-mark" aria-hidden="true" /> : null}
        {loading ? 'Running decision pipeline' : 'Generate decision brief'}
        {!loading && <ArrowIcon />}
      </button>
    </form>
  );
}
