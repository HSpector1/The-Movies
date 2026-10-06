from __future__ import annotations
import argparse, hashlib, json, os, re, stat, tarfile
from pathlib import Path
S = Path('/Users/zacheryspector/studio-scratch')
R = Path('/Users/zacheryspector/The-Movies-headless-program')
E = R / 'docs/engineering/playability-launch-review/evidence/p14b4-20260919'
OUT = S / '1368-eighteenth-publication-prep-r4'
PACKAGE_DIRS = [
    '1368-ledger-r6-state-capture-proposal-20261005-r1',
    '1368-ledger-r7-exploratory-proposal-20261005-r1',
    '1368-ledger-r7-exploratory-proposal-20261005-r2',
]
FIXED_DIRS = PACKAGE_DIRS + [
    '1368-ledger-r6-state-capture-independent-review-20261005',
    '1368-ledger-r6-types-clean-gate-independent-20261005',
    '1368-ledger-r6-clean-capture-independent-audit-20261005',
    '1368-ledger-r6-state-benchmark-harness-20261005-r1',
    '1368-ledger-r6-state-benchmark-results-20261005-r1',
    '1368-ledger-r5-snap-optimization-proposal-20261005-r1',
    '1368-ledger-r5-snap-optimization-proposal-20261005-r2',
    '1368-ledger-r5-snap-optimization-proposal-20261005-r3',
    '1368-ledger-r5-snap-optimization-review-20261005-r1',
    '1368-ledger-r5-rawsnap-independent-design-20261005-r1',
    '1368-ledger-r5-batched-snap-proposal-20261005-r1',
    '1368-ledger-r5-replacer-feasibility-20261005-r1',
    '1368-ledger-r7-descriptive-comparator-20261005-r1',
    '1368-ledger-r7-descriptive-comparator-20261005-r2',
    '1368-ledger-r7-comparator-self-review-20261005-r1',
    '1368-ledger-r7-descriptive-comparator-20261005-r3',
    '1368-ledger-r7-comparator-r3-self-review-20261005',
    '1368-ledger-r7-exploratory-independent-review-20261005',
]
RUNS = [
    # package, leaf, formal stem, heavy queue log stem
    ('r6-types', '1368-ledger-recorded-runs-r6-capture-r1', 'ABC-types-source-r1', '1368-ledger-r6-capture-r1-abc-types-source-r1', '1368-ledger-r6-capture-types-r1'),
    ('r6-clean', '1368-ledger-recorded-runs-r6-capture-r1', 'ABC-clean-p13a-r1', '1368-ledger-r6-capture-r1-abc-clean-p13a-r1', '1368-ledger-r6-capture-clean-p13a-r1'),
    ('r7-types', '1368-ledger-recorded-runs-r7-exploratory-r2', 'ABC-types-source-r1', '1368-ledger-r7-exploratory-r2-abc-types-source-r1', '1368-ledger-r7-exploratory-r2-types-r1'),
    ('r7-clean', '1368-ledger-recorded-runs-r7-exploratory-r2', 'ABC-clean-p13a-r1', '1368-ledger-r7-exploratory-r2-abc-clean-p13a-r1', '1368-ledger-r7-exploratory-r2-clean-p13a-r1'),
    ('r7-observed', '1368-ledger-recorded-runs-r7-exploratory-r2', 'ABC-observed-p13a-r1', '1368-ledger-r7-exploratory-r2-abc-observed-p13a-r1', '1368-ledger-r7-exploratory-r2-observed-p13a-r1'),
]
FORMAL_SUFFIXES = ['.json', '.patch', '.txt', '-preflight.json', '-postflight.json']

def sha(data: bytes) -> str: return hashlib.sha256(data).hexdigest()
def member(path: Path) -> str:
    if path.is_relative_to(S): return 'studio-scratch/' + path.relative_to(S).as_posix()
    assert path.is_relative_to(E), path
    return 'formal-evidence/' + path.relative_to(E).as_posix()
def regular(path: Path):
    assert path.is_file() and not path.is_symlink() and stat.S_ISREG(path.lstat().st_mode), path
    assert path.resolve() == path, path
    return path

def scan(root: Path, skipped_symlinks: list[str], skipped_caches: list[str]) -> list[Path]:
    assert root.is_dir() and not root.is_symlink(), root
    found=[]
    for base, dirs, files in os.walk(root, followlinks=False):
        b=Path(base)
        for d in list(dirs):
            q=b/d
            if q.is_symlink(): skipped_symlinks.append(str(q)); dirs.remove(d)
            elif d in {'node_modules','__pycache__'}: skipped_caches.append(str(q)); dirs.remove(d)
        dirs.sort()
        for name in sorted(files):
            q=b/name
            if q.is_symlink(): skipped_symlinks.append(str(q)); continue
            if name.endswith('.pyc'): skipped_caches.append(str(q)); continue
            found.append(regular(q))
    return found

