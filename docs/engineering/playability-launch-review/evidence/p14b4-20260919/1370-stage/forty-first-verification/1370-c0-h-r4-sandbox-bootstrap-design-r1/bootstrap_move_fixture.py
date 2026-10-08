#!/usr/bin/env python3
"""Disposable macOS sandbox-exec held-FD move fixture; never touches game paths."""
import json
import os
from pathlib import Path
import select
import signal
import subprocess
import sys
import tempfile

CHILD = '''import json,os,sys
parent=sys.argv[1]
fd=os.open(parent,os.O_RDONLY|os.O_DIRECTORY|os.O_NOFOLLOW)
print("READY",flush=True)
sys.stdin.readline()
try:
    out=os.open("profile.sb",os.O_CREAT|os.O_EXCL|os.O_WRONLY|os.O_NOFOLLOW,0o600,dir_fd=fd)
except OSError as e:
    print(json.dumps({"write":"DENIED","errno":e.errno}),flush=True)
else:
    os.write(out,b"synthetic only\\n");os.close(out)
    print(json.dumps({"write":"ALLOWED"}),flush=True)
os.close(fd)
'''

def attempt(base, move):
    protected = base / 'protected'; protected.mkdir()
    output = base / 'output'; output.mkdir()
    child = base / 'child.py'; child.write_text(CHILD)
    # A bootstrap generator policy allows only this original output directory.
    # The exact protected stand-in remains denied after a parent rename.
    policy = ('(version 1)\n(deny default)\n(allow process*)\n'
              '(allow file-read*)\n(allow mach-lookup)\n'
              f'(deny file-write* (subpath {json.dumps(str(protected))}))\n'
              f'(allow file-write* (subpath {json.dumps(str(output))}))\n')
    env = dict(os.environ); env['PYTHONDONTWRITEBYTECODE'] = '1'
    proc = subprocess.Popen(['/usr/bin/sandbox-exec','-p',policy,sys.executable,
                             '-B',str(child),str(output)],cwd=base,env=env,
                            stdin=subprocess.PIPE,stdout=subprocess.PIPE,stderr=subprocess.PIPE,
                            text=True,start_new_session=True)
    try:
        assert select.select([proc.stdout],[],[],5)[0], 'child not ready'
        assert proc.stdout.readline().strip() == 'READY'
        if move:
            output.rename(protected / 'moved-output')
        proc.stdin.write('go\n'); proc.stdin.flush()
        line = proc.stdout.readline()
        result = json.loads(line)
        proc.wait(timeout=5)
        result['exit'] = proc.returncode
        result['protectedFileExists'] = (protected / 'moved-output' / 'profile.sb').exists()
        result['originalFileExists'] = (output / 'profile.sb').exists()
        return result
    finally:
        if proc.poll() is None:
            try: os.killpg(proc.pid, signal.SIGKILL)
            except ProcessLookupError: pass
        proc.wait(timeout=5)
        for stream in (proc.stdin,proc.stdout,proc.stderr): stream.close()

with tempfile.TemporaryDirectory(prefix='bootstrap-move-',dir=Path(__file__).parent) as name:
    root=Path(name)
    baseline=root/'baseline'; baseline.mkdir()
    moved=root/'moved'; moved.mkdir()
    ordinary=attempt(baseline,False)
    swapped=attempt(moved,True)
    print(json.dumps({'status':'SCRATCH_BOOTSTRAP_MOVE_OBSERVED',
                      'ordinary':ordinary,'swapped':swapped},indent=2,sort_keys=True))
    assert ordinary['write']=='ALLOWED' and ordinary['originalFileExists']
    assert swapped['write']=='DENIED' and not swapped['protectedFileExists']
