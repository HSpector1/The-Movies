#!/usr/bin/env python3
"""UNREVIEWED/UNRUN external pipe sink. Never launches or signals game workers."""
import hashlib
import json
import os
import select
import stat
import sys
import time
import types
from pathlib import Path

SOURCE = Path('/Users/zacheryspector/studio-scratch/1370-c0-aging-era-employment-witness-source-r7')
SOURCE_PINS_SHA = '69ca5043bb533908f722126fbc93fd59ce84f0d7388180f3b60c5074076aebc2'
SUPERVISOR_SHA = 'b9c85abe795502852f4fe4350121f3e6b639884b97ebc419da46b95d7ce2276f'
MAX_FRAME = 512 * 1024
READ_SECONDS = 760  # r7 remains 750; ten seconds is sink observation overhead only.
FORWARD_SECONDS = 10


def sha(data):
    return hashlib.sha256(data).hexdigest()


def read_bounded(fd, end, cap=MAX_FRAME):
    os.set_blocking(fd, False)
    raw = bytearray()
    while True:
        remaining = end - time.monotonic()
        if remaining <= 0:
            raise RuntimeError('STOP_SINK_READ_DEADLINE_CLEARANCE_UNKNOWN')
        ready, _, _ = select.select([fd], [], [], remaining)
        if not ready:
            raise RuntimeError('STOP_SINK_READ_DEADLINE_CLEARANCE_UNKNOWN')
        try:
            chunk = os.read(fd, min(8192, cap + 1 - len(raw)))
        except BlockingIOError:
            continue
        if not chunk:
            return bytes(raw)
        raw.extend(chunk)
        if len(raw) > cap:
            raise RuntimeError('STOP_SINK_FRAME_CAP')


def forward_bounded(raw, fd, end):
    os.set_blocking(fd, False)
    while raw:
        remaining = end - time.monotonic()
        if remaining <= 0:
            raise RuntimeError('STOP_SINK_FORWARD_DEADLINE')
        _, ready, _ = select.select([], [fd], [], remaining)
        if not ready:
            raise RuntimeError('STOP_SINK_FORWARD_DEADLINE')
        try:
            count = os.write(fd, raw[:8192])
        except BlockingIOError:
            continue
        if count <= 0:
            raise RuntimeError('STOP_SINK_FORWARD_WRITE')
        raw = raw[count:]


def main():
    started = time.monotonic()
    if len(sys.argv) != 3:
        raise RuntimeError('STOP_SINK_ARGV')
    if not stat.S_ISFIFO(os.fstat(0).st_mode):
        raise RuntimeError('STOP_SINK_STDIN_NOT_PIPE')
    binding_bytes = Path(sys.argv[1]).read_bytes()
    if sha(binding_bytes) != sys.argv[2]:
        raise RuntimeError('STOP_SINK_BINDING_PIN')
    profile = json.loads(binding_bytes)
    if profile.get('status') != 'REVIEWED_FILLED_UNRUN':
        raise RuntimeError('STOP_SINK_BINDING_UNFILLED')
    if sha((SOURCE / 'SOURCE-PINS.json').read_bytes()) != SOURCE_PINS_SHA:
        raise RuntimeError('STOP_SINK_SOURCE_MANIFEST')
    supervisor_bytes = (SOURCE / 'supervise.py').read_bytes()
    if sha(supervisor_bytes) != SUPERVISOR_SHA:
        raise RuntimeError('STOP_SINK_VALIDATOR_PIN')
    # Execute precisely the read and authenticated bytes, avoiding an import reread.
    validator = types.ModuleType('accepted_r7_frame_validator')
    validator.__file__ = str(SOURCE / 'supervise.py')
    exec(compile(supervisor_bytes, validator.__file__, 'exec'), validator.__dict__)
    validator.validate_source_review(profile, SOURCE)
    raw = read_bounded(0, started + READ_SECONDS)
    validator.validate_frame(raw, profile)
    if sha(Path(sys.argv[1]).read_bytes()) != sys.argv[2]:
        raise RuntimeError('STOP_SINK_BINDING_DRIFT')
    # This is still a candidate until shell PIPESTATUS and observed review accept it.
    forward_bounded(raw, 1, time.monotonic() + FORWARD_SECONDS)


if __name__ == '__main__':
    try:
        main()
    except Exception as exc:
        print(json.dumps({'status': str(exc)}), file=sys.stderr)
        raise SystemExit(2)
