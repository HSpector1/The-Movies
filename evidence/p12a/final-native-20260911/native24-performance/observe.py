import pathlib,json,os,time,hashlib,datetime,argparse,signal
os.umask(0o077)
P=pathlib.Path(__file__).resolve().parent
ap=argparse.ArgumentParser();ap.add_argument('--runtime',required=True);ap.add_argument('--evidence',required=True);ap.add_argument('--app-pid',required=True,type=int);ap.add_argument('--seconds',type=int,default=900);a=ap.parse_args()
assert 1<=a.seconds<=1800
runtime=pathlib.Path(a.runtime).resolve(strict=True);evidence=pathlib.Path(a.evidence).resolve(strict=True)
assert str(runtime).startswith('/private/tmp/p12a-native-')
assert str(evidence).startswith('/Users/bruce/The Movies - P12A Living Hollywood Unity/Evidence/P12A/early-')
assert evidence.name!='early-2026-09-11T02-53-09-816Z','Run23 aborted; observation excluded'
mapfile=runtime/'element-map.json';perffile=evidence/'runtime-performance/PerformanceCaptures/Unity/runtime-performance.json'
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def utc():return datetime.datetime.now(datetime.timezone.utc).isoformat()
def unchanged():return [r['path'] for r in json.loads((P/'source-binding.json').read_text())['sources'] if sha(pathlib.Path(r['path']))!=r['sha256']]
def emit(f,x):f.write(json.dumps(x,separators=(',',':'))+'\n');f.flush()
def coherent(path,maxbytes):
 before=path.stat();assert before.st_size<=maxbytes,'bounded input size exceeded'
 raw=path.read_bytes();after=path.stat()
 if (before.st_ino,before.st_mtime_ns,before.st_size)!=(after.st_ino,after.st_mtime_ns,after.st_size):raise ValueError('changed-during-read')
 return json.loads(raw),after,hashlib.sha256(raw).hexdigest()
assert not unchanged(),'observation source changed before start'
os.kill(a.app_pid,0)
with (P/'STARTED.json').open('x') as f:json.dump({'at':utc(),'observerPid':os.getpid(),'appPid':a.app_pid,'runtime':str(runtime),'evidence':str(evidence),'map':str(mapfile),'performance':str(perffile),'maxSeconds':a.seconds,'pollIntervalSeconds':.25,'observerSha256':sha(pathlib.Path(__file__))},f,indent=2)
stop=False
def stopping(*_):
 global stop
 stop=True
