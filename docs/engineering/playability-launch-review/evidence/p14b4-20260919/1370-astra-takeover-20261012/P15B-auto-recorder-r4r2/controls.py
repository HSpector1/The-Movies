"""UNRUN. Parent: python -I controls.py /absolute/fresh/A-only-fixture-directory.
Tiny invented repo only; no engine/source copies. Requires absent explicit directory.
"""
import copy,hashlib,importlib.util,json,pathlib,subprocess,sys
helper=pathlib.Path(__file__).resolve().with_name("auto_freeze.py")
if helper.is_symlink() or not helper.is_file():raise SystemExit("unsafe adjacent helper")
spec=importlib.util.spec_from_file_location("auto_freeze",helper)
h=importlib.util.module_from_spec(spec);spec.loader.exec_module(h)
root=pathlib.Path(sys.argv[1]).absolute()
allowed=pathlib.Path('/Users/zacheryspector/studio-scratch/1370-astra-takeover-20261012')
if root.parent!=allowed or root.exists() or root.is_symlink():raise SystemExit('fresh direct A-only fixture required')
for ancestor in (allowed,*allowed.parents):
    if ancestor.is_symlink() or not ancestor.is_dir():raise SystemExit('unsafe fixture ancestor')
root.mkdir();repo=root/'repo';repo.mkdir();receipts=root/'receipts';receipts.mkdir()
g=['git','-c','gc.auto=0','-c','maintenance.auto=0','-c','core.hooksPath=/dev/null','--no-optional-locks','-C',str(repo)]
def git(*a):return subprocess.check_output(g+list(a),stderr=subprocess.PIPE)
def digest(p):return ['file',hashlib.sha256(p.read_bytes()).hexdigest(),p.stat().st_mode&511]
def snap():
    n=len(list(receipts.iterdir()));m=h.capture(repo,receipts/str(n))
    return {'HEAD':git('rev-parse','HEAD').decode().strip(),'index':hashlib.sha256(git('ls-files','--stage','-z')).hexdigest(),'cached':hashlib.sha256(git('diff','--cached','--binary')).hexdigest(),'diff':hashlib.sha256(git('diff','--binary')).hexdigest(),'status':git('status','--porcelain=v1','-z','--untracked-files=all').hex(),'untrackedPaths':git('ls-files','--others','--exclude-standard','-z').decode().split('\0')[:-1],'files':{'source.ts':digest(repo/'source.ts')},'inputs':{str(root/'input.json'):digest(root/'input.json')},'autoMetadata':m}
def reject(fn):
    try:fn()
    except (ValueError,OSError,UnicodeError):return
    raise AssertionError('invalid case accepted')
def stamp(meta,date):
    f=meta['facts'];dirty=f['dirtyVariants'][0]
    return '\n'.join([h.BEGIN.decode(),f'- Stamped: {date} CDT by **codex** on PreCompact (session 01a13050-fe8f-7903-9af3-0a45b7130787)',f"- Branch: `{f['branch']}` @ `{f['head']}`",f"- Upstream: `{f['upstream'] or 'none'}`, unpushed commits: {f['ahead']}",f'- Uncommitted files: {len(dirty)}']+[f'  - `{d}`' for d in dirty[:15]]+(['  - ...'] if len(dirty)>15 else [])+['- Last commits:']+['  - '+x for x in f['log']]+[h.END.decode()])
git('init');git('config','user.name','Isolated control');git('config','user.email','fixture@example.invalid')
hand=repo/'HANDOFF.md';original=b'prefix\n'+h.BEGIN+b'\nhistorical\n'+h.END+b'\nsuffix\n';hand.write_bytes(original)
(repo/'source.ts').write_text('fixture');(root/'input.json').write_text('{}');(repo/'notes.md').write_text('non-scoped tracked fixture')
git('add','--','HANDOFF.md','source.ts','notes.md');git('commit','-m','tiny fixture')
base=snap();h.compare_envelopes(base,snap())
for date in ('2026-10-12 21:00','2026-10-12 21:01'):
    m=snap()['autoMetadata'];pre,_,post=h.split(hand.read_bytes());hand.write_bytes(pre+stamp(m,date).encode()+post)
    newer=snap();h.compare_envelopes(base,newer);base=newer
valid=hand.read_bytes()
for bad in (valid+b'x',valid+h.BEGIN,valid.replace(h.END,b''),h.END+h.BEGIN,valid.replace(b'2026-10-12',b'2026-99-12'),valid.replace(b'21:01',b'29:99'),valid.replace(b'**codex**',b'**unknown**')):
    hand.write_bytes(bad);reject(lambda:h.compare_envelopes(base,snap()));hand.write_bytes(valid)
mode=hand.stat().st_mode&511;hand.chmod(mode^0o100);reject(lambda:h.compare_envelopes(base,snap()));hand.chmod(mode)
hand.unlink();hand.symlink_to('source.ts');reject(snap);hand.unlink();hand.write_bytes(valid);hand.chmod(mode)
for p in (repo/'source.ts',repo/'notes.md',root/'input.json'):
    filename=p.name;raw=p.read_bytes();p.write_bytes(raw+b'x');reject(lambda:h.compare_envelopes(base,snap()));p.write_bytes(raw)
    old=p.stat().st_mode&511;p.chmod(old^0o100);reject(lambda:h.compare_envelopes(base,snap()));p.chmod(old)
(repo/'unexpected').write_text('x');reject(lambda:h.compare_envelopes(base,snap()));(repo/'unexpected').unlink()
git('add','--','HANDOFF.md');reject(lambda:h.compare_envelopes(base,snap()));git('restore','--staged','--','HANDOFF.md')
for field in ('HEAD','index','cached'):
    bad=copy.deepcopy(base);bad[field]='b'*len(bad[field]);reject(lambda:h.compare_envelopes(base,bad))
for field in ('files','inputs','untrackedPaths','autoMetadata'):
    bad=copy.deepcopy(base);del bad[field];reject(lambda:h.compare_envelopes(base,bad))
# Deterministically torn second HANDOFF read; real capture still emits first raw receipt.
read=pathlib.Path.read_bytes;count=[0]
def torn(p):
    b=read(p)
    if p==hand:
        count[0]+=1
        if count[0]==2:return b+b'torn'
    return b
pathlib.Path.read_bytes=torn
try:reject(snap)
finally:pathlib.Path.read_bytes=read
# Actual HEAD movement in miniature fixture only.
git('commit','--allow-empty','-m','HEAD control');reject(lambda:h.compare_envelopes(base,snap()))
(root/'CONTROL-RESULT.json').write_text(json.dumps({'passed':True,'scope':'isolated parser/capture/strict-envelope controls only; not campaign or caller authentication'}))
print('isolated controls PASS')
