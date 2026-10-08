import hashlib,json,os,stat,subprocess,shutil,pathlib
D=pathlib.Path('/Users/zacheryspector/studio-scratch/1370-c0-aging-era-sparse-materializer-r4-exact-draft-20261008-r1')
R=pathlib.Path('/Users/zacheryspector/The-Movies-headless-program')
OUT=pathlib.Path(__file__).parent
j=lambda p:json.loads(pathlib.Path(p).read_text())
h=lambda b:hashlib.sha256(b).hexdigest()
fh=lambda p:h(pathlib.Path(p).read_bytes())
issues=[]; facts={}
def check(ok,label):
 if not ok:issues.append(label)
def run(*args):return subprocess.check_output(args,stderr=subprocess.PIPE)
b=j(D/'BINDING-DRAFT.json'); c=j(D/'CANDIDATE-PINS.json'); sem=j(D/'BINDING-SEMANTIC.json'); rep=j(D/'DRAFT-REPORT.json'); man=j(D/'SOURCE-MANIFEST.json'); deps=j(D/'DEPENDENCY-LINKS.json')
check(fh(D/'CANDIDATE-PINS.json')=='f9e17aa441af0efa22077d5943172d380f7baaf00a44f562e4f7e656a55c60d7','candidate pins SHA')
for name,digest in c['files'].items():check(fh(D/name)==digest,'candidate file '+name)
excluded={'status','executionAuthorization','exactBindingReviewPath','exactBindingReviewSha256','exactBindingReviewDecision'}
derived={k:v for k,v in b.items() if k not in excluded}
semantic=h(json.dumps(derived,sort_keys=True,separators=(',',':')).encode())
check(derived==sem,'semantic JSON content');check(semantic==c['bindingSemanticSha256'],'semantic SHA')
check(set(b)-set(derived)==excluded,'semantic exclusions exact')
check(b['status']=='DRAFT_UNREVIEWED_UNRUN' and b['executionAuthorization'] is False and all(b[k] is None for k in excluded-{'status','executionAuthorization'}),'draft unlaunchable')
facts['bindingSemanticSha256']=semantic
for role in ['sourcePins','sourceReview','designReceipt','feasibilityNote']:
 check(fh(b[role+'Path'])==b[role+'Sha256'],role+' SHA')
for role in ['materializer','recorder','supervisor']:
 check(fh(b[role+'Path'])==b[role+'Sha256'],role+' SHA')
 check(pathlib.Path(b[role+'Path']).parent==pathlib.Path(b['sourcePinsPath']).parent,role+' location')
pins=j(b['sourcePinsPath']);sr=j(b['sourceReviewPath']);design=j(b['designReceiptPath'])
for name,digest in pins['files'].items():check(fh(pathlib.Path(b['sourcePinsPath']).parent/name)==digest,'source package '+name)
check(sr['decision']=='ACCEPT_SOURCE_ONLY_UNRUN' and sr['reviewedSourcePinsSha256']==b['sourcePinsSha256'] and sr['qualifiedSourceSha']==b['sourceSha'],'source review roles')
check(design['decision']=='ACCEPT_DESIGN_ONLY' and design['qualifiedSourceSha']==b['sourceSha'],'design roles')
check(c['sourcePinsSha256']==b['sourcePinsSha256'] and c['sourceReviewSha256']==b['sourceReviewSha256'],'candidate source references')
for name in ['git','cp','ls','du','lsof','node']:
 p=pathlib.Path(b[name+'Path']);check(p.is_file() and not p.is_symlink() and os.access(p,os.X_OK) and fh(p)==b[name+'Sha256'],name+' executable')
check(run(b['nodePath'],'--version').strip()==b'v22.23.2','node version')
check(run('/usr/bin/git','-c','gc.auto=0','-c','maintenance.auto=0','-C',str(R),'rev-parse','HEAD').strip().decode()==b['productionHead'],'production HEAD')
check(run('/usr/bin/git','-c','gc.auto=0','-c','maintenance.auto=0','-C',str(R),'rev-parse','HEAD:src').strip().decode()==rep['productionSourceTree'],'production source tree')
check(not run('/usr/bin/git','-c','gc.auto=0','-c','maintenance.auto=0','-C',str(R),'status','--porcelain=v1','-z','--untracked-files=all'),'production clean')
check(pathlib.Path(b['dependencyRoot'])==R/'node_modules','dependency root');check(pathlib.Path(b['commonObjects'])==pathlib.Path(b['commonGitRoot'])/'objects','common objects');check(pathlib.Path(b['commonObjects']).is_dir(),'common objects exists')
common=run('/usr/bin/git','-c','gc.auto=0','-c','maintenance.auto=0','-C',str(R),'rev-parse','--path-format=absolute','--git-common-dir').strip().decode()
check(common==b['commonGitRoot'],'common Git root')
check(b['productionHead']==rep['productionHead'],'report HEAD');check(b['sourceSha']==man['sourceSha']==pins['sourceSha']=='3aaf55e0c06c4b745b0b722cc56913050b1ee229','historical source identity')
raw=run('/usr/bin/git','-c','gc.auto=0','-c','maintenance.auto=0','-C',str(R),'ls-tree','-r','-z',b['sourceSha'],'--','src','tests/bridge-p14b5-relationships.test.ts','tests/fixtures/p13a/accepted-v19.json.gz','package.json','package-lock.json')
rows={}
for item in raw.split(b'\0'):
 if item:
  meta,path=item.split(b'\t',1);mode,kind,oid=meta.decode().split(' ');rows[path.decode()]={'mode':mode,'kind':kind,'oid':oid}
