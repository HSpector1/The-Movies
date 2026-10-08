#!/usr/bin/env python3
"""Single-use final-profile generator. Must be launched by bootstrap.py inside -p."""
import json
import os
import sys
from pathlib import Path

from bootstrap import file_bytes
from profile import freeze


def main(binding_path):
    binding = json.loads(file_bytes(binding_path, 1024 * 1024))
    policy_sha = binding['bootstrapPolicySha256']
    if os.environ.get('H_BOOTSTRAP_POLICY_SHA') != policy_sha:
        raise RuntimeError('STOP_BOOTSTRAP policy environment drift')
    result = freeze(binding['profileBinding'], binding['profilePath'])
    print(json.dumps({'status': 'PROFILE_CREATED_UNDER_BOOTSTRAP',
                      'policySha256': policy_sha,
                      'profileSha256': result['sha256']}, sort_keys=True))


if __name__ == '__main__':
    if len(sys.argv) != 2:
        raise SystemExit('usage: generate_profile.py <binding>')
    main(Path(sys.argv[1]))
