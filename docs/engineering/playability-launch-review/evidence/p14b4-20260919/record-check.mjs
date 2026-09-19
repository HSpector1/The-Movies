// Parent-owned serialized evidence runner. No command is authorized by this file alone.
// From the repository root: node <this-file> <fresh-name> <command> [args...]
import { spawnSync } from 'node:child_process';
import { appendFileSync, closeSync, existsSync, openSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';

const cwd = process.cwd();
const directory = fileURLToPath(new URL('.', import.meta.url));
const [name, command, ...args] = process.argv.slice(2);
if (!/^[a-z0-9-]+$/.test(name ?? '') || !command) throw new Error('Expected fresh evidence name and command');
const path = (extension) => `${directory}${name}.${extension}`;
for (const extension of ['txt', 'json', 'patch']) {
  if (existsSync(path(extension))) throw new Error(`Refusing to overwrite ${path(extension)}`);
}
const sha = (value) => createHash('sha256').update(value).digest('hex');
const git = (...args) => {
  const result = spawnSync('git', args, { cwd, encoding: 'utf8', maxBuffer: 32 * 1024 * 1024 });
  if (result.status !== 0) throw new Error(result.stderr || result.error?.message || 'git failed');
  return result.stdout;
};
const sourcePaths = ['src', 'bridge', 'tests', 'generated', 'ui', 'scripts', 'package.json',
  'package-lock.json', 'tsconfig.json', 'tsconfig.bridge.json', 'vitest.config.ts', 'vitest.workspace.ts'];
const capture = () => {
  let patch = git('diff', 'HEAD', '--binary', '--', ...sourcePaths);
  const untracked = git('ls-files', '--others', '--exclude-standard', '-z', '--', ...sourcePaths)
    .split('\0').filter(Boolean).sort();
  for (const file of untracked) {
    const result = spawnSync('git', ['diff', '--no-index', '--binary', '--', '/dev/null', file],
      { cwd, encoding: 'utf8', maxBuffer: 32 * 1024 * 1024 });
    if (result.status !== 1) throw new Error(`Cannot capture untracked source ${file}: ${result.stderr}`);
    patch += result.stdout;
  }
  return { sourceSha: git('rev-parse', 'HEAD').trim(), patch, untracked };
};
const before = capture();
const metadata = {
  sourceSha: before.sourceSha,
  testedDiffSha256: sha(before.patch),
  untrackedSource: before.untracked,
  command: [command, ...args], node: process.version,
  start: new Date().toISOString(), end: null, exitCode: null,
};
writeFileSync(path('patch'), before.patch);
writeFileSync(path('json'), JSON.stringify(metadata, null, 2) + '\n');
writeFileSync(path('txt'), JSON.stringify(metadata) + '\n\n');
const fd = openSync(path('txt'), 'a');
console.log(`START ${name}`);
const result = spawnSync(command, args, { cwd, stdio: ['ignore', fd, fd] });
closeSync(fd);
const after = capture();
metadata.end = new Date().toISOString();
metadata.exitCode = result.status;
metadata.signal = result.signal;
metadata.error = result.error?.message ?? null;
metadata.sourceShaAtEnd = after.sourceSha;
metadata.testedDiffSha256AtEnd = sha(after.patch);
metadata.untrackedSourceAtEnd = after.untracked;
metadata.fixedSource = before.sourceSha === after.sourceSha && before.patch === after.patch;
appendFileSync(path('txt'), `\n${JSON.stringify(metadata)}\n`);
writeFileSync(path('json'), JSON.stringify(metadata, null, 2) + '\n');
console.log(`END ${name} exit=${result.status} fixedSource=${metadata.fixedSource}`);
process.exitCode = result.status ?? 1;
