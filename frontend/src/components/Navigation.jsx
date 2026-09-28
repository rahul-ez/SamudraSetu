import { useState } from 'react';

function ArrowIcon() {
  return <svg aria-hidden="true" viewBox="0 0 20 20"><path d="M4 10h11M11 5l5 5-5 5" /></svg>;
}

export default function Navigation({ onRunClick, loading }) {
  const [open, setOpen] = useState(false);
  const closeMenu = () => setOpen(false);

  return (
    <header className="navigation" id="top">
      <div className="navigation__inner page-frame">
        <a className="brand" href="#top" aria-label="SamudraSetu home" onClick={closeMenu}>
          <span className="brand__mark" aria-hidden="true"><i /><i /><i /></span>
          <span>SamudraSetu</span>
        </a>
        <nav className={`navigation__links ${open ? 'is-open' : ''}`} aria-label="Primary navigation">
          <a href="#forecast" onClick={closeMenu}>Forecast</a>
          <a href="#evidence" onClick={closeMenu}>Evidence</a>
          <a href="#decision" onClick={closeMenu}>Decision</a>
          <button className="primary-button navigation__action" type="button" onClick={() => { closeMenu(); onRunClick(); }} disabled={loading}>
            {loading ? 'Running' : 'Run forecast'} <ArrowIcon />
          </button>
        </nav>
        <button
          className={`menu-button ${open ? 'is-open' : ''}`}
          type="button"
          aria-label={open ? 'Close navigation' : 'Open navigation'}
          aria-expanded={open}
          onClick={() => setOpen((current) => !current)}
        >
          <span /><span />
        </button>
      </div>
    </header>
  );
}
