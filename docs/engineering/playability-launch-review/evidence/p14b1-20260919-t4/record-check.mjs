import { spawnSync } from 'node:child_process';
import { appendFileSync, closeSync, existsSync, openSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';

const cwd = '/Users/zacheryspector/The-Movies-headless-program';
const [name, command, ...args] = process.argv.slice(2);
if (!/^[a-z0-9-]+$/.test(name ?? '') || !command) throw new Error('Expected evidence name and command arguments');
const directory = `${cwd}/docs/engineering/playability-launch-review/evidence/p14b1-20260919-t4`;
const log = `${directory}/${name}.txt`;
if (existsSync(log)) throw new Error('Refusing to overwrite prior evidence');
const git = (...args) => {
  const result = spawnSync('git', args, { cwd, encoding: 'utf8' });
  if (result.status !== 0) throw new Error(result.stderr);
  return result.stdout;
};
const diff = git('diff', 'HEAD', '--binary', '--', 'src', 'bridge', 'tests', 'generated', 'ui');
const metadata = {
  sourceSha: git('rev-parse', 'HEAD').trim(),
  testedDiffSha256: createHash('sha256').update(diff).digest('hex'),
  command: [command, ...args], node: process.version,
  start: new Date().toISOString(), end: null, exitCode: null,
};
writeFileSync(`${directory}/${name}.patch`, diff);
writeFileSync(`${directory}/${name}.json`, JSON.stringify(metadata, null, 2) + '\n');
writeFileSync(log, JSON.stringify(metadata) + '\n\n');
const fd = openSync(log, 'a');
console.log(`START ${name}`);
const result = spawnSync(command, args, { cwd, stdio: ['ignore', fd, fd] });
closeSync(fd);
metadata.end = new Date().toISOString();
metadata.exitCode = result.status;
metadata.signal = result.signal;
metadata.testedDiffSha256AtEnd = createHash('sha256').update(git('diff', 'HEAD', '--binary', '--', 'src', 'bridge', 'tests', 'generated', 'ui')).digest('hex');
appendFileSync(log, `\n${JSON.stringify(metadata)}\n`);
writeFileSync(`${directory}/${name}.json`, JSON.stringify(metadata, null, 2) + '\n');
console.log(`END ${name} exit=${result.status}`);
process.exitCode = result.status ?? 1;
