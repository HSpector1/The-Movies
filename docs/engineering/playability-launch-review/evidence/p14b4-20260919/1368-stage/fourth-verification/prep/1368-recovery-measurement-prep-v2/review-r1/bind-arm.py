#!/usr/bin/env python3
"""Bind parent-assembled, typechecked clean/observed copies. Read-only on both trees."""
import argparse,hashlib,json,os,re
from pathlib import Path
p=argparse.ArgumentParser();p.add_argument('--arm',choices=['C0','A','AB','ABC'],required=True);p.add_argument('--clean',required=True);p.add_argument('--observed',required=True);p.add_argument('--published-head',required=True);p.add_argument('--publication-repo',required=True);p.add_argument('--node',required=True);p.add_argument('--output',required=True);a=p.parse_args()
kit=Path(__file__).resolve().parent;known=json.loads((kit/'KNOWN-ARM-SOURCES.json').read_text())[a.arm]
sha=lambda b:hashlib.sha256(b).hexdigest()
if not re.fullmatch('[a-f0-9]{40}',a.published_head):raise SystemExit('full published coordinator HEAD required')
out=Path(a.output).absolute()
if out.exists() or out.is_symlink():raise SystemExit('exclusive manifest output required')
for x in [out,*out.parents]:
 if x.is_symlink():raise SystemExit('symlink output refused')
expected=dict(known['files']);changes=json.loads((kit/'observer-patches'/f'{a.arm}.patch.json').read_text())
observed=dict(expected)
for row in changes['files']:
 if expected[row['path']]!=row['beforeSha256']:raise SystemExit('observer base mismatch')
 observed[row['path']]=row['afterSha256']
common={f.relative_to(kit/'files').as_posix():sha(f.read_bytes()) for f in (kit/'files').rglob('*') if f.is_file()}
variants={};vitest_hash=None
for kind,path,source in [('clean',a.clean,expected),('observed',a.observed,observed)]:
 root=Path(path).absolute()
 for x in [root,*root.parents]:
  if x.is_symlink():raise SystemExit('symlink tree refused')
 actual={}
 for d,dirs,names in os.walk(root/'src',followlinks=False):
  for n in dirs+names:
   if (Path(d)/n).is_symlink():raise SystemExit('source symlink refused')
  for n in names:
   f=Path(d)/n
   if f.is_file():actual[f.relative_to(root).as_posix()]=sha(f.read_bytes())
 if actual!=source:raise SystemExit(kind+' full source identity mismatch')
 for rel,pin in common.items():
  f=root/rel
  if f.is_symlink() or sha(f.read_bytes())!=pin:raise SystemExit('driver/config pin mismatch '+rel)
  actual[rel]=pin
 for rel in ['package.json','package-lock.json','tsconfig.json','vitest.workspace.ts']:
  f=root/rel
  if f.is_file():
   actual[rel]=sha(f.read_bytes())
   if actual[rel]!=known['configs'].get(rel):raise SystemExit('original config changed: '+rel)
 entry=sha((root/'node_modules/vitest/vitest.mjs').read_bytes())
 if vitest_hash is not None and entry!=vitest_hash:raise SystemExit('unequal runtime entrypoints')
 vitest_hash=entry;variants[kind]={'root':str(root),'files':actual}
if variants['clean']['root']==variants['observed']['root']:raise SystemExit('clean and observed copies must differ')
node=Path(a.node).resolve(strict=True)
kitpins={n:sha((kit/n).read_bytes()) for n in ['run-one.py','compare.py','bind-arm.py','KNOWN-ARM-SOURCES.json','measurement-driver.patch','observer-patches/'+a.arm+'.patch','observer-patches/'+a.arm+'.patch.json']}
manifest={'kitRoot':str(kit),'kitPins':kitpins,'arm':a.arm,'saveVersion':45 if a.arm in ['C0','A'] else 46,'pressure':'as-authored','publishedHead':a.published_head,'publicationRepo':str(Path(a.publication_repo).absolute()),'sourceIdentity':known['sourceIdentity'],'node':str(node),'nodeSha256':sha(node.read_bytes()),'vitestEntrySha256':vitest_hash,'observerPatchSha256':changes['patchSha256'],**variants}
out.write_text(json.dumps(manifest,indent=2)+'\n');print(json.dumps({'path':str(out),'sha256':sha(out.read_bytes())}))
