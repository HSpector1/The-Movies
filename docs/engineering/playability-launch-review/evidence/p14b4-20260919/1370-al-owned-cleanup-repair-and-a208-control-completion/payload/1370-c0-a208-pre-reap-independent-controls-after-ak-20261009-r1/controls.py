"""Finite injected controls; authenticated driver AST only, never driver top level."""
import ast
import copy
import errno
import hashlib
import json
from pathlib import Path
import sys
from types import SimpleNamespace

BASE_SHA = '73519d8146d44b7076dcd73188baaf57743e27076198f4d3cb6d31bcb04fae07'
MODULE_SHA = '8117463b6ecd6aa57dd5b34a6ad1ee50f8d9a82197b13659bed0f489a6ad2a15'
SCHEMA = 'a208-independent-pre-reap-controls/v1'
NAMES = (
    'old-order-exited-unreaped-EPERM',
    'pre-reap-completed-ESRCH-skip',
    'pre-reap-live-child-existing-kills',
    'pre-reap-leader-descendants-live',
    'pre-reap-already-reaped-no-wait',
    'pre-reap-wait-error-sticky-continue',
    'pre-reap-group-EPERM-sticky-continue',
    'pre-reap-mismatched-wait-refused',
    'pre-reap-malformed-wait-refused',
    'pre-reap-status-conversion-refused',
    'pre-reap-deadline-precedence',
    'pre-reap-owned-boundaries',
    'pre-reap-diagnostic-cap-sticky',
)


def check(condition, label):
    if not condition:
        raise AssertionError(label)


def authenticated(path, expected):
    check(len(expected) == 64 and all(c in '0123456789abcdef' for c in expected), 'SHA syntax')
    p = Path(path)
    check(p.is_absolute() and p.resolve(strict=True) == p, 'physical source path')
    stat = p.lstat()
    check(p.is_file() and stat.st_nlink == 1 and 0 < stat.st_size <= 131072, 'source bounded regular')
    raw = p.read_bytes()
    check(len(raw) == stat.st_size and hashlib.sha256(raw).hexdigest() == expected, 'source authentication')
    check(p.lstat() == stat, 'source unchanged during read')
    return raw


def dump(node):
    return ast.dump(node, include_attributes=False)


def function(tree, name):
    found = [n for n in tree.body if isinstance(n, ast.FunctionDef) and n.name == name]
    check(len(found) == 1, 'unique function ' + name)
    return found[0]


def entry(tree):
    main = function(tree, 'main')
    finals = [n.finalbody for n in main.body if isinstance(n, ast.Try) and n.finalbody]
    check(len(finals) == 1, 'actual main cleanup finally')
    final = finals[0]
    stop = next((i for i, n in enumerate(final) if isinstance(n, ast.Try)), None)
    check(stop is not None, 'actual later reap try')
    prefix = final[:stop]
    globals_ = [copy.deepcopy(n) for n in main.body if isinstance(n, ast.Global)]
    return globals_, prefix


def extracted(tree, filename):
    names = {'deadline_guard', 'cleanup_group_probe', 'hard_kill', 'reap_completed'}
    nodes = [copy.deepcopy(n) for n in tree.body if
             (isinstance(n, ast.FunctionDef) and n.name in names) or
             (isinstance(n, ast.ClassDef) and n.name == 'ControlStop')]
    globals_, prefix = entry(tree)
    template = ast.parse('def extracted_cleanup_entry():\n pass\n').body[0]
    template.body = globals_ + copy.deepcopy(prefix)
    nodes.append(template)
    return compile(ast.fix_missing_locations(ast.Module(body=nodes, type_ignores=[])), filename, 'exec')


def source_contract(candidate, baseline):
    oldglobals, old = entry(baseline)
    newglobals, new = entry(candidate)
    check(dump(ast.Module(body=oldglobals, type_ignores=[])) ==
          dump(ast.Module(body=newglobals, type_ignores=[])), 'main globals preserved')
    check(len(old) == 2 and len(new) == 3, 'actual entry arity')
    check(dump(old[0]) == dump(new[0]) and dump(old[1]) == dump(new[2]), 'actual entry preserved')
    expected = ast.parse('reap_completed()').body[0]
    check(dump(new[1]) == dump(expected), 'helper called before actual hard_kill')
    inverse = copy.deepcopy(candidate)
    inverse.body = [n for n in inverse.body if not
                    (isinstance(n, ast.FunctionDef) and n.name == 'reap_completed')]
    actualmain = function(inverse, 'main')
    final = next(n.finalbody for n in actualmain.body if isinstance(n, ast.Try) and n.finalbody)
    del final[1]
    check(dump(inverse) == dump(baseline), 'entire r2 AST preserved except helper and actual call')


