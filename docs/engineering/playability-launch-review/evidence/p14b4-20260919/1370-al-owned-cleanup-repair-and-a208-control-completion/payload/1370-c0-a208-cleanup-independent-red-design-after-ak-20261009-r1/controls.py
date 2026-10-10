"""SOURCE ONLY until separately granted. No process creation or real signals.

CLI: controls.py CANDIDATE_MODULE CANDIDATE_SHA ORIGINAL_DRIVE ORIGINAL_SHA
Only original hard_kill is AST-extracted; original top-level is never imported.
Injected callbacks use synthetic numbers, never OS syscalls. One bounded JSON
summary is emitted. Expected original RED must match exactly, then every GREEN
must pass. The original 3+14 route assertions remain separate and unchanged.
"""
import ast
import errno
import hashlib
import json
from pathlib import Path
import sys
import types

ORIGINAL_SHA = '7c29cf7c679971ad59fb2190b2fc6e78f10ab64e1857723dd8a09cc9ba05303c'
SOURCE_CAP = 131072
SUMMARY_CAP = 16384
SIGKILL = 9


def require(value, message):
    if not value:
        raise AssertionError(message)


def bounded(text, cap=192):
    return str(text).encode('utf-8', 'replace')[:cap].decode('utf-8', 'ignore')


def source(path, expected):
    require(len(expected) == 64 and all(x in '0123456789abcdef' for x in expected), 'sha format')
    with Path(path).open('rb') as stream:
        raw = stream.read(SOURCE_CAP + 1)
    require(len(raw) <= SOURCE_CAP, 'source cap')
    require(hashlib.sha256(raw).hexdigest() == expected, 'source sha mismatch')
    return raw


class Probe:
    def __init__(self, pid):
        self.pid = pid
    def poll(self):
        return None


def owned():
    # Exactly seven synthetic groups and four inherited probes. No host IDs.
    slots = [dict(pid=810001 + n, ready=True, reaped=False, groupClear=False, exit=None) for n in range(7)]
    return slots, [Probe(820001 + n) for n in range(4)]


def expected_trace(slots, probes):
    trace = []
    for slot in slots:
        if slot.get('groupClear'):
            continue
        if slot['ready']:
            trace.append(('killpg', slot['pid'], SIGKILL))
        if not slot['reaped']:
            trace.append(('kill', slot['pid'], SIGKILL))
    trace.extend(('kill', child.pid, SIGKILL) for child in probes)
    return trace


class World:
    def __init__(self):
        self.now = 1.0
        self.trace = []
        self.effects = {}
        self.clock_fault = None
        self.snapshot_fault = None
    def clock(self):
        if self.clock_fault:
            raise self.clock_fault
        return self.now
    def snapshot(self):
        if self.snapshot_fault:
            raise self.snapshot_fault
        return dict(phase='cleanup', pid=830001, pgrp=830001, session=830001, euid=501,
                    alarmHandler='synthetic-handler', timerRemaining=0.25,
                    timerInterval=0.25, alarmBlocked=False)
    def signal(self, operation, target, sig):
        key = (operation, target, sig)
        self.trace.append(key)
        effect = self.effects.get(key)
        if callable(effect):
            return effect()
        if effect:
            raise effect
    def killpg(self, target, sig):
        return self.signal('killpg', target, sig)
    def kill(self, target, sig):
        return self.signal('kill', target, sig)
    def getpgid(self, target):
        return target
    def poll(self, child):
        return child.poll()


def execute_cleanup(diag, world, slots, probes, **overrides):
    inject = dict(killpg=world.killpg, kill=world.kill, getpgid=world.getpgid, poll=world.poll)
    inject.update(overrides)
    return diag.cleanup_targets(slots, probes, **inject)


def stopped(diag):
    summary = diag.summary()
    require(bool(summary['refusalCodes']) or summary['deadlineObserved'], 'refusal missing')
    require('PASS' not in summary['status'], 'stale pass')
    return summary


def exact_error(diag, operation, target, error_type, error_errno):
    events = [row for row in diag.summary()['events'] if row['operation'] == operation
              and row['pid'] == target and row.get('error') is not None]
    require(bool(events), 'exact target error absent')
    row = events[-1]
    require(row['error']['type'] == error_type, 'exception class changed')
    require(row['error']['errno'] == error_errno, 'errno changed')
    require(row['signal'] == SIGKILL, 'signal changed')
    require(row['pgid'] == target if operation == 'killpg' else True, 'group target changed')
    for field in ('slot', 'ready', 'reaped', 'groupClear', 'lastExit', 'elapsedSeconds', 'phase', 'driver'):
        require(field in row, 'missing evidence field ' + field)
    return row


