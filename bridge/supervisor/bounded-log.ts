import fs from 'node:fs'
import { StringDecoder } from 'node:string_decoder'

export const DEFAULT_SUPERVISOR_LOG_MAX_BYTES = 2 * 1024 * 1024
export const MAX_SUPERVISOR_PENDING_LINE_CHARACTERS = 256 * 1024

type LogStream = 'stderr' | 'stdout' | 'supervisor'

function replaceAllExact(value: string, secret: string): string {
  if (secret.length === 0 || !value.includes(secret)) return value
  return value.split(secret).join('[REDACTED_CAPABILITY]')
}

export class BoundedRedactingLineLog {
  readonly filePath: string

  private readonly descriptor: number
  private decoders = {
    stderr: new StringDecoder('utf8'),
    stdout: new StringDecoder('utf8'),
  }
  private readonly pending = { stderr: '', stdout: '' }
  private readonly discarding = { stderr: false, stdout: false }
  private bytesWritten = 0
  private closed = false
  private truncated = false

  constructor(
    filePath: string,
    private readonly capability: string,
    private readonly maxBytes: number = DEFAULT_SUPERVISOR_LOG_MAX_BYTES,
    private readonly onLine?: (stream: 'stderr' | 'stdout', line: string) => void,
  ) {
    if (!Number.isSafeInteger(maxBytes) || maxBytes < 1024) {
      throw new Error('Log byte bound must be an integer of at least 1024 bytes.')
    }
    this.filePath = filePath
    this.descriptor = fs.openSync(
      filePath,
      fs.constants.O_WRONLY |
        fs.constants.O_CREAT |
        fs.constants.O_EXCL |
        (fs.constants.O_NOFOLLOW ?? 0),
      0o600,
    )
    fs.fchmodSync(this.descriptor, 0o600)
  }

  write(stream: 'stderr' | 'stdout', chunk: Uint8Array | string): void {
    if (this.closed) return
    const decoded = typeof chunk === 'string'
      ? chunk
      : this.decoders[stream].write(Buffer.from(chunk))
    this.consume(stream, decoded)
  }

  event(message: string): void {
    if (this.closed) return
    this.writeLine('supervisor', replaceAllExact(message, this.capability))
  }

  endStream(stream: 'stderr' | 'stdout'): void {
    if (this.closed) return
    this.consume(stream, this.decoders[stream].end())
    if (!this.discarding[stream] && this.pending[stream].length > 0) {
      const line = replaceAllExact(this.pending[stream].replace(/\r$/, ''), this.capability)
      this.onLine?.(stream, line)
      this.writeLine(stream, line)
    }
    this.pending[stream] = ''
    this.discarding[stream] = false
    this.decoders[stream] = new StringDecoder('utf8')
  }

  close(): void {
    if (this.closed) return
    for (const stream of ['stdout', 'stderr'] as const) {
      this.endStream(stream)
    }
    fs.fsyncSync(this.descriptor)
    fs.closeSync(this.descriptor)
    this.closed = true
  }

  private consume(stream: 'stderr' | 'stdout', decoded: string): void {
    if (decoded.length === 0) return
    let remaining = decoded
    while (remaining.length > 0) {
      const newline = remaining.indexOf('\n')
      const fragment = newline < 0 ? remaining : remaining.slice(0, newline)
      remaining = newline < 0 ? '' : remaining.slice(newline + 1)

      if (!this.discarding[stream]) this.pending[stream] += fragment
      if (this.pending[stream].length > MAX_SUPERVISOR_PENDING_LINE_CHARACTERS) {
        this.writeLine(stream, '[line discarded: exceeded 262144 characters]')
        this.pending[stream] = ''
        this.discarding[stream] = true
      }

      if (newline >= 0) {
        if (!this.discarding[stream]) {
          const line = replaceAllExact(this.pending[stream].replace(/\r$/, ''), this.capability)
          this.onLine?.(stream, line)
          this.writeLine(stream, line)
        }
        this.pending[stream] = ''
        this.discarding[stream] = false
      }
    }
  }

  private writeLine(stream: LogStream, line: string): void {
    if (this.truncated) return
    const encoded = Buffer.from(
      `${new Date().toISOString()} [${stream}] ${replaceAllExact(line, this.capability)}\n`,
      'utf8',
    )
    if (this.bytesWritten + encoded.length > this.maxBytes) {
      const marker = Buffer.from(
        `${new Date().toISOString()} [supervisor] [log truncated at ${String(this.maxBytes)} bytes]\n`,
        'utf8',
      )
      if (this.bytesWritten + marker.length <= this.maxBytes) {
        fs.writeSync(this.descriptor, marker)
        this.bytesWritten += marker.length
      }
      this.truncated = true
      return
    }
    fs.writeSync(this.descriptor, encoded)
    this.bytesWritten += encoded.length
  }
}
