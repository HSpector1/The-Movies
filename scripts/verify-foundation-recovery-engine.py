#!/usr/bin/env python3
"""Exercise the packaged loader on disposable accepted P06 copies; no Owner data."""
import argparse
import gzip
import hashlib
import json
import os
from pathlib import Path
import secrets
import subprocess
import tempfile
import time
import urllib.request

args = argparse.ArgumentParser()
args.add_argument('--engine', required=True)
args.add_argument('--evidence', required=True)
args.add_argument('--port', type=int, default=43411)
opt = args.parse_args()
root = Path(__file__).resolve().parents[1]
evidence = Path(opt.evidence).resolve()
evidence.mkdir(mode=0o700, parents=True, exist_ok=False)
expected = json.loads((root / 'generated/unity/project-studio-bridge.contract-manifest.json').read_text())['schemaId']
p06 = 'sha256:71529afdcb8e5cf645ab136efb9685256da0039e86d989bfab97b7b2cc5d9a8b'
checks = []


def check(name, condition):
    checks.append({'name': name, 'passed': bool(condition)})
    print(('PASS ' if condition else 'FAIL ') + name, flush=True)
    if not condition:
        raise AssertionError(name)


def boot(runtime, label, valid=True):
    cap = secrets.token_urlsafe(32)
    environment = dict(os.environ, PROJECT_STUDIO_BRIDGE_CAPABILITY=cap,
                       PROJECT_STUDIO_BRIDGE_PORT=str(opt.port), PROJECT_STUDIO_BRIDGE_RUNTIME_DIR=str(runtime))
    log = evidence / (label + '.log')
    with log.open('wb') as output:
        process = subprocess.Popen(['node', str(Path(opt.engine).resolve())], env=environment, stdout=output, stderr=subprocess.STDOUT)
        try:
            session = None
            for _ in range(100):
                if process.poll() is not None:
                    break
                try:
                    request = urllib.request.Request(f'http://127.0.0.1:{opt.port}/session', headers={'x-project-studio-capability': cap})
                    with urllib.request.urlopen(request, timeout=.2) as response:
                        session = json.load(response)
                    break
                except (OSError, ValueError):
                    time.sleep(.05)
            if valid:
                check(label + ': current authority served by actual bundle', session is not None and session['schemaId'] == expected)
            else:
                check(label + ': rejected before serving authority', session is None and process.poll() not in (None, 0))
            return session
        finally:
            if process.poll() is None:
                process.terminate()
            try:
                process.wait(timeout=5)
            except subprocess.TimeoutExpired:
                process.kill()
                process.wait()
    # The capability is never serialized in any evidence payload.


def preserved(slot_before, slot_after):
    if slot_before is None:
        return slot_after is None
    before, after = json.loads(slot_before), json.loads(slot_after)
    state = dict(before['state'], studioHistory={'recordingStartedWeek': before['state']['market']['tick'], 'nextEventId': 0, 'rows': []}, foundingRegime='endowed')
    return before['saveVersion'] == 16 and after == dict(before, saveVersion=18, state=state)


ready = (root / 'ui/e2e/p06-visual-oracle-v1/s4-release-ready.checkpoint.json').read_bytes()
committed = gzip.decompress((root / 'tests/fixtures/p06-recovery.checkpoint.json.gz').read_bytes())
try:
    for label, raw, digest in [
        ('p06-null-save', ready, '74e4f4a7b2eda36b1f08a29d44a227f697c2aa768ee04218f1ff508ce91f8c13'),
        ('p06-explicit-save-journal', committed, 'd9e08202cd40188d7a8f7c66282bfcde35a676ae45f09257072b0709985b7bb0'),
    ]:
        before = json.loads(raw)
        check(label + ': immutable predecessor fixture', hashlib.sha256(raw).hexdigest() == digest and before['schemaId'] == p06)
        runtime = Path(tempfile.mkdtemp(prefix='studio-p06-recovery-'))
        checkpoint = runtime / 'bridge-runtime-v1.json'
        checkpoint.write_bytes(raw)
        first = boot(runtime, label + '-first')
        migrated_raw = checkpoint.read_bytes()
        after = json.loads(migrated_raw)
        check(label + ': governed new session revision and empty journal', after['sessionId'] != before['sessionId'] and after['stateRevision'] == 0 and after['journal'] == [])
        check(label + ': preserved current meaning through V16 to V18', preserved(before['currentSaveJson'], after['currentSaveJson']))
        check(label + ': independently preserved explicit saved slot', preserved(before['savedSaveJson'], after['savedSaveJson']))
        before_mtime = checkpoint.stat().st_mtime_ns
        second = boot(runtime, label + '-second')
        check(label + ': second restart is stable without rewriting', checkpoint.read_bytes() == migrated_raw and checkpoint.stat().st_mtime_ns == before_mtime and second['sessionId'] == first['sessionId'] and second['stateDigest'] == first['stateDigest'])
        (evidence / (label + '-binding.json')).write_text(json.dumps({'runtime': str(runtime), 'inputSha256': digest, 'outputSha256': hashlib.sha256(migrated_raw).hexdigest(), 'sessionId': second['sessionId']}, indent=2) + '\n')

    for label, field, value in [('unknown-schema', 'schemaId', 'sha256:' + 'f'*64), ('future-protocol', 'protocolVersion', 5), ('future-checkpoint', 'checkpointVersion', 2)]:
        invalid = dict(json.loads(committed), **{field: value})
        raw = (json.dumps(invalid, ensure_ascii=False, sort_keys=True, separators=(',', ':')) + '\n').encode()
        runtime = Path(tempfile.mkdtemp(prefix='studio-reject-recovery-'))
        checkpoint = runtime / 'bridge-runtime-v1.json'
        checkpoint.write_bytes(raw)
        boot(runtime, label, valid=False)
        check(label + ': rejected bytes remain untouched', checkpoint.read_bytes() == raw)
finally:
    report = {'kind': 'foundation-recovery-packaged-engine', 'tsCommit': subprocess.check_output(['git', 'rev-parse', 'HEAD'], cwd=root, text=True).strip(),
              'engineSha256': hashlib.sha256(Path(opt.engine).read_bytes()).hexdigest(), 'schemaId': expected,
              'checks': checks, 'passed': sum(c['passed'] for c in checks), 'failed': sum(not c['passed'] for c in checks)}
    (evidence / 'report.json').write_text(json.dumps(report, indent=2) + '\n')
