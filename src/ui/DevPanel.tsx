// Developer control HUD (contract §8) + provenance status (§12). Pure DOM overlay.
import { useEffect, useState, type CSSProperties, type ReactNode } from 'react'
import { useLab } from '../lab/LabContext'
import { latestStats } from '../lab/stats'
import { applyView, D_VIEWS, E_VIEWS, F_VIEWS, G_REVIEW, G_REVIEW_ORDER, G_REVIEW_DEFAULT, G_HERO_ORDER, G_HERO_05G_ORDER, G_HERO_05H_ORDER, G_HERO_05I_ORDER, G_MGMT_ORDER, getReviewView, gReviewKind } from '../lab/cameraBridge'
import { getErrorCount, getLastError } from '../lab/errors'
import type { RuntimeManifest, Provenance, SceneKey } from '../types'

const PROV_COLOR: Record<Provenance, string> = {
  'CC0': '#22c55e', 'ATTRIBUTION-REQUIRED': '#3b82f6', 'PROTOTYPE-ONLY': '#f59e0b',
  'LICENSE-UNCLEAR': '#f59e0b', 'DO-NOT-USE': '#ef4444',
}
const SCENE_LABEL: Record<SceneKey, string> = { A: 'A · Lab01 lot', B: 'B · Furnished', C: 'C · Animation', D: 'D · Studio greybox', E: 'E · Hero stage', F: 'F · Refined lot', G: 'G · Character Art Review (Lab05E)' }
const SCENE_PACK: Record<SceneKey, string> = { A: 'downtown', B: 'props', C: 'animation', D: 'downtown', E: 'animation', F: 'downtown', G: 'studio' }

const panel: CSSProperties = {
  position: 'fixed', top: 0, left: 0, width: 340, maxHeight: '100vh', overflowY: 'auto',
  background: 'rgba(12,15,20,0.92)', color: '#dfe6ee', font: '12px/1.45 ui-monospace, SFMono-Regular, Menlo, monospace',
  padding: '12px 14px 40px', borderRight: '1px solid #232a33', backdropFilter: 'blur(6px)', zIndex: 10,
}
const h: CSSProperties = { margin: '14px 0 6px', fontSize: 11, letterSpacing: 0.8, textTransform: 'uppercase', color: '#7d8896' }
const row: CSSProperties = { display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }

function Btn({ on, onClick, children }: { on?: boolean; onClick: () => void; children: ReactNode }): JSX.Element {
  return (
    <button onClick={onClick} style={{
      padding: '4px 9px', borderRadius: 6, cursor: 'pointer', fontSize: 11,
      border: '1px solid ' + (on ? '#3b8fbf' : '#2b333d'), background: on ? '#12405a' : '#161b22',
      color: on ? '#cdeafd' : '#c2ccd6',
    }}>{children}</button>
  )
}
function Toggle({ label, on, onChange }: { label: string; on: boolean; onChange: (v: boolean) => void }): JSX.Element {
  return (
    <label style={{ display: 'flex', gap: 6, alignItems: 'center', cursor: 'pointer', minWidth: 140 }}>
      <input type="checkbox" checked={on} onChange={(e) => onChange(e.target.checked)} />{label}
    </label>
  )
}
function Slider({ label, value, min, max, step, onChange }:
  { label: string; value: number; min: number; max: number; step: number; onChange: (v: number) => void }): JSX.Element {
  return (
    <label style={{ display: 'block', margin: '4px 0' }}>
      <span style={{ color: '#9fb0c0' }}>{label}: {value.toFixed(2)}</span>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))} style={{ width: '100%' }} />
    </label>
  )
}
function Badge({ p }: { p: Provenance }): JSX.Element {
  return <span style={{ background: PROV_COLOR[p], color: '#07110a', padding: '1px 6px', borderRadius: 4, fontWeight: 700, fontSize: 10 }}>{p}</span>
}

// ---- Lab 05E: Scene-G owner character-review controls + status panel ----
const REVIEW_GROUPS = ['Lineups', 'Close Review', 'Animation', 'LOD', 'Context'] as const

