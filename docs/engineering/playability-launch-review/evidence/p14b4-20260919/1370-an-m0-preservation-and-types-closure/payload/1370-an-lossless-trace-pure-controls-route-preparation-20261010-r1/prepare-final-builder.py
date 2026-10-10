
from pathlib import Path
p=Path(__file__).parent
s=(p/'build-route.py').read_text()
s=s.replace("OUT=S/'1370-an-lossless-trace-pure-controls-recorded-route-source-20261010-r1'","OUT=S/'1370-an-lossless-trace-pure-controls-recorded-route-source-20261010-r2'")
old="write('SOURCE-PROOF.json',proof)"
extra="""def apply_diff(diff,original):
 lines=original.splitlines(keepends=True);out=[];at=0;d=diff.splitlines(keepends=True);i=2
 import re
 while i<len(d):
  m=re.match(r'@@ -(\\d+)(?:,(\\d+))? \\+(\\d+)(?:,(\\d+))? @@',d[i]);assert m,d[i]
  start=int(m.group(1))-1;count=int(m.group(2) or 1);i+=1;out.extend(lines[at:start]);at=start;consumed=0
  while i<len(d) and not d[i].startswith('@@'):
   line=d[i];i+=1
   if line.startswith(' '):assert lines[at]==line[1:];out.append(line[1:]);at+=1;consumed+=1
   elif line.startswith('-'):assert lines[at]==line[1:];at+=1;consumed+=1
   elif line.startswith('+'):out.append(line[1:])
   else:raise ValueError(line)
  assert consumed==count
 out.extend(lines[at:]);return ''.join(out)
for pair in pairs:
 before=Path(pair['baseline']['path']).read_text();after=Path(pair['derivative']['path']).read_text()
 assert apply_diff(Path(pair['forward']['path']).read_text(),before)==after
 assert apply_diff(Path(pair['inverse']['path']).read_text(),after)==before
proof['allRetainedFullForwardAndInverseApplicationsExact']=True
write('R1-SOURCE-STOP.json',{'schema':'1370-source-only-pure-route-self-review-stop/v1','executionAuthorization':False,'sourceManifest':role(S/'1370-an-lossless-trace-pure-controls-recorded-route-source-20261010-r1/SOURCE-PINS.json'),'finding':'Original route R1 was unreviewed/unrun; worker rehashed PY/helper only before controls. Final R2 also rehashes these genuine public tool roles after controls, satisfying the same exact complete tool boundary. Original R1 sealed bytes preserved.','candidateExecuted':False})
write('SOURCE-PROOF.json',proof)"""
assert s.count(old)==1
s=s.replace(old,extra)
with (p/'build-route-r2.py').open('x') as f:f.write(s)

