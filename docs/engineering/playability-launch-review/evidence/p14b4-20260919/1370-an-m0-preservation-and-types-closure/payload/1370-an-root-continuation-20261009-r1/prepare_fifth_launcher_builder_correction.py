import json,os
from pathlib import Path
A=Path(__file__).parent
b=(A/'prepare_fifth_root_launcher.py').read_text()
start=b.index('# The actual R12 review alias contract')
end=b.index("new=new.replace(anchor,block+anchor)",start)
b=b[:start]+"""# Read exact alias contract from the actual R12 RECIPE, not CONFIG.
recipe=json.loads((A.parent/'1370-an-m0-fullfunction-qualification-source-20261010-r12/RECIPE.json').read_bytes())
assert len(recipe['reviewAliases'])==15 and 'm0TraceCodec.mjs' in recipe['reviewAliases']
block=block.replace("config['runtimeSourceReviewAliases']", "read(Q/'RECIPE.json')['reviewAliases']")
aliasKeys=['RECIPE.reviewAliases']
"""+b[end:]
p=A/'prepare_fifth_root_launcher_r2.py'
with p.open('x') as f:f.write(b);f.flush();os.fsync(f.fileno())
compile(b,str(p),'exec')
q=A/'R5-ROOT-BUILDER-ALIAS-LOCATION-CORRECTION.json'
with q.open('x') as f:json.dump({'schema':'1370-root-builder-alias-location-correction/v1','actualFailure':'0552e0 exit1 before launcher output: asserted alias list existed directly in CONFIG','actualContract':'R12 RECIPE.reviewAliases holds the exact15 aliases','sourceOrCandidateChanged':False,'runtimeAttempted':False,'executionAuthorization':False},f,sort_keys=True,indent=2);f.write('\n');f.flush();os.fsync(f.fileno())
q.chmod(0o444)
print(str(p))
