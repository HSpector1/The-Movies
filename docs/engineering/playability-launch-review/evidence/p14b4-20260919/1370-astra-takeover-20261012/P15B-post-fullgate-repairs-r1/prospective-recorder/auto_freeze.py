"""Prospective narrow AUTO comparator; capture/check only. No HANDOFF writes."""
import datetime, hashlib, json, os, pathlib, re, subprocess, sys, time
BEGIN=b'<!-- AUTO:BEGIN (handoff_guard.py rewrites this block) -->'
END=b'<!-- AUTO:END -->'
def split(raw):
    raw.decode('utf-8',errors='strict')
    if raw.count(BEGIN)!=1 or raw.count(END)!=1: raise ValueError('AUTO markers not unique')
    a=raw.index(BEGIN);b=raw.index(END)
    if b<a: raise ValueError('AUTO markers reversed')
    return raw[:a],raw[a:b+len(END)],raw[b+len(END):]
def regular(p):
    s=p.lstat()
    if p.is_symlink() or not p.is_file() or s.st_nlink!=1: raise ValueError('unsafe HANDOFF file')
    return s.st_mode & 0o777

def capture(root,receipt):
    r=pathlib.Path(root);p=r/'HANDOFF.md'
    g=['git','-c','gc.auto=0','-c','maintenance.auto=0','--no-optional-locks','-C',str(r)]
    def git(*a,optional=False):
        z=subprocess.run(g+list(a),stdout=subprocess.PIPE,stderr=subprocess.PIPE)
        if z.returncode and not optional: raise ValueError('git read failed '+repr(a))
        return z.stdout
    # Preserve evidence even on parser/stability rejection. New receipt per check.
    q=pathlib.Path(receipt);q.mkdir()
    try: mode=regular(p)
    except Exception as e:
        (q/'rejection.txt').write_text(str(e));raise
    # Reject symlink before following any bytes.
    raw=p.read_bytes();(q/'HANDOFF.raw').write_bytes(raw)
    diff=git('diff','--binary');status=git('status','--porcelain=v1','-z','--untracked-files=all')
    (q/'diff.raw').write_bytes(diff);(q/'status.raw').write_bytes(status)
    parts=split(raw)
    nonstatus=[]
    entries=status.split(b'\0');i=0
    while i<len(entries):
        e=entries[i];i+=1
        if not e:continue
        if e[:2].find(b'R')>=0 or e[:2].find(b'C')>=0:
            # Conservative: reject renames/copies rather than normalize their paired paths.
            raise ValueError('rename/copy not admitted by AUTO recorder')
        if e[3:]!=b'HANDOFF.md':nonstatus.append(e)
        elif e[:2] not in (b' M',):raise ValueError('HANDOFF index/path status changed')
    hookstatus=git('status','--porcelain').decode().strip().splitlines()
    facts={'branch':git('branch','--show-current').decode().strip() or 'DETACHED',
           'head':git('rev-parse','HEAD').decode().strip(),
           'upstream':git('rev-parse','--abbrev-ref','@{u}',optional=True).decode().strip(),
           'log':git('log','--oneline','-5').decode().strip().splitlines()}
    facts['ahead']=git('rev-list','--count','@{u}..HEAD').decode().strip() if facts['upstream'] else '?'
    # Hook may have observed HANDOFF before its first appearance as dirty. Exact .strip
    # semantics matter: first porcelain row loses leading space only in hook view.
    without=git('status','--porcelain','--', '.',':(exclude)HANDOFF.md').decode().strip().splitlines()
    facts['dirtyVariants']=[hookstatus,without]
    if p.read_bytes()!=raw or regular(p)!=mode or git('diff','--binary')!=diff or git('status','--porcelain=v1','-z','--untracked-files=all')!=status:raise ValueError('unstable metadata capture')
    return {'mode':mode,'outside':[parts[0].hex(),parts[2].hex()], 'auto':parts[1].decode(),
            'nonHandoffDiff':git('diff','--binary','--','.',':(exclude)HANDOFF.md').hex(),
            'nonHandoffStatus':b'\0'.join(nonstatus).hex(),'facts':facts,'receipt':str(q)}
def changed_auto_valid(current):
    block=current['auto'];lines=block.split('\n');f=current['facts']
    if len(lines)<7 or lines[0]!=BEGIN.decode() or lines[-1]!=END.decode():raise ValueError('invalid AUTO framing')
    # Payload identifiers are bounded single-line text; event/tool restricted to actual hook callers.
    stamp=re.fullmatch(r'- Stamped: (\d{4}-\d{2}-\d{2} \d{2}:\d{2}) (CDT|CST) by \*\*codex\*\* on PreCompact \(session 01a13050-fe8f-7903-9af3-0a45b7130787\)',lines[1])
    if stamp is None:raise ValueError('unknown stamp/caller format')
    datetime.datetime.strptime(stamp[1],'%Y-%m-%d %H:%M')
    if lines[2]!=f"- Branch: `{f['branch']}` @ `{f['head']}`":raise ValueError('AUTO branch/HEAD mismatch')
    if lines[3]!=f"- Upstream: `{f['upstream'] or 'none'}`, unpushed commits: {f['ahead']}":raise ValueError('AUTO upstream mismatch')
    tails=[]
    for dirty in f['dirtyVariants']:
        tails.append([f'- Uncommitted files: {len(dirty)}']+[f'  - `{d}`' for d in dirty[:15]]+(['  - ...'] if len(dirty)>15 else [])+['- Last commits:']+['  - '+x for x in f['log']]+[END.decode()])
    if lines[4:] not in tails:raise ValueError('AUTO status/log mismatch')
