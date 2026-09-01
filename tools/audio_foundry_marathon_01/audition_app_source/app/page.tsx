'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

type AssetTier = 'primary' | 'alternate' | 'radio-demo';
type Item = {
  id: string; kind: 'music' | 'radio'; tier: AssetTier; epoch: string;
  epochCode: string; blindCode: string; title: string; audio: string; seam?: string;
  durationSeconds: number; status: string;
};
type Catalogue = { schemaVersion: string; generatedUtc: string; items: Item[] };
type RevealDetail = {
  candidateId?: string; family?: string; title: string; stableTrackId: string;
  shortlistRole: string; familyId?: string; machineLabel?: string; seed?: number;
};
type RevealCatalogue = { reveal: Record<string, RevealDetail> };
type RatingKey = 'quality' | 'eraFeel' | 'studioSpirit' | 'managementSuitability' | 'irritation' | 'repetition';
type Rating = Partial<Record<RatingKey, number>> & { verdict?: 'keep' | 'maybe' | 'reject'; notes?: string; savedAt?: string };

const STORAGE_KEY = 'project-studio-audio-foundry-marathon-01-ratings-v1';
const FIELDS: Array<{ key: RatingKey; label: string; low: string; high: string }> = [
  { key: 'quality', label: 'Quality', low: 'rough', high: 'excellent' },
  { key: 'eraFeel', label: 'Era feel', low: 'weak', high: 'strong' },
  { key: 'studioSpirit', label: 'Studio spirit', low: 'absent', high: 'alive' },
  { key: 'managementSuitability', label: 'Management fit', low: 'distracting', high: 'supportive' },
  { key: 'irritation', label: 'Irritation', low: 'none', high: 'high' },
  { key: 'repetition', label: 'Repetition', low: 'none', high: 'high' },
];
const EMPTY: Catalogue = { schemaVersion: '1.0.0', generatedUtc: '', items: [] };

function csvCell(value: unknown) { return `"${String(value ?? '').replaceAll('"', '""')}"`; }
function download(name: string, payload: string, type: string) {
  const url = URL.createObjectURL(new Blob([payload], { type }));
  const anchor = document.createElement('a');
  anchor.href = url; anchor.download = name; anchor.click(); URL.revokeObjectURL(url);
}
function duration(value: number) {
  return `${Math.floor(value / 60)}:${Math.round(value % 60).toString().padStart(2, '0')}`;
}

