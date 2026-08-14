import { describe, expect, it } from 'vitest'
import { parseRosterWallArgs } from '../src/harness/run-roster-wall-observatory.js'

describe('roster-wall observatory CLI', () => {
  it('parses generate, verify, and compare commands strictly', () => {
    expect(
      parseRosterWallArgs(['generate', '--profile', 'smoke', '--run-name', 'smoke-a']),
    ).toEqual({ command: 'generate', profile: 'smoke', runName: 'smoke-a' })
    expect(parseRosterWallArgs(['verify', '--run-name', 'complete-a'])).toEqual({
      command: 'verify',
      runName: 'complete-a',
    })
    expect(parseRosterWallArgs(['compare', '--left', 'a', '--right', 'b'])).toEqual({
      command: 'compare',
      leftRunName: 'a',
      rightRunName: 'b',
    })
  })

  const invalidArgs: string[][] = [
    [],
    ['generate', '--profile', 'tiny', '--run-name', 'x'],
    ['generate', '--profile', 'smoke'],
    ['verify', '--run-name', 'a', '--run-name', 'b'],
    ['compare', '--left', 'same', '--right', 'same'],
    ['compare', '--left', 'a', '--unknown', 'b'],
    ['wat'],
  ]

  invalidArgs.forEach((argv) => {
    it(`rejects invalid argv ${JSON.stringify(argv)}`, () => {
      expect(() => parseRosterWallArgs(argv)).toThrow()
    })
  })
})