check(set(rows)==set(man['files']),'manifest complete exact tree path set')
check(len(rows)==man['count']==176,'manifest count 176')
size=0
for path,row in rows.items():
 m=man['files'][path];check(row['mode']==m['mode']=='100644' and row['kind']=='blob' and row['oid']==m['oid'],'tree metadata '+path)
 data=run('/usr/bin/git','-c','gc.auto=0','-c','maintenance.auto=0','-C',str(R),'cat-file','blob',row['oid'])
 check(h(data)==m['sha256'] and len(data)==m['bytes'],'blob bytes '+path)
 check(hashlib.sha1(b'blob '+str(len(data)).encode()+b'\0'+data).hexdigest()==row['oid'],'blob OID '+path)
 size+=len(data)
check(size==man['logicalBytes']==4803106,'logical size')
facts['sourceCount']=len(rows);facts['sourceLogicalBytes']=size
links=[];reg=0;dirs=1;root=pathlib.Path(b['dependencyRoot']); stack=[(root,'')]
while stack:
 base,prefix=stack.pop()
 for item in os.scandir(base):
  rel=prefix+item.name;st=item.stat(follow_symlinks=False)
  if stat.S_ISDIR(st.st_mode):dirs+=1;stack.append((pathlib.Path(item.path),rel+'/'))
  elif stat.S_ISREG(st.st_mode):reg+=1;check(st.st_nlink==1,'dependency hardlink '+rel)
  elif stat.S_ISLNK(st.st_mode):
   target=os.readlink(item.path);links.append({'path':rel,'target':target});check(not os.path.isabs(target) and pathlib.Path(item.path).resolve().is_relative_to(root.resolve()),'dependency escape '+rel)
  else:issues.append('dependency special '+rel)
check(sorted(links,key=lambda x:x['path'])==sorted(deps['links'],key=lambda x:x['path']),'dependency link inventory')
check((reg,dirs,len(links))==(deps['regularCount'],deps['directoryCount'],deps['symlinkCount'])==(11060,1401,24),'dependency shape')
facts['dependencyShape']={'regular':reg,'directories':dirs,'links':len(links)}
for rel,digest in b['runtimeFiles'].items():
 p=R/rel
 if rel in ['package.json','package-lock.json']:check(man['files'][rel]['sha256']==digest,'runtime historical package '+rel)
 check(p.is_file() and fh(p)==digest,'runtime file '+rel)
for key in ['outputRoot','scratchRoot','recorderLockPath']:
 p=pathlib.Path(b[key]);check(p.parent==pathlib.Path(b['scratchParent']) and not p.exists() and not p.is_symlink(),'reserved '+key)
check(len({b[k] for k in ['outputRoot','scratchRoot','recorderLockPath']})==3,'reserved distinct')
check(pathlib.Path(b['scratchParent']).resolve()==pathlib.Path(b['scratchParent']) and not pathlib.Path(b['scratchParent']).is_symlink(),'scratch parent')
check(os.stat(b['scratchParent']).st_dev==os.stat(b['dependencyRoot']).st_dev,'same clone device')
check(b['noExternalSameUidRenamer'] is True and rep['assumption'].startswith('No external same-UID process'),'no renamer')
free=shutil.disk_usage(b['scratchParent']).free;required=3*1024**3+128*1024**2+384*1024**2
facts['freeBytesNow']=free;facts['requiredFreeBytes']=required;facts['deficitBytesNow']=max(0,required-free)
check(rep['requiredFreeBytes']==required and rep['deficitBytes']==required-rep['freeBytesAtDraft'],'draft disk math')
check(rep['launch']=='LAUNCH_STOP_LOW_SPACE' and c['launch']=='LAUNCH_STOP_LOW_SPACE','draft launch STOP')
check(free<required,'current low-space STOP')
(OUT/'AUDIT.json').write_text(json.dumps({'issues':issues,'facts':facts},indent=2,sort_keys=True)+'\n')
print(json.dumps({'issues':issues,'facts':facts},indent=2))
