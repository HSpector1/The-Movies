#!/usr/bin/env python3
"""UNRUN focused proposal tests. Only the unfilled real route may be launched.

Filled cases launch the external sink alone; pipeline acceptance cases use mock
producer/consumer processes and preserve the actual shell PIPESTATUS suffix.
No historical root, game import, sandbox executable, or heavy lane is used.
"""
import hashlib
import json
import shlex
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path

PROPOSAL = Path('/Users/zacheryspector/studio-scratch/1370-c0-aging-era-witness-r7-readiness-20261008-r1')
LIVE_CWD = '/Users/zacheryspector/The-Movies-headless-program'
SCRATCH = '/Users/zacheryspector/studio-scratch'
LAUNCH_SHA = '38f8bddc4aef317b4e83fe6e19e547b338bd3cd4fe0d86856f6a11e2b03fda50'
SINK_SHA = '6a7a91d482ddaf80c8ecb6fd0d1912da7add50917102178845a6fa37db675b9e'
ORIGINAL_PIPELINE = ('"$witness_python" -B "$witness_source/outer-recorder.py" "$witness_binding" | '
                     '"$witness_python" -B "$witness_sink" "$witness_binding" "$witness_binding_sha"')


def sha(data):
    return hashlib.sha256(data).hexdigest()


def checked_source(name, expected):
    data = (PROPOSAL / name).read_bytes()
    if sha(data) != expected:
        raise RuntimeError('STOP_TEST_PROPOSAL_PIN')
    return data


def completed(argv, data=b''):
    # Every case has reviewed bounded output and short no-game work.
    return subprocess.run(argv, input=data, stdout=subprocess.PIPE,
                          stderr=subprocess.PIPE, cwd=LIVE_CWD, timeout=15,
                          check=False)


