"""Root-invoked named-index semantics only. No index refresh, write-tree or baseline adoption."""
import datetime,hashlib,json,os,pathlib,re,selectors,signal,stat,subprocess,sys,time
S=pathlib.Path('/Users/zacheryspector/studio-scratch')
REPO=pathlib.Path('/Users/zacheryspector/The-Movies-headless-program')
INDEX=pathlib.Path('/Users/zacheryspector/The Movies - Unity Production Convergence 80H/.git/worktrees/The-Movies-headless-program/index')
PUB=S/'1370-ap-checkpoint-root-finalization-20261010-r1/PUSH-READBACK.json'
PUB_SHA='6545dea2ceaa3cb52d8799fe9ef0aede1b58bd34e42268307b27208c9050e27f'
HEAD='d20347b83ea7497ed17c48ec14d8f64a3ce69cc8'
GIT=pathlib.Path('/usr/bin/git');GIT_SHA='fe38fea56d944c3b7e9df10617b1fa5432d7b75cc346d7eacb607d083ea11711'
CAP=16777216
def need(value,label):
 if not value:raise RuntimeError('STOP_'+label)
def sig(st):return tuple(getattr(st,k) for k in ('st_dev','st_ino','st_mode','st_nlink','st_size','st_mtime_ns','st_ctime_ns'))
def identity(p,cap=CAP,expected_links=1):
 need(p.is_absolute() and p.resolve(strict=True)==p,'PHYSICAL_PATH');a=p.lstat();need(stat.S_ISREG(a.st_mode) and a.st_nlink==expected_links and a.st_size<=cap,'REGULAR_BOUNDED_FILE')
 fd=os.open(p,os.O_RDONLY|os.O_NOFOLLOW);h=hashlib.sha256();count=0
 try:
  need(sig(os.fstat(fd))==sig(a),'OPEN_IDENTITY')
  while True:
   b=os.read(fd,65536)
   if not b:break
   count+=len(b);need(count<=cap,'ACCUMULATED_READ_CAP');h.update(b)
  need(sig(os.fstat(fd))==sig(a)==sig(p.lstat()),'READ_CHANGED')
 finally:os.close(fd)
 return {'path':str(p),'bytes':a.st_size,'sha256':h.hexdigest(),'metadata':list(sig(a))}
def put(p,b):
 fd=os.open(p,os.O_WRONLY|os.O_CREAT|os.O_EXCL|os.O_NOFOLLOW,0o600)
 with os.fdopen(fd,'wb') as f:f.write(b);f.flush();os.fsync(f.fileno())
 p.chmod(0o444);r=identity(p);r.pop('metadata');return r
def retain_index(before,out):
 p=out/'INDEX-LOCAL.bin';source=os.open(INDEX,os.O_RDONLY|os.O_NOFOLLOW);dest=os.open(p,os.O_WRONLY|os.O_CREAT|os.O_EXCL|os.O_NOFOLLOW,0o600);h=hashlib.sha256();count=0
 try:
  need(list(sig(os.fstat(source)))==before['metadata'],'INDEX_COPY_OPEN')
  with os.fdopen(dest,'wb') as f:
   while True:
    b=os.read(source,65536)
    if not b:break
    count+=len(b);need(count<=CAP,'INDEX_COPY_CAP');h.update(b);f.write(b)
   f.flush();os.fsync(f.fileno())
  need(identity(INDEX)==before and count==before['bytes'] and h.hexdigest()==before['sha256'],'INDEX_COPY_CHANGED')
 finally:os.close(source);p.chmod(0o444)
 r=identity(p);r.pop('metadata');return r
def command(args,out,name):
 env={k:os.environ[k] for k in ('PATH','TMPDIR','LANG','LC_ALL','USER','LOGNAME','HOME') if k in os.environ}
 env.update(GIT_OPTIONAL_LOCKS='0',GIT_CONFIG_NOSYSTEM='1',GIT_CONFIG_GLOBAL='/dev/null',GIT_TERMINAL_PROMPT='0')
 argv=[str(GIT),'--no-optional-locks','-c','gc.auto=0','-c','maintenance.auto=0','-c','core.hooksPath=/dev/null','-C',str(REPO),*args]
 started=time.monotonic();p=subprocess.Popen(argv,env=env,stdin=subprocess.DEVNULL,stdout=subprocess.PIPE,stderr=subprocess.PIPE,start_new_session=True)
 sel=selectors.DefaultSelector();buf={'stdout':bytearray(),'stderr':bytearray()};failure=None
 try:
  for label,stream in [('stdout',p.stdout),('stderr',p.stderr)]:os.set_blocking(stream.fileno(),False);sel.register(stream,selectors.EVENT_READ,label)
  while sel.get_map() or p.poll() is None:
   need(time.monotonic()<started+60,'COMMAND_60_SECONDS')
   for key,_ in sel.select(.05):
    b=os.read(key.fileobj.fileno(),65536)
    if not b:sel.unregister(key.fileobj);key.fileobj.close()
    else:need(len(buf[key.data])+len(b)<=CAP,'COMMAND_STREAM_16MIB');buf[key.data].extend(b)
  need(time.monotonic()<started+60,'COMMAND_60_SECONDS')
 except BaseException as e:failure=e
 finally:
  sel.close()
  for stream in (p.stdout,p.stderr):
   if not stream.closed:stream.close()
  if p.poll() is None:
   try:os.killpg(p.pid,signal.SIGKILL)
   except ProcessLookupError:pass
  p.wait(timeout=5)
  try:os.killpg(p.pid,0)
  except ProcessLookupError:pass
  else:
   try:os.killpg(p.pid,signal.SIGKILL)
   except ProcessLookupError:pass
   failure=failure or RuntimeError('STOP_OWNED_GROUP_NOT_ABSENT')
 roles={k:put(out/(name+'.'+k+'.LOCAL'),bytes(v)) for k,v in buf.items()}
 if failure is not None:raise failure
 need(p.returncode==0 and not buf['stderr'],'COMMAND_EXIT_OR_STDERR')
 return bytes(buf['stdout']),{'argv':argv,'pid':p.pid,'pgid':p.pid,'exit':p.returncode,'elapsedSeconds':time.monotonic()-started,'rawLocalOnly':list(roles.values())}
