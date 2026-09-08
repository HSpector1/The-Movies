// Proposed tests/bridge-owner-ux-projection21-schema.test.ts; scratch only, unexecuted.
// Integrate alongside both producers and the canonical projection21 patch.
import { describe, expect, it } from 'vitest'
import { BRIDGE_SCHEMA, PROJECTION_VERSION, PROTOCOL_VERSION, SCHEMA_ID } from '../bridge/protocol.ts'
import { BridgeSession, createBridgeInitialState } from '../bridge/session.ts'
import { parseWireValue } from '../bridge/schema/runtime.ts'

const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T
function session() { return new BridgeSession(createBridgeInitialState('owner-ux-wire-21'), 'owner-ux-wire-21') }
function control(s: BridgeSession, commandId: string) {
  return { protocolVersion: PROTOCOL_VERSION, schemaId: SCHEMA_ID, sessionId: s.sessionId,
    expectedStateRevision: s.stateRevision, commandId }
}

describe('Owner UX projection21 public field wire boundary', () => {
  it('pins the intended version and required envelope/profile fields independently', () => {
    expect(PROTOCOL_VERSION).toBe(4)
    expect(PROJECTION_VERSION).toBe(21)
    expect(BRIDGE_SCHEMA.$id).toBe('urn:project-studio:bridge:protocol-4:projection-21')
    expect(BRIDGE_SCHEMA.$defs.StudioPersonProfileSnapshot.required).toContain('genreExperience')
    for (const definition of [BRIDGE_SCHEMA.$defs.StudioBridgeSnapshotResponse,
      BRIDGE_SCHEMA.$defs.StudioBridgeAcceptedCommandResponse, BRIDGE_SCHEMA.$defs.StudioBridgeSaveResponse]) {
      expect(definition.required).toContain('savedSlot')
    }
    expect(BRIDGE_SCHEMA.$defs.StudioProjectionBundle.properties).not.toHaveProperty('savedSlot')
    expect(BRIDGE_SCHEMA.$defs.StudioSavedSlotSnapshot.additionalProperties).toBe(false)
  })

  it('parses actual current snapshot, Save, and Load envelopes', () => {
    const s = session()
    const snapshot = s.snapshot()
    expect(snapshot.savedSlot).toBeNull()
    expect(parseWireValue(BRIDGE_SCHEMA.$defs.StudioBridgeSnapshotResponse, snapshot)).toEqual(snapshot)
    const saved = s.save(control(s, 'save'))
    if (!saved.accepted) throw new Error(saved.message)
    expect(saved.savedSlot).toEqual({ studioName: 'PROJECT: STUDIO', gameWeek: snapshot.gameWeek })
    expect(parseWireValue(BRIDGE_SCHEMA.$defs.StudioBridgeSaveResponse, saved)).toEqual(saved)
    const loaded = s.load(control(s, 'load'))
    if (!loaded.accepted) throw new Error(loaded.message)
    expect(loaded.savedSlot).toEqual(saved.savedSlot)
    expect(parseWireValue(BRIDGE_SCHEMA.$defs.StudioBridgeAcceptedCommandResponse, loaded)).toEqual(loaded)
  })

  it('requires savedSlot rather than silently defaulting it', () => {
    const s = session()
    const snapshot = s.snapshot()
    const missing = clone(snapshot) as Partial<typeof snapshot>
    delete missing.savedSlot
    expect(() => parseWireValue(BRIDGE_SCHEMA.$defs.StudioBridgeSnapshotResponse, missing))
      .toThrow(/savedSlot.*required property is missing/)
    const saved = s.save(control(s, 'save'))
    if (!saved.accepted) throw new Error(saved.message)
    const missingSave = clone(saved) as Partial<typeof saved>
    delete missingSave.savedSlot
    expect(() => parseWireValue(BRIDGE_SCHEMA.$defs.StudioBridgeSaveResponse, missingSave))
      .toThrow(/savedSlot.*required property is missing/)
  })

  it.each([
    { studioName: 'PROJECT: STUDIO' },
    { studioName: '', gameWeek: 0 },
    { studioName: 'PROJECT: STUDIO', gameWeek: -1 },
    { studioName: 'PROJECT: STUDIO', gameWeek: 1.5 },
    { studioName: 'PROJECT: STUDIO', gameWeek: 0, savedAt: 'invented time' },
  ])('rejects malformed/fabricated slot metadata %#', savedSlot => {
    const snapshot = { ...session().snapshot(), savedSlot }
    expect(() => parseWireValue(BRIDGE_SCHEMA.$defs.StudioBridgeSnapshotResponse, snapshot)).toThrow()
  })

  it('accepts public fractional and known-zero cells, rejects hidden values and malformed cells', () => {
    const profile = clone(session().snapshot().snapshot.talent.talent.profiles[0]!)
    expect(profile.genreExperience).toHaveLength(24)
    profile.genreExperience[0]!.perceived = 61.25
    profile.genreExperience[1]!.perceived = 0
    expect(parseWireValue(BRIDGE_SCHEMA.$defs.StudioPersonProfileSnapshot, profile)).toEqual(profile)
    const missing = clone(profile) as Partial<typeof profile>
    delete missing.genreExperience
    expect(() => parseWireValue(BRIDGE_SCHEMA.$defs.StudioPersonProfileSnapshot, missing))
      .toThrow(/genreExperience.*required property is missing/)
    for (const changed of [
      { ...profile.genreExperience[0], actual: 88 },
      { ...profile.genreExperience[0], discipline: 'producing' },
      { ...profile.genreExperience[0], genre: 'western' },
      { ...profile.genreExperience[0], perceived: 100.01 },
      { ...profile.genreExperience[0], perceived: -0.01 },
    ]) {
      expect(() => parseWireValue(BRIDGE_SCHEMA.$defs.StudioPersonProfileSnapshot,
        { ...profile, genreExperience: [changed, ...profile.genreExperience.slice(1)] })).toThrow()
    }
  })
})
