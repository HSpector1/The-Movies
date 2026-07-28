// ── ConceptCard — restricted-capable ────────────────────────────────────────
// Shows ONLY contract-public, player-visible concept fields: title, genre, base
// production needs, required roles. It invents no logline/script/IP/quality rating.
//
// `mode='normal'`  → shows the exact base production cost.
// `mode='restricted'` → hides the exact base cost, showing only a qualitative band
//   ("modest / substantial / major" scale). This is a genuine capability for a
//   future deferred restricted-information system — NOT a filmmaker-pitch screen.

import type { FilmConcept, CastSlot } from '../engine/adapter.ts'
import { genreLabel } from '../content.ts'
import { money } from '../format.ts'

export type DisplayMode = 'normal' | 'restricted'

function costBand(cost: number): string {
  if (cost < 3_500_000) return 'Modest'
  if (cost < 6_000_000) return 'Substantial'
  return 'Major'
}

const SLOT_LABELS: Record<CastSlot, string> = {
  lead: 'Lead',
  antagonist: 'Antagonist',
  support: 'Support',
}

export function ConceptCard({
  concept,
  mode = 'normal',
  selected = false,
  onSelect,
}: {
  concept: FilmConcept
  mode?: DisplayMode
  selected?: boolean
  onSelect?: (id: string) => void
}) {
  const clickable = onSelect !== undefined
  const Tag = clickable ? 'button' : 'div'
  return (
    <Tag
      className={`option${selected ? ' selected' : ''}`}
      data-testid={`concept-${concept.id}`}
      {...(clickable ? { onClick: () => onSelect!(concept.id), type: 'button' as const } : {})}
    >
      <div className="spread">
        <span className="opt-title">{concept.title}</span>
        <span className="badge">{genreLabel(concept.genre)}</span>
      </div>
      <div className="opt-desc">
        {mode === 'restricted' ? (
          <span data-testid="concept-cost-band">
            Base production needs: <strong>{costBand(concept.baseNegativeCost)}</strong>
          </span>
        ) : (
          <span data-testid="concept-cost-exact">
            Base production needs: <strong>{money(concept.baseNegativeCost)}</strong>
          </span>
        )}
      </div>
      <div className="opt-desc">
        Required roles:{' '}
        {concept.requiredSlots.map((s) => SLOT_LABELS[s]).join(', ')}
      </div>
    </Tag>
  )
}