class LaunchRefusals(unittest.TestCase):
    def setUp(self):
        self.launch = checked_source('launch-pipeline.sh', LAUNCH_SHA).decode()
        checked_source('bounded-sink.py', SINK_SHA)

    def test_direct_unfilled_pipeline_refuses_before_sandbox(self):
        binding = PROPOSAL / 'BINDING-TEMPLATE-UNFILLED.json'
        profile = json.loads(binding.read_bytes())
        self.assertEqual(profile['status'], 'UNFILLED_UNRUN')
        self.assertIsNone(profile['repoRoot'])
        result = completed(['/bin/bash', str(PROPOSAL / 'launch-pipeline.sh'),
                            str(binding), sha(binding.read_bytes())])
        self.assertEqual(result.returncode, 2)
        self.assertEqual(result.stdout, b'')
        messages = [json.loads(line) for line in result.stderr.splitlines()]
        statuses = [message['status'] for message in messages]
        self.assertCountEqual(statuses, ['STOP_SINK_BINDING_UNFILLED',
                                        'STOP_SUPERVISOR_EXIT_2',
                                        'PIPELINE_EXITS_CANDIDATE'])
        self.assertEqual(messages[-1], {'status': 'PIPELINE_EXITS_CANDIDATE',
                                       'outerExit': 2, 'sinkExit': 2})
        # The frozen supervise.main checks status before resolving null repoRoot
        # and before sandbox Popen. The outer suppresses the failed supervisor's
        # buffered stderr and reports its actual exit; the next case observes
        # the specific supervisor refusal independently.

    def test_direct_unfilled_supervisor_refuses_before_sandbox(self):
        binding = PROPOSAL / 'BINDING-TEMPLATE-UNFILLED.json'
        source = '/Users/zacheryspector/studio-scratch/1370-c0-aging-era-employment-witness-source-r7/supervise.py'
        result = completed([sys.executable, '-B', source, str(binding)])
        self.assertEqual(result.returncode, 2)
        self.assertEqual(result.stdout, b'')
        self.assertEqual(json.loads(result.stderr), {'status': 'STOP_UNFILLED'})

    def mock_pipeline(self, outer_exit, sink_exit):
        self.assertEqual(self.launch.count(ORIGINAL_PIPELINE), 1)
        with tempfile.TemporaryDirectory(prefix='witness-r7-pipeline-test-', dir=SCRATCH) as work:
            root = Path(work)
            outer = root / 'mock-outer.py'
            sink = root / 'mock-sink.py'
            outer.write_text('import sys\nsys.stdout.buffer.write(b"mock-candidate\\n")\n'
                             f'raise SystemExit({outer_exit})\n')
            sink.write_text('import sys\nraw=sys.stdin.buffer.read()\n'
                            'assert raw == b"mock-candidate\\n"\n'
                            f'if {sink_exit} == 0: sys.stdout.buffer.write(raw)\n'
                            f'raise SystemExit({sink_exit})\n')
            pipeline = (f'{shlex.quote(sys.executable)} -B {shlex.quote(str(outer))} | '
                        f'{shlex.quote(sys.executable)} -B {shlex.quote(str(sink))}')
            # Only the producer/consumer line changes. The exact original immediate
            # PIPESTATUS capture, marker and success/refusal suffix are exercised.
            mock = root / 'mock-launch.sh'
            mock.write_text(self.launch.replace(ORIGINAL_PIPELINE, pipeline))
            result = completed(['/bin/bash', str(mock), 'unused-binding', 'unused-sha'])
        marker = {'status': 'PIPELINE_EXITS_CANDIDATE',
                  'outerExit': outer_exit, 'sinkExit': sink_exit}
        self.assertEqual(result.stderr, (json.dumps(marker, separators=(',', ':')) + '\n').encode())
        self.assertEqual(result.stdout, b'mock-candidate\n' if sink_exit == 0 else b'')
        self.assertEqual(result.returncode, 0 if outer_exit == sink_exit == 0 else 2)

    def test_outer_fails_despite_sink_pass(self):
        self.mock_pipeline(17, 0)

    def test_sink_fails_despite_outer_pass(self):
        self.mock_pipeline(0, 23)

    def test_both_zero_exact_marker(self):
        self.mock_pipeline(0, 0)

    def run_sink(self, raw, wrong_pin=False):
        profile = json.loads((PROPOSAL / 'BINDING-TEMPLATE-UNFILLED.json').read_bytes())
        profile['status'] = 'REVIEWED_FILLED_UNRUN'
        # This deliberately nonlaunchable synthetic profile has no repoRoot and
        # no runtime/worktree identity. Only the sink is invoked, never outer.
        with tempfile.TemporaryDirectory(prefix='witness-r7-frame-test-', dir=SCRATCH) as work:
            binding = Path(work) / 'SINK-ONLY-SYNTHETIC-NOT-LAUNCHABLE.json'
            binding.write_text(json.dumps(profile) + '\n')
            pin = '0' * 64 if wrong_pin else sha(binding.read_bytes())
            return completed([sys.executable, '-B', str(PROPOSAL / 'bounded-sink.py'),
                              str(binding), pin], raw)

    def test_malformed_json_frame_refuses(self):
        result = self.run_sink(b'not-json\n')
        self.assertEqual(result.returncode, 2)
        self.assertEqual(result.stdout, b'')
        self.assertEqual(json.loads(result.stderr), {'status': 'STOP_FRAME_VALIDATION'})

    def test_missing_frame_identity_refuses(self):
        result = self.run_sink(b'{}\n')
        self.assertEqual(result.returncode, 2)
        self.assertEqual(result.stdout, b'')
        self.assertEqual(json.loads(result.stderr), {'status': 'STOP_FRAME_VALIDATION'})

    def test_extra_frame_refuses(self):
        result = self.run_sink(b'{}\n{}\n')
        self.assertEqual(result.returncode, 2)
        self.assertEqual(result.stdout, b'')
        self.assertEqual(json.loads(result.stderr), {'status': 'STOP_FRAME_SHAPE'})

    def test_truncated_frame_refuses(self):
        result = self.run_sink(b'{}')
        self.assertEqual(result.returncode, 2)
        self.assertEqual(result.stdout, b'')
        self.assertEqual(json.loads(result.stderr), {'status': 'STOP_FRAME_SHAPE'})

    def test_exact_binding_pin_mismatch_refuses(self):
        result = self.run_sink(b'{}\n', wrong_pin=True)
        self.assertEqual(result.returncode, 2)
        self.assertEqual(result.stdout, b'')
        self.assertEqual(json.loads(result.stderr), {'status': 'STOP_SINK_BINDING_PIN'})


if __name__ == '__main__':
    unittest.main()
