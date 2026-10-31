from pathlib import Path
import datetime, hashlib, json, re, shlex, subprocess, sys

R = Path('/Users/zacheryspector/The-Movies-headless-program')
A = Path('/Users/zacheryspector/studio-scratch/1370-astra-takeover-20261012')
NATIVE = {'make', 'gmake', 'clang', 'clang++', 'gcc', 'g++', 'cc', 'c++',
          'cc1', 'cc1plus', 'ld', 'ld64', 'lld', 'ld.lld', 'swift', 'swiftc',
          'swift-frontend', 'rustc', 'cargo', 'cmake', 'ninja', 'xcodebuild',
          'javac', 'ant', 'mvn', 'gradle', 'gradlew'}

def intensive(executable, arguments):
    name = Path(executable).name
    if name == 'node' and any(token in arguments for token in ('vitest', '/bin/tsc', '/lib/tsc.js', 'DIAGNOSTIC.ts')):
        return True
    if name in NATIVE or re.fullmatch(r'(?:clang(?:\+\+)?|gcc|g\+\+)-\d+(?:\.\d+)*', name):
        return True
    if name == 'java':
        try:
            tokens = shlex.split(arguments)
        except ValueError:
            return True  # An unparseable Java invocation cannot establish a free lane.
        return any(t.startswith(('com.sun.tools.javac.', 'jdk.compiler/', 'org.gradle.launcher.', 'org.apache.maven.', 'org.codehaus.plexus.classworlds.launcher.', 'org.apache.tools.ant.', 'ghidra.app.util.headless.')) for t in tokens)
    return False

def main():
    runner, receipt = map(Path, sys.argv[1:])
    assert runner.is_file() and not runner.is_symlink()
    lock = A.parent/'HEAVY-LANE-LOCK'
    assert not receipt.exists() and not receipt.is_symlink()
    assert not lock.exists() and not lock.is_symlink()
    def read(*args):
        return subprocess.check_output(args, text=True)
    free = int(read('df', '-Pk', str(R)).splitlines()[1].split()[3])
    power = read('pmset', '-g', 'batt')
    # Keep executable names separate from argv: spaces in an application path
    # and ps column truncation must not hide a compiler or create a self-match.
    commands = read('ps', '-ww', '-axo', 'pid=,comm=')
    processes = read('ps', '-ww', '-axo', 'pid=,ppid=,args=')
    by_pid = {}
    for line in processes.splitlines():
        fields = line.split(None, 2)
        if len(fields) == 3:
            by_pid[fields[0]] = (fields[2], line)
    heavy = []
    for line in commands.splitlines():
        fields = line.split(None, 1)
        if len(fields) != 2:
            continue
        pid, executable = fields
        arguments, detail = by_pid.get(pid, ('', line))
        if intensive(executable, arguments):
            heavy.append(detail)
    paths = [runner, runner.parent/'SELECTION.json', A/'p15b-auto-recorder-r4r2-draft/auto_freeze.py', A/'p15b-d16-ui-r5-draft/RUNTIME-INPUTS.json', A.parent/'1370-c0-stage41-heavy-lane-recovery-proposal-r8/lane-run-r8.sh', Path(__file__)]
    pins = {str(p): hashlib.sha256(p.read_bytes()).hexdigest() for p in paths}
    allowed = free >= 3670016 and 'AC Power' in power and not heavy
    r = dict(at=datetime.datetime.now().astimezone().isoformat(), freeKiB=free, launchMinimumKiB=3670016, runtimeFloorKiB=3145728, powerLOCAL=power, memoryLOCAL=read('memory_pressure', '-Q'), swapLOCAL=read('sysctl', 'vm.swapusage'), loadLOCAL=read('sysctl', 'vm.loadavg'), processInventoryLOCAL=processes, executableInventoryLOCAL=commands, heavyLOCAL=heavy, pins=pins, laneAbsent=True, launchAllowed=allowed)
    with receipt.open('x') as f:
        json.dump(r, f, indent=2)
        f.write('\n')
    print(json.dumps(dict(freeKiB=free, launchAllowed=allowed, competingHeavy=len(heavy), pins=pins)))
    assert allowed

if __name__ == '__main__':
    main()