class HardExit(BaseException):
    def __init__(self, code):
        self.code = code


class Probe:
    def __init__(self, world, pid):
        self.world, self.pid = world, pid

    def poll(self):
        self.world.trace.append(('poll', self.pid, None))
        return 0


class World:
    def __init__(self, code, module, kinds=('completed',), *, reaped=(), descendants=(),
                 invalid=(), probes=4, event_limit=128):
        self.now = 1.0
        self.trace, self.prefixes = [], []
        self.wait_faults, self.group_faults = {}, {}
        self.decode_faults = set()
        self.wait_deadline = None
        self.slots = [{'pid': value, 'ready': True, 'reaped': False, 'groupClear': None}
                      for value in invalid]
        self.models = {}
        for i, kind in enumerate(kinds):
            pid = 900001 + i
            is_reaped = i in reaped
            self.slots.append({'pid': pid, 'ready': True, 'reaped': is_reaped,
                               'groupClear': None, 'exit': 0 if is_reaped else None,
                               'waitStatus': 0 if is_reaped else None})
            self.models[pid] = {'kind': kind, 'kernelReaped': is_reaped,
                                'descendants': i in descendants, 'killed': False}
        self.probes = [Probe(self, 900101 + i) for i in range(probes)]
        self.diag = module['CleanupDiagnostics'](
            lambda: self.now, lambda: {'phase': self.ns.get('PHASE', 'suite')},
            whole=55, start=0, event_limit=event_limit)
        fake_os = SimpleNamespace(WNOHANG=1, killpg=self.killpg, kill=self.kill,
                                  getpgid=self.getpgid, waitstatus_to_exitcode=self.decode,
                                  _exit=self.exit)
        self.ns = {'os': fake_os, 'time': SimpleNamespace(monotonic=lambda: self.now),
                   'START': 0, 'WHOLE': 55, 'ACTIVE': 45, 'SLOTS': self.slots,
                   'POPENS': self.probes, 'PHASE': 'suite', 'STOP': None,
                   'CLEANUP': self.diag, 'CleanupDeadline': module['CleanupDeadline'],
                   'REAL_WAIT': self.wait}
        exec(code, self.ns)
        exact_hard_kill = self.ns['hard_kill']

        def capture_then_exact_hard_kill():
            self.prefixes.append({'slots': copy.deepcopy(self.slots),
                                  'summary': self.diag.summary(), 'trace': list(self.trace)})
            return exact_hard_kill()

        self.ns['hard_kill'] = capture_then_exact_hard_kill
        self.exitcode, self.returned = None, False

    def target(self, op, pid, arg=None):
        self.trace.append((op, pid, arg))
        check(type(pid) is int and pid > 1 and pid in self.models, 'fake syscall exact retained target')
        return self.models[pid]

    def wait(self, pid, flags):
        model = self.target('wait', pid, flags)
        check(flags == 1, 'only nonblocking WNOHANG')
        if self.wait_deadline == pid:
            self.now = 55
        if pid in self.wait_faults:
            fault = self.wait_faults[pid]
            if isinstance(fault, Exception):
                raise fault
            return fault
        if model['kind'] == 'live':
            return 0, 0
        model['kernelReaped'] = True
        return pid, 0

    def decode(self, status):
        self.trace.append(('decode', status, None))
        if status in self.decode_faults:
            raise ValueError('injected status decoder failure')
        check(type(status) is int and status >= 0, 'fake valid status')
        return 0 if status == 0 else -(status & 127)

    def getpgid(self, pid):
        model = self.target('getpgid', pid)
        if model['kind'] == 'live' and not model['killed']:
            return pid
        raise ProcessLookupError(errno.ESRCH, 'injected getpgid absent')

    def killpg(self, pid, sig):
        model = self.target('killpg', pid, sig)
        check(sig in (0, 9), 'only owned group probe or SIGKILL')
        if sig == 0 and pid in self.group_faults:
            raise self.group_faults[pid]
        if sig == 9 and model['kind'] == 'completed' and not model['kernelReaped']:
            raise PermissionError(errno.EPERM, 'injected unreaped group refusal')
        present = ((model['kind'] == 'live' and not model['killed']) or
                   not model['kernelReaped'] or model['descendants'])
        if not present:
            raise ProcessLookupError(errno.ESRCH, 'injected owned group absent')
        if sig == 9:
            model['descendants'] = False
        return None

    def kill(self, pid, sig):
        model = self.target('kill', pid, sig)
        check(sig == 9, 'only retained PID SIGKILL')
        if model['kernelReaped']:
            raise ProcessLookupError(errno.ESRCH, 'injected reaped PID absent')
        model['killed'] = True
        return None

    def exit(self, code):
        self.trace.append(('exit', code, None))
        raise HardExit(code)

    def run(self):
        try:
            self.ns['extracted_cleanup_entry']()
            self.returned = True
        except HardExit as exc:
            self.exitcode = exc.code
        return self

    def prefix(self):
        check(len(self.prefixes) == 1, 'exact actual hard_kill invocation')
        return self.prefixes[0]

    def verify(self):
        check(len(self.trace) < 300, 'finite injected callback count')
        for op, pid, arg in self.trace:
            if op in ('wait', 'getpgid', 'killpg', 'kill'):
                check(type(pid) is int and pid > 1 and pid in self.models, 'no extra target')
            if op == 'poll':
                check(pid in [p.pid for p in self.probes], 'only retained probe poll')
        for prefix in self.prefixes:
            check(not any(op in ('killpg', 'kill') and arg == 9
                          for op, _, arg in prefix['trace']), 'pre-reap prefix no positive signal')
        summary = self.diag.summary()
        check(len(summary['events']) <= self.diag.event_limit <= 128 and
              summary['eventBytes'] <= 65536 and summary['emitFailures'] == 0,
              'bounded diagnostics without emitter IO')
        for event in summary['events']:
            check(len((json.dumps(event, sort_keys=True, allow_nan=False,
                                  separators=(',', ':')) + '\n').encode()) <= 2048,
                  'per-event byte cap')
        check(self.diag.emit is None, 'no diagnostic writer installed')


