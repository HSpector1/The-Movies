// ── Settings (PF1-M3) ────────────────────────────────────────────────────────
//
// NOT a screen. A screen switch would unmount the Studio Lot and tear its renderer down to
// change a volume, so settings is one modal component hosted by whichever surface opened it:
// inside the proven retained-workspace host on the Lot, inside the shell dialog elsewhere.
// There is no route to it and nothing to return to.
//
// Everything here is presentation preference. Volumes and mute go straight through the audio
// service, which owns the persistence; motion goes through the shell's motion module. None
// of it is in GameState, none of it enters a save file, and no engine behaviour reads it.

import { useState } from 'react'
import { getAudioService } from '../audio/audioService.ts'
import type { AudioChannel } from '../audio/sink.ts'
import type { MotionPref } from '../prefs.ts'
import { reassertMotionPref, writeMotionPref } from './motion.ts'
import { useResolvedMotion } from './useResolvedMotion.ts'

const CHANNELS: readonly { channel: AudioChannel; label: string; hint: string }[] = [
  { channel: 'master', label: 'Master', hint: 'Everything the studio makes a sound with.' },
  { channel: 'music', label: 'Music', hint: 'The house score.' },
  { channel: 'ambience', label: 'The lot', hint: 'The property itself — air, work, weather.' },
  { channel: 'effects', label: 'Effects', hint: 'Stings, stamps, and the answer to a click.' },
]

const MOTION_OPTIONS: readonly { value: MotionPref; label: string; hint: string }[] = [
  { value: 'system', label: 'System', hint: 'Follow this computer’s own setting.' },
  { value: 'reduced', label: 'Reduced', hint: 'Hold the picture still. Nothing moves that need not.' },
  { value: 'full', label: 'Full', hint: 'The studio moves as it was staged.' },
]

/**
 * The unavailable-with-reason copy for "Full" under an OS reduced-motion request.
 * Fact, reason, way forward — the blocked-state grammar, in that order. It is never a live
 * control that does nothing: the player may only ever STRENGTHEN the system's request.
 */
export const MOTION_FULL_BLOCKED_REASON =
  'Your system asks for reduced motion. The studio honors it; change your system setting to allow full motion.'

function percent(value: number): string {
  return `${Math.round(value * 100)}%`
}

export function SettingsOverlay({ onClose }: { onClose: () => void }) {
  const audio = getAudioService()
  const [volumes, setVolumes] = useState(() => audio.getState().volumes)
  const [muted, setMuted] = useState(() => audio.getState().muted)
  const { pref, osReduced, resolved } = useResolvedMotion()

  // The audio service persists the WHOLE shared preferences record from a snapshot it took
  // when it was constructed, so an audio write can carry an older motion value back to
  // storage. Correcting it in the same synchronous gesture is what keeps a volume drag from
  // un-writing the player's motion choice. See motion.ts.
  function afterAudioWrite() {
    reassertMotionPref(pref)
    const next = audio.getState()
    setVolumes(next.volumes)
    setMuted(next.muted)
  }

  function handleVolume(channel: AudioChannel, value: number) {
    audio.setVolume(channel, value)
    afterAudioWrite()
  }

  function handleMute(next: boolean) {
    audio.setMuted(next)
    afterAudioWrite()
  }

  return (
    <div className="settings-overlay stack" data-testid="settings-overlay" data-motion-resolved={resolved}>
      <section className="settings-section stack" aria-labelledby="settings-sound-heading">
        <h3 id="settings-sound-heading">Sound</h3>
        <label className="settings-mute">
          <input
            type="checkbox"
            checked={muted}
            onChange={(event) => handleMute(event.target.checked)}
            data-testid="settings-mute"
          />
          <span>Silence the studio</span>
        </label>
        {CHANNELS.map(({ channel, label, hint }) => (
          <div className="settings-slider" key={channel}>
            <label htmlFor={`settings-volume-${channel}`}>
              {label}
              <span className="settings-slider-value mono" data-testid={`settings-volume-${channel}-value`}>
                {percent(volumes[channel])}
              </span>
            </label>
            <input
              id={`settings-volume-${channel}`}
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={volumes[channel]}
              onChange={(event) => handleVolume(channel, Number(event.target.value))}
              data-testid={`settings-volume-${channel}`}
            />
            <span className="hint">{hint}</span>
          </div>
        ))}
      </section>

      <section className="settings-section stack" aria-labelledby="settings-motion-heading">
        <h3 id="settings-motion-heading">Motion</h3>
        <fieldset className="settings-motion" data-testid="settings-motion">
          <legend className="visually-hidden">Motion preference</legend>
          {MOTION_OPTIONS.map(({ value, label, hint }) => {
            const blocked = value === 'full' && osReduced
            return (
              <label
                key={value}
                className={`settings-motion-option${blocked ? ' is-unavailable' : ''}`}
                data-testid={`settings-motion-option-${value}`}
              >
                <input
                  type="radio"
                  name="settings-motion"
                  value={value}
                  checked={pref === value}
                  disabled={blocked}
                  aria-describedby={blocked ? 'settings-motion-full-reason' : undefined}
                  onChange={() => writeMotionPref(value)}
                  data-testid={`settings-motion-${value}`}
                />
                <span>
                  {label}
                  <span className="hint">{hint}</span>
                </span>
              </label>
            )
          })}
        </fieldset>
        {osReduced && (
          <p
            id="settings-motion-full-reason"
            className="hint settings-blocked-reason"
            data-testid="settings-motion-full-blocked"
          >
            {MOTION_FULL_BLOCKED_REASON}
          </p>
        )}
        <p className="hint" data-testid="settings-motion-resolved" data-resolved={resolved}>
          {resolved === 'reduced' ? 'The studio is holding still.' : 'The studio is moving as staged.'}
        </p>
      </section>

      <div className="btn-row">
        <button className="primary" onClick={onClose} data-testid="settings-close">
          Back to the studio
        </button>
      </div>
    </div>
  )
}
