"""Unrun disposable Git regression controls; root must provide a genuine grant."""
import ast
import hashlib
import json
import os
from pathlib import Path
import selectors
import signal
import stat
import subprocess
import sys
import time
import types

HERE = Path(__file__).parent
SCRATCH = Path('/Users/zacheryspector/studio-scratch')
COMMAND_SECONDS = 15
AGGREGATE_SECONDS = 60
STREAM_CAP = 65536
RESULT_CAP = 131072
START = None
COMMANDS = []


def require(ok, message):
    if not ok:
        raise RuntimeError(message)


def role(path, cap=16777216):
    path = Path(path)
    before = path.lstat()
    require(path.is_absolute() and path.resolve(strict=True) == path and
            stat.S_ISREG(before.st_mode) and 0 <= before.st_size <= cap,
            'ROLE_FILE_INVALID')
    data = path.read_bytes()
    after = path.lstat()
    fields = ('st_dev', 'st_ino', 'st_mode', 'st_size', 'st_mtime_ns', 'st_ctime_ns')
    require(all(getattr(before, k) == getattr(after, k) for k in fields) and
            len(data) == before.st_size, 'ROLE_CHANGED')
    return {'path': str(path), 'bytes': len(data), 'sha256': hashlib.sha256(data).hexdigest()}


def unique_pairs(pairs):
    result = {}
    for key, value in pairs:
        require(key not in result, 'DUPLICATE_JSON_KEY')
        result[key] = value
    return result


def load(path):
    return json.loads(Path(path).read_bytes(), object_pairs_hook=unique_pairs)


def authenticate(expected):
    require(type(expected) is dict and set(expected) == {'path', 'bytes', 'sha256'} and
            type(expected['bytes']) is int and role(expected['path']) == expected,
            'SOURCE_OR_TOOL_PIN_MISMATCH')


def actual_function(source_role, environment):
    """Compile only the authenticated actual function; never execute the module."""
    authenticate(source_role)
    tree = ast.parse(Path(source_role['path']).read_bytes(), filename=source_role['path'])
    nodes = [n for n in tree.body if type(n) is ast.FunctionDef and n.name == 'clean_git_env']
    require(len(nodes) == 1, 'SANITIZER_FUNCTION_ROSTER')
    node = nodes[0]
    require(not node.decorator_list and not node.args.args and not node.args.kwonlyargs and
            node.args.vararg is None and node.args.kwarg is None and not node.args.defaults and
            node.returns is None, 'SANITIZER_FUNCTION_INTERFACE')
    require(not any(isinstance(n, (ast.Import, ast.ImportFrom)) for n in ast.walk(node)),
            'SANITIZER_FUNCTION_IMPORT')
    namespace = {'os': types.SimpleNamespace(environ=environment), '__builtins__': {}}
    code = compile(ast.Module(body=[node], type_ignores=[]), source_role['path'], 'exec',
                   dont_inherit=True, optimize=0)
    exec(code, namespace)
    return namespace['clean_git_env']


def remaining():
    value = AGGREGATE_SECONDS - (time.monotonic() - START)
    require(value > 0, 'AGGREGATE_60_SECONDS_EXCEEDED')
    return value


