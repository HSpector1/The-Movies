"""UNRUN actual-main integration controls. Four args: r2 path SHA r1 path SHA.
Authenticated AST only: global declarations plus exact main refusal/report tail.
Driver top-level, timers, imports, suite, fork, cleanup syscalls never execute.
All tail I/O, clock, alarm disable and hard-exit callbacks are synthetic.
"""
import ast
import copy
import hashlib
import json
from pathlib import Path
import sys
import types

R1_SHA = '0a4934e66eb748d7f2912373bd6896b21e80a867fad4a1e72b9f2a7647345369'
SOURCE_CAP = 131072
SUMMARY_CAP = 12288
RED_NAMES = ['r1-refusal-unbound-STOP', 'r1-clean-unbound-STOP']
GREEN_NAMES = ['r2-clean-valid-pass', 'r2-EPERM-sticky-stop',
               'r2-prior-STOP-plus-EPERM-preserved', 'r2-prior-STOP-alone-preserved',
               'r2-invalid-method-count-stop', 'r2-unclear-owned-state-stop',
               'r2-late-artifact-rejected', 'r2-late-emission-rejected',
               'r2-hard-deadline-precedes-IO', 'r2-fixture-cap-before-IO-rejected']


def require(ok, why):
    if not ok:
        raise AssertionError(why)


def bounded(value):
    return str(value).encode('utf8', 'replace')[:192].decode('utf8', 'ignore')


def source(path, expected):
    require(len(expected) == 64 and all(c in '0123456789abcdef' for c in expected), 'exact SHA format')
    with Path(path).open('rb') as stream:
        raw = stream.read(SOURCE_CAP + 1)
    require(len(raw) <= SOURCE_CAP and hashlib.sha256(raw).hexdigest() == expected, 'source size/hash')
    return raw


def extracted(raw):
    tree = ast.parse(raw, filename='authenticated-driver-source-only')
    mains = [n for n in tree.body if isinstance(n, ast.FunctionDef) and n.name == 'main']
    require(len(mains) == 1, 'one exact main')
    main = mains[0]
    # This actual If is in main's finally; preserve its scope by making it the
    # first tail statement, with main's original global declarations untouched.
    choices = []
    for index, node in enumerate(main.body):
        if not isinstance(node, ast.Try):
            continue
        matches = [n for n in node.finalbody if isinstance(n, ast.If)
                   and ast.dump(n.test, include_attributes=False) ==
                   ast.dump(ast.parse('CLEANUP.refusal_codes', mode='eval').body, include_attributes=False)]
        if matches:
            require(len(matches) == 1 and node.finalbody[-1] is matches[0], 'exact final refusal tail shape')
            choices.append((index, matches[0]))
    require(len(choices) == 1, 'one main final refusal tail')
    index, refusal = choices[0]
    require(isinstance(main.body[-1], ast.Return), 'actual return retained')
    globals_actual = [copy.deepcopy(n) for n in main.body if isinstance(n, ast.Global)]
    prelude = ast.parse('outcome = fake_outcome\nreason = fake_reason\ncleanup = list(fake_cleanup)\nroot = ROOT\n').body
    function = copy.deepcopy(main)
    function.body = globals_actual + prelude + [copy.deepcopy(refusal)] + copy.deepcopy(main.body[index + 1:])
    helpers = [copy.deepcopy(n) for n in tree.body
               if isinstance(n, (ast.ClassDef, ast.FunctionDef))
               and n.name in ('ControlStop', 'need', 'deadline_guard')]
    require({n.name for n in helpers} == {'ControlStop', 'need', 'deadline_guard'}, 'three exact pure/injected helpers')
    module = ast.fix_missing_locations(ast.Module(body=helpers + [function], type_ignores=[]))
    return module


class HardExit(BaseException):
    def __init__(self, code):
        self.code = code


class Outcome:
    def __init__(self, count=14):
        self.testsRun = count
        self.failures = []
        self.errors = []
    def wasSuccessful(self):
        return True


class Root:
    def __truediv__(self, name):
        return 'synthetic-owned-fixture/' + name


class Diagnostics:
    def __init__(self, refused):
        self.refusal_codes = ['cleanup-error'] if refused else []
        self.events = ([dict(operation='killpg', target=910003, slot=3,
                             error=dict(type='PermissionError', errno=1))] if refused else [])
    def summary(self):
        return dict(status='STOP' if self.refusal_codes else 'COMPLETE',
                    refusalCodes=list(self.refusal_codes), events=list(self.events))


