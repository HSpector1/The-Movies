#!/usr/bin/env python3
"""Disposable stand-in worker for manifest openat and /bin/cp descendant probes."""
import json
import os
from pathlib import Path
import subprocess
import sys

mode, output, source = sys.argv[1:4]
output = Path(output)
if mode == 'manifest':
    held = os.open(output, os.O_RDONLY | os.O_DIRECTORY | os.O_NOFOLLOW)
else:
    held = None
print('READY', flush=True)
sys.stdin.readline()
try:
    if mode == 'manifest':
        fd = os.open('manifest.json', os.O_CREAT | os.O_EXCL | os.O_WRONLY | os.O_NOFOLLOW,
                     0o600, dir_fd=held)
        os.write(fd, b'fixture manifest only\n'); os.close(fd)
    elif mode in ('cp', 'cp-create'):
        if mode == 'cp-create': output.mkdir()
        subprocess.run(['/bin/cp', '-cRpP', source, str(output / 'copied.txt')], check=True,
                       timeout=5)
    else:
        raise ValueError('bad fixture mode')
except (OSError, subprocess.CalledProcessError) as error:
    print(json.dumps({'write': 'DENIED', 'error': repr(error)}), flush=True)
else:
    print(json.dumps({'write': 'ALLOWED'}), flush=True)
finally:
    if held is not None: os.close(held)
