#!/usr/bin/env python3
"""Only launched under the bound inline bootstrap sandbox; no fallback path."""
import json
from pathlib import Path
import sys

SOURCE = Path('/Users/zacheryspector/studio-scratch/1370-c0-h-r4-materializer-proposal-r4')
sys.path.insert(0, str(SOURCE))


def main(operation, binding_path):
    binding = json.loads(Path(binding_path).read_text())
    if operation == 'manifest':
        from dependency_manifest import build
        build(binding['productionDependencies'], binding['manifestOutput'],
              fixture=False, binding=binding)
        return 0
    if operation == 'materialize':
        from run import main as materializer_main
        return materializer_main(binding_path)
    raise ValueError('unrecognized bootstrap worker operation')


if __name__ == '__main__':
    if len(sys.argv) != 3: raise SystemExit('usage: worker.py manifest|materialize BINDING')
    raise SystemExit(main(sys.argv[1], sys.argv[2]))
