import type { Production } from './types.js'

/** Credited writers are not production seats. Company seats remain reserved through release. */
export function productionCompanyTalentIds(productions: readonly Production[]): Set<string> {
  const ids = new Set<string>()
  for (const p of productions) {
    ids.add(p.directorId)
    for (const id of Object.values(p.cast)) ids.add(id)
    for (const id of p.craftIds) ids.add(id)
  }
  return ids
}