def original_red(raw, fail_kind):
    tree = ast.parse(raw, filename='authenticated-original-drive.py')
    funcs = [node for node in tree.body if isinstance(node, ast.FunctionDef) and node.name == 'hard_kill']
    require(len(funcs) == 1, 'original hard_kill shape changed')
    module = ast.Module(body=funcs, type_ignores=[])
    world = World()
    slots, probes = owned()
    target = slots[0]['pid'] if fail_kind != 'probe' else probes[0].pid
    operation = 'killpg' if fail_kind == 'group' else 'kill'
    fault = PermissionError(errno.EPERM, 'synthetic EPERM; no host causal claim')
    world.effects[(operation, target, SIGKILL)] = fault
    fake_os = types.SimpleNamespace(killpg=world.killpg, kill=world.kill)
    namespace = dict(os=fake_os, signal=types.SimpleNamespace(SIGKILL=SIGKILL),
                     refresh=lambda: None, SLOTS=slots, POPENS=probes)
    exec(compile(module, 'authenticated-original-hard-kill-only', 'exec'), namespace)
    escaped = None
    try:
        namespace['hard_kill']()
    except BaseException as exc:
        escaped = exc
    require(escaped is fault, 'expected original EPERM escape did not occur')
    full = expected_trace(slots, probes)
    stop_at = full.index((operation, target, SIGKILL)) + 1
    require(world.trace == full[:stop_at], 'unexpected original RED shape')
    require(stop_at < len(full), 'RED did not omit a later-owned target')
    return dict(expectedEscapedType='PermissionError', errno=errno.EPERM,
                operation=operation, target=target, attempted=len(world.trace),
                laterOwnedOmitted=len(full) - len(world.trace))


