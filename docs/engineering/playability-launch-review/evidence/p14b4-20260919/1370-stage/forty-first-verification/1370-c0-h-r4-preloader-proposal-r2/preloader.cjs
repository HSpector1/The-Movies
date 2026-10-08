'use strict';

// Proposal only. Load with NODE_OPTIONS=--require=<this file> after exact review.
// No production or H mirror path is configured here.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { threadId, isMainThread } = require('node:worker_threads');
const { fileURLToPath } = require('node:url');
const { syncBuiltinESMExports } = require('node:module');

const original = {};
for (const key of Object.keys(fs)) if (typeof fs[key] === 'function') original[key] = fs[key].bind(fs);
const promiseOriginal = {};
for (const key of Object.keys(fs.promises)) if (typeof fs.promises[key] === 'function') promiseOriginal[key] = fs.promises[key].bind(fs.promises);

const root = process.env.H_ATTRIBUTION_ROOT;
const depsRoot = process.env.H_ATTRIBUTION_DEP_ROOT;
const protectedH = process.env.H_ATTRIBUTION_PROTECTED_H;
const productionRoot = process.env.H_ATTRIBUTION_PRODUCTION_ROOT;
const addonPath = process.env.H_ATTRIBUTION_NATIVE_ADDON;
const logBase = process.env.H_ATTRIBUTION_LOG;
const logPath = logBase ? `${logBase}.${process.pid}.${threadId}.jsonl` : null;
const cap = Number(process.env.H_ATTRIBUTION_LOG_CAP || 4 * 1024 * 1024);
if (!root || !depsRoot || !protectedH || !productionRoot || !addonPath ||
    ![root, depsRoot, protectedH, productionRoot, addonPath, logBase].every(x => x && path.isAbsolute(x)) ||
    !Number.isSafeInteger(cap) || cap < 4096 || cap > 4 * 1024 * 1024 ||
    path.resolve(root) === path.resolve(logPath) || path.resolve(logPath).startsWith(path.resolve(root) + path.sep)) {
  throw new Error('H preloader requires absolute roots, addon, external log, and 4096..4194304 byte cap');
}
const absoluteRoot = path.resolve(root);
const rootReal = original.realpathSync.native ? original.realpathSync.native(absoluteRoot) : original.realpathSync(absoluteRoot);
if (rootReal !== absoluteRoot) throw new Error('H preloader root must be canonical');
const sourceRootBeforeLog = original.lstatSync(absoluteRoot, { bigint: true });
const protectedRoots = [absoluteRoot, path.resolve(depsRoot), path.resolve(protectedH), path.resolve(productionRoot)];
const native = require(addonPath);
const logFd = native.secureOpen(logPath, protectedRoots);
const sourceRootAfterLog = original.lstatSync(absoluteRoot, { bigint: true });
for (const key of ['dev', 'ino', 'mode', 'nlink', 'mtimeNs', 'ctimeNs']) {
  if (sourceRootBeforeLog[key] !== sourceRootAfterLog[key]) throw new Error('H preloader source root changed during log creation: ' + key);
}
const logStat = original.fstatSync(logFd);
if (!logStat.isFile() || logStat.nlink !== 1) throw new Error('H preloader log must be a unique regular file');
let written = 0;
let sequence = 0;
let capped = false;
let loggingFailure = false;
const fdPaths = new Map();

