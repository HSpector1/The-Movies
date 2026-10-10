"""Exact 2 RED + 10 GREEN driver-tail producer gate; no driver imports."""
import json
CAP = 65536
SUMMARY_CAP = 12288
RED_NAMES = ['r1-refusal-unbound-STOP', 'r1-clean-unbound-STOP']
GREEN_NAMES = ['r2-clean-valid-pass', 'r2-EPERM-sticky-stop',
               'r2-prior-STOP-plus-EPERM-preserved', 'r2-prior-STOP-alone-preserved',
               'r2-invalid-method-count-stop', 'r2-unclear-owned-state-stop',
               'r2-late-artifact-rejected', 'r2-late-emission-rejected',
               'r2-hard-deadline-precedes-IO', 'r2-fixture-cap-before-IO-rejected']


class ReportStop(ValueError):
    pass


def need(ok, why):
    if not ok:
        raise ReportStop('STOP_DRIVER_INTEGRATION_REPORT_' + why)


def validate(mode, stdout, stderr, owned_pgid):
    need(mode == 'integration', 'MODE')
    need(len(stdout) <= CAP and len(stderr) <= CAP, 'STREAM_CAP')
    need(not stderr, 'STDERR')
    need(len(stdout) <= SUMMARY_CAP and stdout.endswith(b'\n')
         and len(stdout.splitlines()) == 1, 'ONE_JSON_SUMMARY_CAP')

    def unique_object(pairs):
        result = {}
        for key, value in pairs:
            need(key not in result, 'DUPLICATE_JSON_KEY')
            result[key] = value
        return result

    def forbidden_number(value):
        raise ReportStop('STOP_DRIVER_INTEGRATION_REPORT_NONFINITE_JSON')

    obj = json.loads(stdout, object_pairs_hook=unique_object, parse_constant=forbidden_number)
    need(type(obj) is dict and set(obj) == {
        'schema', 'status', 'expectedRed', 'observedExpectedRed', 'expectedGreen',
        'observedGreen', 'cases', 'failure', 'game', 'realIO', 'realSignals',
        'driverTopLevelImported'}, 'SUMMARY_FIELDS')
    need(obj['schema'] == 'a208-independent-driver-integration-controls/v1'
         and obj['status'] == 'DRIVER_INTEGRATION_CONTROLS_PASS', 'STATUS_SCHEMA')
    for key, value in [('expectedRed', 2), ('observedExpectedRed', 2),
                       ('expectedGreen', 10), ('observedGreen', 10)]:
        need(type(obj[key]) is int and obj[key] == value, 'COUNT_' + key)
    need(obj['failure'] is None and all(obj[key] is False for key in
         ['game', 'realIO', 'realSignals', 'driverTopLevelImported']), 'REFUSAL_OR_SCOPE')
    rows = obj['cases']
    need(type(rows) is list and len(rows) == 12, 'EXACT12')
    for row, name, line, branch in zip(rows[:2], RED_NAMES, [185, 187], ['refusal', 'clean']):
        need(type(row) is dict and set(row) == {'case', 'status', 'detail'}
             and row['case'] == name and row['status'] == 'EXPECTED_RED', 'EXACT_RED_ROSTER_STATUS')
        detail = row['detail']
        need(type(detail) is dict and set(detail) == {
            'exception', 'name', 'sourceLine', 'branch', 'resultWrites'}, 'RED_DETAIL_FIELDS')
        need(detail['exception'] == 'UnboundLocalError' and detail['name'] == 'STOP'
             and type(detail['sourceLine']) is int and detail['sourceLine'] == line
             and detail['branch'] == branch and type(detail['resultWrites']) is int
             and detail['resultWrites'] == 0, 'RED_EXACT_SCOPE_EVIDENCE')
    for row, name in zip(rows[2:], GREEN_NAMES):
        need(type(row) is dict and set(row) == {'case', 'status'}
             and row['case'] == name and row['status'] == 'GREEN', 'EXACT_GREEN_ROSTER_STATUS')
    return {'protocol': 'a208-independent-driver-integration-controls/v1',
            'expectedRed': 2, 'expectedGreen': 10, 'rows': 12,
            'game': False, 'realIO': False, 'realSignals': False}