signal.signal(signal.SIGTERM,stopping);signal.signal(signal.SIGINT,stopping)
controls={'studio-menu-open','studio-menu-resume','studio-menu-quit','studio-menu-save','studio-menu-load','campaign-new','campaign-save-as','campaign-refresh','campaign-retry','campaign-cancel','campaign-leave-save','campaign-leave-discard'}
metrics={'polls':0,'newMapGenerations':0,'missingMaps':0,'readRacesOrParseErrors':0,'unchangedReads':0,'mapGenerationSkips':0,'frameRegressions':0,'maxObserverPollGapMs':0,'maxObservedNewMapArrivalGapMs':0,'performancePublications':0,'errors':[]}
started=time.monotonic();lastpoll=started;lastnew=None;lastgen=None;lastframe=None;perfhash=None;nextperf=0;nextprogress=started+30;stopreason='bounded-duration';lastmap=None
with (P/'maps.jsonl').open('x') as maps,(P/'performance.jsonl').open('x') as perf,(P/'read-events.jsonl').open('x') as events:
 try:
  while time.monotonic()-started<a.seconds and not stop and not (P/'STOP').exists():
   t=time.monotonic();metrics['polls']+=1;metrics['maxObserverPollGapMs']=max(metrics['maxObserverPollGapMs'],(t-lastpoll)*1000);lastpoll=t
   try:
    m,st,h=coherent(mapfile,2_000_000);generation=m.get('mapGeneration');frame=m.get('frameCount')
    assert isinstance(generation,int) and isinstance(frame,int),'map frame/generation missing'
    if generation!=lastgen:
     gap=None if lastnew is None else (t-lastnew)*1000
     if gap is not None:metrics['maxObservedNewMapArrivalGapMs']=max(metrics['maxObservedNewMapArrivalGapMs'],gap)
     if lastgen is not None:metrics['mapGenerationSkips']+=max(0,generation-lastgen-1)
     if lastframe is not None and frame<lastframe:metrics['frameRegressions']+=1
     diag=m.get('diag') or {};authority=diag.get('authority') or {}
     selected=[{'name':x['name'],'visible':x.get('visible'),'enabled':x.get('enabled')} for x in m.get('elements',[]) if x.get('name') in controls]
     row={'observedUtc':utc(),'observedEpochNs':time.time_ns(),'observerElapsedMs':(t-started)*1000,'mapMtimeEpochNs':st.st_mtime_ns,'mapSha256':h,'mapGeneration':generation,'frameCount':frame,'generationDelta':None if lastgen is None else generation-lastgen,'frameDelta':None if lastframe is None else frame-lastframe,'arrivalGapMs':gap,'workspaceOpen':m.get('workspaceOpen'),'rootEnabled':m.get('rootEnabled'),'eventSystem':m.get('eventSystem'),'authority':{k:authority.get(k) for k in ['sessionId','stateRevision','gameWeek','stateDigest','successfulSnapshotPollCount','connectionState','transportOutageCount']},'profileRouteOpen':diag.get('profileRouteOpen'),'profileTalentId':diag.get('profileTalentId'),'controls':selected}
     emit(maps,row);lastmap=row;lastgen=generation;lastframe=frame;lastnew=t;metrics['newMapGenerations']+=1
    else:metrics['unchangedReads']+=1
   except FileNotFoundError:metrics['missingMaps']+=1
   except (ValueError,AssertionError,OSError) as e:
    metrics['readRacesOrParseErrors']+=1;emit(events,{'at':utc(),'kind':'map-read-not-evidence','errorType':type(e).__name__,'message':str(e)[:160]})
   if t>=nextperf:
    nextperf=t+1
    try:
     d,st,h=coherent(perffile,5_000_000)
     if h!=perfhash:
      # Existing instrumentation guarantees no bodies/capabilities in bridge diagnostic records.
      row={'observedUtc':utc(),'observedEpochNs':time.time_ns(),'sha256':h,'fileMtimeEpochNs':st.st_mtime_ns,'status':d.get('status'),'applicationQuitCapture':d.get('applicationQuitCapture'),'applicationQuitCapturedUtc':d.get('applicationQuitCapturedUtc'),'timing':d.get('timing'),'bridge':d.get('bridge')}
      emit(perf,row);perfhash=h;metrics['performancePublications']+=1
    except FileNotFoundError:pass
    except (ValueError,AssertionError,OSError) as e:emit(events,{'at':utc(),'kind':'performance-read-not-evidence','errorType':type(e).__name__,'message':str(e)[:160]})
   try:os.kill(a.app_pid,0)
   except ProcessLookupError:stopreason='observed-app-process-exited';break
   if t>=nextprogress:
    nextprogress=t+30
    print(json.dumps({'at':utc(),'elapsedSeconds':round(t-started,2),'maps':metrics['newMapGenerations'],'lastFrame':lastframe,'performancePublications':metrics['performancePublications'],'readRaces':metrics['readRacesOrParseErrors']}),flush=True)
   time.sleep(max(0,.25-(time.monotonic()-t)))
  if stop or (P/'STOP').exists():stopreason='observer-stop-request'
 except Exception as e:
  metrics['errors'].append({'type':type(e).__name__,'message':str(e)[:200]});stopreason='observer-error'
 finally:
  result={'at':utc(),'status':'OBSERVATIONS_ONLY_NO_PASS_CLAIM','stopReason':stopreason,'elapsedSeconds':time.monotonic()-started,'metrics':metrics,'lastMap':lastmap,'sourceChanges':unchanged(),'limitations':['Every15Unityframes map publication plus250ms observer polling is not an all-frame or input-response measurement.','Read races, missing files, scheduler delay and skipped generations are recorded; map arrival gaps cannot uniquely identify a UI stall.','Continued frame/map publication during Save establishes observed rendering/progress, not that blocked campaign controls are responsive or every interaction remains available.','Only final existing bridge diagnostics can bind actual Save send-to-coroutine-resume and application scopes. Those include transport/server wait and scheduling, not continuous UI unresponsiveness.','Existing45s warmup/30s frame window is scoped by its UTC/tick boundaries; it cannot be extended to a later Save unless timestamps overlap.','No native input, HTTP requests, screenshot capture, raw-save read, process mutation or shared source/global-setting edits occurred.']}
  with (P/'observer-result.json').open('x') as f:json.dump(result,f,indent=2);f.write('\n')
  print(json.dumps({'stopped':True,'reason':stopreason,'maps':metrics['newMapGenerations'],'errors':metrics['errors'],'sourceChanges':result['sourceChanges'],'directory':str(P)}),flush=True)
