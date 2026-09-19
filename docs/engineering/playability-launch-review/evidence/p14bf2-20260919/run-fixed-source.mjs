import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, openSync, closeSync, appendFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import os from 'node:os';

const cwd = process.cwd();
const runName = process.argv[2];
if (!runName || !/^p14bf2-[a-z0-9-]+$/.test(runName)) throw new Error('Supply a fresh p14bf2 evidence directory name');
const evidence = `${cwd}/docs/engineering/playability-launch-review/evidence/${runName}`;
if (existsSync(`${evidence}/00-run.json`)) throw new Error('Refusing to overwrite prior run evidence');
const read = (...args) => {
  const result = spawnSync(args[0], args.slice(1), { cwd, encoding: 'utf8' });
  if (result.status !== 0) throw new Error(`${args.join(' ')}: ${result.stderr}`);
  return result.stdout.trim();
};
mkdirSync(evidence, { recursive: true });
const sourceSha = read('git', 'rev-parse', 'HEAD');
const sourcePaths = ['src', 'bridge', 'tests', 'ui', 'generated', 'scripts', 'package.json', 'package-lock.json', 'vitest.config.ts', 'vitest.workspace.ts', 'tsconfig.json', 'tsconfig.bridge.json'];
const diff = read('git', 'diff', 'HEAD', '--binary', '--', ...sourcePaths);
if (diff || read('git', 'ls-files', '--others', '--exclude-standard', '--', ...sourcePaths)) {
  throw new Error('Commit the tested code and tests before the final fixed-source pass');
}
const summary = {
  task: 'P14B-F2 T4', sourceSha,
  start: new Date().toISOString(), end: null,
  statusAtStart: read('git', 'status', '--short'),
  testedDiffSha256: createHash('sha256').update(diff).digest('hex'),
  environment: { node: process.version, platform: process.platform, arch: process.arch,
    release: os.release(), logicalCpus: os.cpus().length, memoryBytes: os.totalmem() },
  qualification: 'Same checkout and worker flags as prior Mac passes; timings are observations, not assumed equivalent. No source or test edits permitted during this run.',
  commands: [],
};
const persist = () => writeFileSync(`${evidence}/00-run.json`, JSON.stringify(summary, null, 2) + '\n');
persist();
const commands = [
  ['01-typecheck', 'npm', ['run', 'typecheck']],
  ['02-typecheck-bridge', 'npm', ['run', 'typecheck:bridge']],
  ['03-contract', 'npm', ['run', 'check:bridge-contract']],
  ['04-contract-fixtures', 'npm', ['run', 'check:bridge-contract:fixtures']],
  ['11-test-core', './node_modules/.bin/vitest', ['run', '--project', 'core', '--minWorkers=1', '--maxWorkers=2', '--reporter=dot']],
  ['12-test-bridge', '/bin/bash', ['-c', './node_modules/.bin/vitest run tests/bridge*.test.ts --minWorkers=1 --maxWorkers=2 --reporter=dot']],
];
for (const [name, command, args] of commands) {
  const log = `${evidence}/${name}-${sourceSha.slice(0, 7)}.txt`;
  const entry = { command, args, start: new Date().toISOString(), log: log.slice(cwd.length + 1), end: null, exitCode: null };
  summary.commands.push(entry);
  persist();
  console.log(`${entry.start} START ${name}`);
  writeFileSync(log, `source ${sourceSha}\ncommand ${JSON.stringify([command, ...args])}\nstart ${entry.start}\n\n`);
  const fd = openSync(log, 'a');
  const result = spawnSync(command, args, { cwd, stdio: ['ignore', fd, fd] });
  closeSync(fd);
  Object.assign(entry, { end: new Date().toISOString(), exitCode: result.status, signal: result.signal, error: result.error?.message ?? null });
  appendFileSync(log, `\nend ${entry.end}\nEXIT_CODE=${entry.exitCode}\nSIGNAL=${entry.signal}\n`);
  persist();
  console.log(`${entry.end} END ${name} exit=${entry.exitCode}`);
}
summary.end = new Date().toISOString();
summary.sourceShaAtEnd = read('git', 'rev-parse', 'HEAD');
summary.statusAtEnd = read('git', 'status', '--short');
summary.testedDiffSha256AtEnd = createHash('sha256').update(read('git', 'diff', 'HEAD', '--binary', '--', ...sourcePaths)).digest('hex');
summary.untrackedSourceAtEnd = read('git', 'ls-files', '--others', '--exclude-standard', '--', ...sourcePaths);
summary.fixedSource = summary.sourceShaAtEnd === sourceSha && summary.testedDiffSha256AtEnd === summary.testedDiffSha256 && !summary.untrackedSourceAtEnd;
persist();
console.log(`T4 commands complete: ${evidence}`);
process.exitCode = !summary.fixedSource || summary.commands.some(x => x.exitCode !== 0) ? 1 : 0;