class World:
    def __init__(self, syntax, *, refused=False, prior_stop=None, count=14, unclear=False,
                 write_time=None, print_time=None, now=1.0, cap_failure=False):
        self.now = now
        self.write_time = write_time
        self.print_time = print_time
        self.cap_failure = cap_failure
        self.writes = []
        self.prints = []
        self.timer_calls = []
        self.guard_calls = 0
        self.diag = Diagnostics(refused)
        groups = [dict(pid=910001 + n, ready=True, reaped=True, groupClear=True, exit=-9) for n in range(7)]
        if unclear:
            groups[3]['groupClear'] = None
            self.diag.refusal_codes = ['ownership-uncertain']
        probes = [types.SimpleNamespace(pid=920001 + n, returncode=0) for n in range(4)]
        self.ns = dict(__builtins__=__builtins__, STOP=prior_stop, START=0, ACTIVE=45, WHOLE=55,
                       REG=999999, PHASE='cleanup', ROOT=Root(), CLEANUP=self.diag,
                       SLOTS=groups, HISTORY=groups, POPENS=probes,
                       fake_outcome=Outcome(count), fake_reason=None, fake_cleanup=[],
                       time=types.SimpleNamespace(monotonic=lambda: self.now), json=json,
                       os=types.SimpleNamespace(getpgrp=lambda: 930001, _exit=self.hard_exit),
                       signal=types.SimpleNamespace(ITIMER_REAL=0, setitimer=self.setitimer),
                       exclusive=self.exclusive, print=self.print, cap_check=self.cap_check)
        exec(compile(copy.deepcopy(syntax), 'authenticated-actual-main-tail', 'exec'), self.ns)

    def hard_exit(self, code):
        raise HardExit(code)

    def setitimer(self, kind, value):
        self.timer_calls.append((kind, value))

    def exclusive(self, path, raw):
        # Capture bytes only; no actual file/descriptor exists.
        self.writes.append((path, bytes(raw)))
        if self.write_time is not None:
            self.now = self.write_time

    def print(self, raw, flush=False):
        self.prints.append((raw, flush))
        if self.print_time is not None:
            self.now = self.print_time

    def cap_check(self):
        self.guard_calls += 1
        if self.cap_failure:
            raise self.ns['ControlStop']('8 MiB owned fixture cap')

    def run(self):
        try:
            return self.ns['main'](), None
        except BaseException as exc:
            return None, exc

    def result(self):
        require(len(self.writes) == 1, 'one exact fake RESULT write')
        return json.loads(self.writes[0][1])


def expected_red(syntax, refused):
    world = World(syntax, refused=refused)
    code, error = world.run()
    require(code is None and type(error) is UnboundLocalError, 'exact r1 UnboundLocalError required')
    require("local variable 'STOP'" in str(error), 'different UnboundLocalError')
    require(world.ns['STOP'] is None and not world.writes and not world.prints and not world.timer_calls,
            'unexpected original RED side effect')
    tb = error.__traceback__
    while tb.tb_next is not None:
        tb = tb.tb_next
    require(tb.tb_frame.f_code.co_name == 'main', 'RED not in actual main')
    require(tb.tb_lineno == (185 if refused else 187), 'RED source location changed')
    return dict(exception='UnboundLocalError', name='STOP', sourceLine=tb.tb_lineno,
                branch='refusal' if refused else 'clean', resultWrites=0)


def finish(world, status, code, sticky):
    actual_code, error = world.run()
    require(error is None and actual_code == code, 'actual main return mismatch')
    row = world.result()
    require(row['status'] == status and row['stickyStop'] == sticky and world.ns['STOP'] == sticky,
            'actual driver status/STOP mismatch')
    require(len(world.prints) == 1 and json.loads(world.prints[0][0]) == row and world.prints[0][1] is True,
            'final fake emission mismatch')
    require(world.timer_calls == [(0, 0)] and world.guard_calls == 2, 'final guard/timer path changed')
    return row


