#!/usr/bin/env python3
"""Scratch-only synthetic API and propagation check; never invokes H/Vitest."""
import glob
import json
import os
from pathlib import Path
import subprocess
import sys
import tempfile

HERE = Path(__file__).resolve().parent
with tempfile.TemporaryDirectory(prefix='synthetic-', dir=HERE) as temp:
    area = Path(temp)
    root = area / 'root'
    root.mkdir()
    deps = area / 'deps'; deps.mkdir()
    protected_h = area / 'protected-h'; protected_h.mkdir()
    production = area / 'production'; production.mkdir()
    log_base = area / 'events'
    env = dict(os.environ)
    env.update(H_ATTRIBUTION_ROOT=str(root), H_ATTRIBUTION_LOG=str(log_base),
               H_ATTRIBUTION_DEP_ROOT=str(deps), H_ATTRIBUTION_PROTECTED_H=str(protected_h),
               H_ATTRIBUTION_PRODUCTION_ROOT=str(production),
               H_ATTRIBUTION_NATIVE_ADDON=str(HERE / 'secure_log.node'),
               H_ATTRIBUTION_LOG_CAP='4194304',
               NODE_OPTIONS='--require=' + str(HERE / 'preloader.cjs'))
    result = subprocess.run(['node', str(HERE / 'synthetic.cjs')], env=env,
                            capture_output=True, text=True, timeout=20)
    if result.returncode:
        print(result.stdout, result.stderr, file=sys.stderr)
        raise SystemExit(result.returncode)
    files = sorted(glob.glob(str(log_base) + '.*.jsonl'))
    rows = []
    for file in files:
        rows += [json.loads(line) for line in Path(file).read_text().splitlines()]
    starts = [row['op'] for row in rows if row.get('phase') == 'start']
    ends = [row for row in rows if row.get('phase') == 'end']
    attests = [row for row in rows if row.get('kind') == 'startup']
    required = {'fs.writeFileSync', 'fs.writeFile', 'fs.promises.writeFile',
                'fs.promises.open', 'FileHandle.writeFile', 'FileHandle.utimes',
                'FileHandle.chmod', 'fs.createWriteStream', 'fs.renameSync',
                'fs.utimesSync', 'fs.chmodSync', 'fs.promises.utimes',
                'fs.chmod', 'fs.unlink'}
    required.update({'fs.futimesSync', 'fs.fchmodSync', 'fs.writeSync'})
    missing = sorted(required - set(starts))
    assert not missing, missing
    assert any(row['op'] == 'fs.unlink' and row['result'] == 'error' and row['error']['code'] == 'ENOENT' for row in ends)
    assert len(attests) == 3, attests
    assert len(files) == 3, files
    assert not any(row.get('kind') == 'LOG_CAP_REACHED' for row in rows)
    assert all(row.get('rootBefore') and row.get('rootAfter') for row in ends)
    cap_base = area / 'cap-events'
    cap_env = dict(env, H_ATTRIBUTION_LOG=str(cap_base), H_ATTRIBUTION_LOG_CAP='4096')
    cap_run = subprocess.run(['node', '-e', "for(let i=0;i<100;i++)require('node:fs').writeFileSync(process.env.H_ATTRIBUTION_ROOT+'/cap.txt',String(i))"],
                             env=cap_env, capture_output=True, text=True, timeout=10)
    assert cap_run.returncode == 0, cap_run.stderr
    cap_files = glob.glob(str(cap_base) + '.*.jsonl')
    assert len(cap_files) == 1, cap_files
    cap_bytes = Path(cap_files[0]).read_bytes()
    assert len(cap_bytes) <= 4096, len(cap_bytes)
    assert any(json.loads(line).get('kind') == 'LOG_CAP_REACHED' for line in cap_bytes.splitlines())
    red = []
    for label, target in [('source', root), ('deps', deps), ('protected-h', protected_h), ('production', production)]:
        alias = area / ('alias-' + label)
        alias.symlink_to(target, target_is_directory=True)
        before = root.stat()
        red_env = dict(env, H_ATTRIBUTION_LOG=str(alias / 'events'))
        refused = subprocess.run(['node', '-e', 'process.stdout.write("should-not-start")'],
                                 env=red_env, capture_output=True, text=True, timeout=10)
        after = root.stat()
        assert refused.returncode != 0, (label, refused.stdout)
        assert 'H_SECURE_LOG' in refused.stderr, (label, refused.stderr)
        assert (before.st_mtime_ns, before.st_ctime_ns) == (after.st_mtime_ns, after.st_ctime_ns), label
        assert not list(target.glob('events.*.jsonl')), label
        red.append(label)
    print(json.dumps({'status': 'PASS', 'log_files': len(files), 'attestations': len(attests),
                      'operations_started': len(starts), 'operations_ended': len(ends),
                      'cap_bytes': len(cap_bytes), 'cap_marker': True,
                      'symlink_parent_red_refusals': red,
                      'distinct_ops': sorted(set(starts))}, indent=2))
