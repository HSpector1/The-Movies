'use strict';
const fs = require('node:fs');
const path = require('node:path');
const { Worker } = require('node:worker_threads');
const { spawnSync } = require('node:child_process');
const root = process.env.H_ATTRIBUTION_ROOT;
const p = name => path.join(root, name);
const cb = (name, args) => new Promise((resolve, reject) => fs[name](...args, e => e ? reject(e) : resolve()));

async function main() {
  if (process.argv[2] === 'child') { fs.writeFileSync(p('child.txt'), 'child'); return; }
  if (process.argv[2] === 'worker') { fs.writeFileSync(p('worker.txt'), 'worker'); return; }
  fs.writeFileSync(p('sync.txt'), 'sync');
  await cb('writeFile', [p('callback.txt'), 'callback']);
  await fs.promises.writeFile(p('promise.txt'), 'promise');
  const handle = await fs.promises.open(p('handle.txt'), 'w');
  await handle.writeFile('handle');
  await handle.utimes(new Date(), new Date());
  await handle.chmod(0o600);
  await handle.close();
  await new Promise((resolve, reject) => {
    const s = fs.createWriteStream(p('stream.txt'));
    s.on('error', reject); s.on('finish', resolve); s.end('stream');
  });
  fs.renameSync(p('sync.txt'), p('renamed.txt'));
  fs.utimesSync(root, new Date(), new Date());
  fs.chmodSync(root, 0o700);
  const fd = fs.openSync(p('syncfd.txt'), 'w');
  fs.futimesSync(fd, new Date(), new Date());
  fs.fchmodSync(fd, 0o600);
  fs.writeSync(fd, 'fd');
  fs.closeSync(fd);
  await fs.promises.utimes(p('promise.txt'), new Date(), new Date());
  await cb('chmod', [p('callback.txt'), 0o600]);
  await new Promise((resolve, reject) => {
    fs.unlink(p('absent.txt'), e => {
      if (!e || e.code !== 'ENOENT') reject(new Error('callback error changed'));
      else resolve();
    });
  });
  const worker = new Worker(__filename, { argv: ['worker'] });
  await new Promise((resolve, reject) => { worker.once('error', reject); worker.once('exit', code => code ? reject(Error('worker ' + code)) : resolve()); });
  const child = spawnSync(process.execPath, [__filename, 'child'], { env: process.env, encoding: 'utf8' });
  if (child.status !== 0) throw new Error('child failed: ' + child.stderr);
}
main().catch(e => { process.stderr.write(e.stack + '\n'); process.exitCode = 1; });
