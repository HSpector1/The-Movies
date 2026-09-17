import { TECHNOLOGY_CATALOGUE, type TechnologyCatalogueEntry } from './technologyCatalogue.js'
import type { TechnologyId } from './technologyTypes.js'

/**
 * P13B-S7 public milestone disclosure. Every function here is pure and reads ONLY the
 * catalogue and the campaign week — never a `GameState`, so no rival project, seat, spend
 * or receipt can reach a forecast. S8 inherits that invariant from the signatures alone.
 */

export type TechnologyForecast =
  | { kind: 'window'; fromWeek: number; toWeek: number }
  | { kind: 'exact'; commercialWeek: number; announcedWeek: number }

export type TechnologyAnnouncement = { technologyId: TechnologyId; week: number }

/**
 * The distant window until the public announcement narrows it to the exact commercial week.
 * Exact whenever the week has reached `announceWeek`, or the window is degenerate — an
 * already-public milestone (sound) is exact at every week, never a two-bound window.
 */
export function technologyForecast(entry: TechnologyCatalogueEntry, week: number): TechnologyForecast {
  const { from, to, announceWeek } = entry.publicWindow
  return week >= announceWeek || from === to
    ? { kind: 'exact', commercialWeek: entry.commercialWeek, announcedWeek: announceWeek }
    : { kind: 'window', fromWeek: from, toWeek: to }
}

/**
 * The announcements public at this week, in catalogue order. Derived from the campaign clock
 * on every read — nothing is persisted, so a Save As copy or a reloaded save publishes the
 * same rows for the same week. Degenerate windows were already public and never announce;
 * every other technology contributes at most one row, at its own fixed announce week.
 */
export function technologyAnnouncements(week: number): TechnologyAnnouncement[] {
  return TECHNOLOGY_CATALOGUE
    .filter(entry => entry.publicWindow.from !== entry.publicWindow.to && entry.publicWindow.announceWeek <= week)
    .map(entry => ({ technologyId: entry.id, week: entry.publicWindow.announceWeek }))
}

/** What a commercial purchase of this technology replaces: authored catalogue text, nothing derived. */
export function replacementDescriptor(entry: TechnologyCatalogueEntry): string {
  return entry.replacementLabel
}
