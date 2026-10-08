#!/usr/bin/env python3
"""Independent byte-level readback of p13a archive parts; no game or publication."""
import hashlib,json,os,pathlib,shutil,stat,subprocess,tarfile
S=pathlib.Path('/Users/zacheryspector/studio-scratch')
ROOT=S/'1370-ebg-p13a-archive-builder-recorded-r1/20261008-ebg-p13a-archive-r1'
ROSTER=S/'1370-ebg-p13a-adoption-github-backup-design-r1/SOURCE-ROSTER.json'
OUT=S/'1370-ebg-p13a-archive-local-readback-r1/AUDIT.json'
HEAD='b97129610a07d3529fc482daeddc0cd9bf798713'
TREE='13880d9b0ba72aff5d4c5bcf5d12fe682c5de554'
sha=lambda b:hashlib.sha256(b).hexdigest()
def file_sha(p):
 h=hashlib.sha256()
 with p.open('rb') as f:
  for b in iter(lambda:f.read(1024*1024),b''):h.update(b)
 return h.hexdigest()
def git(*args):return subprocess.check_output(['git',*args],cwd='/Users/zacheryspector/The-Movies-headless-program',text=True,timeout=25).strip()
def regular(p):
 st=p.lstat();assert stat.S_ISREG(st.st_mode) and st.st_nlink==1 and not p.is_symlink();return st
class Parts:
 def __init__(self,parts):
  self.parts=parts;self.index=0;self.f=None;self.whole=hashlib.sha256();self.count=0;self.part_results=[]
 def read(self,n):
  chunks=[];remaining=n
  while remaining:
   if self.f is None:
    assert self.index<len(self.parts),'unexpected archive EOF'
    p=ROOT/self.parts[self.index]['name'];regular(p);self.f=p.open('rb');self.part_hash=hashlib.sha256();self.part_size=0
   data=self.f.read(remaining)
   if data:
    chunks.append(data);remaining-=len(data);self.whole.update(data);self.part_hash.update(data);self.count+=len(data);self.part_size+=len(data)
   else:
    expected=self.parts[self.index]
    assert self.part_size==expected['bytes'] and self.part_hash.hexdigest()==expected['sha256']
    self.part_results.append({'name':expected['name'],'bytes':self.part_size,'sha256':self.part_hash.hexdigest()})
    self.f.close();self.f=None;self.index+=1
  return b''.join(chunks)
 def finish(self):
  assert self.f is not None
  assert self.f.read(1)==b''
  expected=self.parts[self.index]
  assert self.part_size==expected['bytes'] and self.part_hash.hexdigest()==expected['sha256']
  self.part_results.append({'name':expected['name'],'bytes':self.part_size,'sha256':self.part_hash.hexdigest()})
  self.f.close();self.f=None;self.index+=1
  assert self.index==len(self.parts)
def main():
 assert not OUT.exists()
 assert git('rev-parse','HEAD')==HEAD and git('rev-parse','HEAD:src')==TREE and git('status','--porcelain=v1')==''
 branch='refs/heads/wip/headless-program-20260916-ts'
 assert git('ls-remote','--exit-code','origin',branch)==HEAD+'\t'+branch
 assert 'Now drawing from \'AC Power\'' in subprocess.check_output(['pmset','-g','batt'],text=True,timeout=5)
 lock=S/'HEAVY-LANE-LOCK';assert lock.is_file() and '1370-ebg-p13a-archive-local-readback-r1/audit.lane.log' in lock.read_text()
 resultp=ROOT/'BUILD-RESULT.json';regular(resultp);result=json.loads(resultp.read_bytes())
 assert result['status']=='LOCAL_BUILD_ONLY_NEEDS_INDEPENDENT_READBACK' and result['runId']=='20261008-ebg-p13a-archive-r1'
 assert result['head']==HEAD and result['sourceTree']==TREE
 assert not (ROOT/'BUILD-FAILURE.json').exists()
 assert sorted(p.name for p in ROOT.iterdir())==['BUILD-RESULT.json','capture.tar.part-001','capture.tar.part-002']
 regular(ROSTER);roster=json.loads(ROSTER.read_bytes());assert sha(ROSTER.read_bytes())==result['sourceRosterSha256']
 files=roster['p13a']['files'];assert len(files)==30 and [x['member'] for x in files]==sorted(x['member'] for x in files)
 assert result['members']==[{k:x[k] for k in ('member','bytes','sha256')} for x in files]
 parts=result['parts'];assert [x['bytes'] for x in parts]==[67108864,40032256]
 assert [x['name'] for x in parts]==['capture.tar.part-001','capture.tar.part-002']
 reader=Parts(parts);names=[];sourcebytes=0
 for item in files:
  name=item['member'];assert name.startswith('p13a/') and '..' not in pathlib.PurePosixPath(name).parts
  hdr=reader.read(512)
  info=tarfile.TarInfo(name);info.size=item['bytes'];info.mode=0o644;info.uid=info.gid=0;info.uname=info.gname='';info.mtime=0
  assert hdr==info.tobuf(format=tarfile.USTAR_FORMAT,encoding='utf-8',errors='strict'),name
  source=pathlib.Path(item['sourcePath']);regular(source);assert source.stat().st_size==item['bytes']
  h=hashlib.sha256();n=item['bytes']
  with source.open('rb') as sf:
   while n:
    take=min(n,1024*1024);content=reader.read(take);assert len(content)==take
    same=sf.read(take);assert content==same,name
    h.update(content);n-=take
   assert sf.read(1)==b''
  assert h.hexdigest()==item['sha256'],name
  pad=(-item['bytes'])%512
  if pad:assert reader.read(pad)==b'\0'*pad
  names.append(name);sourcebytes+=item['bytes']
 remaining=result['tarBytes']-reader.count
 assert remaining>=1024 and reader.read(remaining)==b'\0'*remaining
 reader.finish()
 assert reader.count==result['tarBytes']==107141120 and reader.whole.hexdigest()==result['tarSha256']
 assert sourcebytes==107110777
 audit={'schema':'1370-ebg-p13a-archive-independent-local-readback-r1','decision':'LOCAL_ARCHIVE_BYTES_ACCEPTED_ONLY','runId':result['runId'],'memberCount':len(names),'sourceBytes':sourcebytes,'tarBytes':reader.count,'tarSha256':reader.whole.hexdigest(),'parts':reader.part_results,'buildResultSha256':file_sha(resultp),'rosterSha256':file_sha(ROSTER),'sourceHead':HEAD,'sourceTree':TREE,'freeBytesAtReadback':shutil.disk_usage(S).free,'checks':['exact normalized USTAR headers','all 30 regular source bytes equal archive member bytes','all 30 SHA256 and sizes','lexicographic unique member names','zero padding and terminator','whole tar and ordered part hashes','source HEAD/tree and explicit remote ref','AC and one recorded heavy lane']}
 with OUT.open('x') as f:json.dump(audit,f,indent=2,sort_keys=True);f.write('\n')
 print(json.dumps({'decision':audit['decision'],'auditSha256':file_sha(OUT),'tarSha256':audit['tarSha256']}))
if __name__=='__main__':main()
