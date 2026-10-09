from pathlib import Path
import json
s=Path('/Users/zacheryspector/studio-scratch');x=json.loads((s/'1370-c0-m0-observed-copy-independent-review-20261009-r1/COPY-READBACK-FACTS.json').read_text())
y=x['materializedDirectoryIdentities'];print(type(y).__name__,str(y)[:800])
