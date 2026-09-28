import { useState } from 'react';

const ORIGINS = ['Australia', 'United States', 'Mozambique', 'Russia', 'Indonesia'];
const DESTINATIONS = ['Paradip', 'Visakhapatnam', 'Gangavaram', 'Gopalpur', 'Dhamra', 'Sagar/Sandheads', 'Haldia'];
const VESSEL_CLASSES = ['Handysize', 'Supramax', 'Panamax', 'Capesize'];
const HORIZONS = [7, 14, 30, 60];

function ArrowIcon() {
  return <svg aria-hidden="true" viewBox="0 0 20 20"><path d="M4 10h11M11 5l5 5-5 5" /></svg>;
}

export default function RequirementForm({ requirement, loading, error, onRun }) {
  const [form, setForm] = useState(requirement);
  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }));
  const submit = (event) => { event.preventDefault(); onRun(form); };

  return (
    <form className="brief-card" onSubmit={submit}>
      <div className="brief-card__head">
        <div>
          <p className="eyebrow">Procurement brief</p>
          <h2>Build a route scenario</h2>
        </div>
        <span className="live-status"><i /> Pipeline ready</span>
      </div>
      <div className="form-grid">
        <label className="field field--wide">
          <span>Origin</span>
          <select value={form.origin} onChange={(event) => update('origin', event.target.value)}>
            {ORIGINS.map((option) => <option key={option}>{option}</option>)}
          </select>
        </label>
        <label className="field field--wide">
          <span>Destination port</span>
          <select value={form.destination} onChange={(event) => update('destination', event.target.value)}>
            {DESTINATIONS.map((option) => <option key={option}>{option}</option>)}
          </select>
        </label>
        <label className="field">
          <span>Vessel class</span>
          <select value={form.vessel_class} onChange={(event) => update('vessel_class', event.target.value)}>
            {VESSEL_CLASSES.map((option) => <option key={option}>{option}</option>)}
          </select>
        </label>
        <label className="field">
          <span>Cargo quantity</span>
          <span className="input-suffix">
            <input type="number" min="1000" max="250000" step="1000" value={form.cargo_quantity_mt} onChange={(event) => update('cargo_quantity_mt', Number(event.target.value))} />
            <i>mt</i>
          </span>
        </label>
        <fieldset className="field field--wide horizon-field">
          <legend>Forecast horizon</legend>
          <div className="segmented-control">
            {HORIZONS.map((horizon) => (
              <button key={horizon} type="button" className={form.horizon_days === horizon ? 'is-active' : ''} onClick={() => update('horizon_days', horizon)}>
                {horizon} days
              </button>
            ))}
          </div>
        </fieldset>
        <label className="field">
          <span>Port congestion</span>
          <select value={form.congestion_level} onChange={(event) => update('congestion_level', event.target.value)}>
            {['Low', 'Medium', 'High'].map((option) => <option key={option}>{option}</option>)}
          </select>
        </label>
        <label className="field">
          <span>Vessel availability</span>
          <select value={form.availability_level} onChange={(event) => update('availability_level', event.target.value)}>
            {['Low', 'Medium', 'High'].map((option) => <option key={option}>{option}</option>)}
          </select>
        </label>
      </div>
      {error && <p className="form-error" role="alert">{error}</p>}
      <button className="primary-button primary-button--submit" type="submit" disabled={loading}>
        {loading ? <span className="loading-mark" aria-hidden="true" /> : null}
        {loading ? 'Running decision pipeline' : 'Generate decision brief'}
        {!loading && <ArrowIcon />}
      </button>
    </form>
  );
}
