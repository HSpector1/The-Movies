"""Pure injected cleanup diagnostics: no OS access, process creation or timer setup."""
import json
import math

EVENT_LIMIT = 128
EVENT_BYTES = 2048
TOTAL_BYTES = 65536
TEXT_BYTES = 192


class CleanupDeadline(BaseException):
    pass


def text(value):
    return str(value).encode('utf8', 'replace')[:TEXT_BYTES].decode('utf8', 'ignore')


class CleanupDiagnostics:
    def __init__(self, clock, snapshot, emit=None, whole=55, start=0,
                 event_limit=EVENT_LIMIT, event_bytes=EVENT_BYTES, total_bytes=TOTAL_BYTES):
        if not (0 < event_limit <= EVENT_LIMIT and 0 < event_bytes <= EVENT_BYTES
                and 0 < total_bytes <= TOTAL_BYTES):
            raise ValueError('diagnostic caps may only be reduced')
        self.clock, self.snapshot, self.emit = clock, snapshot, emit
        self.whole, self.start = whole, start
        self.event_limit, self.event_bytes, self.total_bytes = event_limit, event_bytes, total_bytes
        self.events, self.refusal_codes = [], []
        self.event_count = self.byte_count = self.dropped = self.emit_failures = 0
        self.deadline_observed = False
        self.busy = False
        self.attempt_busy = self.targets_busy = False

    def refuse(self, code):
        # Fixed codes only; independent of event storage and emission success.
        allowed = {'cleanup-error', 'ownership-uncertain', 'diagnostic-capture',
                   'diagnostic-cap', 'diagnostic-emission', 'diagnostic-reentry', 'deadline'}
        code = code if code in allowed else 'diagnostic-capture'
        if code not in self.refusal_codes:
            self.refusal_codes.append(code)

    def elapsed(self):
        try:
            elapsed = self.clock() - self.start
        except Exception:
            self.refuse('diagnostic-capture')
            raise CleanupDeadline('unavailable monotonic clock')
        if not math.isfinite(elapsed) or elapsed < 0:
            self.refuse('diagnostic-capture')
            raise CleanupDeadline('invalid monotonic clock')
        return elapsed

    def check_deadline(self):
        if self.elapsed() >= self.whole:
            self.deadline_observed = True
            self.refuse('deadline')
            raise CleanupDeadline('55-second driver hard deadline')

    def event(self, operation, target, slot, *, stage, outcome, error=None, context=None):
        # No locks or signal masking: the real alarm retains deadline precedence.
        if self.busy:
            self.refuse('diagnostic-reentry')
            self.dropped += 1
            return
        self.busy = True
        try:
            self.event_count += 1
            if self.event_count > self.event_limit:
                self.refuse('diagnostic-cap')
                self.dropped += 1
                return
            state = slot or {}
            driver = self.snapshot()
            permitted = ('pid', 'pgrp', 'session', 'euid', 'alarmHandler', 'timerRemaining',
                         'timerInterval', 'alarmBlocked', 'phase')
            driver = {key: value for key, value in driver.items() if key in permitted}
            for key, value in tuple(driver.items()):
                if not (value is None or type(value) in (str, int, float, bool)):
                    raise ValueError('non-scalar snapshot')
                if isinstance(value, str):
                    driver[key] = text(value)
            event = {'seq': self.event_count, 'stage': stage, 'operation': text(operation),
                     'pid': state.get('pid', target),
                     'pgid': state.get('pid') if operation in ('killpg', 'group-check') else None,
                     'target': target, 'signal': 9 if operation in ('killpg', 'kill', 'probe-kill')
                     else 0 if operation == 'group-check' else None,
                     'slot': state.get('ordinal'), 'ready': state.get('ready'),
                     'reaped': state.get('reaped'), 'groupClear': state.get('groupClear'),
                     'lastExit': state.get('exit'), 'lastWaitStatus': state.get('waitStatus'),
                     'elapsedSeconds': self.elapsed(),
                     'phase': driver.get('phase', 'cleanup'), 'driver': driver,
                     'outcome': outcome, 'error': None}
            if context is not None:
                event['context'] = text(context)
            if error is not None:
                event['error'] = {'type': text(type(error).__name__),
                                  'errno': getattr(error, 'errno', None), 'message': text(error)}
            raw = (json.dumps(event, sort_keys=True, allow_nan=False, separators=(',', ':')) + '\n').encode()
            if len(raw) > self.event_bytes or self.byte_count + len(raw) > self.total_bytes:
                self.refuse('diagnostic-cap')
                self.dropped += 1
                return
            self.events.append(event)
            self.byte_count += len(raw)
            if self.emit is not None:
                try:
                    self.emit(raw)
                except Exception:
                    self.emit_failures += 1
                    self.refuse('diagnostic-emission')
                    self.emit = None
        except Exception:
            self.refuse('diagnostic-capture')
            self.dropped += 1
        finally:
            self.busy = False

    def attempt(self, operation, target, slot, call, context=None):
        if self.attempt_busy:
            self.refuse('diagnostic-reentry')
            return False, None
        self.attempt_busy = True
        try:
            return self._attempt(operation, target, slot, call, context)
        finally:
            self.attempt_busy = False

    def _attempt(self, operation, target, slot, call, context=None):
        self.check_deadline()
        self.event(operation, target, slot, stage='attempt', outcome='attempt', context=context)
        self.check_deadline()
        try:
            value = call()
        except ProcessLookupError as exc:
            # ESRCH establishes only that this exact syscall found no target.
            if operation not in ('getpgid', 'killpg', 'kill', 'probe-kill', 'group-check'):
                self.refuse('cleanup-error')
                self.event(operation, target, slot, stage='result', outcome='error', error=exc)
                self.check_deadline()
                return False, None
            self.event(operation, target, slot, stage='result', outcome='absent', error=exc)
            self.check_deadline()
            return True, None
        except Exception as exc:
            self.refuse('cleanup-error')
            self.event(operation, target, slot, stage='result', outcome='error', error=exc)
            self.check_deadline()
            return False, None
        self.event(operation, target, slot, stage='result', outcome='ok', context=value)
        self.check_deadline()
        return True, value

    def cleanup_targets(self, slots, probes, *, killpg, kill, getpgid, poll):
        if self.targets_busy:
            self.refuse('diagnostic-reentry')
            return
        self.targets_busy = True
        try:
            self._cleanup_targets(slots, probes, killpg=killpg, kill=kill,
                                  getpgid=getpgid, poll=poll)
        finally:
            self.targets_busy = False

    def _cleanup_targets(self, slots, probes, *, killpg, kill, getpgid, poll):
        # Retained lists are the entire authority. Never enumerate or discover targets.
        if len(slots) > 7 or len(probes) > 4:
            self.refuse('ownership-uncertain')
            return
        for ordinal, slot in enumerate(slots):
            slot['ordinal'] = ordinal
            pid = slot.get('pid')
            if type(pid) is not int or pid <= 1:
                self.refuse('ownership-uncertain')
                continue
            if slot.get('groupClear'):
                self.event('already-clear', pid, slot, stage='result', outcome='ok')
                continue
            good, current = self.attempt('getpgid', pid, slot, lambda: getpgid(pid))
            if good and current is not None:
                if current == pid:
                    slot['ready'] = True
                else:
                    slot['ready'] = False
                    self.refuse('ownership-uncertain')
            if slot.get('ready'):
                self.attempt('killpg', pid, slot, lambda: killpg(pid, 9))
            elif not slot.get('reaped'):
                self.refuse('ownership-uncertain')
            if not slot.get('reaped'):
                self.attempt('kill', pid, slot, lambda: kill(pid, 9))
        for ordinal, child in enumerate(probes):
            pid = child.pid
            slot = {'pid': pid, 'ordinal': ordinal}
            if type(pid) is not int or pid <= 1:
                self.refuse('ownership-uncertain')
                continue
            good, status = self.attempt('probe-poll', pid, slot, lambda: poll(child))
            if good and status is None:
                self.attempt('probe-kill', pid, slot, lambda: kill(pid, 9))

    def summary(self):
        return {'schema': '1370-owned-cleanup-diagnostics/v1',
                'status': 'STOP' if self.refusal_codes else 'COMPLETE',
                'refusalCodes': list(self.refusal_codes), 'events': list(self.events),
                'eventCount': self.event_count, 'eventBytes': self.byte_count,
                'droppedEvents': self.dropped, 'emitFailures': self.emit_failures,
                'deadlineObserved': self.deadline_observed}
