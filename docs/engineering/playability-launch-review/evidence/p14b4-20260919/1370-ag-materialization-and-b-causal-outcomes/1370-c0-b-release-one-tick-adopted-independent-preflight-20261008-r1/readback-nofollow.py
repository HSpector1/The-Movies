import hashlib,json,os,pathlib,stat
D=pathlib.Path('/Users/zacheryspector/studio-scratch/1370-c0-b-release-one-tick-exact-draft-20261008-r1')
expected={'BINDING-DRAFT.json':('1d961e6badb90588e304938b75d6b488a2e35188992e30232426f823b23f12d2',2691),'BINDING-ORIGINAL-e0a31a76.json':('e0a31a76c19a5c8f18a3f690cba4984f38c5a263920f5d8a573ea8858dda0003',2463)}
def identity(s):return (s.st_dev,s.st_ino,s.st_mode,s.st_nlink,s.st_size,s.st_mtime_ns,s.st_ctime_ns)
rows={};contents={}
for name,(sha,n) in expected.items():
 p=D/name;before=p.lstat();fd=os.open(p,os.O_RDONLY|os.O_NOFOLLOW)
 try:
  opened=os.fstat(fd);assert identity(before)==identity(opened) and stat.S_ISREG(opened.st_mode) and opened.st_nlink==1 and stat.S_IMODE(opened.st_mode)==0o600 and opened.st_size==n
  b=os.read(fd,n+1);assert len(b)==n and os.read(fd,1)==b'';after=os.fstat(fd);pathafter=p.lstat();assert identity(before)==identity(after)==identity(pathafter);assert hashlib.sha256(b).hexdigest()==sha
  rows[name]={'sha256':sha,'bytes':n,'device':opened.st_dev,'inode':opened.st_ino,'mode':stat.S_IMODE(opened.st_mode),'nlink':opened.st_nlink,'nofollowReadStable':True};contents[name]=json.loads(b)
 finally:os.close(fd)
parent=(D/'PARENT-NOFOLLOW-READBACK.json').read_bytes();assert json.loads(parent)==rows
changed=sorted(k for k in set(contents['BINDING-DRAFT.json'])|set(contents['BINDING-ORIGINAL-e0a31a76.json']) if contents['BINDING-DRAFT.json'].get(k)!=contents['BINDING-ORIGINAL-e0a31a76.json'].get(k));assert changed==['exactReview','executionAuthorization','status']
print(json.dumps({'independentNoFollowReadback':rows,'onlyChangedFields':changed,'parentReadbackSha256':hashlib.sha256(parent).hexdigest(),'claimLimit':'Current adopted/archive bytes and metadata directly observed. Initial adoption syscall sequence not independently observed.'},sort_keys=True,indent=2))
