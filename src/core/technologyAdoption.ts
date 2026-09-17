// ── Technology adoption components and equipment assets (P13B-S5) ────────────
//
// LAW: an adoption's price is a list of named components, never a bare total.
// Every physical line mirrors the target P09 blueprint's OWN authored
// installation components one-to-one, so the physical work this studio pays for
// is the physical work P09 actually commits — and S6 can refund exactly the part
// of it that was never done. Access is acquired BEFORE an adoption (purchased at
// `purchaseTechnology`, granted at research completion), so an adoption never
// charges for it: its access line is `existing` at $0. Equipment is a durable
// asset: minted once by the adoption that pays for it, held by that adoption,
// and reused at $0 by a later adoption of the SAME technology when it is unheld.
// No line is ever negative.
//
// This module owns the pricing and the refusal list. `technology.ts` owns the
// commit (charges, P09 placements, the persisted row); it imports from here, and
// nothing here imports it back.

import { canAfford } from './employment.js'
import { hasOperationalFacilityInstallation } from './facilityEffects.js'
import { queryFacilityInstallation, type FacilityInstallationQuote } from './placement.js'
import { technologyEntry, type TechnologyCatalogueEntry } from './technologyCatalogue.js'
import { FACILITY_BLUEPRINTS } from './tuning.js'
import type { GameState, StudioOperations } from './types.js'
import type { TechnologyAdoption, TechnologyAdoptionComponent, TechnologyEquipmentAsset, TechnologyId } from './technologyTypes.js'

export type AdoptionRequest = {
  technologyId: TechnologyId
  stageFacilityId: string
  /** Refused outright when this technology has no Post component; optional for sound when an operational sound Post already stands. */
  postFacilityId?: string
}
/**
 * One quote. `ok` false means the request is refused: `refusal` is the
 * engine-primary reason, `rejections` the full list (the P13B-S4 disclosure
 * pattern), and `components`/`total` are empty — a refused request has no price.
 */
export type AdoptionQuote = {
  ok: boolean
  components: TechnologyAdoptionComponent[]
  total: number
  reusedPostFacilityId: string | null
  reusedEquipmentAssetId: string | null
  refusal: string | null
  rejections: string[]
}

/** Every equipment set this studio owns, in mint order. Never filtered by holder. */
export function equipmentAssets(state: GameState, studioId: string): TechnologyEquipmentAsset[] {
  return state.technology.equipment.filter(asset => asset.studioId === studioId)
}

/** The catalogue price of a technology's complete physical chain, from P09's own blueprints. */
export function installationCatalogueCost(entry: TechnologyCatalogueEntry): number {
  return [entry.stageInstallationId, entry.postInstallationId]
    .reduce((total, id) => total + (id === null ? 0 : FACILITY_BLUEPRINTS.find(b => b.id === id)?.capex ?? 0), 0)
}

/**
 * The component kind an authored P09 installation component carries, or NULL for a
 * label this classifier has no authored mapping for. The null is the gap itself —
 * P13B-S6's bridge publishes it verbatim on a cancellation receipt line (an Office
 * conversion authors one component whose label names no physical class) rather than
 * defaulting it to a kind the authored text never claimed.
 */
export function physicalKindOrNull(label: string): TechnologyAdoptionComponent['kind'] | null {
  const text = label.toLowerCase()
  if (text.includes('site adaptation')) return 'site'
  if (text.includes('capture package')) return 'capture'
  if (text.includes('post fit-out')) return 'post'
  if (text.includes('installation')) return 'installation'
  return null
}

/** The same classifier where an unmapped label is a gap, not a default: an adoption row must carry a kind. */
function physicalKind(label: string): TechnologyAdoptionComponent['kind'] {
  const kind = physicalKindOrNull(label)
  if (kind === null) throw new Error(`Technology adoption: no component kind is authored for "${label}".`)
  return kind
}

function operationsOf(state: GameState, studioId: string): StudioOperations | undefined {
  const identity = state.hollywood?.identities.find(s => s.studioId === studioId && s.enteredWeek !== null)
  if (!identity) return undefined
  return identity.role === 'player' ? state.operations : state.hollywood?.businesses.find(b => b.studioId === studioId)?.operations
}

/** The Post this request actually uses: the named one, or the studio's own operational Post when the request omits it. */
export function resolvedPostFacilityId(state: GameState, studioId: string, request: AdoptionRequest): string | null {
  const entry = technologyEntry(request.technologyId)
  const installationId = entry.postInstallationId
  if (installationId === null) return null
  if (request.postFacilityId !== undefined) return request.postFacilityId
  return operationsOf(state, studioId)?.facilities
    .find(f => f.capability === 'post' && hasOperationalFacilityInstallation(state, f.id, installationId))?.id ?? null
}