def verify_run(tag: str, run: Path, formal: str, log: str) -> tuple[list[Path], dict]:
    result_path=regular(run/'RESULT.json')
    result=json.loads(result_path.read_text())
    assert result['allGuardsExact'] and result['livePostflightExact'] and not result['reportingErrors'], tag
    group=result['processGroup']
    assert group['noSurvivors'] and group['leaderReaped'] and group['cleanupVerified'], tag
    if tag != 'r7-observed':
        assert result['actualChildExit']==result['recorderChildExit']==0 and not result['timedOut'], tag
    if tag.startswith('r7-'): assert result['classification']=='EXPLORATORY_NOT_ACCEPTANCE', tag
    files=[]
    for suffix in FORMAL_SUFFIXES: files.append(regular(E/(formal+suffix)))
    formal_record=json.loads((E/(formal+'.json')).read_text())
    post=json.loads((E/(formal+'-postflight.json')).read_text())
    assert formal_record['fixedSource'] and post['fixedSource'] and post['allGuardsExact'], tag
    assert formal_record['exitCode']==post['exitCode']==result['recorderChildExit'], tag
    assert formal_record['sourceSha']==formal_record['sourceShaAtEnd']==post['head'], tag
    log_path=regular(S/'heavy-queue'/(log+'.log'))
    meta_path=regular(S/'heavy-queue'/(log+'.log.meta'))
    assert re.search(r'(?m)^end, exit -?\d+;', meta_path.read_text()), tag
    files.extend([log_path,meta_path])
    for name,pin in result['artifacts'].items():
        q=regular(Path(name));data=q.read_bytes()
        assert len(data)==pin['bytes'] and sha(data)==pin['sha256'], (tag,name)
    return files, {'tag':tag,'resultSha256':sha(result_path.read_bytes()),'actualChildExit':result['actualChildExit'],'recorderChildExit':result['recorderChildExit'],'timedOut':result['timedOut']}