function wall() { return new Date().toISOString(); }
function mono() { return process.hrtime.bigint().toString(); }
function rootTuple() {
  try {
    const s = original.lstatSync(absoluteRoot, { bigint: true });
    return { dev: String(s.dev), ino: String(s.ino), mode: String(s.mode),
      mtimeNs: String(s.mtimeNs), ctimeNs: String(s.ctimeNs), nlink: String(s.nlink) };
  } catch (e) { return { error: e.code || e.message }; }
}
function emit(row) {
  if (capped || loggingFailure) return;
  const line = Buffer.from(JSON.stringify({ sequence: ++sequence, pid: process.pid,
    ppid: process.ppid, threadId, isMainThread, wall: wall(), monotonicNs: mono(), ...row }) + '\n');
  if (written + line.length > cap - 256) {
    capped = true;
    const marker = Buffer.from(JSON.stringify({ sequence: ++sequence, pid: process.pid,
      threadId, kind: 'LOG_CAP_REACHED', cap, bytesBeforeMarker: written }) + '\n');
    try { original.writeSync(logFd, marker); written += marker.length; }
    catch (e) { loggingFailure = true; throw new Error('H preloader cap marker write failed: ' + e.message); }
    return;
  }
  try { original.writeSync(logFd, line); written += line.length; }
  catch (e) { loggingFailure = true; throw new Error('H preloader log write failed: ' + e.message); }
}
function pathString(value) {
  try {
    if (value && typeof value === 'object' && typeof value.original === 'string' &&
        typeof value.absolute === 'string') return value;
    if (value instanceof URL) value = fileURLToPath(value);
    if (Buffer.isBuffer(value)) value = value.toString();
    if (typeof value !== 'string') return null;
    return { original: value, absolute: path.resolve(value) };
  } catch (_) { return null; }
}
function relevant(p) {
  if (!p) return false;
  return p.absolute === absoluteRoot || path.dirname(p.absolute) === absoluteRoot;
}
function refs(values) {
  return values.map(v => typeof v === 'number' ? fdPaths.get(v) || null : pathString(v));
}
function begin(op, values) {
  const paths = refs(values);
  if (!paths.some(relevant)) return null;
  const event = { kind: 'operation', op, paths, startWall: wall(), startMonotonicNs: mono(), rootBefore: rootTuple() };
  emit({ ...event, phase: 'start' });
  return event;
}
function end(event, error) {
  if (!event) return;
  emit({ kind: 'operation', op: event.op, paths: event.paths, phase: 'end',
    startMonotonicNs: event.startMonotonicNs, endWall: wall(), endMonotonicNs: mono(),
    rootBefore: event.rootBefore, rootAfter: rootTuple(),
    result: error ? 'error' : 'success', error: error ? { code: error.code || null, message: error.message } : null });
}
function wrapSync(name, indices) {
  const fn = original[name]; if (!fn) return;
  fs[name] = function (...args) {
    const e = begin('fs.' + name, indices.map(i => args[i]));
    try { const out = fn(...args); end(e); return out; }
    catch (err) { end(e, err); throw err; }
  };
}
function wrapCallback(name, indices) {
  const fn = original[name]; if (!fn) return;
  fs[name] = function (...args) {
    const e = begin('fs.' + name, indices.map(i => args[i]));
    const i = args.length - 1;
    if (typeof args[i] !== 'function') {
      try { const out = fn(...args); end(e); return out; }
      catch (err) { end(e, err); throw err; }
    }
    const cb = args[i];
    args[i] = function (...cbArgs) { end(e, cbArgs[0]); return cb.apply(this, cbArgs); };
    try { return fn(...args); }
    catch (err) { end(e, err); throw err; }
  };
}
function wrapPromise(name, indices) {
  const fn = promiseOriginal[name]; if (!fn) return;
  fs.promises[name] = function (...args) {
    const e = begin('fs.promises.' + name, indices.map(i => args[i]));
    try { return Promise.resolve(fn(...args)).then(x => { end(e); return x; }, err => { end(e, err); throw err; }); }
    catch (err) { end(e, err); throw err; }
  };
}

const pathOps = ['mkdir', 'writeFile', 'appendFile', 'unlink', 'rmdir', 'rm', 'truncate',
  'utimes', 'lutimes', 'chmod', 'lchmod', 'chown', 'lchown', 'link', 'symlink', 'copyFile', 'cp'];
const dualPaths = new Set(['link', 'symlink', 'copyFile', 'cp', 'rename']);
for (const name of [...pathOps, 'rename']) {
  const indices = dualPaths.has(name) ? [0, 1] : [0];
  wrapSync(name + 'Sync', indices);
  wrapCallback(name, indices);
  wrapPromise(name, indices);
}
for (const name of ['futimes', 'fchmod', 'fchown', 'ftruncate', 'fsync', 'fdatasync', 'write', 'writev']) {
  wrapSync(name + 'Sync', [0]);
  wrapCallback(name, [0]);
}

