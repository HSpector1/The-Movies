#!/usr/bin/env python3
"""Unrun source proposal: create a final sandbox profile inside inline bootstrap sandbox."""
import hashlib
import json
import os
from pathlib import Path
import stat
import sys

from canary import bounded_group_child
from profile import build, held_chain, recheck, scheme

HERE = Path(__file__).resolve().parent
SANDBOX = Path('/usr/bin/sandbox-exec')
POLICY_CAP = 16 * 1024
PROFILE_CAP = 16 * 1024

def sha(data): return hashlib.sha256(data).hexdigest()

def file_bytes(path, cap):
    p = Path(path)
    parent_fd, _ = held_chain(p.parent)
    try:
        fd = os.open(p.name, os.O_RDONLY | os.O_NOFOLLOW, dir_fd=parent_fd)
        try:
            st = os.fstat(fd)
            if not stat.S_ISREG(st.st_mode) or st.st_nlink != 1 or st.st_size > cap:
                raise ValueError(f'file identity/cap mismatch: {p}')
            data = os.read(fd, cap + 1)
            if len(data) != st.st_size:
                raise ValueError(f'file changed during read: {p}')
            return data
        finally: os.close(fd)
    finally: os.close(parent_fd)

def protected_paths(binding):
    profile_spec = binding['profileBinding']
    built = build(profile_spec)
    receipt_map = binding['immutableReceiptSha256']
    receipts = profile_spec.get('protectedReceiptPaths') or []
    if sorted(receipts) != sorted(receipt_map):
        raise ValueError('protected receipt set differs from hashed receipt set')
    if profile_spec['mode'] == 'real' and not receipts:
        raise ValueError('real bootstrap missing immutable receipts')
    for path, digest in receipt_map.items():
        if sha(file_bytes(path, 16 * 1024 * 1024)) != digest:
            raise ValueError(f'protected receipt drift: {path}')
    return sorted(set([*built['protected'], profile_spec['experimentParent'], built['canary']]))

def policy(binding):
    if binding['sandboxExecutable'] != str(SANDBOX):
        raise ValueError('sandbox executable mismatch')
    profile_path = Path(binding['profilePath'])
    if profile_path.exists() or profile_path.is_symlink():
        raise ValueError('one-shot final profile already exists')
    parent_fd, parent_chain = held_chain(profile_path.parent)
    try:
        guard = protected_paths(binding)
        for item in guard:
            fd, chain = held_chain(item)
            try:
                if chain[-1] in parent_chain or parent_chain[-1] in chain:
                    raise ValueError('profile parent overlaps protected source')
            finally: os.close(fd)
        recheck(profile_path.parent, parent_fd, parent_chain[-1])
    finally: os.close(parent_fd)
    lines = ['(version 1)', '(deny default)', '(allow process*)',
             '(allow file-read*)', '(allow mach-lookup)']
    for item in guard:
        lines.append(f'(deny file-write* (subpath {scheme(item)}))')
    lines.append(f'(allow file-write* (subpath {scheme(profile_path.parent)}))')
    text = '\n'.join(lines) + '\n'
    if len(text.encode()) > POLICY_CAP:
        raise ValueError('inline bootstrap policy exceeds 16 KiB cap')
    return {'text': text, 'sha256': sha(text.encode()), 'protected': guard,
            'allowedOutputParent': str(profile_path.parent)}

def command(binding, binding_path, inline_policy):
    return [str(SANDBOX), '-p', inline_policy,
            binding['pythonExecutable'], '-B', str(HERE / 'generate_profile.py'), str(binding_path)]

def run(binding_path):
    binding_path = Path(binding_path)
    binding = json.loads(file_bytes(binding_path, 1024 * 1024))
    if sha(file_bytes(SANDBOX, 16 * 1024 * 1024)) != binding['sandboxExecutableSha256']:
        raise ValueError('sandbox executable SHA drift')
    if sha(file_bytes(binding['pythonExecutable'], 64 * 1024 * 1024)) != binding['pythonExecutableSha256']:
        raise ValueError('Python executable SHA drift')
    for name in ('profile.py', 'generate_profile.py', 'canary.py', 'bootstrap.py'):
        if sha(file_bytes(HERE / name, 1024 * 1024)) != binding['sourceSha256'][name]:
            raise ValueError(f'source SHA drift: {name}')
    rendered = policy(binding)
    if rendered['sha256'] != binding['bootstrapPolicySha256']:
        raise ValueError('bootstrap policy SHA drift')
    parent_fd, parent_chain = held_chain(Path(binding['profilePath']).parent)
    try:
        recheck(Path(binding['profilePath']).parent, parent_fd, parent_chain[-1])
    finally: os.close(parent_fd)
    argv = command(binding, binding_path, rendered['text'])
    env = {k: v for k, v in os.environ.items() if not k.startswith('GIT_')}
    env['PYTHONDONTWRITEBYTECODE'] = '1'
    env['H_BOOTSTRAP_POLICY_SHA'] = rendered['sha256']
    out, err, code = bounded_group_child(argv, env, str(binding_path.parent), timeout=12, cap=8192)
    if code or err:
        raise RuntimeError('STOP_BOOTSTRAP child exit/stderr')
    child = json.loads(out)
    if child.get('status') != 'PROFILE_CREATED_UNDER_BOOTSTRAP' or \
       child.get('policySha256') != rendered['sha256']:
        raise RuntimeError('STOP_BOOTSTRAP child attestation mismatch')
    expected = build(binding['profileBinding'])
    if child.get('profileSha256') != expected['sha256']:
        raise RuntimeError('STOP_BOOTSTRAP child profile SHA mismatch')
    final_bytes = file_bytes(binding['profilePath'], PROFILE_CAP)
    if final_bytes != expected['text'].encode() or sha(final_bytes) != expected['sha256']:
        raise RuntimeError('STOP_BOOTSTRAP final profile readback mismatch')
    parent_fd, post_chain = held_chain(Path(binding['profilePath']).parent)
    try:
        if post_chain != parent_chain:
            raise RuntimeError('STOP_BOOTSTRAP profile parent moved')
        recheck(Path(binding['profilePath']).parent, parent_fd, parent_chain[-1])
    finally: os.close(parent_fd)
    if protected_paths(binding) != rendered['protected']:
        raise RuntimeError('STOP_BOOTSTRAP protected set drift')
    for name in ('profile.py', 'generate_profile.py', 'canary.py', 'bootstrap.py'):
        if sha(file_bytes(HERE / name, 1024 * 1024)) != binding['sourceSha256'][name]:
            raise RuntimeError(f'STOP_BOOTSTRAP source drift: {name}')
    # The preceding child used the only one-shot final output path. No unsandboxed retry.
    return {'status': 'BOOTSTRAP_PROFILE_SOURCE_OBSERVED_ONLY',
            'bootstrapPolicySha256': rendered['sha256'], 'finalProfileSha256': expected['sha256'],
            'argvShape': [argv[0], argv[1], '<inline-policy>', *argv[3:]],
            'child': child, 'stdoutBytes': len(out), 'stderrBytes': len(err)}

if __name__ == '__main__':
    if len(sys.argv) != 2: raise SystemExit('usage: bootstrap.py <filled-binding.json>')
    print(json.dumps(run(sys.argv[1]), sort_keys=True))
