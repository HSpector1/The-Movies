// Developer control HUD (contract §8) + provenance status (§12). Pure DOM overlay.
import { useEffect, useState, type CSSProperties, type ReactNode } from 'react'
import { useLab } from '../lab/LabContext'
import { latestStats } from '../lab/stats'
import { applyView, D_VIEWS, E_VIEWS } from '../lab/cameraBridge'
import type { RuntimeManifest, Provenance, SceneKey } from '../types'

const PROV_COLOR: Record<Provenance, string> = {
  'CC0': '#22c55e', 'ATTRIBUTION-REQUIRED': '#3b82f6', 'PROTOTYPE-ONLY': '#f59e0b',
  'LICENSE-UNCLEAR': '#f59e0b', 'DO-NOT-USE': '#ef4444',
}
const SCENE_LABEL: Record<SceneKey, string> = { A: 'A · Lab01 lot', B: 'B · Furnished', C: 'C · Animation', D: 'D · Studio greybox', E: 'E · Hero stage' }
const SCENE_PACK: Record<SceneKey, string> = { A: 'downtown', B: 'props', C: 'animation', D: 'downtown', E: 'animation' }

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

export function DevPanel({ manifest }: { manifest: RuntimeManifest | null }): JSX.Element {
  const { state, set, resetCamera } = useLab()
  const [, tick] = useState(0)
  useEffect(() => { const id = setInterval(() => tick((n) => n + 1), 250); return () => clearInterval(id) }, [])
  const s = latestStats

  const clipDuration = manifest?.clips.find((c) => c.name === state.clip)?.duration
  const activePack = SCENE_PACK[state.scene]
  const packAssets = manifest?.assets.filter((a) => a.pack === activePack) ?? []
  const packProv = (packAssets[0]?.provenance ?? 'LICENSE-UNCLEAR') as Provenance
  const packTris = packAssets.reduce((n, a) => n + (a.triangles ?? 0), 0)
  const packMats = packAssets.reduce((n, a) => n + (a.materials ?? 0), 0)

  return (
    <div style={panel}>
      <div style={{ fontSize: 14, fontWeight: 700, color: '#eaf2fa' }}>Project: Studio — Asset Lab</div>
      <div style={{ color: '#6f7b88', fontSize: 10.5 }}>isolated intake · conversion · visual proof — owns no sim truth</div>

      <div style={h}>Scene — D⇄E = greybox vs hero soundstage (Lab 03)</div>
      <div style={row}>{(['A', 'B', 'C', 'D', 'E'] as SceneKey[]).map((k) =>
        <Btn key={k} on={state.scene === k} onClick={() => set('scene', k)}>{SCENE_LABEL[k]}</Btn>)}</div>

      <div style={h}>Camera (§7)</div>
      {state.scene === 'D' || state.scene === 'E' ? (
        <div style={row}>
          {Object.keys(state.scene === 'E' ? E_VIEWS : D_VIEWS).map((name) => {
            const v = (state.scene === 'E' ? E_VIEWS : D_VIEWS)[name]
            return <Btn key={name} onClick={() => applyView(v.pos, v.tgt)}>{name}</Btn>
          })}
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
      {(state.scene === 'D' || state.scene === 'E') && (
        <div style={{ color: '#8a94a0', fontSize: 10, marginTop: 2, lineHeight: 1.35 }}>
          Key/Ambient control the directional key + ambient fill only. The warm hero rig also lights the scene via procedural Sky + IBL{state.scene === 'E' ? ' + ACES exposure' : ''}, so it stays illuminated even at Key/Ambient 0 — these sliders do not fully control the hero lighting.
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
        {activePack}: {packAssets.length} assets · {packMats} materials · {packTris.toLocaleString()} tris
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