def green_cases(module):
    def fresh(**kwargs):
        world = World()
        diag = module.CleanupDiagnostics(world.clock, world.snapshot, whole=55, start=0, **kwargs)
        slots, probes = owned()
        return world, diag, slots, probes

    def clean_owned_only():
        world, diag, slots, probes = fresh()
        execute_cleanup(diag, world, slots, probes)
        require(world.trace == expected_trace(slots, probes), 'target or signal set changed')
        require(not diag.summary()['refusalCodes'], 'clean injected cleanup refused')

    def refusal(kind):
        world, diag, slots, probes = fresh()
        target = slots[0]['pid'] if kind != 'probe' else probes[0].pid
        operation = 'killpg' if kind == 'group' else 'kill'
        world.effects[(operation, target, SIGKILL)] = PermissionError(errno.EPERM, 'synthetic refusal')
        execute_cleanup(diag, world, slots, probes)
        require(world.trace == expected_trace(slots, probes), 'later-owned cleanup skipped')
        event_operation = 'probe-kill' if kind == 'probe' else operation
        row = exact_error(diag, event_operation, target, 'PermissionError', errno.EPERM)
        require(row['phase'] == 'cleanup', 'phase missing')
        require(row['driver'] == world.snapshot(), 'driver/timer snapshot fields changed')
        before = stopped(diag)['refusalCodes'][:]
        world.effects.clear()
        execute_cleanup(diag, world, slots, probes)
        require(all(code in stopped(diag)['refusalCodes'] for code in before), 'refusal reset by later success')

    def absent_is_distinct():
        world, diag, slots, probes = fresh()
        world.effects[('killpg', slots[0]['pid'], SIGKILL)] = ProcessLookupError(errno.ESRCH, 'synthetic absent')
        execute_cleanup(diag, world, slots, probes)
        require(world.trace == expected_trace(slots, probes), 'absence aborts cleanup')
        require(not diag.summary()['refusalCodes'], 'ESRCH treated as refusal')
        require(any(e['outcome'] == 'absent' and e['pid'] == slots[0]['pid'] for e in diag.summary()['events']), 'absence evidence missing')

    def skip_already_cleared_and_reaped():
        world, diag, slots, probes = fresh()
        slots[0]['groupClear'] = True
        slots[1]['reaped'] = True
        execute_cleanup(diag, world, slots, probes)
        require(world.trace == expected_trace(slots, probes), 'skipped target was signaled')

    def uncertain_readiness():
        world, diag, slots, probes = fresh()
        slots[0]['ready'] = False
        def getpgid(target):
            if target == slots[0]['pid']:
                raise PermissionError(errno.EPERM, 'synthetic readiness refusal')
            return target
        execute_cleanup(diag, world, slots, probes, getpgid=getpgid)
        stopped(diag)
        require(('killpg', slots[0]['pid'], SIGKILL) not in world.trace, 'invented readiness')
        require(('kill', slots[-1]['pid'], SIGKILL) in world.trace, 'readiness fault aborts later owned')
        require(all(op in ('kill', 'killpg') and sig == SIGKILL and pid in {s['pid'] for s in slots} | {p.pid for p in probes}
                    for op, pid, sig in world.trace), 'discovered or substituted target')

    def poll_fault():
        world, diag, slots, probes = fresh()
        def poll(child):
            if child is probes[0]:
                raise OSError(errno.EIO, 'synthetic poll failure')
            return None
        execute_cleanup(diag, world, slots, probes, poll=poll)
        stopped(diag)
        require(('kill', probes[-1].pid, SIGKILL) in world.trace, 'poll fault aborts later probes')

    def before_deadline():
        world, diag, slots, probes = fresh()
        world.now = 55
        try:
            execute_cleanup(diag, world, slots, probes)
        except module.CleanupDeadline:
            pass
        else:
            raise AssertionError('hard deadline did not take precedence')
        require(not world.trace, 'signal attempted after deadline')
        require(stopped(diag)['deadlineObserved'], 'deadline evidence absent')

    def after_call_deadline_with_error():
        world, diag, slots, probes = fresh()
        def cross_and_refuse():
            world.now = 55
            raise PermissionError(errno.EPERM, 'synthetic simultaneous refusal and deadline')
        world.effects[('killpg', slots[0]['pid'], SIGKILL)] = cross_and_refuse
        try:
            execute_cleanup(diag, world, slots, probes)
        except module.CleanupDeadline:
            pass
        else:
            raise AssertionError('post-call deadline escaped precedence')
        require(world.trace == [('killpg', slots[0]['pid'], SIGKILL)], 'signals continued after deadline')
        exact_error(diag, 'killpg', slots[0]['pid'], 'PermissionError', errno.EPERM)
        require(stopped(diag)['deadlineObserved'], 'deadline hidden by syscall refusal')

    def reentrant_cleanup():
        world, diag, slots, probes = fresh()
        key = ('killpg', slots[0]['pid'], SIGKILL)
        def reenter():
            world.effects.pop(key)
            execute_cleanup(diag, world, slots, probes)
        world.effects[key] = reenter
        execute_cleanup(diag, world, slots, probes)
        require(world.trace == expected_trace(slots, probes), 'reentrant duplicate or omitted signals')
        stopped(diag)

    def event_cap_refusal_survives():
        world, diag, slots, probes = fresh(event_limit=1)
        world.effects[('killpg', slots[0]['pid'], SIGKILL)] = PermissionError(errno.EPERM, 'refusal behind full event buffer')
        execute_cleanup(diag, world, slots, probes)
        summary = stopped(diag)
        require(summary['droppedEvents'] > 0, 'event cap not exercised')
        require(len(summary['events']) <= 1, 'event count cap exceeded')
        require(world.trace == expected_trace(slots, probes), 'cap aborts remaining cleanup')
        require(any('signal' in code or 'cleanup' in code or 'error' in code for code in summary['refusalCodes']), 'specific syscall refusal concealed by cap')

    def aggregate_cap_refuses():
        world, diag, slots, probes = fresh(total_bytes=1024)
        execute_cleanup(diag, world, slots, probes)
        summary = stopped(diag)
        require(summary['eventBytes'] <= 1024, 'aggregate cap exceeded')
        require(summary['droppedEvents'] > 0, 'aggregate overflow not exercised')
        require(world.trace == expected_trace(slots, probes), 'aggregate cap skips cleanup')

    def bounded_text():
        world, diag, slots, probes = fresh()
        world.effects[('killpg', slots[0]['pid'], SIGKILL)] = PermissionError(errno.EPERM, '\u00e9' * 8192)
        execute_cleanup(diag, world, slots, probes)
        row = exact_error(diag, 'killpg', slots[0]['pid'], 'PermissionError', errno.EPERM)
        require(len(row['error']['message'].encode('utf-8')) <= 192, 'UTF8 text cap exceeded')
        summary = stopped(diag)
        require(len(summary['events']) <= 128 and summary['eventBytes'] <= 65536, 'default aggregate cap exceeded')
        for row in summary['events']:
            require(len(json.dumps(row, sort_keys=True, separators=(',', ':'), ensure_ascii=False).encode('utf-8')) <= 2048, 'individual event cap exceeded')

    def writer_fault(error_errno):
        writes = []
        def emit(payload):
            writes.append(payload)
            raise OSError(error_errno, 'synthetic writer fault')
        world, diag, slots, probes = fresh(emit=emit)
        world.effects[('killpg', slots[0]['pid'], SIGKILL)] = PermissionError(errno.EPERM, 'syscall still refused')
        execute_cleanup(diag, world, slots, probes)
        summary = stopped(diag)
        require(len(writes) == 1 and summary['emitFailures'] >= 1, 'failed writer retried')
        require(world.trace == expected_trace(slots, probes), 'writer error aborts owned cleanup')
        exact_error(diag, 'killpg', slots[0]['pid'], 'PermissionError', errno.EPERM)

    def writer_crosses_deadline():
        world = World()
        def emit(payload):
            world.now = 55
        diag = module.CleanupDiagnostics(world.clock, world.snapshot, emit=emit, whole=55, start=0)
        slots, probes = owned()
        try:
            execute_cleanup(diag, world, slots, probes)
        except module.CleanupDeadline:
            pass
        else:
            raise AssertionError('writer clock advance yielded success')
        require(not world.trace, 'pre-attempt writer deadline still allowed syscall')
        stopped(diag)

    def snapshot_fault():
        world, diag, slots, probes = fresh()
        world.snapshot_fault = OSError(errno.EIO, 'synthetic snapshot fault')
        execute_cleanup(diag, world, slots, probes)
        stopped(diag)
        require(world.trace == expected_trace(slots, probes), 'snapshot fault aborts later cleanup')

    return [
        ('owned-seven-four-only', clean_owned_only),
        ('group-EPERM-sticky-continue', lambda: refusal('group')),
        ('pid-EPERM-sticky-continue', lambda: refusal('pid')),
        ('probe-EPERM-sticky-continue', lambda: refusal('probe')),
        ('ESRCH-distinct', absent_is_distinct),
        ('already-clear-reaped-skip', skip_already_cleared_and_reaped),
        ('unknown-readiness-stop', uncertain_readiness),
        ('poll-fault-continue', poll_fault),
        ('hard-deadline-before-syscall', before_deadline),
        ('deadline-plus-EPERM-retained', after_call_deadline_with_error),
        ('reentrant-cleanup-no-duplicate', reentrant_cleanup),
        ('event-cap-does-not-conceal-refusal', event_cap_refusal_survives),
        ('aggregate-cap-refusal', aggregate_cap_refuses),
        ('UTF8-event-field-caps', bounded_text),
        ('writer-EAGAIN-stop-continue', lambda: writer_fault(errno.EAGAIN)),
        ('writer-ENOSPC-stop-continue', lambda: writer_fault(errno.ENOSPC)),
        ('writer-clock-deadline-precedence', writer_crosses_deadline),
        ('snapshot-fault-stop-continue', snapshot_fault),
    ]