def parse(raw,index):
 need(raw and raw.endswith(b'\0'),'NUL_FRAMING');rows={}
 for record in raw[:-1].split(b'\0'):
  need(record.count(b'\t')>=1,'RECORD_HEADER');header,path=record.split(b'\t',1);fields=header.split(b' ')
  need(len(fields)==3,'RECORD_FIELD_COUNT');mode,second,third=fields
  oid,kind=(second,third) if index else (third,second)
  need(mode in (b'100644',b'100755',b'120000',b'160000'),'MODE')
  need(re.fullmatch(b'[0-9a-f]{40}',oid) is not None,'OBJECT_ID')
  need(kind==b'0' if index else kind==(b'commit' if mode==b'160000' else b'blob'),'STAGE_OR_TYPE')
  need(path and not path.startswith(b'/') and all(x not in (b'',b'.',b'..') for x in path.split(b'/')) and path not in rows,'PATH_OR_DUPLICATE')
  rows[path]=(mode,oid);need(len(rows)<=100000,'ENTRY_BOUND')
 return rows
def main():
 need(sys.flags.isolated and sys.dont_write_bytecode and not sys.flags.optimize and len(sys.argv)==2,'PYTHON_I_B_AND_OUTPUT')
 out=pathlib.Path(sys.argv[1]);need(out.parent==S and out.name.startswith('1370-aq-') and not os.path.lexists(out),'FRESH_SCRATCH_OUTPUT')
 publication=identity(PUB);need(publication['sha256']==PUB_SHA,'PUBLICATION_ROLE');v=json.loads(PUB.read_bytes());need(v['head']==HEAD and v['sourceTree']=='13880d9b0ba72aff5d4c5bcf5d12fe682c5de554' and v['workingTreeClean'] is True,'PUBLICATION_HEAD')
 tool=identity(GIT,expected_links=76);need(tool['sha256']==GIT_SHA and os.access(GIT,os.X_OK),'AUTHENTIC_GIT')
 before=identity(INDEX);out.mkdir(mode=0o700);result={'schema':'1370-aq-current-index-semantic-proof/v1','status':'STOP_INCOMPLETE','executionAuthorization':False,'publication':publication,'gitTool':tool,'indexBefore':before,'commands':[],'rawLocalOnly':[],'oldRawIndexEqualityProved':False,'indexFlagsProved':False,'commonGitAggregateCauseProved':False,'original54871Accepted':False,'preservationContinuityRestored':False}
 try:
  retained=retain_index(before,out);result['currentIndexRawLocalOnly']=retained;result['rawLocalOnly'].append(retained)
  raw,r=command(['ls-files','--stage','-z'],out,'index-stage');result['commands'].append(r);result['rawLocalOnly'].extend(r['rawLocalOnly']);indexed=parse(raw,True)
  raw,r=command(['ls-tree','-r','-z',HEAD],out,'commit-tree');result['commands'].append(r);result['rawLocalOnly'].extend(r['rawLocalOnly']);committed=parse(raw,False)
  need(indexed==committed,'COMPLETE_INDEX_CONTENT_DIFFERS');after=identity(INDEX);result['indexAfter']=after;need(before==after,'INDEX_CHANGED_DURING_PROOF');need(identity(GIT,expected_links=76)==tool and identity(PUB)==publication,'AUTHORITY_CHANGED')
  result.update(status='CURRENT_INDEX_STAGE0_CONTENT_EQUALS_AUTHENTIC_AP_COMMIT_ONLY',entryCount=len(indexed),currentIndexSemanticEquality=True,indexUnchangedDuringProof=True)
 except BaseException as e:
  result['error']=repr(e)
  try:result['indexAfter']=identity(INDEX)
  except BaseException as after:result['indexAfterError']=repr(after)
  raise
 finally:
  names=['INDEX-LOCAL.bin','index-stage.stdout.LOCAL','index-stage.stderr.LOCAL','commit-tree.stdout.LOCAL','commit-tree.stderr.LOCAL'];result['localRawPaths']=[str(out/n) for n in names if (out/n).exists()]
  result['rawDisposition']='LOCAL_HASH_SIZE_ONLY';result['utc']=datetime.datetime.now(datetime.timezone.utc).isoformat();r=put(out/'RESULT.json',(json.dumps(result,sort_keys=True,indent=2)+'\n').encode());print(json.dumps({'status':result['status'],'result':r}),flush=True)
if __name__=='__main__':main()