/**
 * Every reason this studio may not commit this adoption, engine-primary first.
 * The same law applies to the player and to abstract rival plant.
 */
export function adoptionRejections(state: GameState, studioId: string, request: AdoptionRequest): string[] {
  if (!state.hollywood?.identities.some(s => s.studioId === studioId && s.enteredWeek !== null)) return ['That studio has not entered this campaign.']
  const entry = technologyEntry(request.technologyId)
  const rejections: string[] = []
  if (!state.technology.access.some(a => a.studioId === studioId && a.technologyId === entry.id && a.acquiredWeek !== null)) {
    rejections.push(`Complete ${entry.id} research or purchase access after commercial release.`)
  }
  const operations = operationsOf(state, studioId)
  if (!operations?.facilities.some(f => f.id === request.stageFacilityId && f.capability === 'soundstage')) rejections.push('Select an exact compatible soundstage.')
  if (entry.postInstallationId === null) {
    if (request.postFacilityId !== undefined) rejections.push(`${entry.name} has no Post component. Select the exact stage alone.`)
  } else {
    const post = resolvedPostFacilityId(state, studioId, request)
    if (post === null || !operations?.facilities.some(f => f.id === post && f.capability === 'post')) rejections.push('Select an exact Post facility.')
  }
  if (state.technology.adoptions.some(a => a.studioId === studioId && a.technologyId === entry.id && a.stageFacilityId === request.stageFacilityId)) {
    rejections.push(`This stage already has a ${entry.id} adoption commitment.`)
  }
  // The commit path refuses a stage or Post whose body cannot begin the P09 installation (engaged by
  // running work, unmet requirements, cash); the quote must say so with the same sentence, in the same
  // order. Only the player's lot has P09 bodies: a rival's commercial purchase is a paper commitment at
  // catalogue cost (S8 owns rival plant), so the query never applies to it.
  if (rejections.length === 0 && studioId === state.hollywood?.playerStudioId) {
    const stageQuote = queryFacilityInstallation(state, { blueprintId: entry.stageInstallationId, targetFacilityId: request.stageFacilityId })
    const post = entry.postInstallationId === null ? null : resolvedPostFacilityId(state, studioId, request)
    const newPost = post !== null && entry.postInstallationId !== null && !hasOperationalFacilityInstallation(state, post, entry.postInstallationId)
    const postQuote = newPost ? queryFacilityInstallation(state, { blueprintId: entry.postInstallationId!, targetFacilityId: post! }) : null
    const sentence = installationRefusalSentence([stageQuote, postQuote])
    if (sentence !== null) rejections.push(sentence)
  }
  return rejections
}

/** The commit path's own sentence for a stage or Post whose body cannot begin its installation. */
export const INSTALLATION_ENGAGED_REFUSAL = 'The selected stage or Post cannot begin installation. Finish its current work first.'
/** The commit path's own sentence when cash is the only obstacle to the complete commitment. */
export const INSTALLATION_CASH_REFUSAL = 'There is not enough cash for the complete stage, capture and Post installation commitment.'

/**
 * Classifies refused P09 installation queries the way the commit path must report them:
 * cash when `insufficientFunds` is the only rejection on every refused query, otherwise the
 * body cannot begin its work (engaged, unmet requirements, wrong target). Null when every query is ok.
 */
export function installationRefusalSentence(quotes: readonly (FacilityInstallationQuote | null)[]): string | null {
  const refused = quotes.filter((q): q is FacilityInstallationQuote => q !== null && !q.ok)
  if (refused.length === 0) return null
  return refused.every(q => q.rejections.length > 0 && q.rejections.every(r => r === 'insufficientFunds')) ? INSTALLATION_CASH_REFUSAL : INSTALLATION_ENGAGED_REFUSAL
}

type EquipmentPlan = {
  source: TechnologyEquipmentAsset['source'] | 'existing'
  cost: number
  reusedEquipmentAssetId: string | null
}
/**
 * Which equipment set this adoption uses and what it costs: a retained UNHELD
 * asset of this technology first (reuse, never a fresh mint), then this studio's
 * one first-prototype entitlement for this technology's own research project,
 * then the route price — the inventor's later concession or the commercial set.
 */
