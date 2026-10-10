import json
from pathlib import Path
root=Path('/Users/zacheryspector/studio-scratch')
for name in ['1370-c0-m0-additive-expanded-readback-facts-after-aj-20261009-r3.json','1370-c0-m0-post-copy-next-stage-readiness-20261009-r1/REFERENCES.json','1370-c0-h-m0-typecheck-collection-route-template-r1/ROUTE.json']:
 p=root/name
 if not p.is_file(): continue
 d=json.loads(p.read_text());print(name, list(d))
 for k,v in d.items():
  if isinstance(v,list): print(k,'LIST',len(v),'first',v[:1])
  elif isinstance(v,dict): print(k,'OBJECT',list(v)[:20])
  else:print(k,v)
