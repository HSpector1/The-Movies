#!/usr/bin/env python3
"""Read-only macOS lease-bound RSS/stat observer. No runtime requests or signals."""
import argparse, datetime, json, os, pathlib, re, stat, subprocess, sys, time

LEASE_KEYS = {'version','launchId','launchDirectory','startedAt','phase','supervisor','engine','unity','fixedPort','engineRestarts'}

def utc():
    return datetime.datetime.now(datetime.timezone.utc).isoformat(timespec='milliseconds').replace('+00:00','Z')

def check_dir(path, missing=False):
    try: s=path.lstat()
    except FileNotFoundError:
        if missing: return False
        raise
    if not stat.S_ISDIR(s.st_mode) or s.st_uid != os.getuid() or path.resolve()!=path:
        raise ValueError('Directory is not a canonical owned real directory: '+str(path))
    return True

def read_lease(path):
    try:
        fd=os.open(path, os.O_RDONLY | os.O_NOFOLLOW)
    except FileNotFoundError: return None
    with os.fdopen(fd,'rb') as f:
        s=os.fstat(f.fileno())
        if not stat.S_ISREG(s.st_mode) or s.st_uid!=os.getuid() or s.st_size>16384:
            raise ValueError('Lease must be owned regular file <=16KiB')
        raw=f.read(16385)
        if len(raw)>16384: raise ValueError('Lease exceeds16KiB')
    value=json.loads(raw)
    if not isinstance(value,dict) or set(value)!=LEASE_KEYS: raise ValueError('Unexpected lease schema')
    if value['version']!=1 or value['phase'] not in ('starting','running','stopping','stopped'):
        raise ValueError('Invalid lease version/phase')
    if not isinstance(value['launchId'],str) or not re.fullmatch(r'[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}',value['launchId']):
        raise ValueError('Invalid launch id')
    if not isinstance(value['launchDirectory'],str) or not re.fullmatch(r'launch-\d{8}T\d{9}Z-[0-9a-f-]{36}',value['launchDirectory']):
        raise ValueError('Invalid retained lease directory')
    if value['engineRestarts']!=0: raise ValueError('Engine restart: observer refuses replacement authority')
    for kind in ('supervisor','engine','unity'):
        ref=value[kind]
        if kind!='supervisor' and ref is None: continue
        expected={'pid','processIncarnation'} if kind=='supervisor' else {'kind','pid','processGroupId','processIncarnation'}
        if not isinstance(ref,dict) or set(ref)!=expected or type(ref['pid']) is not int or ref['pid']<=0:
            raise ValueError('Malformed process reference: '+kind)
        if not isinstance(ref['processIncarnation'],str) or not ref['processIncarnation'].startswith('ps-lstart:') or len(ref['processIncarnation'])>240:
            raise ValueError('Unverifiable process incarnation: '+kind)
        if kind!='supervisor' and (ref['kind']!=kind or ref['processGroupId']!=ref['pid']):
            raise ValueError('Malformed child reference: '+kind)
    return value

def bind(lease, identity, refs):
    current={k:lease[k] for k in ('launchId','launchDirectory','supervisor')}
    if identity is not None and current!=identity: raise ValueError('Observed launch/owner changed')
    for kind in ('supervisor','engine','unity'):
        ref=lease[kind]
        if ref is None: continue
        if kind in refs and ref!=refs[kind]: raise ValueError('Observed '+kind+' incarnation changed')
        refs[kind]=ref.copy()
    if len({r['pid'] for r in refs.values()})!=len(refs): raise ValueError('Duplicate owned PIDs')
    return current

def parse_ps(output):
    rows={}
    for line in output.splitlines():
        fields=line.split(None,2)
        if len(fields)!=3 or not fields[0].isdigit() or not fields[1].isdigit(): raise ValueError('Malformed ps row')
        pid=int(fields[0]); incarnation='ps-lstart:'+' '.join(fields[2].split())
        if pid in rows: raise ValueError('Duplicate ps PID')
        rows[pid]={'pid':pid,'rssBytes':int(fields[1])*1024,'processIncarnation':incarnation}
    return rows

def owned_rows(rows, refs):
    result={}
    for kind, ref in refs.items():
        row=rows.get(ref['pid'])
        if row is not None and row['processIncarnation']!=ref['processIncarnation']:
            raise ValueError('PID incarnation mismatch; RSS refused: '+kind)
        result[kind]=row
    return result

