import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import RightCard from './RightCard';

const ORIGINS = ['Australia', 'United States', 'Mozambique', 'Russia', 'Indonesia'];
const DESTINATIONS = ['Paradip', 'Visakhapatnam', 'Gangavaram', 'Gopalpur', 'Dhamra', 'Sagar/Sandheads', 'Haldia'];
const VESSEL_CLASSES = ['Handysize', 'Supramax', 'Panamax', 'Capesize'];
const HORIZONS = [7, 14, 30, 60];

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

export default function SectionHero({ requirement, loading, error, onRun }) {
  const [form, setForm] = useState(requirement);

  useEffect(() => setForm(requirement), [requirement]);

  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  return (
    <div className="relative flex items-center justify-between h-full w-full px-12 lg:px-20 gap-12">
      <motion.div className="flex-1 max-w-xl" initial="hidden" animate="show">
        <motion.div variants={fadeUp} className="mb-8">
          <span className="section-label">Pipeline Input</span>
        </motion.div>
        <motion.h1 variants={fadeUp} className="text-5xl lg:text-7xl font-black leading-[1.12] tracking-tight">
          <span className="text-white">Predictive.</span><br />
          <span className="bg-gradient-to-r from-cyan-300 via-teal-300 to-emerald-300 bg-clip-text text-transparent">Model-backed.</span><br />
          <span className="text-white/80">Explainable.</span>
        </motion.h1>
        <motion.p variants={fadeUp} className="mt-8 text-lg text-slate-300/90 leading-[1.8] max-w-md">
          The React UI now calls the unified Python pipeline. Exact supported scopes use the trained PyTorch/XGBoost artifacts; every unsupported combination is identified and routed to the documented Holt baseline.
        </motion.p>
        <motion.div variants={fadeUp} className="mt-10 p-5 rounded-2xl border border-white/10 bg-white/5 max-w-md text-sm text-slate-300 leading-relaxed">
          <div className="text-cyan-300 font-semibold mb-1">Trained freight scope</div>
          Australia → Paradip · Capesize · 7/14/30/60 days<br />
          <span className="text-slate-500">Other selections remain runnable with explicit fallback provenance.</span>
        </motion.div>
      </motion.div>

      <div className="flex-shrink-0">
        <RightCard title="Procurement Requirement" subtitle="Submit once to run forecast → feasibility → risk → recommendation." sectionIndex={0}>
          {[
            ['Origin', 'origin', ORIGINS],
            ['Destination (Indian Port)', 'destination', DESTINATIONS],
            ['Vessel Class', 'vessel_class', VESSEL_CLASSES],
          ].map(([label, key, options]) => (
            <label key={key} className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">
              {label}
              <select className="form-select mt-2" value={form[key]} onChange={(event) => update(key, event.target.value)}>
                {options.map((option) => <option key={option}>{option}</option>)}
              </select>
            </label>
          ))}
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Cargo Quantity (mt)
            <input className="form-input mt-2" type="number" min="1000" max="250000" step="1000" value={form.cargo_quantity_mt} onChange={(event) => update('cargo_quantity_mt', Number(event.target.value))} />
          </label>
          <div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Forecast Horizon</div>
            <div className="toggle-group">
              {HORIZONS.map((horizon) => (
                <button key={horizon} type="button" className={`toggle-btn ${form.horizon_days === horizon ? 'active' : ''}`} onClick={() => update('horizon_days', horizon)}>{horizon}d</button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              ['Congestion', 'congestion_level'],
              ['Availability', 'availability_level'],
            ].map(([label, key]) => (
              <label key={key} className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">
                {label}
                <select className="form-select mt-2" value={form[key]} onChange={(event) => update(key, event.target.value)}>
                  {['Low', 'Medium', 'High'].map((option) => <option key={option}>{option}</option>)}
                </select>
              </label>
            ))}
          </div>
          {error && <div role="alert" className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">{error}</div>}
          <button type="button" disabled={loading} onClick={() => onRun(form)} className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 text-white font-semibold text-sm disabled:opacity-60 cursor-pointer">
            {loading ? 'Running models…' : 'Run Unified Pipeline →'}
          </button>
        </RightCard>
      </div>
    </div>
  );
}