export default function Home() {
  const [catalogue, setCatalogue] = useState<Catalogue>(EMPTY);
  const [ratings, setRatings] = useState<Record<string, Rating>>({});
  const [selectedId, setSelectedId] = useState('');
  const [epoch, setEpoch] = useState('ALL');
  const [tier, setTier] = useState<'all' | AssetTier>('primary');
  const [blind, setBlind] = useState(true);
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});
  const [revealIndex, setRevealIndex] = useState<Record<string, RevealDetail>>({});
  const [loadError, setLoadError] = useState('');
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    queueMicrotask(() => {
      try { const stored = localStorage.getItem(STORAGE_KEY); if (stored) setRatings(JSON.parse(stored)); }
      catch { setLoadError('Saved ratings could not be read. The catalogue remains available.'); }
    });
    fetch('/data/catalogue.json', { cache: 'no-store' })
      .then((response) => { if (!response.ok) throw new Error(`catalogue HTTP ${response.status}`); return response.json(); })
      .then((value: Catalogue) => { setCatalogue(value); setSelectedId(value.items[0]?.id ?? ''); })
      .catch((error: Error) => setLoadError(`Catalogue unavailable: ${error.message}`));
  }, []);

  const epochs = useMemo(() => Array.from(new Map(
    catalogue.items.filter((item) => item.kind === 'music').map((item) => [item.epochCode, item.epoch]),
  ).entries()), [catalogue]);
  const visible = useMemo(() => catalogue.items.filter((item) =>
    (epoch === 'ALL' || item.epochCode === epoch) && (tier === 'all' || item.tier === tier),
  ), [catalogue, epoch, tier]);

  const selected = visible.find((item) => item.id === selectedId) ?? visible[0];
  const current = selected ? ratings[selected.id] ?? {} : {};
  const ratedCount = Object.values(ratings).filter((rating) => rating.verdict).length;
  const hidden = Boolean(blind && selected && !revealed[selected.id]);
  const identity = selected ? revealIndex[selected.id] : undefined;

  async function loadRevealIndex() {
    if (Object.keys(revealIndex).length) return revealIndex;
    const response = await fetch('/data/reveal.json', { cache: 'no-store' });
    if (!response.ok) throw new Error(`reveal index HTTP ${response.status}`);
    const value = await response.json() as RevealCatalogue;
    setRevealIndex(value.reveal);
    return value.reveal;
  }

  async function setBlindListening(nextBlind: boolean) {
    setBlind(nextBlind);
    if (!nextBlind) {
      try { await loadRevealIndex(); }
      catch (error) { setLoadError(`Reveal index unavailable: ${(error as Error).message}`); }
    }
  }

  async function revealSelected() {
    if (!selected || !ratings[selected.id]?.verdict) return;
    try {
      const index = await loadRevealIndex();
      if (!index[selected.id]) throw new Error(`identity missing for ${selected.id}`);
      setRevealed((currentRevealed) => ({ ...currentRevealed, [selected.id]: true }));
    } catch (error) { setLoadError(`Reveal index unavailable: ${(error as Error).message}`); }
  }

  function updateRating(patch: Partial<Rating>) {
    if (!selected) return;
    const next = { ...ratings, [selected.id]: { ...ratings[selected.id], ...patch, savedAt: new Date().toISOString() } };
    setRatings(next); localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }
  function selectItem(id: string) {
    setSelectedId(id);
    requestAnimationFrame(() => { audioRef.current?.pause(); audioRef.current?.load(); });
  }
  function exportJson() {
    download(`project-studio-feedback-${new Date().toISOString().slice(0, 10)}.json`, JSON.stringify({
      schemaVersion: '1.0.0', exportedAt: new Date().toISOString(), catalogueGeneratedUtc: catalogue.generatedUtc,
      status: 'OWNER_AUDITION_FEEDBACK_NOT_PRODUCTION_CLEARANCE', ratings,
    }, null, 2), 'application/json');
  }
  function exportCsv() {
    const headers = ['item_id', 'blind_code', 'kind', 'tier', 'epoch_code', ...FIELDS.map((field) => field.key), 'verdict', 'notes', 'saved_at'];
    const lines = [headers.map(csvCell).join(',')];
    for (const item of catalogue.items) {
      const rating = ratings[item.id] ?? {};
      lines.push([item.id, item.blindCode, item.kind, item.tier, item.epochCode,
        ...FIELDS.map((field) => rating[field.key]), rating.verdict, rating.notes, rating.savedAt].map(csvCell).join(','));
    }
    download(`project-studio-feedback-${new Date().toISOString().slice(0, 10)}.csv`, `${lines.join('\n')}\n`, 'text/csv;charset=utf-8');
  }

  return (
    <main className="app-shell">
      <header className="masthead">
        <div className="brand-lockup"><span className="brand-mark" aria-hidden="true">PS</span><div>
          <p className="eyebrow">Project: Studio · Audio Foundry 01</p><h1>Owner audition desk</h1>
        </div></div>
        <div className="status-strip"><span className="status-pill">Offline</span><span>{ratedCount} / {catalogue.items.length} decisions</span><span className="prototype-label">Prototype audition only</span></div>
      </header>

      <section className="control-bar" aria-label="Audition filters">
        <label><span>Epoch</span><select value={epoch} onChange={(event) => setEpoch(event.target.value)}>
          <option value="ALL">All epochs + radio</option>
          {epochs.map(([code, name]) => <option key={code} value={code}>{code} · {name.replaceAll('_', ' ')}</option>)}
        </select></label>
        <label><span>Set</span><select value={tier} onChange={(event) => setTier(event.target.value as typeof tier)}>
          <option value="primary">27 provisional picks</option><option value="alternate">Alternates</option>
          <option value="radio-demo">Radio demos</option><option value="all">Everything</option>
        </select></label>
        <label className="toggle-control"><input type="checkbox" checked={blind} onChange={(event) => { void setBlindListening(event.target.checked); }} /><span className="toggle-track" aria-hidden="true"><span /></span>Blind listening</label>
        <div className="export-group"><button className="button ghost" onClick={exportCsv} disabled={!catalogue.items.length}>Export CSV</button><button className="button ghost" onClick={exportJson} disabled={!catalogue.items.length}>Export JSON</button></div>
      </section>

      {loadError && <p className="error-banner" role="alert">{loadError}</p>}
      <div className="workspace">
        <aside className="queue-panel" aria-label="Audition queue">
          <div className="panel-heading"><span>Audition queue</span><span>{visible.length}</span></div>
          <ol className="queue-list">{visible.map((item) => {
            const saved = ratings[item.id];
            return <li key={item.id}><button className={`queue-item ${item.id === selected?.id ? 'selected' : ''}`} onClick={() => selectItem(item.id)}>
              <span className="queue-index">{item.blindCode}</span><span className="queue-copy">
                <strong>{blind && !revealed[item.id] ? `${item.kind === 'radio' ? 'Radio reel' : 'Music candidate'} ${item.blindCode}` : revealIndex[item.id]?.title ?? item.title}</strong>
                <small>{item.epochCode} · {item.tier.replace('-', ' ')}</small>
              </span><span className={`decision-dot ${saved?.verdict ?? ''}`} title={saved?.verdict ?? 'unrated'} />
            </button></li>;
          })}</ol>
        </aside>

        <section className="player-panel">{selected ? <>
          <div className="record-card"><div className="record-grooves" aria-hidden="true"><span /></div><div className="record-copy">
            <p className="eyebrow">{selected.epochCode} · {selected.tier.replace('-', ' ')}</p>
            <h2>{hidden ? `Blind candidate ${selected.blindCode}` : identity?.title ?? selected.title}</h2>
            <p className="subline">{duration(selected.durationSeconds)} · {selected.status.replaceAll('_', ' ')}</p>
            <audio ref={audioRef} controls preload="metadata" src={selected.audio}>Your browser cannot play this local audio file.</audio>
            {selected.seam && <a className="seam-link" href={selected.seam} target="_blank">Open 12-second loop seam check</a>}
          </div></div>
          <div className={`identity-card ${hidden ? 'concealed' : ''}`}><div><p className="eyebrow">Commissioning identity</p>
            <p><strong>Family:</strong> {hidden ? 'Hidden until a verdict is saved' : identity?.family ?? 'Loading local identity…'}</p>
            {identity?.candidateId && <p><strong>Candidate:</strong> {hidden ? 'Hidden' : identity.candidateId}</p>}
          </div>{blind && <button className="button reveal" disabled={!ratings[selected.id]?.verdict || revealed[selected.id]} onClick={() => { void revealSelected(); }}>{revealed[selected.id] ? 'Family revealed' : ratings[selected.id]?.verdict ? 'Reveal family' : 'Save keep / maybe / reject first'}</button>}</div>

          <section className="rating-sheet" aria-label="Rating sheet">
            <div className="sheet-heading"><div><p className="eyebrow">Listening card</p><h3>Rate what you actually hear</h3></div><span>1 low · 5 high</span></div>
            <div className="rating-grid">{FIELDS.map((field) => <fieldset key={field.key}><legend>{field.label}</legend>
              <div className="scale-labels"><span>{field.low}</span><span>{field.high}</span></div><div className="score-buttons">{[1, 2, 3, 4, 5].map((value) =>
                <button key={value} type="button" aria-label={`${field.label}: ${value}`} className={current[field.key] === value ? 'active' : ''} onClick={() => updateRating({ [field.key]: value })}>{value}</button>)}</div>
            </fieldset>)}</div>
            <div className="verdict-row"><span>Decision</span>{(['keep', 'maybe', 'reject'] as const).map((verdict) =>
              <button key={verdict} className={`verdict ${verdict} ${current.verdict === verdict ? 'active' : ''}`} onClick={() => updateRating({ verdict })}>{verdict}</button>)}</div>
            <label className="notes-field"><span>Owner notes</span><textarea value={current.notes ?? ''} onChange={(event) => updateRating({ notes: event.target.value })} placeholder="Moments, instruments, fatigue risks, revision direction…" /></label>
            <p className="save-note">Ratings save automatically in this browser on this Mac. Export creates the transferable record.</p>
          </section>
        </> : <div className="empty-state"><h2>Catalogue pending</h2><p>The foundry will publish the verified shortlist here after analysis and processing.</p></div>}</section>

        <aside className="boundary-panel"><p className="eyebrow">Decision boundary</p><h3>Nothing here is ship-cleared.</h3>
          <p>Machine rankings organize listening. They do not establish quality, historical authenticity, originality, rights clearance, or cultural acceptance.</p>
          <dl><div><dt>Primary picks</dt><dd>{catalogue.items.filter((item) => item.tier === 'primary').length}</dd></div><div><dt>Alternates</dt><dd>{catalogue.items.filter((item) => item.tier === 'alternate').length}</dd></div><div><dt>Radio reels</dt><dd>{catalogue.items.filter((item) => item.tier === 'radio-demo').length}</dd></div></dl>
          <p className="privacy-note">No account · no internet · no telemetry · localhost only</p>
        </aside>
      </div>
    </main>
  );
}