export function equipmentPlan(state: GameState, studioId: string, technologyId: TechnologyId): EquipmentPlan {
  const entry = technologyEntry(technologyId)
  const owned = state.technology.equipment.filter(asset => asset.studioId === studioId && asset.technologyId === technologyId)
  // P13B-S6: an asset is reusable exactly when NOTHING HOLDS IT. The holder field
  // is that fact; a cancelled adoption keeps naming the asset it paid for as its own
  // history, which is why the predicate can never also require that no adoption row
  // mentions it (the save validator refuses an unheld asset a LIVE adoption names,
  // so a null holder is proof the work that owned it was cancelled or finished).
  const unheld = owned.find(asset => asset.holderAdoptionId === null)
  if (unheld) return { source: 'existing', cost: 0, reusedEquipmentAssetId: unheld.id }
  const access = state.technology.access.find(a => a.studioId === studioId && a.technologyId === technologyId && a.acquiredWeek !== null)
  const inventor = access?.route === 'research'
  const entitlementUsed = owned.some(asset => asset.source === 'first-prototype') ||
    state.technology.adoptions.some(a => a.studioId === studioId && a.technologyId === technologyId && a.prototypeProjectId !== null)
  if (inventor && !entitlementUsed) return { source: 'first-prototype', cost: 0, reusedEquipmentAssetId: null }
  return inventor
    ? { source: 'later-inventor', cost: entry.laterInventorEquipmentCost, reusedEquipmentAssetId: null }
    : { source: 'commercial', cost: entry.commercialEquipmentCost, reusedEquipmentAssetId: null }
}

function equipmentLabel(entry: TechnologyCatalogueEntry, source: TechnologyAdoptionComponent['source']): string {
  if (source === 'first-prototype') return `${entry.name} equipment: first prototype from your own research`
  if (source === 'later-inventor') return `${entry.name} equipment set at the inventor's price`
  if (source === 'existing') return `${entry.name} equipment set already owned by this studio`
  return `${entry.name} equipment set at the commercial price`
}

/** The P09 rows for one committed installation, mirroring its authored components one-to-one. */
function physicalRows(state: GameState, blueprintId: string, targetFacilityId: string, placementId: number | null): TechnologyAdoptionComponent[] {
  return queryFacilityInstallation(state, { blueprintId, targetFacilityId }).components.map(component => ({
    kind: physicalKind(component.label), label: component.label, cost: component.cost, weeks: component.weeks,
    source: 'physical' as const, placementId, equipmentAssetId: null,
  }))
}

/**
 * The component rows of one lawful adoption. `placementIds` names the committed
 * P09 placements once they exist; a pre-commit quote leaves them null.
 */
export function adoptionComponents(state: GameState, studioId: string, request: AdoptionRequest, placementIds: { stage?: number; post?: number } = {}): {
  components: TechnologyAdoptionComponent[]
  postFacilityId: string | null
  reusedPostFacilityId: string | null
  equipment: EquipmentPlan
} {
  const entry = technologyEntry(request.technologyId)
  const postFacilityId = resolvedPostFacilityId(state, studioId, request)
  const postAlready = entry.postInstallationId !== null && postFacilityId !== null &&
    hasOperationalFacilityInstallation(state, postFacilityId, entry.postInstallationId)
  const equipment = equipmentPlan(state, studioId, request.technologyId)
  const components: TechnologyAdoptionComponent[] = [
    { kind: 'access', label: `${entry.name} access`, cost: 0, weeks: null, source: 'existing', placementId: null, equipmentAssetId: null },
    { kind: 'equipment', label: equipmentLabel(entry, equipment.source), cost: equipment.cost, weeks: null,
      source: equipment.source, placementId: null, equipmentAssetId: equipment.reusedEquipmentAssetId },
    ...physicalRows(state, entry.stageInstallationId, request.stageFacilityId, placementIds.stage ?? null),
  ]
  if (entry.postInstallationId !== null && postFacilityId !== null) {
    components.push(...postAlready
      ? [{ kind: 'post' as const, label: `${entry.name} Post fit-out already operational on this Post`, cost: 0, weeks: null,
        source: 'existing' as const, placementId: null, equipmentAssetId: null }]
      : physicalRows(state, entry.postInstallationId, postFacilityId, placementIds.post ?? null))
  }
  return { components, postFacilityId, reusedPostFacilityId: postAlready ? postFacilityId : null, equipment }
}

export function componentTotal(components: readonly TechnologyAdoptionComponent[]): number {
  return components.reduce((total, component) => total + component.cost, 0)
}