def calls(world, operation, pid=None, arg=None):
    return [row for row in world.trace if row[0] == operation and
            (pid is None or row[1] == pid) and (arg is None or row[2] == arg)]


def prefix_error(world, operation, pid, error_type, error_number):
    p = world.prefix()
    check('cleanup-error' in p['summary']['refusalCodes'], 'prefix error sticky before hard_kill')
    hits = [event for event in p['summary']['events'] if event['operation'] == operation and
            event['target'] == pid and event['outcome'] == 'error']
    check(len(hits) == 1, 'exact prefix error evidence')
    event = hits[0]
    check(event['pid'] == pid and type(event['slot']) is int and
          event['error']['type'] == error_type and event['error']['errno'] == error_number,
          'owned slot/error/errno retained')
    return event


def tests(newcode, oldcode, module):
    rows = []

    def finish(name, worlds, red=False):
        for world in worlds:
            world.verify()
        rows.append({'name': name, 'status': 'EXPECTED_RED' if red else 'GREEN_PASS'})

    w = World(oldcode, module, ('completed', 'live')).run()
    check(not calls(w, 'wait') and calls(w, 'killpg', 900001, 9) and
          calls(w, 'kill', 900001, 9) and calls(w, 'killpg', 900002, 9), 'actual old order shape')
    errors = [e for e in w.diag.events if e['operation'] == 'killpg' and e['target'] == 900001 and e['outcome'] == 'error']
    check(len(errors) == 1 and errors[0]['slot'] == 0 and errors[0]['pgid'] == 900001 and
          errors[0]['signal'] == 9 and errors[0]['error']['type'] == 'PermissionError' and
          errors[0]['error']['errno'] == errno.EPERM and w.diag.summary()['status'] == 'STOP',
          'old ordering exact injected EPERM RED')
    finish(NAMES[0], [w], True)

    w = World(newcode, module).run()
    s = w.prefix()['slots'][0]
    check(s['reaped'] is True and s['waitStatus'] == 0 and s['exit'] == 0 and
          s['groupClear'] is True, 'completed status admitted then ESRCH clear')
    check(calls(w, 'wait') == [('wait', 900001, 1)] and
          calls(w, 'killpg') == [('killpg', 900001, 0)] and not calls(w, 'kill') and
          not calls(w, 'getpgid') and not w.diag.refusal_codes, 'completed skip positive cleanup')
    finish(NAMES[1], [w])

    w = World(newcode, module, ('live',)).run()
    check(w.prefix()['slots'][0]['reaped'] is False and not calls(w, 'killpg', 900001, 0), 'live remains unreaped')
    check(calls(w, 'killpg', 900001, 9) and calls(w, 'kill', 900001, 9) and
          not w.diag.refusal_codes, 'live group and PID killed')
    finish(NAMES[2], [w])

    w = World(newcode, module, descendants=(0,)).run()
    check(w.prefix()['slots'][0]['reaped'] is True and
          w.prefix()['slots'][0]['groupClear'] is False and
          calls(w, 'killpg', 900001, 0) and calls(w, 'killpg', 900001, 9) and
          not calls(w, 'kill') and not w.diag.refusal_codes, 'True adapter keeps descendants cleanup')
    finish(NAMES[3], [w])

    worlds = []
    for clear in (None, True):
        w = World(newcode, module, reaped=(0,))
        w.slots[0]['groupClear'] = clear
        w.run()
        check(not calls(w, 'wait') and not calls(w, 'kill') and
              calls(w, 'killpg') == ([] if clear else [('killpg', 900001, 0)]), 'no repeat wait and clear skip')
        worlds.append(w)
    finish(NAMES[4], worlds)

    worlds = []
    for fault in (OSError(errno.EIO, 'injected wait IO'), ChildProcessError(errno.ECHILD, 'injected no child')):
        w = World(newcode, module, ('completed', 'completed'))
        w.wait_faults[900001] = fault
        w.run()
        prefix_error(w, 'waitpid', 900001, type(fault).__name__, fault.errno)
        check(w.prefix()['slots'][0]['reaped'] is False and
              ('wait', 900002, 1) in w.prefix()['trace'] and w.slots[1]['groupClear'] is True,
              'wait failure preserves uncertainty and later owned attempt')
        worlds.append(w)
    finish(NAMES[5], worlds)

    w = World(newcode, module, ('completed', 'completed'))
    w.group_faults[900001] = PermissionError(errno.EPERM, 'injected group probe refusal')
    w.run()
    e = prefix_error(w, 'group-check', 900001, 'PermissionError', errno.EPERM)
    check(e['signal'] == 0 and e['pgid'] == 900001 and
          w.prefix()['slots'][0]['groupClear'] is None and
          ('wait', 900002, 1) in w.prefix()['trace'] and w.slots[1]['groupClear'] is True,
          'group EPERM never admits clear and continues')
    finish(NAMES[6], [w])

    worlds = []
    for returned in (999999, 900002):
        w = World(newcode, module, ('completed', 'completed'))
        w.wait_faults[900001] = (returned, 0)
        w.run()
        prefix_error(w, 'waitpid', 900001, 'ValueError', None)
        check(w.prefix()['slots'][0]['reaped'] is False and not calls(w, 'killpg', 900001, 0) and
              calls(w, 'wait', 900002) == [('wait', 900002, 1)] and w.slots[1]['reaped'] is True,
              'returned PID not admitted or substituted')
        worlds.append(w)
    finish(NAMES[7], worlds)

    worlds = []
    for malformed in (None, (900001,), (900001, 0, 0), [900001, 0], (True, 0), (900001, False), (0, 7)):
        w = World(newcode, module, ('completed', 'completed'))
        w.wait_faults[900001] = malformed
        w.run()
        prefix_error(w, 'waitpid', 900001, 'ValueError', None)
        check(w.prefix()['slots'][0]['reaped'] is False and
              not calls(w, 'killpg', 900001, 0) and ('wait', 900002, 1) in w.prefix()['trace'],
              'malformed wait not admitted; remaining target attempted')
        worlds.append(w)
    finish(NAMES[8], worlds)

    w = World(newcode, module, ('completed', 'completed'))
    w.wait_faults[900001] = (900001, 1357911)
    w.decode_faults.add(1357911)
    w.run()
    prefix_error(w, 'waitpid', 900001, 'ValueError', None)
    observed = [e for e in w.prefix()['summary']['events'] if e['operation'] == 'wait-status' and e['target'] == 900001]
    check(len(observed) == 1 and observed[0]['context'] == '1357911' and
          observed[0]['outcome'] == 'observed' and observed[0]['slot'] == 0 and
          w.prefix()['slots'][0]['reaped'] is False and w.prefix()['slots'][0]['exit'] is None and
          ('wait', 900002, 1) in w.prefix()['trace'], 'raw status retained without invalid reap admission')
    finish(NAMES[9], [w])

    worlds = []
    for point in ('entry', 'wait'):
        w = World(newcode, module, ('completed', 'completed'))
        if point == 'entry':
            w.now = 55
        else:
            w.wait_deadline = 900001
        w.run()
        check(w.exitcode == 124 and not w.returned and not w.prefixes and
              not calls(w, 'wait', 900002) and not calls(w, 'killpg') and not calls(w, 'kill'),
              '55-second hard deadline precedes cleanup and success')
        check(calls(w, 'wait') == ([] if point == 'entry' else [('wait', 900001, 1)]), 'no late callbacks')
        worlds.append(w)
    finish(NAMES[10], worlds)

    worlds = []
    for w in (World(newcode, module, ('completed',) * 8), World(newcode, module, probes=5)):
        w.run()
        check(not w.trace and 'ownership-uncertain' in w.prefix()['summary']['refusalCodes'], 'retained-list bounds before calls')
        worlds.append(w)
    for invalid in (None, True, 0, 1, -7, '900001'):
        w = World(newcode, module, invalid=(invalid,)).run()
        check('ownership-uncertain' in w.prefix()['summary']['refusalCodes'] and
              calls(w, 'wait') == [('wait', 900001, 1)] and w.slots[1]['reaped'] is True,
              'invalid targets skipped while valid owned target continues')
        worlds.append(w)
    finish(NAMES[11], worlds)

    w = World(newcode, module, ('completed', 'completed'), event_limit=1)
    w.wait_faults[900001] = OSError(errno.EIO, 'injected capped wait failure')
    w.run()
    p = w.prefix()
    check('cleanup-error' in p['summary']['refusalCodes'] and
          'diagnostic-cap' in p['summary']['refusalCodes'] and p['summary']['droppedEvents'] > 0 and
          len(p['summary']['events']) == 1 and ('wait', 900002, 1) in p['trace'] and
          w.diag.summary()['status'] == 'STOP', 'prefix cap cannot conceal refusal or stop remaining owned attempt')
    finish(NAMES[12], [w])
    check([row['name'] for row in rows] == list(NAMES), 'exact finite roster')
    return rows