function GReviewControls(): JSX.Element {
  const { state, set, resetCamera } = useLab()
  return (
    <div>
      {REVIEW_GROUPS.map((grp) => (
        <div key={grp} style={{ marginBottom: 6 }}>
          <div style={{ fontSize: 10, color: '#7d8896', letterSpacing: 0.5, margin: '4px 0 3px' }}>{grp}</div>
          <div style={row}>
            {G_REVIEW_ORDER.filter((n) => G_REVIEW[n].group === grp).map((n) => (
              <Btn key={n} on={state.gReview === n} onClick={() => set('gReview', n)}>{n}</Btn>
            ))}
          </div>
        </div>
      ))}
      <div style={{ marginBottom: 6 }}>
        <div style={{ fontSize: 10, color: '#f0a860', letterSpacing: 0.5, margin: '6px 0 3px' }}>05F Hero — 05E Electric ↔ 05F hero A/B</div>
        <div style={row}>
          {G_HERO_ORDER.map((n) => (
            <Btn key={n} on={state.gReview === n} onClick={() => set('gReview', n)}>{n}</Btn>
          ))}
        </div>
      </div>
      <div style={{ marginBottom: 6 }}>
        <div style={{ fontSize: 10, color: '#7ee787', letterSpacing: 0.5, margin: '6px 0 3px' }}>05G Hero — 05F hero ↔ 05G surgical correction A/B</div>
        <div style={row}>
          {G_HERO_05G_ORDER.map((n) => (
            <Btn key={n} on={state.gReview === n} onClick={() => set('gReview', n)}>{n}</Btn>
          ))}
        </div>
      </div>
      <div style={{ marginBottom: 6 }}>
        <div style={{ fontSize: 10, color: '#58a6ff', letterSpacing: 0.5, margin: '6px 0 3px' }}>05H Hero — 05G hero ↔ 05H authored-base A/B</div>
        <div style={row}>
          {G_HERO_05H_ORDER.map((n) => (
            <Btn key={n} on={state.gReview === n} onClick={() => set('gReview', n)}>{n}</Btn>
          ))}
        </div>
      </div>
      <div style={{ marginBottom: 6 }}>
        <div style={{ fontSize: 10, color: '#7ee7c7', letterSpacing: 0.5, margin: '6px 0 3px' }}>05I Hero — 05H hero ↔ 05I corrective pass A/B</div>
        <div style={row}>
          {G_HERO_05I_ORDER.map((n) => (
            <Btn key={n} on={state.gReview === n} onClick={() => set('gReview', n)}>{n}</Btn>
          ))}
        </div>
        <div style={{ ...row, marginTop: 6 }}>
          <Toggle label="Neutral eval light (§7 material honesty)" on={state.neutralEval} onChange={(v) => set('neutralEval', v)} />
        </div>
      </div>
      <div style={{ marginBottom: 6 }}>
        <div style={{ fontSize: 10, color: '#d29bfd', letterSpacing: 0.5, margin: '6px 0 3px' }}>05H Mgmt — fixed-isometric management camera (Question B: value at lot distance)</div>
        <div style={row}>
          {G_MGMT_ORDER.map((n) => (
            <Btn key={n} on={state.gReview === n} onClick={() => set('gReview', n)}>{n}</Btn>
          ))}
        </div>
        {gReviewKind(state.gReview) === 'mgmt' && (
          <div style={{ marginTop: 6, borderTop: '1px dashed #2b333d', paddingTop: 6 }}>
            <div style={{ fontSize: 10, color: '#7d8896', margin: '0 0 3px' }}>Worker source (live-3D vs alternatives)</div>
            <div style={row}>
              {(['05h', '05g', 'sprite', 'none'] as const).map((w) => (
                <Btn key={w} on={(state.mgmtWorker || '05h') === w} onClick={() => set('mgmtWorker', w === '05h' ? '' : w)}>{w}</Btn>
              ))}
            </div>
            <div style={{ fontSize: 10, color: '#7d8896', margin: '6px 0 3px' }}>Framing (worker pixel scale)</div>
            <div style={row}>
              {([['wide', 0.55], ['default', 1], ['tight', 1.7]] as const).map(([lbl, m]) => (
                <Btn key={lbl} on={Math.abs((state.mgmtZoomMul || 1) - m) < 0.01} onClick={() => set('mgmtZoomMul', m)}>{lbl}</Btn>
              ))}
            </div>
            <div style={{ ...row, marginTop: 6 }}>
              <Toggle label="Reduced motion (freeze)" on={state.reducedMotion} onChange={(v) => set('reducedMotion', v)} />
            </div>
          </div>
        )}
      </div>
      <div style={{ ...row, marginTop: 4 }}>
        <Btn on={state.gReview === G_REVIEW_DEFAULT} onClick={() => { set('gReview', G_REVIEW_DEFAULT); resetCamera() }}>Reset</Btn>
      </div>
    </div>
  )
}