function attachHandle(handle, p) {
  if (!handle || typeof handle !== 'object') return handle;
  if (typeof handle.fd === 'number') fdPaths.set(handle.fd, p);
  for (const name of ['write', 'writev', 'writeFile', 'appendFile', 'truncate', 'utimes',
    'chmod', 'chown', 'sync', 'datasync']) {
    if (typeof handle[name] !== 'function') continue;
    const fn = handle[name].bind(handle);
    Object.defineProperty(handle, name, { configurable: true, value: function (...args) {
      const e = begin('FileHandle.' + name, [p]);
      try { return Promise.resolve(fn(...args)).then(x => { end(e); return x; }, err => { end(e, err); throw err; }); }
      catch (err) { end(e, err); throw err; }
    } });
  }
  if (typeof handle.close === 'function') {
    const close = handle.close.bind(handle);
    const fd = handle.fd;
    Object.defineProperty(handle, 'close', { configurable: true, value: function (...args) {
      return Promise.resolve(close(...args)).then(x => { fdPaths.delete(fd); return x; });
    } });
  }
  return handle;
}
if (original.openSync) {
  fs.openSync = function (...args) {
    const p = pathString(args[0]); const e = begin('fs.openSync', [args[0]]);
    try { const fd = original.openSync(...args); fdPaths.set(fd, p); end(e); return fd; }
    catch (err) { end(e, err); throw err; }
  };
}
if (original.open) {
  fs.open = function (...args) {
    const p = pathString(args[0]); const e = begin('fs.open', [args[0]]);
    const i = args.length - 1; const cb = args[i];
    if (typeof cb === 'function') args[i] = function (err, fd) {
      if (!err && typeof fd === 'number') fdPaths.set(fd, p);
      end(e, err); return cb.apply(this, arguments);
    };
    try { return original.open(...args); }
    catch (err) { end(e, err); throw err; }
  };
}
if (promiseOriginal.open) {
  fs.promises.open = function (...args) {
    const e = begin('fs.promises.open', [args[0]]); const p = pathString(args[0]);
    try { return Promise.resolve(promiseOriginal.open(...args)).then(h => { attachHandle(h, p); end(e); return h; },
      err => { end(e, err); throw err; }); }
    catch (err) { end(e, err); throw err; }
  };
}
if (original.createWriteStream) {
  fs.createWriteStream = function (...args) {
    const e = begin('fs.createWriteStream', [args[0]]);
    try {
      const stream = original.createWriteStream(...args);
      let ended = false;
      const finish = err => { if (!ended) { ended = true; end(e, err); } };
      stream.once('finish', () => finish());
      stream.once('close', () => finish());
      stream.once('error', finish);
      return stream;
    } catch (err) { end(e, err); throw err; }
  };
}
for (const name of ['close', 'closeSync']) {
  const fn = original[name]; if (!fn) continue;
  fs[name] = function (...args) {
    const fd = args[0];
    if (name === 'closeSync') { const out = fn(...args); fdPaths.delete(fd); return out; }
    const i = args.length - 1, cb = args[i];
    if (typeof cb === 'function') args[i] = function (err) { if (!err) fdPaths.delete(fd); return cb.apply(this, arguments); };
    return fn(...args);
  };
}

syncBuiltinESMExports();
const selfSha256 = crypto.createHash('sha256').update(original.readFileSync(__filename)).digest('hex');
const addonSha256 = crypto.createHash('sha256').update(original.readFileSync(addonPath)).digest('hex');
emit({ kind: 'startup', preloaderSha256: selfSha256, root: absoluteRoot, logPath,
  addonSha256, protectedRoots, sourceRootBeforeLog: {
    dev: String(sourceRootBeforeLog.dev), ino: String(sourceRootBeforeLog.ino),
    mtimeNs: String(sourceRootBeforeLog.mtimeNs), ctimeNs: String(sourceRootBeforeLog.ctimeNs) },
  nodeOptions: process.env.NODE_OPTIONS || '', execArgv: process.execArgv,
  coverage: 'Node fs wrappers only; native syscall and uninstrumented descendant gaps remain' });
