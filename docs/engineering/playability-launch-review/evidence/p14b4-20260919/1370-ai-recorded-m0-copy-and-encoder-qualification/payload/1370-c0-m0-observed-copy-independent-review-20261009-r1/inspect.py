from pathlib import Path
S=Path('/Users/zacheryspector/studio-scratch')
for p in [S/'1370-c0-m0-operational-materializer-proposal-20261009-r3/materialize.py',S/'1370-c0-m0-observer-mirrors-20261009-r2/20261009-m0-types-r2.MATERIALIZE-RESULT.json']:
 print(str(p))
 print(p.read_text())