function GReviewStatus(): JSX.Element {
  const { state } = useLab()
  const s = latestStats
  const v = getReviewView(state.gReview)
  const kind = gReviewKind(state.gReview)
  const hero05g = kind === 'hero05gcompare' || kind === 'hero05gsingle' || kind === 'hero05glod'
  const hero05h = kind === 'hero05hcompare' || kind === 'hero05hsingle' || kind === 'hero05hlod'
  const hero05i = kind === 'hero05icompare' || kind === 'hero05isingle' || kind === 'hero05ilod'
  const hero = hero05g || hero05h || hero05i || kind === 'herocompare' || kind === 'herosingle' || kind === 'herolod'
  const isLodTrio = kind === 'lod' || kind === 'herolod' || kind === 'hero05glod' || kind === 'hero05hlod' || kind === 'hero05ilod'
  const chars = isLodTrio ? 3 : hero ? 2 : 8
  const anim = v?.clip ?? (kind === 'anim' ? '—' : kind === 'production' ? 'per-role (production)' : 'Idle (static)')
  const lod = isLodTrio ? 'LOD0 / LOD1 / LOD2' : 'LOD0 (as authored)'
  const errs = getErrorCount()
  const cell: CSSProperties = { display: 'flex', justifyContent: 'space-between', gap: 8 }
  return (
    <div style={{ border: '1px solid #24303a', background: 'rgba(18,30,42,0.5)', borderRadius: 8, padding: '8px 10px', margin: '8px 0 4px' }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: '#cdeafd', marginBottom: 5 }}>Review status</div>
      <div style={{ display: 'grid', gap: '2px 0' }}>
        <div style={cell}><span style={{ color: '#8a94a0' }}>milestone</span><b>{hero05i ? 'Asset Lab 05I (corrective pass)' : hero05h ? 'Asset Lab 05H (authored base)' : hero05g ? 'Asset Lab 05G (hero)' : hero ? 'Asset Lab 05F (hero)' : 'Asset Lab 05E'}</b></div>
        <div style={cell}><span style={{ color: '#8a94a0' }}>active camera</span><b style={{ color: '#7ee787' }}>{state.gReview}</b></div>
        <div style={cell}><span style={{ color: '#8a94a0' }}>animation</span><b>{anim}</b></div>
        <div style={cell}><span style={{ color: '#8a94a0' }}>LOD</span><b>{lod}</b></div>
        <div style={cell}><span style={{ color: '#8a94a0' }}>characters{hero ? '' : ' / roles'}</span><b>{hero ? `${chars} (${hero05i ? '05H vs 05I' : hero05h ? '05G vs 05H' : hero05g ? '05F vs 05G' : '05E vs 05F'})` : `${chars} / 8`}</b></div>
        <div style={cell}><span style={{ color: '#8a94a0' }}>FPS</span><b style={{ color: s.loading ? '#f0a860' : '#7ee787' }}>{s.loading ? '— (loading)' : s.fps}</b></div>
        <div style={cell}><span style={{ color: '#8a94a0' }}>draw calls / frame</span><b>{s.drawCalls.toLocaleString()}</b></div>
        <div style={cell}><span style={{ color: '#8a94a0' }}>triangles / frame</span><b>{s.triangles.toLocaleString()}</b></div>
        <div style={cell}><span style={{ color: '#8a94a0' }}>scene tris (inventory)</span><b>{s.sceneTriangles.toLocaleString()}</b></div>
        <div style={cell}><span style={{ color: '#8a94a0' }}>loaded assets</span><b>{s.loadedAssets}/{s.totalAssets || '?'}</b></div>
        <div style={cell}><span style={{ color: '#8a94a0' }}>console errors</span><b style={{ color: errs ? '#ef4444' : '#7ee787' }}>{errs ? `⚠ ${errs}` : '✓ none'}</b></div>
      </div>
      <div style={{ color: '#8a94a0', fontSize: 9.5, marginTop: 5, lineHeight: 1.35 }}>
        Roles: PA · Grip · Electric · Maintenance · Office · Camera/DP · Director · Carpenter (8).
        GPU: <b style={{ color: s.isSoftware ? '#f0a860' : '#a8c0d0' }}>{s.renderer || 'unknown'}</b>
        {s.isSoftware && ' — SOFTWARE (diagnostic only, not M3)'}
        {errs > 0 && <div style={{ color: '#f0a860' }}>last: {getLastError()}</div>}
      </div>
    </div>
  )
}

