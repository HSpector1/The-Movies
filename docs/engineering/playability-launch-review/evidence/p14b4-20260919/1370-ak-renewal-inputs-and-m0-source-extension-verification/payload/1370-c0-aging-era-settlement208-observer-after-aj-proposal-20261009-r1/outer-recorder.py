#!/usr/bin/env python3
"""UNRUN whole-route recorder. One inherited PGID, bounded pipes, no output files."""
import base64
import hashlib
import json
import os
import select
import selectors
import signal
import stat
import sys
import time
from pathlib import Path

OUTER_SECONDS = 750
ACTIVE_SECONDS = 742
MAX_STDOUT = 512 * 1024
MAX_STDERR = 64 * 1024
SOURCE = '3aaf55e0c06c4b745b0b722cc56913050b1ee229'
PROTOCOL = 'single-bounded-stdout-frame-no-files'
EMPLOYMENT = '4cffcb410893395f8ee93da2d7d6146f35db2369962fe333e02de8d2fc7c0b58'
MAX_FAILURE_BYTES = 16 * 1024
STDERR_PREFIX_BYTES = 8 * 1024


class FailureStop(RuntimeError):
    def __init__(self, status, diagnostic):
        super().__init__(status)
        self.diagnostic = diagnostic


def failure_record(streams, pid, child_exit, cleared):
    err = bytes(streams['stderr'])
    out = bytes(streams['stdout'])
    prefix = err[:STDERR_PREFIX_BYTES]
    return {'stage': 'outer', 'supervisorPid': pid, 'ownedPgid': pid,
            'supervisorExit': child_exit, 'ownedGroupCleared': cleared,
            'stdoutBytes': len(out), 'stdoutSha256': hashlib.sha256(out).hexdigest(),
            'stderrBytes': len(err), 'stderrSha256': hashlib.sha256(err).hexdigest(),
            'stderrPrefixBase64': base64.b64encode(prefix).decode('ascii'),
            'stderrPrefixBytes': len(prefix), 'stderrTruncated': len(prefix) != len(err),
            'byteCountsScope': 'Already captured bytes; cap-crossing read is excluded.'}


def failure_line(exc):
    status = str(exc).encode('utf8', errors='replace')
    record = {'status': status[:256].decode('utf8', errors='replace'),
              'statusBytes': len(status), 'statusSha256': hashlib.sha256(status).hexdigest(),
              'statusTruncated': len(status) > 256,
              'reporterPid': os.getpid(), 'reporterPgid': os.getpgrp()}
    if isinstance(exc, FailureStop):
        record['failure'] = exc.diagnostic
    raw = (json.dumps(record, sort_keys=True, separators=(',', ':')) + '\n').encode('ascii')
    if len(raw) > MAX_FAILURE_BYTES:
        record.pop('failure', None)
        record['failureMetadataOmittedForCap'] = True
        raw = (json.dumps(record, sort_keys=True, separators=(',', ':')) + '\n').encode('ascii')
    if len(raw) > MAX_FAILURE_BYTES:
        raise RuntimeError('STOP_DIAGNOSTIC_CAP')
    return raw


def group_alive(pgid):
    try:
        os.killpg(pgid, 0)
        return True
    except ProcessLookupError:
        return False
    except PermissionError:
        return True


def reap(pid):
    try:
        got, status = os.waitpid(pid, os.WNOHANG)
        return os.waitstatus_to_exitcode(status) if got == pid else None
    except ChildProcessError:
        raise RuntimeError('STOP_REAP_LOST')


def start_group(command):
    out_r, out_w = os.pipe()
    err_r, err_w = os.pipe()
    try:
        pid = os.fork()
    except BaseException:
        for fd in (out_r, out_w, err_r, err_w):
            os.close(fd)
        raise
    if pid == 0:
        try:
            os.setsid()
            null_fd = os.open('/dev/null', os.O_RDONLY)
            os.dup2(null_fd, 0)
            os.dup2(out_w, 1)
            os.dup2(err_w, 2)
            for fd in (out_r, out_w, err_r, err_w, null_fd):
                if fd > 2:
                    os.close(fd)
            os.execv(command[0], command)
        except BaseException:
            os._exit(127)
    os.close(out_w)
    os.close(err_w)
    os.set_blocking(out_r, False)
    os.set_blocking(err_r, False)
    return pid, out_r, err_r