def main():
    check(sys.flags.isolated and sys.dont_write_bytecode and not sys.flags.optimize, 'pinned -I -B no -O')
    check(len(sys.argv) == 7, 'exact six source arguments')
    candidate_path, candidate_sha, module_path, module_sha, baseline_path, baseline_sha = sys.argv[1:]
    check(module_sha == MODULE_SHA and baseline_sha == BASE_SHA, 'fixed unchanged source roles')
    candidate_raw = authenticated(candidate_path, candidate_sha)
    module_raw = authenticated(module_path, module_sha)
    baseline_raw = authenticated(baseline_path, baseline_sha)
    candidate = ast.parse(candidate_raw, candidate_path)
    baseline = ast.parse(baseline_raw, baseline_path)
    source_contract(candidate, baseline)
    module = {'__name__': 'injected_owned_cleanup'}
    exec(compile(module_raw, module_path, 'exec'), module)
    rows = tests(extracted(candidate, candidate_path), extracted(baseline, baseline_path), module)
    return {'schema': SCHEMA, 'status': 'PRE_REAP_CONTROLS_PASS',
            'expectedRed': 1, 'observedRed': 1, 'expectedGreen': 12, 'observedGreen': 12,
            'caseCount': 13, 'cases': rows, 'candidateSha256': candidate_sha,
            'moduleSha256': module_sha, 'baselineSha256': baseline_sha,
            'driverTopLevelImported': False, 'realSignals': False, 'game': False,
            'moduleUnchanged': True, 'r2TailUnchanged': True, 'failure': None}


if __name__ == '__main__':
    try:
        result = main()
        exit_code = 0
    except BaseException as exc:
        result = {'schema': SCHEMA, 'status': 'PRE_REAP_CONTROLS_FAIL',
                  'failure': {'type': type(exc).__name__, 'message': str(exc)[:192]}}
        exit_code = 1
    encoded = json.dumps(result, sort_keys=True, allow_nan=False, separators=(',', ':')).encode()
    if len(encoded) > 12288:
        encoded = b'{"schema":"a208-independent-pre-reap-controls/v1","status":"PRE_REAP_CONTROLS_FAIL","failure":"summary-cap"}'
        exit_code = 1
    sys.stdout.buffer.write(encoded + b'\n')
    sys.stdout.buffer.flush()
    raise SystemExit(exit_code)