def green_cases(syntax):
    def clean():
        row = finish(World(syntax), 'A208_PYTHON_CONTROLS_PASS', 0, None)
        require(row['methods'] == 14 and len(row['ownedGroups']) == 7 and len(row['inheritedProbes']) == 4,
                'clean pass count predicate changed')
        require(row['cleanupErrors'] == [] and row['cleanupDiagnostics']['refusalCodes'] == [], 'clean pass hides refusal')

    def refused():
        row = finish(World(syntax, refused=True), 'A208_PYTHON_CONTROLS_STOP', 2, 'owned-cleanup-diagnostic-refusal')
        require(row['cleanupErrors'] == ['owned-cleanup:cleanup-error'], 'cleanup refusal absent')
        event = row['cleanupDiagnostics']['events'][0]
        require(event['target'] == 910003 and event['error'] == dict(type='PermissionError', errno=1),
                'fake EPERM evidence lost through actual result tail')

    def prior(with_refusal):
        row = finish(World(syntax, refused=with_refusal, prior_stop='prior-alarm-stop'),
                     'A208_PYTHON_CONTROLS_STOP', 2, 'prior-alarm-stop')
        require(bool(row['cleanupErrors']) == with_refusal, 'prior STOP conceals new cleanup refusal')

    def wrong_methods():
        finish(World(syntax, count=13), 'A208_PYTHON_CONTROLS_STOP', 2, None)

    def unclear():
        row = finish(World(syntax, unclear=True), 'A208_PYTHON_CONTROLS_STOP', 2,
                     'owned-cleanup-diagnostic-refusal')
        require(row['ownedGroups'][3]['groupClear'] is None, 'uncertainty erased')

    def late(write):
        world = World(syntax, write_time=45 if write else None, print_time=None if write else 45)
        code, error = world.run()
        require(code is None and type(error) is world.ns['ControlStop'], 'late finalization returned a pass')
        require(str(error) == ('late successful artifact' if write else 'late successful emission'), 'wrong actual late gate')
        require(len(world.writes) == 1 and len(world.prints) == (0 if write else 1), 'late branch shape changed')
        require(not world.timer_calls, 'late rejection disabled hard timer')
        # A candidate PASS artifact is invalid because the actual main raises;
        # full parent acceptance separately requires genuine child/recorder0.
        require(world.result()['status'] == 'A208_PYTHON_CONTROLS_PASS', 'expected late candidate artifact shape')

    def deadline():
        world = World(syntax, now=55)
        code, error = world.run()
        require(code is None and isinstance(error, HardExit) and error.code == 124, 'actual hard deadline not decisive')
        require(not world.writes and not world.prints and not world.timer_calls, 'hard deadline allowed IO/disabled timer')

    def cap():
        world = World(syntax, refused=True, cap_failure=True)
        code, error = world.run()
        require(code is None and type(error) is world.ns['ControlStop'] and str(error) == '8 MiB owned fixture cap',
                'actual cap failure returned success')
        require(world.ns['STOP'] == 'owned-cleanup-diagnostic-refusal' and not world.writes and not world.prints,
                'cap failure concealed earlier refusal')

    return [clean, refused, lambda: prior(True), lambda: prior(False), wrong_methods,
            unclear, lambda: late(True), lambda: late(False), deadline, cap]


def main(argv):
    rows = []
    red = green = 0
    failure = None
    try:
        require(len(argv) == 4, 'exact four arguments: r2 path SHA r1 path SHA')
        r2path, r2sha, r1path, r1sha = argv
        require(r1sha == R1_SHA, 'exact failed r1 authority')
        r1 = source(r1path, r1sha)
        r2 = source(r2path, r2sha)
        before = b' global REG,PHASE,ROOT,CLEANUP\n'
        after = b' global REG,PHASE,ROOT,CLEANUP,STOP\n'
        require(r1.count(before) == 1 and r2 == r1.replace(before, after, 1), 'r2 must be exact one-global-name repair')
        red_syntax = extracted(r1)
        green_syntax = extracted(r2)
        for name, refused in zip(RED_NAMES, (True, False)):
            detail = expected_red(red_syntax, refused)
            rows.append(dict(case=name, status='EXPECTED_RED', detail=detail))
            red += 1
        cases = green_cases(green_syntax)
        require(len(cases) == len(GREEN_NAMES) == 10, 'GREEN roster changed')
        for name, case in zip(GREEN_NAMES, cases):
            try:
                case()
            except BaseException as exc:
                rows.append(dict(case=name, status='FAIL', errorType=type(exc).__name__, error=bounded(exc)))
            else:
                rows.append(dict(case=name, status='GREEN'))
                green += 1
    except BaseException as exc:
        failure = dict(errorType=type(exc).__name__, error=bounded(exc))
    ok = failure is None and red == 2 and green == 10 and len(rows) == 12
    summary = dict(schema='a208-independent-driver-integration-controls/v1',
                   status='DRIVER_INTEGRATION_CONTROLS_PASS' if ok else 'DRIVER_INTEGRATION_CONTROLS_STOP',
                   expectedRed=2, observedExpectedRed=red, expectedGreen=10, observedGreen=green,
                   cases=rows, failure=failure, game=False, realIO=False,
                   realSignals=False, driverTopLevelImported=False)
    raw = json.dumps(summary, sort_keys=True, separators=(',', ':'))
    if len(raw.encode('utf8')) > SUMMARY_CAP:
        raw = json.dumps(dict(schema=summary['schema'], status='DRIVER_INTEGRATION_CONTROLS_STOP', failure='summary cap'))
        ok = False
    print(raw, flush=True)
    return 0 if ok else 2


if __name__ == '__main__':
    raise SystemExit(main(sys.argv[1:]))