def signal_owned(pid, sig, child_reaped):
    # Before setsid completes, the direct child is still addressable by PID.
    try:
        os.killpg(pid, sig)
    except ProcessLookupError:
        pass
    if not child_reaped:
        try:
            os.kill(pid, sig)
        except ProcessLookupError:
            pass


def clear_group(pid, child_exit, end):
    for sig, grace in ((signal.SIGTERM, 3.0), (signal.SIGKILL, 4.0)):
        signal_owned(pid, sig, child_exit is not None)
        limit = min(end, time.monotonic() + grace)
        while time.monotonic() < limit:
            if child_exit is None:
                child_exit = reap(pid)
            if child_exit is not None and not group_alive(pid):
                return child_exit, True
            time.sleep(0.025)
    if child_exit is None:
        child_exit = reap(pid)
    return child_exit, child_exit is not None and not group_alive(pid)


def validate_settlement208_payload(frame):
    encoded = frame['settlement208Base64']
    if not isinstance(encoded, str) or len(encoded) > 4 * ((64 * 1024 + 2) // 3):
        raise ValueError('a208-encoded-cap')
    raw = base64.b64decode(encoded, validate=True)
    if (not raw or len(raw) > 64 * 1024 or frame['settlement208Bytes'] != len(raw) or
            frame['settlement208Rows'] != 16 or
            hashlib.sha256(raw).hexdigest() != frame['settlement208Sha256'] or
            base64.b64encode(raw).decode('ascii') != frame['settlement208Base64']):
        raise ValueError('a208-bytes-role')
    value = json.loads(raw.decode('utf8'))
    if (value.get('schema') != '1370-a208-selected16-snapshot-r1' or
            value.get('phase') != 'after-natural-tick208-return' or value.get('week') != 208 or
            value.get('seed') != 'p13a-core-causal-01' or
            not isinstance(value.get('rows'), list) or len(value['rows']) != 16 or
            value.get('pricingHelpersCalled') != 0 or value.get('extraRngCalls') != 0 or
            value.get('premiumAttribution') is not False or value.get('floorAttribution') is not False):
        raise ValueError('a208-phase-role')
    return value


def validate_outer_frame(raw):
    if not raw.endswith(b'\n') or raw.count(b'\n') != 1 or len(raw) > MAX_STDOUT:
        raise RuntimeError('STOP_OUTER_FRAME_SHAPE')
    try:
        frame = json.loads(raw.decode('utf8'))
        validate_settlement208_payload(frame)
        preimage = base64.b64decode(frame['preimageBase64'], validate=True)
        if (frame['status'] != 'MATCHED_AGING_ERA_PREIMAGE_CANDIDATE' or
                frame['protocol'] != PROTOCOL or frame['sourceSha'] != SOURCE or
                frame['weeks'] != 416 or frame['employmentRows'] != 44 or
                frame['employmentBytes'] != len(preimage) or
                frame['digests']['employment'] != EMPLOYMENT or
                hashlib.sha256(preimage).hexdigest() != EMPLOYMENT):
            raise ValueError('identity')
    except (KeyError, ValueError, TypeError, UnicodeError) as exc:
        raise RuntimeError('STOP_OUTER_FRAME_VALIDATION') from exc
    return frame


def run_recorded(command, started, outer_seconds=OUTER_SECONDS, active_seconds=ACTIVE_SECONDS):
    """Tests may use shorter bounds. Production main always supplies fixed constants."""
    end = started + outer_seconds
    active_end = started + active_seconds
    if time.monotonic() >= active_end:
        raise RuntimeError('STOP_BEFORE_LAUNCH_DEADLINE')
    pid, out_fd, err_fd = start_group(command)
    selector = selectors.DefaultSelector()
    streams = {'stdout': bytearray(), 'stderr': bytearray()}
    for name, fd in (('stdout', out_fd), ('stderr', err_fd)):
        selector.register(fd, selectors.EVENT_READ, name)
    child_exit = None
    failure = None
    pending_stop = None
    try:
        while selector.get_map() or child_exit is None:
            now = time.monotonic()
            if now >= active_end:
                failure = 'STOP_ACTIVE_TIMEOUT'
                break
            if child_exit is None:
                child_exit = reap(pid)
            for key, _ in selector.select(timeout=min(0.05, active_end - now)):
                block = os.read(key.fd, 8192)
                if not block:
                    selector.unregister(key.fd)
                    os.close(key.fd)
                    continue
                target = streams[key.data]
                cap = MAX_STDOUT if key.data == 'stdout' else MAX_STDERR
                if len(target) + len(block) > cap:
                    failure = f'STOP_{key.data.upper()}_CAP'
                    break
                target.extend(block)
            if failure:
                break
        if failure is None and child_exit != 0:
            failure = f'STOP_SUPERVISOR_EXIT_{child_exit}'
        if failure is None and streams['stderr']:
            failure = 'STOP_SUPERVISOR_STDERR'
        if failure is None and group_alive(pid):
            failure = 'STOP_GROUP_SURVIVOR'
        if failure is None:
            validate_outer_frame(bytes(streams['stdout']))
    except Exception as exc:
        pending_stop = FailureStop(str(exc), failure_record(streams, pid, child_exit, None))
        raise pending_stop from exc
    finally:
        for key in list(selector.get_map().values()):
            selector.unregister(key.fd)
            os.close(key.fd)
        selector.close()
        if failure is not None or child_exit is None or group_alive(pid):
            try:
                child_exit, cleared = clear_group(pid, child_exit, end)
            except Exception as exc:
                raise FailureStop(str(exc), failure_record(streams, pid, child_exit, None)) from exc
        else:
            cleared = True
        if pending_stop is not None:
            pending_stop.diagnostic.update(supervisorExit=child_exit, ownedGroupCleared=cleared)
    if not cleared:
        raise FailureStop('STOP_SURVIVOR', failure_record(streams, pid, child_exit, cleared))
    if time.monotonic() >= end:
        raise FailureStop('STOP_OUTER_DEADLINE', failure_record(streams, pid, child_exit, cleared))
    if failure:
        raise FailureStop(failure, failure_record(streams, pid, child_exit, cleared))
    return bytes(streams['stdout']), end


def forward_frame(raw, end, fd):
    os.set_blocking(fd, False)
    while raw:
        remaining = end - time.monotonic()
        if remaining <= 0:
            raise RuntimeError('STOP_OUTER_FORWARD_DEADLINE')
        _, ready, _ = select.select([], [fd], [], remaining)
        if not ready:
            raise RuntimeError('STOP_OUTER_FORWARD_DEADLINE')
        try:
            count = os.write(fd, raw)
        except BlockingIOError:
            continue
        if count <= 0:
            raise RuntimeError('STOP_OUTER_FORWARD_WRITE')
        raw = raw[count:]


def main():
    started = time.monotonic()  # Includes argv, source/binding preflight, launch, cleanup and forward.
    if len(sys.argv) != 2:
        raise RuntimeError('STOP_ARGV')
    mode = os.fstat(sys.stdout.fileno()).st_mode
    if not (stat.S_ISFIFO(mode) or stat.S_ISSOCK(mode)):
        raise RuntimeError('STOP_STDOUT_NOT_PIPE')
    source = Path(__file__).resolve().parent
    command = [sys.executable, '-B', str(source / 'supervise.py'), sys.argv[1]]
    raw, end = run_recorded(command, started)
    forward_frame(raw, end, sys.stdout.fileno())


if __name__ == '__main__':
    try:
        main()
    except Exception as exc:
        sys.stderr.write(failure_line(exc).decode('ascii'))
        raise SystemExit(2)