def disk_sizes(runtime):
    if not check_dir(runtime,missing=True): return {'present':False,'files':[],'regularFileBytes':0}
    files=[]; skipped=[]
    with os.scandir(runtime) as entries:
        for entry in entries:
            try: s=entry.stat(follow_symlinks=False)
            except FileNotFoundError:
                skipped.append({'name':entry.name,'reason':'disappeared during stat'});continue
            if stat.S_ISREG(s.st_mode): files.append({'name':entry.name,'bytes':s.st_size})
            else: skipped.append({'name':entry.name,'reason':'nonregular: not followed'})
    files.sort(key=lambda x:x['name'])
    return {'present':True,'files':files,'regularFileBytes':sum(f['bytes'] for f in files),'skipped':skipped}

def main():
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--package-root',required=True)
    parser.add_argument('--output',required=True,help='New output directory; must not already exist')
    parser.add_argument('--duration-seconds',type=int,default=7200)
    args=parser.parse_args()
    if not 1<=args.duration_seconds<=7200: parser.error('Duration must be1..7200 seconds')
    package=pathlib.Path(os.path.abspath(args.package_root));check_dir(package)
    profile=package/'PrivateProfile';runtime=profile/'bridge-runtime';active=profile/'active-supervisor-v1.json'
    output=pathlib.Path(os.path.abspath(args.output));output.mkdir(mode=0o700,parents=False,exist_ok=False)
    summary={'version':1,'status':'STARTING','complete':False,'startedAt':utc(),'observerPid':os.getpid(),
        'packageRoot':str(package),'sampleIntervalMs':500,'durationLimitSeconds':args.duration_seconds,
        'psCommand':['/bin/ps','-o','pid=,rss=,lstart=','-p','<deduplicated observer + lease-bound supervisor/engine/unity PIDs>'],
        'sourceSha256':__import__('hashlib').sha256(pathlib.Path(__file__).read_bytes()).hexdigest(),
        'qualifications':['Sampled RSS maxima are not exact peaks; sub-500ms peaks can be missed.',
        'RSS is per OS process; engine RSS includes its worker threads. Observer is separate.',
        'Per-process maxima occur at separate times and must not be added. Concurrent engine+Unity sums use only the same ps sample.',
        'Disk values are logical lengths of top-level regular files, not allocated disk blocks; no store bodies are read.',
        'No process request, capability retrieval, input, signal, or runtime mutation occurs. Root native runner independently verifies executable/package identity and UI Quit.',
        'Completion means the observed lease stopped and its bound processes disappeared; it is not product/performance acceptance.'],
        'samples':0,'sampledMaxRss':{},'maxConcurrentEngineUnityRss':None,'maxTopLevelRegularFileBytes':None,'errors':[]}
    identity=None;refs={};stopped=False;observer_incarnation=None;start=time.monotonic();next_sample=start
    def persist():
        temp=output/'summary.json.tmp'
        with open(temp,'w',encoding='utf8') as f: json.dump(summary,f,indent=2);f.write('\n')
        os.chmod(temp,0o600);os.replace(temp,output/'summary.json')
    persist()
    try:
        with open(output/'samples.jsonl','x',encoding='utf8',buffering=1) as sink:
            os.chmod(output/'samples.jsonl',0o600)
            while True:
                if time.monotonic()-start>=args.duration_seconds:
                    raise TimeoutError('Observation deadline reached before complete owned cleanup')
                sample_start=time.monotonic();timestamp=utc();epoch_ms=time.time_ns()//1000000
                lease=None
                if check_dir(profile,missing=True): lease=read_lease(active)
                if lease is not None:
                    identity=bind(lease,identity,refs);summary['identity']=identity
                    summary.setdefault('firstLeaseAt',timestamp)
                retained=None
                if identity is not None and lease is None:
                    launches=profile/'launches';launch=launches/identity['launchDirectory']
                    check_dir(launches);check_dir(launch)
                    retained=read_lease(launch/'launch-lease-v1.json')
                    if retained is None: raise ValueError('Retained lease missing after active lease disappeared')
                    bind(retained,identity,refs)
                    stopped=retained['phase']=='stopped' and retained['engine'] is None and retained['unity'] is None
                pids=sorted({os.getpid(),*(r['pid'] for r in refs.values())})
                ps_start=time.monotonic()
                proc=subprocess.run(['/bin/ps','-o','pid=,rss=,lstart=','-p',','.join(map(str,pids))],
                    capture_output=True,text=True,timeout=3,env={'PATH':'/usr/bin:/bin','LANG':'C','LC_ALL':'C'})
                if proc.returncode!=0: raise ValueError('ps failed: exit '+str(proc.returncode))
                ps_ms=(time.monotonic()-ps_start)*1000;rows=parse_ps(proc.stdout)
                if any(pid not in pids for pid in rows): raise ValueError('ps returned unrelated PID')
                own=rows.get(os.getpid())
                if own is None: raise ValueError('Observer PID absent from ps')
                observer_incarnation=observer_incarnation or own['processIncarnation']
                if own['processIncarnation']!=observer_incarnation: raise ValueError('Observer incarnation changed')
                measured=owned_rows(rows,refs);measured['observer']=own
                disk=disk_sizes(runtime)
                sample={'at':timestamp,'epochMs':epoch_ms,'elapsedMs':(sample_start-start)*1000,
                    'leasePhase':lease['phase'] if lease else None,'retainedPhase':retained['phase'] if retained else None,
                    'processes':measured,'storage':disk,'psElapsedMs':ps_ms}
                for kind,row in measured.items():
                    if row is None: continue
                    prior=summary['sampledMaxRss'].get(kind)
                    if prior is None or row['rssBytes']>prior['rssBytes']:
                        summary['sampledMaxRss'][kind]={**row,'at':timestamp,'epochMs':epoch_ms}
                if measured.get('engine') and measured.get('unity'):
                    concurrent=measured['engine']['rssBytes']+measured['unity']['rssBytes']
                    sample['concurrentEngineUnityRssBytes']=concurrent
                    prior=summary['maxConcurrentEngineUnityRss']
                    if prior is None or concurrent>prior['rssBytes']:
                        summary['maxConcurrentEngineUnityRss']={'rssBytes':concurrent,'at':timestamp,'epochMs':epoch_ms}
                prior=summary['maxTopLevelRegularFileBytes']
                if prior is None or disk['regularFileBytes']>prior['bytes']:
                    summary['maxTopLevelRegularFileBytes']={'bytes':disk['regularFileBytes'],'at':timestamp,'files':disk['files']}
                summary['samples']+=1;summary['lastSampleAt']=timestamp
                sample['sampleElapsedMs']=(time.monotonic()-sample_start)*1000
                sink.write(json.dumps(sample,separators=(',',':'))+'\n')
                if identity and lease is None and stopped and all(measured.get(k) is None for k in refs):
                    if (runtime/'bridge-runtime-v1.json.lock').exists():
                        summary['cleanupWaitingForCheckpointLock']=True
                    else:
                        summary['status']='OBSERVATION_COMPLETE';summary['complete']=True
                        summary['cleanup']={'activeLeaseAbsent':True,'retainedPhaseStopped':True,'boundIncarnationsAbsent':True,
                            'checkpointLockAbsent':True,'sawEngineAndUnity':all(k in refs for k in ('engine','unity'))}
                        if not summary['cleanup']['sawEngineAndUnity']:
                            raise ValueError('Cleanup complete but engine/Unity was not observed; incomplete launch measurement')
                        break
                summary['status']='OBSERVING_OWNED_LAUNCH' if identity else 'WAITING_FOR_FIRST_LEASE'
                if summary['samples']%10==0: persist()
                next_sample=max(next_sample+0.5,time.monotonic())
                time.sleep(max(0,next_sample-time.monotonic()))
    except BaseException as error:
        summary['complete']=False;summary['status']='INTERRUPTED_PARTIAL' if isinstance(error,KeyboardInterrupt) else 'REFUSED_OR_FAILED_PARTIAL'
        summary['errors'].append({'at':utc(),'type':type(error).__name__,'message':str(error)})
    finally:
        summary['finishedAt']=utc();summary['elapsedSeconds']=time.monotonic()-start
        summary['boundProcessReferences']=refs;persist()
    print(json.dumps({'output':str(output),'status':summary['status'],'complete':summary['complete'],'samples':summary['samples']}),flush=True)
    return 0 if summary['complete'] else 1

if __name__=='__main__': sys.exit(main())