def git_command(git_role, repository, arguments, environment, hooks, template):
    # Explicit owned git-dir/work-tree and empty template/hooks prevent ambient
    # configuration from selecting the real project or running hook/fsmonitor code.
    argv = [git_role['path'], '--git-dir=' + str(repository / '.git'),
            '--work-tree=' + str(repository), '-c', 'core.worktree=' + str(repository),
            '-c', 'core.bare=false', '-c', 'core.fsmonitor=false',
            '-c', 'core.untrackedCache=false', '-c', 'core.hooksPath=' + str(hooks),
            '-c', 'core.excludesFile=/dev/null', '-c', 'commit.gpgsign=false',
            '-c', 'gc.auto=0', '-c', 'maintenance.auto=0',
            '-c', 'user.name=Disposable Control', '-c', 'user.email=control@example.invalid'] + arguments
    deadline = time.monotonic() + min(COMMAND_SECONDS, remaining())
    proc = subprocess.Popen(argv, cwd=repository, env=environment, stdin=subprocess.DEVNULL,
                            stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    # Inherit the root-owned worker group; no detached sessions or descendants.
    selector = selectors.DefaultSelector()
    streams = {'stdout': bytearray(), 'stderr': bytearray()}
    try:
        try:
            require(os.getpgid(proc.pid) == os.getpgrp(), 'CHILD_GROUP_OWNERSHIP')
        except ProcessLookupError:
            require(proc.poll() is not None, 'CHILD_GROUP_ID_UNAVAILABLE_WHILE_LIVE')
        for name in streams:
            stream = getattr(proc, name)
            os.set_blocking(stream.fileno(), False)
            selector.register(stream, selectors.EVENT_READ, name)
        while selector.get_map():
            remaining()
            require(time.monotonic() < deadline, 'COMMAND_15_SECONDS_EXCEEDED')
            for key, _ in selector.select(min(.1, max(.001, deadline - time.monotonic()))):
                try:
                    chunk = os.read(key.fileobj.fileno(), 8192)
                except BlockingIOError:
                    continue
                if not chunk:
                    selector.unregister(key.fileobj)
                    key.fileobj.close()
                else:
                    target = streams[key.data]
                    require(len(target) + len(chunk) <= STREAM_CAP, 'COMMAND_STREAM_CAP')
                    target.extend(chunk)
        proc.wait(timeout=min(remaining(), max(.001, deadline - time.monotonic())))
        record = {'argv': argv, 'cwd': str(repository), 'pid': proc.pid,
                  'pgid': os.getpgrp(), 'exit': proc.returncode,
                  'stdoutBytes': len(streams['stdout']), 'stderrBytes': len(streams['stderr']),
                  'stdoutSha256': hashlib.sha256(streams['stdout']).hexdigest(),
                  'stderrSha256': hashlib.sha256(streams['stderr']).hexdigest()}
        COMMANDS.append(record)
        require(proc.returncode == 0, 'DISPOSABLE_GIT_COMMAND_FAILED')
        return bytes(streams['stdout'])
    finally:
        selector.close()
        if proc.poll() is None:
            proc.terminate()
            try:
                proc.wait(timeout=2)
            except subprocess.TimeoutExpired:
                proc.kill()
                proc.wait(timeout=2)
        for stream in (proc.stdout, proc.stderr):
            if stream is not None and not stream.closed:
                stream.close()


def index_identity(path):
    expected = role(path)
    st = path.lstat()
    return {'file': expected, 'metadata': [st.st_dev, st.st_ino, st.st_mode,
             st.st_nlink, st.st_size, st.st_mtime_ns, st.st_ctime_ns]}


def fixture(root, name, git_role, setup_environment, tested_environment):
    repository = root / name
    repository.mkdir()
    hooks = root / 'empty-hooks'
    template = root / 'empty-template'
    run = lambda args, env: git_command(git_role, repository, args, env, hooks, template)
    run(['init', '--quiet', '--template=' + str(template)], setup_environment)
    tracked = repository / 'tracked.txt'
    payload = b'unchanged disposable tracked bytes\n'
    tracked.write_bytes(payload)
    old_mtime = (int(time.time()) - 60) * 1000000000
    os.utime(tracked, ns=(old_mtime, old_mtime))
    run(['add', '--', 'tracked.txt'], setup_environment)
    run(['commit', '--quiet', '-m', 'Disposable baseline', '--no-verify'], setup_environment)
    require(run(['status', '--porcelain=v1', '--untracked-files=no'], setup_environment) == b'',
            'FIXTURE_NOT_CLEAN_BEFORE_STALE_STAT')
    index = repository / '.git' / 'index'
    baseline = index_identity(index)
    tracked_before = role(tracked)
    before_mtime = tracked.stat().st_mtime_ns
    os.utime(tracked, ns=(old_mtime + 10000000000, old_mtime + 10000000000))
    require(role(tracked) == tracked_before and tracked.stat().st_mtime_ns != before_mtime,
            'STALE_STAT_FIXTURE_PRECONDITION')
    require(index_identity(index) == baseline, 'INDEX_CHANGED_DURING_FIXTURE_PREPARATION')
    output = run(['status', '--porcelain=v1', '--untracked-files=no'], tested_environment)
    after = index_identity(index)
    require(output == b'' and tracked.read_bytes() == payload, 'STATUS_CONTENT_OR_WORKTREE_MISMATCH')
    return {'repository': str(repository), 'trackedBytesUnchanged': True,
            'worktreeMtimeChangedBeforeStatus': True, 'indexBefore': baseline,
            'indexAfter': after, 'statusStdoutBytes': 0,
            'actualOptionalLocks': tested_environment.get('GIT_OPTIONAL_LOCKS'),
            'optionalLocksKeyPresent': 'GIT_OPTIONAL_LOCKS' in tested_environment}


def main():
    global START
    require(sys.flags.isolated and sys.dont_write_bytecode and not sys.flags.optimize,
            'ISOLATED_UNOPTIMIZED_PYTHON_REQUIRED')
    require(len(sys.argv) == 3, 'CLI_GRANT_PATH_SHA')
    config_role = role(HERE / 'CONFIG.json')
    config = load(config_role['path'])
    grant_role = role(Path(sys.argv[1]))
    require(grant_role['sha256'] == sys.argv[2], 'GRANT_PIN')
    grant = load(grant_role['path'])
    require(grant['schema'] == '1370-root-git-optional-locks-regression-once-grant/v1' and
            grant['executionAuthorization'] is True and grant['oneAggregateRun'] is True and
            grant['automaticRetry'] is False and grant['config'] == config_role and
            grant['bounds'] == config['bounds'], 'GRANT_CONTRACT')
    authenticate(grant['sourceManifest'])
    manifest = load(grant['sourceManifest']['path'])
    for expected in manifest['files'].values():
        authenticate(expected)
    require(manifest['files']['run_git_env_controls.py'] == role(Path(__file__)) and
            manifest['files']['CONFIG.json'] == config_role, 'SOURCE_SELF_BINDING')
    authenticate(grant['sourceReview'])
    review = load(grant['sourceReview']['path'])
    require(review['decision'] == 'ACCEPT_STATIC_GIT_OPTIONAL_LOCKS_REGRESSION_CONTROLS_SOURCE_ONLY' and
            review['executionAuthorization'] is False and review['concreteFindings'] == [] and
            review['sourceManifest'] == grant['sourceManifest'], 'CONTROLS_SOURCE_REVIEW')
    for name in ['run_git_env_controls.py', 'CONFIG.json', 'MATRIX.json', 'CONTRACT.json']:
        require(review['sourcePins'][name] == manifest['files'][name] and
                review['routeSourcePins'][name] == manifest['files'][name], 'SOURCE_REVIEW_ALIAS')
    for expected in config['inputs'].values():
        authenticate(expected)
    impl_review = load(config['inputs']['implementationReview']['path'])
    impl_manifest = load(config['inputs']['implementationManifest']['path'])
    require(impl_review['decision'] == 'ACCEPT_STATIC_PROOF_GIT_OPTIONAL_LOCKS_SANITIZER_SOURCE_ONLY' and
            impl_review['executionAuthorization'] is False and impl_review['concreteFindings'] == [] and
            impl_review['sourceManifest'] == config['inputs']['implementationManifest'] and
            impl_review['correctedSource'] == config['inputs']['correctedRunner'] and
            impl_manifest['files']['runner.py'] == config['inputs']['correctedRunner'], 'IMPLEMENTATION_REVIEW')
    authenticate(grant['git'])
    authenticate(grant['python'])
    require(Path(sys.executable).resolve() == Path(grant['python']['path']), 'PHYSICAL_PYTHON')
    root = Path(grant['outputPath'])
    require(root.is_absolute() and root.parent.resolve(strict=True) == root.parent and
            SCRATCH in root.parents and not os.path.lexists(root), 'FRESH_DISPOSABLE_OUTPUT')
    require(root == Path(config['outputPath']), 'OUTPUT_BINDING')
    START = time.monotonic()
    root.mkdir()
    (root / 'empty-hooks').mkdir()
    (root / 'empty-template').mkdir()
    original = config['inputs']['originalRunner']
    corrected = config['inputs']['correctedRunner']
    matrix = load(HERE / 'MATRIX.json')
    rows = []
    def passed(case_id):
        want = matrix['cases'][len(rows)]
        require(want['id'] == case_id, 'CASE_ORDER')
        rows.append(dict(want, verdict='ACCEPT_SPECIFIC_REFUSAL' if want['expected'] == 'RED'
                         else 'ACCEPT_POSITIVE'))
    base = os.environ.copy()
    injected = dict(base, GIT_OPTIONAL_LOCKS='0', GIT_INDEX_FILE='/unusable/control-index',
                    GIT_CONFIG='/unusable/control-config', GIT_CONFIG_GLOBAL='/unusable/control-global',
                    GIT_CONFIG_SYSTEM='/unusable/control-system', GIT_CONFIG_COUNT='1',
                    GIT_CONFIG_KEY_0='core.worktree', GIT_CONFIG_VALUE_0='/unusable/worktree',
                    GIT_OBJECT_DIRECTORY='/unusable/control-objects', GIT_ALTERNATE_OBJECT_DIRECTORIES='/unusable/alternate',
                    GIT_DIR='/unusable/git-dir', GIT_WORK_TREE='/unusable/worktree')
    setup = actual_function(corrected, dict(injected))()
    old_env = actual_function(original, dict(injected))()
    require('GIT_OPTIONAL_LOCKS' not in old_env, 'ORIGINAL_DEFECT_NOT_PRESENT')
    red = fixture(root, 'original', grant['git'], setup, old_env)
    require(red['indexBefore']['file']['sha256'] != red['indexAfter']['file']['sha256'],
            'ORIGINAL_INDEX_REFRESH_NOT_OBSERVED')
    passed('original_sanitizer_stale_index_refresh')
    green_env = actual_function(corrected, dict(injected))()
    green = fixture(root, 'corrected', grant['git'], setup, green_env)
    require(green_env['GIT_OPTIONAL_LOCKS'] == '0' and green['indexBefore'] == green['indexAfter'],
            'CORRECTED_INDEX_NOT_PRESERVED')
    passed('corrected_sanitizer_preserves_full_index')
    absent = {k: v for k, v in base.items() if not k.startswith('GIT_')}
    require(actual_function(corrected, absent)()['GIT_OPTIONAL_LOCKS'] == '0', 'ABSENT_OPTIONAL_NOT_FORCED')
    passed('absent_optional_locks_forced_zero')
    for conflict in ('1', '', 'false'):
        require(actual_function(corrected, dict(absent, GIT_OPTIONAL_LOCKS=conflict))()['GIT_OPTIONAL_LOCKS'] == '0',
                'CONFLICTING_OPTIONAL_NOT_FORCED')
    passed('conflicting_optional_locks_forced_zero')
    require({k for k in green_env if k.startswith('GIT_')} == {'GIT_OPTIONAL_LOCKS'}, 'OTHER_GIT_VARIABLE_LEAK')
    passed('other_inherited_git_variables_removed')
    require({k:v for k,v in green_env.items() if not k.startswith('GIT_')} ==
            {k:v for k,v in injected.items() if not k.startswith('GIT_')}, 'ORDINARY_ENV_CHANGED')
    passed('ordinary_environment_including_home_preserved')
    original_input = dict(injected)
    func = actual_function(corrected, original_input)
    first, second = func(), func()
    require(original_input == injected and first is not original_input and first is not second,
            'INPUT_MUTATION_OR_DICTIONARY_ALIAS')
    first['GIT_OPTIONAL_LOCKS'] = '1'
    require(second['GIT_OPTIONAL_LOCKS'] == '0' and original_input == injected, 'FRESH_COPY_ALIAS')
    passed('input_environment_unchanged_and_fresh_copies')
    require(not any(k.startswith('GIT_') for k in old_env), 'ORIGINAL_OTHER_VARIABLE_LEAK')
    passed('original_other_git_variables_still_removed')
    require(len(rows) == matrix['caseCount'] == 8 and matrix['positiveCount'] == 7 and
            matrix['specificNegativeCount'] == 1, 'ROSTER_COUNTS')
    for expected in list(config['inputs'].values()) + list(manifest['files'].values()) + [grant['git'],grant['python']]:
        authenticate(expected)
    report = {'schema':'1370-git-optional-locks-regression-controls-result/v1',
              'status':'DISPOSABLE_GIT_OPTIONAL_LOCKS_CONTROLS_COMPLETE_UNADOPTED',
              'sourceManifest':grant['sourceManifest'], 'sourceReview':grant['sourceReview'],
              'grant':grant_role, 'inputs':config['inputs'], 'git':grant['git'], 'python':grant['python'],
              'caseCount':8, 'positiveCount':7, 'specificNegativeCount':1, 'results':rows,
              'originalFixture':red, 'correctedFixture':green, 'commands':COMMANDS,
              'bounds':config['bounds'], 'elapsedSeconds':time.monotonic()-START,
              'workerPid':os.getpid(), 'workerPgid':os.getpgrp(), 'workerSid':os.getsid(0),
              'executionAuthorization':False, 'protectedProjectGitReadOrWritten':False,
              'original54871CauseIdentified':False, 'diagnostic96592SpecificLeafIdentified':False,
              'disposableFixtureDisposition':'LOCAL_HASH_SIZE_ONLY_REBUILDABLE_GIT_FIXTURES'}
    data = (json.dumps(report,indent=2,sort_keys=True)+'\n').encode()
    require(len(data) <= RESULT_CAP, 'RESULT_CAP')
    with (root/'RESULT.json').open('xb') as stream:
        stream.write(data);stream.flush();os.fsync(stream.fileno())
    (root/'RESULT.json').chmod(0o444)
    print(json.dumps({'result':role(root/'RESULT.json'),'caseCount':8,'status':report['status']}))
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