export function DevPanel({ manifest }: { manifest: RuntimeManifest | null }): JSX.Element {
  const { state, set, resetCamera } = useLab()
  const [, tick] = useState(0)
  useEffect(() => { const id = setInterval(() => tick((n) => n + 1), 250); return () => clearInterval(id) }, [])
  if (!state.showHud) return <></>          // hidden for clean hero captures (window.__lab.set)
  const s = latestStats

  const clipDuration = manifest?.clips.find((c) => c.name === state.clip)?.duration
  const activePack = SCENE_PACK[state.scene]
  const packAssets = manifest?.assets.filter((a) => a.pack === activePack) ?? []
  // Scene G assets are the Blender-authored studio set (studio-assets.json), original & owner-owned.
  const packProv = (activePack === 'studio' ? 'CC0' : (packAssets[0]?.provenance ?? 'LICENSE-UNCLEAR')) as Provenance
  const packTris = packAssets.reduce((n, a) => n + (a.triangles ?? 0), 0)
  const packMats = packAssets.reduce((n, a) => n + (a.materials ?? 0), 0)

  return (
    <div style={panel}>
      <div style={{ fontSize: 14, fontWeight: 700, color: '#eaf2fa' }}>Project: Studio — Asset Lab</div>
      <div style={{ color: '#6f7b88', fontSize: 10.5 }}>isolated intake · conversion · visual proof — owns no sim truth</div>

      <div style={h}>Scene — D⇄F = greybox vs refined lot (Lab 04)</div>
      <div style={row}>{(['A', 'B', 'C', 'D', 'E', 'F', 'G'] as SceneKey[]).map((k) =>
        <Btn key={k} on={state.scene === k} onClick={() => set('scene', k)}>{SCENE_LABEL[k]}</Btn>)}</div>

      {state.scene === 'G' && <GReviewStatus />}

      <div style={h}>{state.scene === 'G' ? 'Character review cameras (Lab 05E)' : 'Camera (§7)'}</div>
      {state.scene === 'G' ? (
        <GReviewControls />
      ) : state.scene === 'D' || state.scene === 'E' || state.scene === 'F' ? (
        <div style={row}>
          {(() => {
            const vmap = state.scene === 'E' ? E_VIEWS : state.scene === 'F' ? F_VIEWS : D_VIEWS
            return Object.keys(vmap).map((name) => <Btn key={name} onClick={() => applyView(vmap[name].pos, vmap[name].tgt)}>{name}</Btn>)
          })()}
          <Btn onClick={resetCamera}>Reset</Btn>
        </div>
      ) : (
        <div style={row}>
          <Btn on={state.cameraMode === 'overview'} onClick={() => set('cameraMode', 'overview')}>Overview</Btn>
          <Btn on={state.cameraMode === 'inspection'} onClick={() => set('cameraMode', 'inspection')}>Inspection</Btn>
          <Btn onClick={resetCamera}>Reset</Btn>
        </div>
      )}

      {state.scene === 'D' && (
        <>
          <div style={h}>Studio dressing — presentation vs polygons (§8)</div>
          <div style={{ ...row, flexDirection: 'column', alignItems: 'flex-start' }}>
            <Toggle label="Characters (CC0 crew)" on={state.showCharacters} onChange={(v) => set('showCharacters', v)} />
            <Toggle label="Landscaping" on={state.showLandscaping} onChange={(v) => set('showLandscaping', v)} />
            <Toggle label="Production dressing" on={state.showDressing} onChange={(v) => set('showDressing', v)} />
            <Toggle label="Shadows" on={state.showShadows} onChange={(v) => set('showShadows', v)} />
            <Toggle label="Atmosphere (sky + fog)" on={state.atmosphere} onChange={(v) => set('atmosphere', v)} />
          </div>
        </>
      )}

      {state.scene === 'E' && (
        <>
          <div style={h}>Hero soundstage — fidelity layers (Lab 03)</div>
          <div style={{ ...row, flexDirection: 'column', alignItems: 'flex-start' }}>
            <Toggle label="Crew (CC0)" on={state.showCharacters} onChange={(v) => set('showCharacters', v)} />
            <Toggle label="Production apron (grip/electric)" on={state.showApron} onChange={(v) => set('showApron', v)} />
            <Toggle label="Shadows (key light)" on={state.showShadows} onChange={(v) => set('showShadows', v)} />
            <Toggle label="Soft shadows (PCSS · live GPU)" on={state.softShadows} onChange={(v) => set('softShadows', v)} />
            <Toggle label="Post FX (bloom/AO · live GPU)" on={state.postFx} onChange={(v) => set('postFx', v)} />
            <Toggle label="Atmosphere (sky + fog)" on={state.atmosphere} onChange={(v) => set('atmosphere', v)} />
          </div>
          <div style={{ color: '#8a94a0', fontSize: 10, margin: '5px 0 0', lineHeight: 1.4 }}>
            Crew variation (roles, hard hats, heights) is part of the Scene E crew presentation — the <b>Crew</b> checkbox enables/disables those workers. There is no separate "Loading Bay", "Crew Variation", or "Performance" control: use the <b>Loading Bay</b> camera button for the dock, and read live performance in <b>Renderer stats</b> below.
          </div>
        </>
      )}

      {state.scene === 'F' && (
        <>
          <div style={h}>Refined lot — layers (Lab 04)</div>
          <div style={{ ...row, flexDirection: 'column', alignItems: 'flex-start' }}>
            <Toggle label="Crew (CC0)" on={state.showCharacters} onChange={(v) => set('showCharacters', v)} />
            <Toggle label="Landscaping (palms/trees/hedges)" on={state.showLandscaping} onChange={(v) => set('showLandscaping', v)} />
            <Toggle label="Production dressing" on={state.showDressing} onChange={(v) => set('showDressing', v)} />
            <Toggle label="Shadows (key light)" on={state.showShadows} onChange={(v) => set('showShadows', v)} />
            <Toggle label="Soft shadows (PCSS · live GPU)" on={state.softShadows} onChange={(v) => set('softShadows', v)} />
            <Toggle label="Post FX (bloom/AO · live GPU)" on={state.postFx} onChange={(v) => set('postFx', v)} />
            <Toggle label="Atmosphere (sky + fog)" on={state.atmosphere} onChange={(v) => set('atmosphere', v)} />
          </div>
          <div style={{ color: '#8a94a0', fontSize: 10, margin: '5px 0 0', lineHeight: 1.4 }}>
            Switch <b>D ⇄ F</b> to compare the Lab 02 greybox lot against the refined, less-boxy lot. The improvement lives in geometry (roof-form + massing variety) — toggle <b>Wireframe</b> below to confirm.
          </div>
        </>
      )}

      <div style={h}>Display (§8)</div>
      <div style={{ ...row, flexDirection: 'column', alignItems: 'flex-start' }}>
        <Toggle label="Wireframe" on={state.wireframe} onChange={(v) => set('wireframe', v)} />
        <Toggle label="Bounds (AABB)" on={state.showBounds} onChange={(v) => set('showBounds', v)} />
        <Toggle label="Grid (1 m cells)" on={state.showGrid} onChange={(v) => set('showGrid', v)} />
        <Toggle label="Scale ref (1.8 m human)" on={state.showScaleRef} onChange={(v) => set('showScaleRef', v)} />
        {state.scene === 'C' && <Toggle label="Skeleton" on={state.showSkeleton} onChange={(v) => set('showSkeleton', v)} />}
      </div>

      <div style={h}>Lights (§8)</div>
      <Slider label="Key" value={state.keyLight} min={0} max={6} step={0.1} onChange={(v) => set('keyLight', v)} />
      <Slider label="Ambient" value={state.ambientLight} min={0} max={2} step={0.05} onChange={(v) => set('ambientLight', v)} />
      {(state.scene === 'D' || state.scene === 'E' || state.scene === 'F') && (
        <div style={{ color: '#8a94a0', fontSize: 10, marginTop: 2, lineHeight: 1.35 }}>
          Key/Ambient control the directional key + ambient fill only. The warm hero rig also lights the scene via procedural Sky + IBL{state.scene === 'E' || state.scene === 'F' ? ' + ACES exposure' : ''}, so it stays illuminated even at Key/Ambient 0 — these sliders do not fully control the hero lighting.
        </div>
      )}

      <div style={h}>Asset visibility (§8)</div>
      <div style={{ ...row, flexDirection: 'column', alignItems: 'flex-start' }}>
        {state.scene === 'A' && <Toggle label="Downtown (CC0)" on={state.visibleDowntown} onChange={(v) => set('visibleDowntown', v)} />}
        {state.scene === 'B' && <Toggle label="Props (LICENSE-UNCLEAR)" on={state.visibleProps} onChange={(v) => set('visibleProps', v)} />}
        {state.scene === 'C' && <Toggle label="Character (CC0)" on={state.visibleCharacter} onChange={(v) => set('visibleCharacter', v)} />}
      </div>

      {state.scene === 'C' && manifest && (
        <>
          <div style={h}>Animation (§7 Scene C)</div>
          <select value={state.clip} onChange={(e) => set('clip', e.target.value)}
            style={{ width: '100%', background: '#161b22', color: '#dfe6ee', border: '1px solid #2b333d', borderRadius: 6, padding: '4px' }}>
            <optgroup label="Required roles (§5)">
              {Object.entries(manifest.roleClipMap).map(([role, clip]) =>
                <option key={role} value={clip}>{role} → {clip}</option>)}
            </optgroup>
            <optgroup label={`All ${manifest.clips.length} clips`}>
              {manifest.clips.map((c) => <option key={c.name} value={c.name}>{c.name} ({c.duration}s)</option>)}
            </optgroup>
          </select>
          <div style={{ ...row, marginTop: 6 }}>
            <Btn on={state.playing} onClick={() => set('playing', !state.playing)}>{state.playing ? 'Pause' : 'Play'}</Btn>
            <Btn on={state.loop} onClick={() => set('loop', !state.loop)}>Loop</Btn>
            <Btn on={state.rootMotion} onClick={() => set('rootMotion', !state.rootMotion)}>Root motion</Btn>
          </div>
          <Slider label="Speed" value={state.speed} min={0.1} max={2} step={0.05} onChange={(v) => set('speed', v)} />
          <div style={{ color: '#9fb0c0' }}>
            duration: <b>{clipDuration ?? '?'}s</b> · root-motion: <b>{state.rootMotion ? 'ON (baked)' : 'OFF (in-place)'}</b>
          </div>
        </>
      )}

      <div style={h}>Renderer stats (§8 · diagnostic only)</div>
      <div style={{ color: '#8a94a0', fontSize: 10, marginBottom: 4, lineHeight: 1.35 }}>
        GPU: <b style={{ color: s.isSoftware ? '#f0a860' : '#a8c0d0' }}>{s.renderer || 'unknown'}</b>
        {s.isSoftware && <span style={{ color: '#f0a860' }}> — SOFTWARE raster (SwiftShader); diagnostic only, not target-hardware</span>}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2px 10px' }}>
        <span>FPS: <b style={{ color: s.loading ? '#f0a860' : '#7ee787' }}>{s.loading ? '— (loading)' : s.fps}</b></span>
        <span>Post FX: <b>{s.postFx ? 'ON' : 'off'}</b></span>
        <span>Draw calls/frame: <b>{s.drawCalls.toLocaleString()}</b></span>
        <span>Triangles/frame: <b>{s.triangles.toLocaleString()}</b></span>
        <span>Scene tris (inventory): <b>{s.sceneTriangles.toLocaleString()}</b></span>
        <span>Scene meshes: <b>{s.sceneMeshes}</b></span>
        <span>Geometries (loaded): <b>{s.geometries}</b></span>
        <span>Textures (loaded): <b>{s.textures}</b></span>
        <span>Programs: <b>{s.programs}</b></span>
        <span>Loaded: <b>{s.loadedAssets}/{s.totalAssets || '?'}</b></span>
      </div>
      <div style={{ color: '#8a94a0', fontSize: 10, marginTop: 3, lineHeight: 1.35 }}>
        Frame values = current frame, all passes{s.postFx ? ' (incl. Post FX)' : ''}. Scene tris = deterministic inventory of visible meshes (reproducible). FPS measured live; loading-period FPS is not steady-state.
      </div>

      <div style={h}>Material info (§8 · manifest)</div>
      <div style={{ color: '#9fb0c0' }}>
        {activePack === 'studio'
          ? 'studio: Blender-authored assets — see manifests/studio-assets.json (23 assets, original/owner-owned)'
          : `${activePack}: ${packAssets.length} assets · ${packMats} materials · ${packTris.toLocaleString()} tris`}
      </div>

      <div style={h}>Provenance status (§12)</div>
      <div style={{ ...row, marginBottom: 4 }}>active scene: <Badge p={packProv} /></div>
      <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '2px 8px', fontSize: 10.5 }}>
        <Badge p="CC0" /><span>Downtown · Animation (Quaternius) — reusable</span>
        <Badge p="LICENSE-UNCLEAR" /><span>FBX props — prototype-only</span>
        <Badge p="DO-NOT-USE" /><span>wintersets (legacy Lionhead) — excluded from runtime</span>
      </div>
    </div>
  )
}
