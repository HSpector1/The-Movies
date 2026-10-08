'use strict';
const fs = require('node:fs');
const path = require('node:path');
const root = process.argv[2];
if (!root || !path.isAbsolute(root)) throw Error('absolute root required');
const st = fs.lstatSync(root, { bigint: true });
if (!st.isDirectory() || st.isSymbolicLink()) throw Error('root must be a real directory');
let seq = 0;
function send(v) { process.stdout.write(JSON.stringify({ seq: ++seq, monoNs: process.hrtime.bigint().toString(), wall: new Date().toISOString(), ...v }) + '\n'); }
const watcher = fs.watch(root, { persistent: true }, (eventType, filename) => {
  send({ kind: 'event', eventType, filename: filename === null ? null : String(filename) });
});
const afterWatch = fs.lstatSync(root, { bigint: true });
if (afterWatch.dev !== st.dev || afterWatch.ino !== st.ino || afterWatch.mtimeNs !== st.mtimeNs ||
    afterWatch.ctimeNs !== st.ctimeNs) {
  watcher.close();
  throw Error('watched root path changed during watch setup');
}
watcher.on('error', e => { send({ kind: 'error', code: e.code || null, message: e.message }); process.exitCode = 2; watcher.close(); });
send({ kind: 'ready', root: path.resolve(root), dev: String(st.dev), ino: String(st.ino),
  mtimeNs: String(st.mtimeNs), ctimeNs: String(st.ctimeNs),
  dropDetection: 'fs.watch exposes no complete dropped-event counter; cap/error are reported' });
process.on('SIGTERM', () => watcher.close());
