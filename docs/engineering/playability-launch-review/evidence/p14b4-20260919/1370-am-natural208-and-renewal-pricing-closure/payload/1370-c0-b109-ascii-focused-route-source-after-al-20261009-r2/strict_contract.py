"""Held strict producer contract. No execution or grant on import."""
import json
EXPECTED = {'schema': '1370-b109-ascii-controls/v1', 'status': 'ORIGINAL28_ASCII6_MUTANT3_EXPECTED_RED_GREEN_PASSED', 'expectedRed': 3, 'newGroups': 6, 'newPairs': 344, 'originalGroups': 28, 'originalPairs': 321, 'totalGroups': 34, 'totalPairs': 665, 'unexpectedRed': 0, 'groups': [{'name': 'ascii128 values keys eligible mixtures empty slash DEL', 'pairs': 268, 'status': 'GREEN'}, {'name': 'native fallback escapes unicode separators surrogate values keys', 'pairs': 34, 'status': 'GREEN'}, {'name': 'raw rendered cumulative key caps and ordered limit coercions', 'pairs': 9, 'status': 'GREEN'}, {'name': 'byte and token flush seams oversized whole tokens late refusal', 'pairs': 15, 'status': 'GREEN'}, {'name': 'source getters proxies two reads dynamic lengths both branches', 'pairs': 8, 'status': 'GREEN'}, {'name': 'shared repeated keys mutations fresh calls no container stringify clone', 'pairs': 10, 'status': 'GREEN'}], 'mutants': [{'name': 'escape exclusion mutant', 'shape': 'exact native string and key byte mismatch on quote backslash LF', 'status': 'EXPECTED_RED'}, {'name': 'unicode byte-size mutant', 'shape': 'é missing terminal byte and budget3 wrongly admitted', 'status': 'EXPECTED_RED'}, {'name': 'raw precheck mutant', 'shape': 'STRING versus JSON cap plus missing ordered coercion checkpoint', 'status': 'EXPECTED_RED'}], 'game': False, 'saveImports': False, 'captureDecode': False, 'performanceWin': False}
PASS_NAMES = ['exact primitives and finite number rendering', 'captured key order, integer keys and escaping', 'undefined object omission and sparse-array null', 'shared references are allowed while cycles refuse', 'own toJSON refuses; inherited toJSON is ignored like baseline', 'unsupported atoms and nonfinite numbers refuse', 'exact-fit and cap refusal for every small budget', 'string raw precheck and escaped token budget', 'property-key cache is per call and cannot mask object mutation', 'getter visitation order remains identical', 'deterministic nested corpus', 'stateful first-check and second-value reads', 'dynamic array shrink and growth preserve emitted length', 'null prototypes prevent inherited hooks including array pollution', 'safe proto keys and integer ordering', 'token caps and refusals never serialize source containers', 'proxy reverse and mixed integer order exact bytes and caps', 'nested and shared proxy order is fresh on each occurrence', 'proxy omitted names preserve all original hook traces', 'proxy stateful values retain two reads and undefined refusal', 'null handler ignores inherited get and descriptor traps', 'token emission creates no clone Proxy wrapping', 'chunk whole-token count and UTF8 byte seams retain exact-fit caps', 'oversized whole tokens preserve Unicode escaping and cap refusals', 'late refusal after multiple chunks cannot return or retain partial output', 'source getters Proxy traces and dynamic length stay exact across seams', 'shared references repeated keys and mutation remain fresh across chunks and calls', 'chunk token architecture and unusual limit coercion preserve original checkpoints', 'ascii128 values keys eligible mixtures empty slash DEL', 'native fallback escapes unicode separators surrogate values keys', 'raw rendered cumulative key caps and ordered limit coercions', 'byte and token flush seams oversized whole tokens late refusal', 'source getters proxies two reads dynamic lengths both branches', 'shared repeated keys mutations fresh calls no container stringify clone']
RED_NAMES = ['escape exclusion mutant', 'unicode byte-size mutant', 'raw precheck mutant']
PRODUCER_CAP = 16384

def require(ok, message):
    if not ok:
        raise RuntimeError('STOP_' + message)

def unique_object(pairs):
    result = {}
    for key, value in pairs:
        require(key not in result, 'DUPLICATE_JSON_FIELD')
        result[key] = value
    return result

def forbidden_constant(value):
    raise RuntimeError('STOP_NONFINITE_JSON_' + value)

def strict_json(raw):
    return json.loads(raw, object_pairs_hook=unique_object, parse_constant=forbidden_constant)

def exact(actual, wanted):
    if type(actual) is not type(wanted):
        return False
    if type(wanted) is dict:
        return set(actual) == set(wanted) and all(exact(actual[k], v) for k, v in wanted.items())
    if type(wanted) is list:
        return len(actual) == len(wanted) and all(exact(x, y) for x, y in zip(actual, wanted))
    return actual == wanted

def validate_producer(stdout, stderr):
    require(type(stdout) is bytes and type(stderr) is bytes, 'STREAM_TYPES')
    require(0 < len(stdout) <= PRODUCER_CAP and not stderr, 'PRODUCER_STREAM_BOUNDS')
    require(stdout.endswith(b'\n') and stdout.count(b'\n') == 38, 'PRODUCER_FRAMING')
    lines = stdout.decode('utf-8', errors='strict').split('\n')
    require(len(lines) == 39 and lines[-1] == '', 'PRODUCER_LINES')
    expected_prefix = ['PASS ' + name for name in PASS_NAMES] + ['EXPECTED_RED ' + name for name in RED_NAMES]
    require(lines[:37] == expected_prefix, 'PRODUCER_ORDERED_ROSTER')
    last = strict_json(lines[37])
    require(exact(last, EXPECTED), 'PRODUCER_FIELDS_TYPES_COUNTS_ROSTERS')
    return last
