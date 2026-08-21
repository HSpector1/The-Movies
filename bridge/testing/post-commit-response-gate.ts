import { createHash } from 'node:crypto'

import type { BridgeRuntimeJournalRoute } from '../runtime-checkpoint.ts'
import type {
  BridgeRuntimeDispatchResult,
  BridgeRuntimeResponse,
} from '../runtime/runtime-coordinator.ts'
import { canonicalJson } from '../schema/canonical.ts'

export const POST_COMMIT_RESPONSE_TEST_ENV =
  'PROJECT_STUDIO_BRIDGE_TEST_POST_COMMIT_RESPONSE' as const

type PostCommitResponseTestAction = 'drop' | 'hold'

type PostCommitResponseTestPlan = {
  action: PostCommitResponseTestAction
  commandId: string
  nonce: string
  route: BridgeRuntimeJournalRoute
  version: 1
}

export type PostCommitResponseTestDisposition = 'drop' | 'respond'

export type PostCommitResponseTestInput = {
  route: BridgeRuntimeJournalRoute
  commandId: string
  requestUtf8Sha256: string
  result: BridgeRuntimeDispatchResult
}

type PostCommitReplayTestSignal = {
  commandId: string
  event: 'post-commit-replay'
  requestUtf8Sha256: string
  responseJsonSha256: string
  route: BridgeRuntimeJournalRoute
  version: 1
}

export interface PostCommitResponseTestGate {
  afterDispatch(input: PostCommitResponseTestInput): Promise<PostCommitResponseTestDisposition>
}

const planKeys = ['action', 'commandId', 'nonce', 'route', 'version'] as const
const commandIdPattern = /^[\x20-\x7e]{1,256}$/
const noncePattern = /^[A-Za-z0-9_-]{1,64}$/
const sha256Pattern = /^[0-9a-f]{64}$/

function sha256Utf8(text: string): string {
  return createHash('sha256').update(text, 'utf8').digest('hex')
}

function parsePlan(encoded: string): PostCommitResponseTestPlan {
  if (Buffer.byteLength(encoded, 'utf8') > 1_024) {
    throw new Error(`${POST_COMMIT_RESPONSE_TEST_ENV} exceeds 1024 UTF-8 bytes.`)
  }

  let value: unknown
  try {
    value = JSON.parse(encoded) as unknown
  } catch {
    throw new Error(`${POST_COMMIT_RESPONSE_TEST_ENV} must contain canonical JSON.`)
  }
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    throw new Error(`${POST_COMMIT_RESPONSE_TEST_ENV} must contain a JSON object.`)
  }
  const record = value as Record<string, unknown>
  if (
    Object.keys(record).sort().join('\0') !== [...planKeys].sort().join('\0') ||
    canonicalJson(record) !== encoded
  ) {
    throw new Error(`${POST_COMMIT_RESPONSE_TEST_ENV} must use its exact canonical schema.`)
  }
  if (record.version !== 1) {
    throw new Error(`${POST_COMMIT_RESPONSE_TEST_ENV} has an unsupported version.`)
  }
  if (record.action !== 'drop' && record.action !== 'hold') {
    throw new Error(`${POST_COMMIT_RESPONSE_TEST_ENV} has an unsupported action.`)
  }
  if (record.route !== 'command' && record.route !== 'save' && record.route !== 'load') {
    throw new Error(`${POST_COMMIT_RESPONSE_TEST_ENV} has an unsupported route.`)
  }
  if (typeof record.commandId !== 'string' || !commandIdPattern.test(record.commandId)) {
    throw new Error(`${POST_COMMIT_RESPONSE_TEST_ENV} has an invalid commandId.`)
  }
  if (typeof record.nonce !== 'string' || !noncePattern.test(record.nonce)) {
    throw new Error(`${POST_COMMIT_RESPONSE_TEST_ENV} has an invalid nonce.`)
  }
  return record as PostCommitResponseTestPlan
}

function writeSignal(signal: unknown, prefix: string): Promise<void> {
  const line = `${prefix}${canonicalJson(signal)}\n`
  return new Promise<void>((resolve, reject) => {
    process.stdout.write(line, 'utf8', (error) => {
      if (error === null || error === undefined) resolve()
      else reject(error)
    })
  })
}

function holdUntilKilled(): Promise<never> {
  return new Promise<never>(() => {
    // The native-process acceptance harness terminates this deliberately with SIGKILL.
  })
}

class DisabledPostCommitResponseTestGate implements PostCommitResponseTestGate {
  async afterDispatch(): Promise<'respond'> {
    return 'respond'
  }
}

class ArmedPostCommitResponseTestGate implements PostCommitResponseTestGate {
  private consumed = false

  constructor(private readonly plan: PostCommitResponseTestPlan) {}

  async afterDispatch(
    input: PostCommitResponseTestInput,
  ): Promise<PostCommitResponseTestDisposition> {
    if (!sha256Pattern.test(input.requestUtf8Sha256)) {
      throw new Error('Post-commit response test gate received an invalid request byte digest.')
    }
    if (
      !input.result.firstSeen &&
      input.result.sessionRolledOver !== true &&
      input.result.response.accepted
    ) {
      const replaySignal: PostCommitReplayTestSignal = {
        commandId: input.commandId,
        event: 'post-commit-replay',
        requestUtf8Sha256: input.requestUtf8Sha256,
        responseJsonSha256: sha256Utf8(input.result.responseJson),
        route: input.route,
        version: 1,
      }
      await writeSignal(replaySignal, '[bridge:test] replay ')
      return 'respond'
    }
    if (
      this.consumed ||
      input.route !== this.plan.route ||
      input.commandId !== this.plan.commandId ||
      !input.result.firstSeen ||
      input.result.sessionRolledOver === true ||
      !input.result.response.accepted
    ) {
      return 'respond'
    }

    this.consumed = true
    const response: BridgeRuntimeResponse = input.result.response
    await writeSignal(
      {
        action: this.plan.action,
        commandId: input.commandId,
        committedSessionId: response.sessionId,
        committedStateDigest: response.stateDigest,
        committedStateRevision: response.stateRevision,
        event: 'post-commit-response',
        nonce: this.plan.nonce,
        requestUtf8Sha256: input.requestUtf8Sha256,
        responseJsonSha256: sha256Utf8(input.result.responseJson),
        route: input.route,
        version: 1,
      },
      '[bridge:test] post-commit ',
    )

    if (this.plan.action === 'hold') return holdUntilKilled()
    return 'drop'
  }
}

export function loadPostCommitResponseTestGate(
  durableRuntime: boolean,
): PostCommitResponseTestGate {
  const encoded = process.env[POST_COMMIT_RESPONSE_TEST_ENV]
  delete process.env[POST_COMMIT_RESPONSE_TEST_ENV]
  if (encoded === undefined) return new DisabledPostCommitResponseTestGate()
  if (process.env.NODE_ENV !== 'test') {
    throw new Error(`${POST_COMMIT_RESPONSE_TEST_ENV} is only available with NODE_ENV=test.`)
  }
  if (!durableRuntime) {
    throw new Error(`${POST_COMMIT_RESPONSE_TEST_ENV} requires a durable runtime directory.`)
  }
  return new ArmedPostCommitResponseTestGate(parsePlan(encoded))
}
