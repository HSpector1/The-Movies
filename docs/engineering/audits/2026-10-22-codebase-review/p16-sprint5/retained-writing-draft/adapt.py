from pathlib import Path
import json,hashlib,difflib
A=Path('/Users/zacheryspector/studio-scratch/1370-astra-takeover-20261012');W=Path('/Users/zacheryspector/studio-scratch/p16-rebase-20261024-wt');O=Path(__file__).parent
sha=lambda b:hashlib.sha256(b).hexdigest()
receipt=json.loads((A/'P16-RETAINED-WRITING-STATIC-COMPOSITION-RECEIPT.json').read_text());base=A/receipt['layers'][0]['packet'];inputs=[]
for layer in receipt['layers']:
 p=A/layer['packet'];b=(p/'SOURCE.patch').read_bytes();assert sha(b)==layer['sourceSHA256'];assert sha((p/'MANIFEST.json').read_bytes())==layer['manifestSHA256'];m=json.loads((p/'MANIFEST.json').read_text())
 for row in m['files']:
  for kind,key in [('preimages','preimageSHA256'),('postimages','postimageSHA256')]:
   if row.get(key) is not None:assert sha((p/kind/row['path']).read_bytes())==row[key],(p,kind,row['path'])
 inputs.append({'packet':layer['packet'],'patchSHA256':sha(b),'manifestSHA256':sha((p/'MANIFEST.json').read_bytes())})
conflicts=[];applied=[];records=[]
for name,row in receipt['finalPostimages'].items():
 final=(A/row['packet']/'postimages'/name).read_bytes();assert sha(final)==row['sha256'];bp=base/'preimages'/name;old=bp.read_text() if bp.exists() else '';wp=W/name;current=wp.read_text() if wp.exists() else '';draft=current
 if not old:
  assert not wp.exists(),name
  draft=final.decode()
 else:
  before=old.splitlines(True);after=final.decode().splitlines(True)
  for group in difflib.SequenceMatcher(None,before,after,autojunk=False).get_grouped_opcodes(3):
   i,j=group[0][1],group[-1][2];x,y=group[0][3],group[-1][4];a=''.join(before[i:j]);b=''.join(after[x:y]);n=draft.count(a)
   if n==1:draft=draft.replace(a,b,1);applied.append({'path':name,'oldLines':[i+1,j],'finalLines':[x+1,y]})
   else:conflicts.append({'path':name,'oldLines':[i+1,j],'finalLines':[x+1,y],'exactCurrentMatches':n,'old':a,'new':b})
 target=O/'postimages'/name;target.parent.mkdir(parents=True,exist_ok=True);target.write_text(draft)
 records.append({'path':name,'candidatePreimageSHA256':sha(current.encode()),'historicalBaseSHA256':sha(old.encode()),'historicalFinalSHA256':sha(final),'draftSHA256':sha(draft.encode()),'bytes':len(draft.encode())})
(O/'INPUTS.json').write_text(json.dumps(inputs,indent=2)+'\n');(O/'AUTO-APPLIED.json').write_text(json.dumps(applied,indent=2)+'\n');(O/'CONFLICTS.json').write_text(json.dumps(conflicts,indent=2)+'\n');(O/'INITIAL-MANIFEST.json').write_text(json.dumps(records,indent=2)+'\n')
print('paths',len(records),'exact applied hunks',len(applied),'conflicts',len(conflicts))
for c in conflicts:print(c['path'],c['oldLines'],c['exactCurrentMatches'])
