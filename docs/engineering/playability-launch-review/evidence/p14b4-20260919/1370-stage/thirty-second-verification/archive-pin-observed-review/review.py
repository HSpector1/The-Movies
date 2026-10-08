import hashlib,json,os,pathlib,stat,subprocess
B=pathlib.Path('/Users/zacheryspector/studio-scratch')
P=B/'1370-r12-e0g-adoption-archive-pin-r1'
N='e0g-adoption-clean-r12-e0g-adoption-clean-20261007-1850'
T=B/'1370-ag-e0g-full-state-clean-recorded-r12'/N
E=B/'1370-ag-e0g-full-state-clean-outer-recorded-r12'/N
L=B/f'1370-ag-e0g-full-state-r12-{N}.lane.log'
R=pathlib.Path('/Users/zacheryspector/The-Movies-headless-program')
def sha(path):
 h=hashlib.sha256()
 with os.fdopen(os.open(path,os.O_RDONLY|os.O_NOFOLLOW),'rb') as f:
  for chunk in iter(lambda:f.read(1<<20),b''):h.update(chunk)
 return h.hexdigest()
def j(path):return json.loads(path.read_bytes())
assert subprocess.check_output(['git','-C',str(R),'rev-parse','HEAD'],text=True).strip()=='b995a83e5363a3843f9b902e08c2df4dd95840cb'
assert subprocess.check_output(['git','-C',str(R),'rev-parse','HEAD:src'],text=True).strip()=='13880d9b0ba72aff5d4c5bcf5d12fe682c5de554'
assert subprocess.check_output(['git','-C',str(R),'status','--porcelain=v1'])==b''
pin=j(P/'PIN.json'); inv=j(P/'SOURCE-INVENTORY.json'); result=j(P/'INVENTORY-RESULT.json')
assert sha(P/'SOURCE-INVENTORY.json')==pin['sourceInventorySha256']==result['sourceInventorySha256']=='325267be4a4c325e212a6651348183848904f38f8119b0b887c4142880cd73ac'
assert sha(P/'PIN.json')=='728d3358b820529dfb477e6d99855d74016c6f2c04138276c66fa841395f2101'
assert len(pin)==22 and len(inv)==232 and result['members']==232
assert pin['role']=='e0g-adoption' and pin['classification']=='EXPLORATORY_720_750'
assert pin['status']=='STAGE_PASS' and pin['stagePassed'] and pin['childExit']==pin['laneProcessExit']==0
assert pin['observedReceiptSha256']=='3f833354bf9eeff08a8c4e82cd235b85a0875c323b7e30f68e8eafd9b489f8c7'
roots={'target':T,'outer':E,'lane':B}
seen=set();regular=0
for x in inv:
 rel=pathlib.PurePosixPath(x['path']);assert rel.parts[0] in roots and len(rel.parts)>1
 assert '..' not in rel.parts and x['path'] not in seen;seen.add(x['path'])
 path=(roots[rel.parts[0]]/pathlib.Path(*rel.parts[1:]))
 s=os.lstat(path);assert stat.S_IMODE(s.st_mode)==x['mode']
 if x['type']=='file':
  assert stat.S_ISREG(s.st_mode) and s.st_size==x['bytes']
  assert sha(path)==x['sha256'];regular+=s.st_size
 elif x['type']=='directory':assert stat.S_ISDIR(s.st_mode)
 elif x['type']=='symlink':
  assert stat.S_ISLNK(s.st_mode) and os.readlink(path)==x['target']
 else:raise AssertionError(x['type'])
assert regular==result['regularBytes']==146623440
assert sum(x['type']=='file' for x in inv)==218
assert sum(x['type']=='directory' for x in inv)==13
assert sum(x['type']=='symlink' for x in inv)==1
for name,expected in [('build.command','2a083112dd9116fafa46b4f62f3f1dc429c789ec16f343d86c0bba382e522aed'),('verify.command','b7e968f6790fcbae8f455fc16db74c5c07799f256988aaaa5863756d422ea38b')]:
 assert sha(P/name)==expected
 text=(P/name).read_text();assert '--pin '+str(P/'PIN.json') in text
 assert 'lane-run.sh 0' in text and '1370-r12-followon-clean-archive-proposal-r3' in text
assert sha(B/'1370-r12-followon-clean-archive-proposal-r3/package.py')=='7368b59185d9818c7fb286dbb39a91cbc98582752f75a560393a34d05a3efc46'
assert sha(B/'1370-r12-followon-clean-archive-proposal-r3/verify.py')=='75b13e206a46d223b2230ea7fde510b0acf36517ae3d944661f3346f5845c4b9'
print(json.dumps({'decision':'ACCEPT_OBSERVED_E0G_ADOPTION_PIN_AND_COMMANDS_ONLY','sourceInventorySha256':pin['sourceInventorySha256'],'pinSha256':sha(P/'PIN.json'),'members':len(inv),'regularBytes':regular},sort_keys=True))
