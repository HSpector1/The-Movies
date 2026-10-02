#!/usr/bin/env python3
"""1358-J: sha256 and size of the C# declaration body (vocabularies, classes, converters) that
generateCsharpTypeDeclarations renders, cut from the checked-in generated C# at base and step4.
Reads git blobs from the scratch repo and prints. A cross-check candidate only."""
import hashlib, subprocess

REPO = '/Users/zacheryspector/studio-scratch/1358-j/tree'
for rev in ['base', 'step4']:
    text = subprocess.run(['git', '-C', REPO, 'show', f'{rev}:generated/unity/StudioBridgeDtos.Generated.cs'],
                          capture_output=True, check=True).stdout.decode('utf-8')
    lines = text.split('\n')
    start = lines.index('        public static void RequireCompatible(int protocolVersion, string schemaId, int projectionVersion)')
    close = lines.index('    }', start)          # the contract class's closing brace
    assert lines[close + 1] == ''
    assert lines[-1] == '' and lines[-2] == '}'
    body = '\n'.join(lines[close + 2:-2])
    data = body.encode('utf-8')
    print(rev, len(data), hashlib.sha256(data).hexdigest())
