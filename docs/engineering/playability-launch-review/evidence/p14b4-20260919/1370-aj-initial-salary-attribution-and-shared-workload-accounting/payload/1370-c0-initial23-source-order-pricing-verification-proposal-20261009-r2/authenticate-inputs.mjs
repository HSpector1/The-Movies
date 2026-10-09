// Pure local-file authentication only; no engine, fixture, capture, or Save imports.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import crypto from 'node:crypto';
const HERE = path.dirname(fileURLToPath(import.meta.url));
const hash = b => crypto.createHash('sha256').update(b).digest('hex');
const same = (a,b) => ['dev','ino','size','mode','nlink','mtimeNs','ctimeNs'].every(k => a[k] === b[k]);
function authenticated(role, cap = 16 * 1024 * 1024) {
  assert.equal(fs.realpathSync(role.path), role.path, 'PHYSICAL_ROLE');
  const before = fs.lstatSync(role.path, {bigint:true});
  assert.ok(before.isFile() && before.nlink === 1n && before.size <= BigInt(cap), 'ROLE_KIND_CAP');
  const fd = fs.openSync(role.path, fs.constants.O_RDONLY | fs.constants.O_NOFOLLOW);
  try {
    assert.ok(same(before, fs.fstatSync(fd,{bigint:true})), 'ROLE_OPEN_RACE');
    const raw = fs.readFileSync(fd); assert.equal(raw.length, role.bytes, 'ROLE_BYTES');
    assert.equal(hash(raw), role.sha256, 'ROLE_HASH');
    assert.ok(same(before,fs.fstatSync(fd,{bigint:true})) && same(before,fs.lstatSync(role.path,{bigint:true})), 'ROLE_READ_RACE');
    return raw;
  } finally { fs.closeSync(fd); }
}
export function authenticateConfig() {
  assert.equal(process.argv.length,3, 'EXACT_ARGV');
  assert.match(process.argv[2], /^[0-9a-f]{64}$/, 'CONFIG_ARG_SHA');
  const raw = fs.readFileSync(path.join(HERE,'CONFIG.json'));
  assert.equal(hash(raw),process.argv[2], 'CONFIG_HASH');
  const config=JSON.parse(raw);
  assert.equal(process.execPath, config.nodePath, 'EXACT_NODE');
  assert.equal(process.version, 'v20.20.2', 'NODE20');
  assert.equal(process.env.NODE_OPTIONS, undefined, 'NO_NODE_OPTIONS');
  assert.equal(process.env.NODE_PATH, undefined, 'NO_NODE_PATH');
  for (const role of Object.values(config.roles)) authenticated(role);
  authenticated({path:config.nodePath,sha256:config.nodeSha256,bytes:config.nodeBytes},128*1024*1024);
  assert.equal(config.executionAuthorization,false, 'UNADOPTED_SOURCE_ROLE');
  assert.ok(config.futureWitness && typeof config.futureWitness === 'object', 'WITNESS_UNFILLED');
  return {config, readRole:name => {assert.ok(config.roles[name], 'MISSING_FILLED_ROLE');return authenticated(config.roles[name]);}};
}