def main():
    ap=argparse.ArgumentParser(description='Build only after all five R6/R7 runs and independent R7 audits close')
    ap.add_argument('--r7-types-audit', required=True)
    ap.add_argument('--r7-clean-audit', required=True)
    ap.add_argument('--r7-observed-audit', required=True)
    ap.add_argument('--comparator-result-dir')
    ap.add_argument('--comparator-review-dir')
    args=ap.parse_args()
    assert not (S/'heavy-queue/HEAVY-LANE-LOCK').exists(), 'heavy lane still active'
    assert not (OUT/'evidence.tar.gz').exists() and not (OUT/'MANIFEST.json').exists(), 'eighteenth archive already exists'
    audit_names=[args.r7_types_audit,args.r7_clean_audit,args.r7_observed_audit]
    assert len(set(audit_names))==3
    for name in audit_names:
        assert name==Path(name).name and name.startswith('1368-ledger-r7-') and '/' not in name
        q=S/name
        assert q.is_dir() and not q.is_symlink(), q
        assert any(q.glob('*REVIEW*.md')) and any(q.glob('*RECEIPT*.json')), q
    assert bool(args.comparator_result_dir)==bool(args.comparator_review_dir), 'comparator result/review must be paired'
    comparator_dirs=[]
    if args.comparator_result_dir:
        comparator_dirs=[args.comparator_result_dir,args.comparator_review_dir]
        assert len(set(comparator_dirs))==2
        for name in comparator_dirs:
            assert name==Path(name).name and name.startswith('1368-ledger-r7-') and '/' not in name
            assert (S/name).is_dir() and not (S/name).is_symlink(),name
        assert 'independent' in args.comparator_review_dir, 'independent comparator review directory required'
    dirs=FIXED_DIRS+audit_names+comparator_dirs+[f'{root}/{leaf}' for _,root,leaf,_,_ in RUNS]
    skipped_symlinks=[];skipped_caches=[];sources=[]
    for name in dirs: sources.extend(scan(S/name,skipped_symlinks,skipped_caches))
    run_status=[]
    for tag,root,leaf,formal,log in RUNS:
        files,row=verify_run(tag,S/root/leaf,formal,log)
        sources.extend(files);run_status.append(row)
    observed_status=next(row for row in run_status if row['tag']=='r7-observed')
    observed_complete=observed_status['actualChildExit']==observed_status['recorderChildExit']==0 and not observed_status['timedOut']
    assert observed_complete==bool(comparator_dirs), 'complete observed needs comparator result/review; timeout must not supply one'
    comparator_status=None
    if observed_complete:
        result_path=regular(S/args.comparator_result_dir/'RESULT.json')
        comparison=json.loads(result_path.read_text())
        assert comparison['classification']=='DESCRIPTIVE_ONLY_NOT_ACCEPTANCE'
        assert comparison['r7Classification']=='EXPLORATORY_NOT_ACCEPTANCE'
        for label,tag in [('typesResultSha256','r7-types'),('cleanResultSha256','r7-clean'),('observedResultSha256','r7-observed')]:
            assert comparison['inputs'][label]==next(row['resultSha256'] for row in run_status if row['tag']==tag)
        review_dir=S/args.comparator_review_dir
        reviews=sorted(review_dir.glob('*REVIEW*.md'))
        receipts=sorted(review_dir.glob('*RECEIPT*.json'))
        assert reviews and receipts, review_dir
        comparison_sha=sha(result_path.read_bytes())
        comparator_code_sha=sha(regular(S/'1368-ledger-r7-descriptive-comparator-20261005-r3/compare.py').read_bytes())
        assert any(comparison_sha in regular(review).read_text() and comparator_code_sha in review.read_text() for review in reviews), 'independent review must name exact comparator result and r3 code SHAs'
        comparator_status={'resultSha256':comparison_sha,'resultDir':args.comparator_result_dir,'reviewDir':args.comparator_review_dir}
    # Link the prior checkpoint without recursively embedding another archive.
    sources.extend([regular(S/'1368-seventeenth-publication-prep-r1/MANIFEST.json'),
                    regular(S/'1368-seventeenth-independent-archive-review-20261005/REVIEW.md')])
    sources.extend([regular(OUT/'build_archive.py'),regular(OUT/'SCOPE.md')])
    package_coverage={}
    for name in PACKAGE_DIRS:
        package=S/name
        manifest=json.loads((package/'MANIFEST.json').read_text())
        for rel,pin in manifest['files'].items():
            q=regular(package/rel)
            assert q in sources and q.stat().st_size==pin['bytes'] and sha(q.read_bytes())==pin['sha256'], q
        source=json.loads((package/'arm/SOURCE-PINS.json').read_text())
        assert len(source)==197
        for rel,digest in source.items():
            q=regular(package/'arm/tree'/rel)
            assert q in sources and sha(q.read_bytes())==digest, q
        assert sum(q.is_relative_to(package/'arm/tree/src') for q in sources)==188, name
        package_coverage[name]={'manifestMembers':len(manifest['files']),'armFiles':197,'productionFiles':188,'manifestSha256':sha((package/'MANIFEST.json').read_bytes())}
    rows=[]
    for q in sources:
        data=regular(q).read_bytes();rows.append({'member':member(q),'source':str(q),'bytes':len(data),'sha256':sha(data)})
    rows.sort(key=lambda x:x['member'])
    assert len(rows)==len({r['member'] for r in rows}), 'duplicate archive member'
    assert not any('/node_modules/' in r['member'] or '/__pycache__/' in r['member'] or r['member'].endswith('.pyc') for r in rows)
    archive=OUT/'evidence.tar.gz'
    with tarfile.open(archive,'w:gz',format=tarfile.PAX_FORMAT) as tar:
        for row in rows: tar.add(row['source'],arcname=row['member'],recursive=False)
    with tarfile.open(archive,'r:gz') as tar:
        members=tar.getmembers();assert len(members)==len(rows)
        for entry,row in zip(members,rows):
            assert entry.isfile() and entry.name==row['member'] and entry.size==row['bytes']
            assert sha(tar.extractfile(entry).read())==row['sha256'], row['member']
            assert sha(regular(Path(row['source'])).read_bytes())==row['sha256'], row['source']
    report={'archive':str(archive),'archiveBytes':archive.stat().st_size,'archiveSha256':sha(archive.read_bytes()),'memberCount':len(rows),
            'logicalBytes':sum(x['bytes'] for x in rows),'readbackVerified':True,'packageCoverage':package_coverage,'runStatus':run_status,'comparatorStatus':comparator_status,
            'includedDirectories':dirs,'skippedSymlinks':skipped_symlinks,'skippedCaches':skipped_caches,'members':rows}
    (OUT/'MANIFEST.json').write_text(json.dumps(report,indent=2)+'\n')
    print(json.dumps({k:v for k,v in report.items() if k!='members'},indent=2))
    print('manifestSha256',sha((OUT/'MANIFEST.json').read_bytes()))
if __name__=='__main__': main()