/** The player's quote for one adoption request: its component rows and total, or its refusal. */
export function adoptionQuote(state: GameState, request: AdoptionRequest): AdoptionQuote {
  const studioId = state.hollywood?.playerStudioId
  if (studioId === undefined) {
    return { ok: false, components: [], total: 0, reusedPostFacilityId: null, reusedEquipmentAssetId: null,
      refusal: 'Found your studio before adopting a technology.', rejections: ['Found your studio before adopting a technology.'] }
  }
  const rejections = adoptionRejections(state, studioId, request)
  if (rejections.length > 0) {
    return { ok: false, components: [], total: 0, reusedPostFacilityId: null, reusedEquipmentAssetId: null,
      refusal: rejections[0]!, rejections }
  }
  const { components, reusedPostFacilityId, equipment } = adoptionComponents(state, studioId, request)
  const total = componentTotal(components)
  // The commit checks the COMPLETE bill (equipment + physical work); the P09 query above priced the
  // physical work alone. A cash-only shortfall on the whole bill is refused here with the commit's
  // own sentence, and the bill stays published: it is real even when it cannot be paid today.
  if (!canAfford(state, total).ok) {
    return { ok: false, components, total, reusedPostFacilityId, reusedEquipmentAssetId: equipment.reusedEquipmentAssetId,
      refusal: INSTALLATION_CASH_REFUSAL, rejections: [INSTALLATION_CASH_REFUSAL] }
  }
  return { ok: true, components, total, reusedPostFacilityId,
    reusedEquipmentAssetId: equipment.reusedEquipmentAssetId, refusal: null, rejections: [] }
}

/**
 * Whether a player adoption's own physical facts are complete: every `physical`
 * component's placement is operational, and every `existing` component's facility
 * is operational. Nothing else grants capability.
 */
export function adoptionPhysicalComplete(state: GameState, adoption: TechnologyAdoption): boolean {
  const entry = technologyEntry(adoption.technologyId)
  // P13B-S6: a cancelled adoption's physical facts are final and incomplete. Read
  // through `?? null` because the frozen V24/V25 delegation strips the leaf before
  // the shared law runs over an older root, where its absence means "never cancelled".
  if ((adoption.cancelledWeek ?? null) !== null) return false
  if (!adoption.components.some(component => component.source === 'physical')) return false
  return adoption.components.every(component => {
    if (component.source === 'physical') {
      return component.placementId !== null &&
        state.placement.facilities.some(placed => placed.id === component.placementId && placed.status === 'operational')
    }
    if (component.source === 'existing' && component.kind === 'post') {
      return entry.postInstallationId !== null && adoption.postFacilityId !== null &&
        hasOperationalFacilityInstallation(state, adoption.postFacilityId, entry.postInstallationId)
    }
    return true
  })
}

/** Whether this adoption's installed chain is operational on its own exact bodies. */
export function adoptionChainOperational(state: GameState, adoption: TechnologyAdoption): boolean {
  const entry = technologyEntry(adoption.technologyId)
  // P13B-S6: a cancelled adoption never has an operational chain, whatever else
  // stands on its bodies — its own work stopped. `?? null`: see above.
  if ((adoption.cancelledWeek ?? null) !== null) return false
  if (!hasOperationalFacilityInstallation(state, adoption.stageFacilityId, entry.stageInstallationId)) return false
  return entry.postInstallationId === null || (adoption.postFacilityId !== null &&
    hasOperationalFacilityInstallation(state, adoption.postFacilityId, entry.postInstallationId))
}

/**
 * The component rows of an adoption whose physical work this campaign does not
 * own placement by placement: one aggregated installation line for the whole
 * chain (abstract rival plant, and the V23→V24 lift of a rival row).
 */
export function aggregatedAdoptionComponents(
  entry: TechnologyCatalogueEntry,
  equipment: { source: TechnologyEquipmentAsset['source']; cost: number },
  installationCost: number,
  equipmentAssetId: string | null,
): TechnologyAdoptionComponent[] {
  return [
    { kind: 'access', label: `${entry.name} access`, cost: 0, weeks: null, source: 'existing', placementId: null, equipmentAssetId: null },
    { kind: 'equipment', label: equipmentLabel(entry, equipment.source), cost: equipment.cost, weeks: null,
      source: equipment.source, placementId: null, equipmentAssetId },
    { kind: 'installation', label: `${entry.name} installation`, cost: installationCost, weeks: entry.deploymentWeeks,
      source: 'physical', placementId: null, equipmentAssetId: null },
  ]
}

/**
 * The next equipment asset identity for this studio, from the root's own counter.
 * The row is authored in the same key order the save boundary writes (sorted), so
 * a live asset and its reloaded copy are byte-identical.
 */
export function mintEquipmentAsset(
  nextEquipmentId: number,
  studioId: string,
  technologyId: TechnologyId,
  acquiredWeek: number,
  source: TechnologyEquipmentAsset['source'],
  cost: number,
  holderAdoptionId: string,
): TechnologyEquipmentAsset {
  return { acquiredWeek, cost, holderAdoptionId, id: `${studioId}:equipment:${String(nextEquipmentId)}`, source, studioId, technologyId }
}