def main(argv):
    rows = []
    red = green = 0
    expected_green = 18
    failure = None
    try:
        require(len(argv) == 4, 'exact four args required')
        candidate_path, candidate_sha, original_path, original_sha = argv
        require(original_sha == ORIGINAL_SHA, 'unrecognized original authority')
        original = source(original_path, original_sha)
        candidate = source(candidate_path, candidate_sha)
        for kind in ('group', 'pid', 'probe'):
            detail = original_red(original, kind)
            rows.append(dict(case='original-RED-' + kind, status='EXPECTED_RED', detail=detail))
            red += 1
        module = types.ModuleType('independent_owned_cleanup_candidate')
        module.__file__ = candidate_path
        # Candidate executes only after exact source hash verification and review.
        # Register for dataclass introspection, then restore previous registry state.
        previous = sys.modules.get(module.__name__)
        sys.modules[module.__name__] = module
        try:
            exec(compile(candidate, candidate_path, 'exec'), module.__dict__)
            cases = green_cases(module)
            require(len(cases) == expected_green, 'GREEN roster changed')
            for name, case in cases:
                try:
                    case()
                except BaseException as exc:
                    rows.append(dict(case=name, status='FAIL', errorType=type(exc).__name__, error=bounded(exc)))
                else:
                    rows.append(dict(case=name, status='GREEN'))
                    green += 1
        finally:
            if previous is None:
                sys.modules.pop(module.__name__, None)
            else:
                sys.modules[module.__name__] = previous
    except BaseException as exc:
        failure = dict(errorType=type(exc).__name__, error=bounded(exc))
    ok = failure is None and red == 3 and green == expected_green and len(rows) == 3 + expected_green
    summary = dict(schema='a208-independent-owned-cleanup-controls/v1',
                   status='SYNTHETIC_CONTROLS_PASS' if ok else 'SYNTHETIC_CONTROLS_STOP',
                   expectedRed=3, observedExpectedRed=red, expectedGreen=expected_green,
                   observedGreen=green, cases=rows, failure=failure,
                   game=False, realSignals=False, originalImported=False)
    encoded = json.dumps(summary, sort_keys=True, separators=(',', ':'))
    if len(encoded.encode('utf-8')) > SUMMARY_CAP:
        encoded = json.dumps(dict(schema=summary['schema'], status='SYNTHETIC_CONTROLS_STOP', failure='summary cap'))
        ok = False
    print(encoded, flush=True)
    return 0 if ok else 2


if __name__ == '__main__':
    raise SystemExit(main(sys.argv[1:]))
