import base64
import importlib.util
import json
import os
from pathlib import Path
import subprocess
import tempfile
import unittest

HERE = Path(__file__).resolve().parent
spec = importlib.util.spec_from_file_location('witness_supervisor', HERE / 'supervise.py')
supervisor = importlib.util.module_from_spec(spec)
spec.loader.exec_module(supervisor)


class SyntheticRouteTests(unittest.TestCase):
    def test_frame_validation_and_digest_stop(self):
        rows = [{'row': n} for n in range(44)]
        preimage = json.dumps(rows, separators=(',', ':')).encode()
        expected = {**supervisor.EXPECTED, 'employment': supervisor.sha(preimage)}
        old = supervisor.EXPECTED
        supervisor.EXPECTED = expected
        try:
            quote = {'index': 0, 'committedAge': 44, 'row': {'terms': {
                'talentId': 'person-studio-aca408ec-r01-0',
                'annualSalary': 395548, 'signingBonus': 71199}}}
            observer = {name: 'a' * 64 for name in supervisor.OBSERVER_FILES}
            runtime = {name: 'b' * 64 for name in supervisor.RUNTIME_FILES}
            worktree = {name: 'e' * 64 for name in supervisor.BLOB_PINS}
            amendment = dict(supervisor.BOUNDS)
            adoption = dict(supervisor.ADOPTION)
            profile = {'observerSha256': observer, 'runtimeSha256': runtime,
                       'worktreeSha256': worktree,
                       'boundsAmendment': amendment, 'parentBoundsAdoption': adoption,
                       'nodeVersion': 'v22.0.0',
                       'nodeExecPath': '/opt/node'}
            guard = {'head': supervisor.SOURCE, 'blobs': supervisor.BLOB_PINS,
                     'worktreeSha256': worktree,
                     'observer': observer, 'runtime': runtime,
                     'amendments': [{'kind': 'bounds', 'amendmentSha256': amendment['sha256'],
                                     'reviewSha256': amendment['reviewSha256'],
                                     'adoptionSha256': adoption['sha256']}],
                     'node': profile['nodeVersion'], 'execPath': profile['nodeExecPath']}
            frame = {'status': 'MATCHED_AGING_ERA_PREIMAGE_CANDIDATE',
                     'protocol': supervisor.PROTOCOL, 'sourceSha': supervisor.SOURCE,
                     'seed': 'p13a-core-causal-01', 'weeks': 416, 'digests': expected,
                     'employmentRows': 44, 'employmentBytes': len(preimage),
                     'preimageBase64': base64.b64encode(preimage).decode(),
                     'preflight': guard, 'postflight': guard, 'finalflight': guard,
                     'sourceBlobs': supervisor.BLOB_PINS, 'worktreeSha256': worktree,
                     'boundsAmendment': amendment, 'parentBoundsAdoption': adoption,
                     'node': profile['nodeVersion'],
                     'firstQuote': quote}
            payload = {'schema':'1370-a208-selected16-snapshot-r1','phase':'after-natural-tick208-return','week':208,
                       'seed':'p13a-core-causal-01','rows':[{} for _ in range(16)],'pricingHelpersCalled':0,
                       'extraRngCalls':0,'premiumAttribution':False,'floorAttribution':False}
            payloadraw = (json.dumps(payload, separators=(',', ':'))+'\n').encode()
            frame.update(settlement208Base64=base64.b64encode(payloadraw).decode(),settlement208Bytes=len(payloadraw),
                         settlement208Rows=16,settlement208Sha256=supervisor.sha(payloadraw))
            raw = (json.dumps(frame, separators=(',', ':')) + '\n').encode()
            self.assertEqual(supervisor.validate_frame(raw, profile)['employmentRows'], 44)
            frame['preflight'] = {'head': supervisor.SOURCE}
            frame['postflight'] = frame['preflight']
            frame['finalflight'] = frame['preflight']
            with self.assertRaisesRegex(RuntimeError, 'STOP_FRAME_VALIDATION'):
                supervisor.validate_frame((json.dumps(frame) + '\n').encode(), profile)
            frame['preflight'] = guard
            frame['postflight'] = guard
            frame['finalflight'] = guard
            frame['worktreeSha256'] = {**worktree, 'src/core/aging.ts': '0' * 64}
            with self.assertRaisesRegex(RuntimeError, 'STOP_FRAME_VALIDATION'):
                supervisor.validate_frame((json.dumps(frame) + '\n').encode(), profile)
            frame['worktreeSha256'] = worktree
            frame['preflight'] = {**guard, 'runtime': {**runtime, 'package.json': '0' * 64}}
            with self.assertRaisesRegex(RuntimeError, 'STOP_FRAME_VALIDATION'):
                supervisor.validate_frame((json.dumps(frame) + '\n').encode(), profile)
            frame['preflight'] = guard
            frame['preimageBase64'] = base64.b64encode(preimage + b' ').decode()
            with self.assertRaisesRegex(RuntimeError, 'STOP_FRAME_VALIDATION'):
                supervisor.validate_frame((json.dumps(frame) + '\n').encode(), profile)
        finally:
            supervisor.EXPECTED = old

    def test_source_review_required_and_exact(self):
        with tempfile.TemporaryDirectory(prefix='witness-r4-review-', dir=HERE) as temp:
            root = Path(temp)
            files = {}
            for name in supervisor.SOURCE_FILES:
                data = (HERE / name).read_bytes()
                (root / name).write_bytes(data)
                files[name] = {'sha256': supervisor.sha(data), 'bytes': len(data)}
            manifest = {'status': 'FROZEN_UNRUN_UNLAUNCHABLE_SOURCE_REVIEW_REQUIRED',
                        'sourceSha': supervisor.SOURCE, 'protocol': supervisor.PROTOCOL,
                        'files': files}
            manifest_bytes = (json.dumps(manifest, indent=2) + '\n').encode()
            (root / 'SOURCE-PINS.json').write_bytes(manifest_bytes)
            receipt = {'schema': '1370-c0-aging-era-settlement208-witness-independent-static-review-r1',
                       'status': 'FROZEN_SOURCE_ONLY_UNRUN', 'sourceDirectory': str(root),
                       'sourcePinsSha256': supervisor.sha(manifest_bytes),
                       'sourceSha': supervisor.SOURCE,
                       'decision': {'witnessSource': 'ACCEPT_SOURCE_ONLY_UNRUN',
                                    'launch': 'STOP_UNFILLED_UNRUN'},
                       'frozenHashes': {name: item['sha256'] for name, item in files.items()}}
            receipt_path = root / 'review.json'
            receipt_bytes = (json.dumps(receipt, indent=2) + '\n').encode()
            receipt_path.write_bytes(receipt_bytes)
            profile = {'observerSha256': {name: files[name]['sha256'] for name in supervisor.OBSERVER_FILES}}
            with self.assertRaisesRegex(RuntimeError, 'STOP_SOURCE_REVIEW_UNFILLED'):
                supervisor.validate_source_review(profile, root)
            profile['independentSourceReviewReceipt'] = {'path': str(receipt_path),
                                                         'sha256': supervisor.sha(receipt_bytes)}
            self.assertEqual(supervisor.validate_source_review(profile, root), receipt)
            receipt['decision']['witnessSource'] = 'REFINE_SOURCE_ONLY_UNRUN'
            altered = (json.dumps(receipt, indent=2) + '\n').encode()
            receipt_path.write_bytes(altered)
            with self.assertRaisesRegex(RuntimeError, 'STOP_SOURCE_REVIEW_PIN'):
                supervisor.validate_source_review(profile, root)
            profile['independentSourceReviewReceipt']['sha256'] = supervisor.sha(altered)
            with self.assertRaisesRegex(RuntimeError, 'STOP_SOURCE_REVIEW_ROLE'):
                supervisor.validate_source_review(profile, root)

    def test_preflight_is_within_whole_recorder_clock(self):
        supervisor.require_launch_window(100, 100 + supervisor.CHILD_STOP_SECONDS - 0.001)
        with self.assertRaisesRegex(RuntimeError, 'STOP_PREFLIGHT_DEADLINE'):
            supervisor.require_launch_window(100, 100 + supervisor.CHILD_STOP_SECONDS)

    def test_exact_external_bounds_roles_and_path_substitution(self):
        profile = {'boundsAmendment': dict(supervisor.BOUNDS),
                   'parentBoundsAdoption': dict(supervisor.ADOPTION)}
        self.assertEqual(supervisor.validate_bounds_roles(profile)['adoptionSha256'],
                         supervisor.ADOPTION['sha256'])
        profile['boundsAmendment']['reviewPath'] = supervisor.BOUNDS['path']
        with self.assertRaisesRegex(RuntimeError, 'STOP_BOUNDS_BINDING_PATH'):
            supervisor.validate_bounds_roles(profile)
        profile['boundsAmendment'] = dict(supervisor.BOUNDS)
        profile['parentBoundsAdoption']['path'] = supervisor.BOUNDS['reviewPath']
        with self.assertRaisesRegex(RuntimeError, 'STOP_BOUNDS_BINDING_PATH'):
            supervisor.validate_bounds_roles(profile)

    def test_sandbox_stdout_denied_write_and_moved_parent_fd_closed(self):
        with tempfile.TemporaryDirectory(prefix='witness-r3-canary-', dir=HERE) as temp:
            root = Path(temp)
            allowed = root / 'allowed'
            protected = root / 'protected'
            allowed.mkdir()
            protected.mkdir()
            policy = str(HERE / 'POLICY.sb')
            pipe = subprocess.run(['/usr/bin/sandbox-exec', '-f', policy, '/bin/echo', 'PIPE_OK'],
                                  capture_output=True, check=True)
            self.assertEqual(pipe.stdout, b'PIPE_OK\n')
            fd_probe = subprocess.run(['/usr/bin/sandbox-exec', '-f', policy,
                                       '/usr/local/bin/python3', '-B', '-c',
                                       'import os,stat,fcntl; print([(fd,os.readlink("/dev/fd/"+str(fd))) for fd in range(3,128) if os.path.exists("/dev/fd/"+str(fd)) and stat.S_ISREG(os.fstat(fd).st_mode) and (fcntl.fcntl(fd,fcntl.F_GETFL)&os.O_ACCMODE)!=os.O_RDONLY])'],
                                      capture_output=True, check=True, close_fds=True)
            self.assertEqual(fd_probe.stdout, b'[]\n')
            target = protected / 'denied'
            denied = subprocess.run(['/usr/bin/sandbox-exec', '-f', policy, '/bin/sh', '-c',
                                     'printf forbidden > "$1"', 'sh', str(target)],
                                    capture_output=True)
            self.assertNotEqual(denied.returncode, 0)
            self.assertFalse(target.exists())
            movable = allowed / 'movable'
            movable.mkdir()
            fd = os.open(movable / 'held', os.O_WRONLY | os.O_CREAT | os.O_EXCL, 0o600)
            try:
                moved = protected / 'moved'
                os.rename(movable, moved)
                # The supervisor's child configuration has close_fds=True and no pass_fds.
                # Even a parent-held descriptor to a moved directory cannot reach the child.
                probe = subprocess.run(['/usr/bin/sandbox-exec', '-f', policy, '/bin/sh', '-c',
                                        'printf escaped >&3'], capture_output=True, close_fds=True)
                self.assertNotEqual(probe.returncode, 0)
                self.assertEqual((moved / 'held').read_bytes(), b'')
            finally:
                os.close(fd)


if __name__ == '__main__':
    unittest.main()