def check(old,new):
    for key in ('mode','outside','nonHandoffDiff','nonHandoffStatus','facts'):
        if key=='facts':
            for k in ('head','branch','upstream','ahead','log'):
                if old[key][k]!=new[key][k]:raise ValueError('Git facts changed '+k)
        elif old[key]!=new[key]:raise ValueError('metadata outside AUTO changed '+key)
    if old['auto']!=new['auto']:changed_auto_valid(new)

def envelope(d):
    required={'HEAD','index','cached','diff','status','untrackedPaths','files','inputs','autoMetadata'}
    if not isinstance(d,dict) or set(d)!=required:raise ValueError('invalid snapshot fields')
    if not re.fullmatch('[0-9a-f]{40}',d['HEAD']):raise ValueError('invalid HEAD')
    for k in ('index','cached','diff'):
        if not isinstance(d[k],str) or not re.fullmatch('[0-9a-f]{64}',d[k]):raise ValueError('invalid digest '+k)
    if not isinstance(d['status'],str) or not re.fullmatch('(?:[0-9a-f]{2})*',d['status']):raise ValueError('invalid status')
    if not isinstance(d['untrackedPaths'],list) or any(not isinstance(x,str) for x in d['untrackedPaths']):raise ValueError('invalid inventory')
    def identity(v):
        return isinstance(v,list) and ((len(v)==3 and v[0]=='file' and isinstance(v[1],str) and re.fullmatch('[0-9a-f]{64}',v[1]) and isinstance(v[2],int) and 0<=v[2]<=511) or (len(v)==2 and v[0]=='symlink' and isinstance(v[1],str)) or v==['missing'])
    for k in ('files','inputs'):
        if not isinstance(d[k],dict) or not d[k]:raise ValueError('missing bound '+k)
        for path,v in d[k].items():
            if not isinstance(path,str) or not (identity(v) or (k=='inputs' and isinstance(v,dict) and all(isinstance(x,str) and identity(y) for x,y in v.items()))):raise ValueError('invalid identity '+path)
    m=d['autoMetadata']
    if not isinstance(m,dict) or set(m)!={'mode','outside','auto','nonHandoffDiff','nonHandoffStatus','facts','receipt'}:raise ValueError('invalid AUTO envelope')
    if not isinstance(m['mode'],int) or not 0<=m['mode']<=511 or not isinstance(m['outside'],list) or len(m['outside'])!=2:raise ValueError('invalid AUTO identity')
    for x in m['outside']+[m['nonHandoffDiff'],m['nonHandoffStatus']]:
        if not isinstance(x,str) or not re.fullmatch('(?:[0-9a-f]{2})*',x):raise ValueError('invalid AUTO byte field')
    if not isinstance(m['auto'],str) or not isinstance(m['receipt'],str):raise ValueError('invalid AUTO bytes')
    split(bytes.fromhex(m['outside'][0])+m['auto'].encode()+bytes.fromhex(m['outside'][1]))
    f=m['facts']
    if not isinstance(f,dict) or set(f)!={'branch','head','upstream','ahead','log','dirtyVariants'}:raise ValueError('invalid Git facts')
    for k in ('branch','head','upstream','ahead'):
        if not isinstance(f[k],str):raise ValueError('invalid Git field')
    if not isinstance(f['log'],list) or any(not isinstance(x,str) for x in f['log']):raise ValueError('invalid log')
    if not isinstance(f['dirtyVariants'],list) or len(f['dirtyVariants'])!=2 or any(not isinstance(x,list) or any(not isinstance(y,str) for y in x) for x in f['dirtyVariants']):raise ValueError('invalid dirty variants')

def compare_envelopes(old,new):
    envelope(old);envelope(new)
    import copy
    old,new=copy.deepcopy(old),copy.deepcopy(new)
    om=old.pop('autoMetadata');nm=new.pop('autoMetadata')
    for d in (old,new):
        d.pop('diff');d.pop('status');d['files'].pop('HANDOFF.md',None)
    if old!=new:raise ValueError('strict source/index/HEAD/input freeze changed')
    check(om,nm)
    return om,nm

def main():
    command=sys.argv[1]
    if command=='capture':print(json.dumps(capture(sys.argv[2],sys.argv[3]),sort_keys=True))
    elif command=='check':
        old,new=(json.loads(pathlib.Path(x).read_text()) for x in sys.argv[2:4])
        om,nm=compare_envelopes(old,new)
        print(json.dumps({'metadataOnly':om['auto']!=nm['auto'],'oldAUTOsha256':hashlib.sha256(om['auto'].encode()).hexdigest(),'newAUTOsha256':hashlib.sha256(nm['auto'].encode()).hexdigest(),'receipt':nm['receipt'],'detectedUTC':datetime.datetime.now(datetime.timezone.utc).isoformat()}))
    else:raise ValueError('unknown command')
if __name__=='__main__':main()
