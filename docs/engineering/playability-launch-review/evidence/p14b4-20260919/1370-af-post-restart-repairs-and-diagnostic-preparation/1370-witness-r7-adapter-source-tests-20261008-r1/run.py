import hashlib,json,subprocess,sys
from pathlib import Path
base=Path(__file__).parent
tests=json.loads((base/'TEST-PINS.json').read_text())
for test in tests:
 assert hashlib.sha256(Path(test['path']).read_bytes()).hexdigest()==test['sha256']
 result=subprocess.run([sys.executable,'-B',test['path']],cwd='/Users/zacheryspector/The-Movies-headless-program',timeout=90)
 if result.returncode: raise SystemExit(result.returncode)
print('SOURCE_ONLY_ADAPTER_CHECKS_PASSED_NO_GAME')
