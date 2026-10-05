#!/usr/bin/env python3
"""Parent-only non-runtime assembly: exact named bytes, eight external copies, no fixtures/dependency copies."""
import argparse,hashlib,json,shutil,subprocess
from pathlib import Path
p=argparse.ArgumentParser();p.add_argument('--output',required=True);p.add_argument('--dependencies',required=True);p.add_argument('--estimate-only',action='store_true');a=p.parse_args()
kit=Path('/Users/zacheryspector/studio-scratch/1368-recovery-measurement-prep-v2')
manifest_pin='d92dc83b6ac45817a85007d7a89e93d630f29573f74273253a99d7430a1260f5'
helper=Path('/Users/zacheryspector/The-Movies-headless-program/tests/contracts/_contractFixtures.ts')
helper_pin='7554a6b11f0756c7cd286a7732ab888757a129fe0d9f10657c93c4d214f10de2'
sha=lambda b:hashlib.sha256(b).hexdigest()
raw=(kit/'SHA256.json').read_bytes();assert sha(raw)==manifest_pin
manifest=json.loads(raw)
for rel,pin in manifest['files'].items():assert sha((kit/rel).read_bytes())==pin['sha256'],rel
assert sha(helper.read_bytes())==helper_pin,'named type-only helper changed'
known=json.loads((kit/'KNOWN-ARM-SOURCES.json').read_text());common={f.relative_to(kit/'files').as_posix():f for f in (kit/'files').rglob('*') if f.is_file()}
inputs={};bytes_total=0
for arm in ['C0','A','AB','ABC']:
 v=known[arm];root=Path(v['rootAtPreparation']);pins={**v['files'],**v['configs']};inputs[arm]={}
 for rel,pin in pins.items():
  f=root/rel;assert all(not x.is_symlink() for x in [f,*f.parents]),str(f);b=f.read_bytes();assert sha(b)==pin,str(f);inputs[arm][rel]=b
 bytes_total+=2*(sum(map(len,inputs[arm].values()))+sum(f.stat().st_size for f in common.values())+helper.stat().st_size)
print(json.dumps({'eightCopyPayloadBytes':bytes_total,'copies':8,'sourceFilesPerCopy':188,'dependencyCopyBytes':0,'fixturePayloadCopyBytes':0,'typeOnlyHelper':str(helper),'typeOnlyHelperSha256':helper_pin}))
if a.estimate_only:raise SystemExit(0)
out=Path(a.output).absolute();deps=Path(a.dependencies).resolve(strict=True)
assert out.parent.is_dir() and not out.exists() and not out.is_symlink()
for consumed in [kit,deps,helper.parents[2],*(Path(v['rootAtPreparation']) for v in known.values())]:assert consumed!=out and consumed not in out.parents and out not in consumed.parents
assert all(not q.is_symlink() for q in [out,*out.parents])
assert shutil.disk_usage(out.parent).free>=5*1024**3+bytes_total,'require 5 GiB headroom beyond copy payload'
assert (deps/'vitest/vitest.mjs').is_file() and (deps/'typescript/bin/tsc').is_file()
out.mkdir();receipt={'kitManifestSha256':manifest_pin,'payloadEstimateBytes':bytes_total,'dependencySymlinkTarget':str(deps),'arms':{}}
for arm in ['C0','A','AB','ABC']:
 receipt['arms'][arm]={};side=json.loads((kit/'observer-patches'/f'{arm}.patch.json').read_text())
 for mode in ['clean','observed']:
  root=out/arm/mode;root.mkdir(parents=True)
  for rel,b in inputs[arm].items():f=root/rel;f.parent.mkdir(parents=True,exist_ok=True);f.write_bytes(b)
  for rel,f in common.items():target=root/rel;target.parent.mkdir(parents=True,exist_ok=True);target.write_bytes(f.read_bytes())
  target=root/'tests/contracts/_contractFixtures.ts';target.parent.mkdir(parents=True,exist_ok=True);target.write_bytes(helper.read_bytes())
  (root/'node_modules').symlink_to(deps,target_is_directory=True)
  if mode=='observed':
   patch=kit/'observer-patches'/f'{arm}.patch'
   subprocess.run(['git','apply','--check',str(patch)],cwd=root,check=True)
   subprocess.run(['git','apply',str(patch)],cwd=root,check=True)
  expected=dict(known[arm]['files'])
  if mode=='observed':
   for change in side['files']:expected[change['path']]=change['afterSha256']
  actual={f.relative_to(root).as_posix():sha(f.read_bytes()) for f in (root/'src').rglob('*') if f.is_file()}
  assert actual==expected
  allpins={rel:sha((root/rel).read_bytes()) for rel in [*expected,*known[arm]['configs'],*common,'tests/contracts/_contractFixtures.ts']}
  receipt['arms'][arm][mode]={'root':str(root),'files':allpins}
# Verify original sources/helper and kit again; never rewrite them.
for arm,v in known.items():
 for rel,b in inputs[arm].items():assert (Path(v['rootAtPreparation'])/rel).read_bytes()==b
assert sha(helper.read_bytes())==helper_pin and (kit/'SHA256.json').read_bytes()==raw
for rel,pin in manifest['files'].items():assert sha((kit/rel).read_bytes())==pin['sha256']
(out/'ASSEMBLY.json').write_text(json.dumps(receipt,indent=2)+'\n')
print(json.dumps({'assembly':str(out/'ASSEMBLY.json'),'sha256':sha((out/'ASSEMBLY.json').read_bytes())}))
