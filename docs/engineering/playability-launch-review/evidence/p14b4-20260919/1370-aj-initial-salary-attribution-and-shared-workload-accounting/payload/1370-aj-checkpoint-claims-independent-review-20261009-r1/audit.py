from pathlib import Path
import os, stat, json, hashlib, re

HERE = Path(__file__).resolve().parent
B = Path('/Users/zacheryspector/studio-scratch')
REPO = Path('/Users/zacheryspector/The-Movies-headless-program')
roles = {}

def read(label, path, expected=None):
    path = Path(path)
    before = path.lstat()
    assert stat.S_ISREG(before.st_mode) and before.st_size <= 8 * 1024 * 1024
    fd = os.open(path, os.O_RDONLY | os.O_NOFOLLOW)
    try:
        opened = os.fstat(fd)
        assert (opened.st_dev, opened.st_ino) == (before.st_dev, before.st_ino)
        chunks = []
        while True:
            part = os.read(fd, 65536)
            if not part: break
            chunks.append(part)
            assert sum(map(len, chunks)) <= 8 * 1024 * 1024
        after = os.fstat(fd)
    finally:
        os.close(fd)
    current = path.lstat()
    fields = ('st_dev', 'st_ino', 'st_mode', 'st_nlink', 'st_size', 'st_mtime_ns', 'st_ctime_ns')
    assert all(getattr(before, x) == getattr(opened, x) == getattr(after, x) == getattr(current, x) for x in fields)
    raw = b''.join(chunks)
    digest = hashlib.sha256(raw).hexdigest()
    if expected: assert digest.startswith(expected), (label, digest, expected)
    roles[label] = dict(path=str(path), bytes=len(raw), sha256=digest)
    return raw

draft = B / '1370-aj-checkpoint-root-finalization-20261009-r1'
report = read('reportDraft', draft/'REPORT-DRAFT.md').decode()
handoff = read('handoffDraft', draft/'HANDOFF-DRAFT.md').decode()
claim = read('rootFinalClaim', draft/'ROOT-FINAL-CLAIM.txt').decode()
live = read('productionHandoff', REPO/'HANDOFF.md').decode()
auto = r'<!-- AUTO:BEGIN[^\n]* -->.*?<!-- AUTO:END -->'
draft_auto = re.findall(auto, handoff, re.S)
live_auto = re.findall(auto, live, re.S)
assert len(draft_auto) == len(live_auto) == 1 and draft_auto == live_auto

def receipt(label, directory, expected, filename='RECEIPT.json'):
    return json.loads(read(label, B/directory/filename, expected))

initial = receipt('initialPricingObserved', '1370-c0-initial23-pricing-independent-observed-review-20261009-r2', 'e27c8d8e230a453eee078a5e21abd5716b9192404bb172a1de0ff46d4571fce2')
initial_adoption = receipt('initialPricingAdoption', '1370-c0-initial23-pricing-verification-parent-recorded-20261009-r1', '395e3341c6ed34281df795868d03026c8b87159e12dc3effe2a3b5e760c3dc03', 'ADOPTION.json')
receipt('initialControlsObserved', '1370-c0-initial23-first-draw-controls-independent-observed-review-20261009-r1', 'abc274938a91d76bf717d94f295d88bc164bc954ef70887a7943a9ca58736646')
receipt('numericWitnessObserved', '1370-c0-initial23-first-draw-witness-independent-observed-review-20261009-r1', '54b305c8b48c96cd664c037d592f955b8ca8e59e53337d5c287ffb7331f303c7')
receipt('renewalDesign', '1370-c0-renewal208-input-gap-and-minimal-observer-design-20261009-r1', '46d78843ee8e2cf61c501a6ca2aebe6a16b66aa9745751c2d60c7ca7bdcf9479')
receipt('renewalIndependentReview', '1370-c0-renewal208-input-gap-independent-design-review-20261009-r1', '12145d203cd76fd36e94b4b8a862505d9e4e150c0af8058fcc47cba881d8292e')
renewal = receipt('renewalAdoption', '1370-c0-renewal208-design-parent-adoption-20261009-r1', '8f29b386', 'ADOPTION.json')
counts = receipt('workloadReview', '1370-c0-b109-shared-workload-accounting-independent-review-20261009-r1', 'bad58469013de6f0d4884c0fd72496efca242cd4175d49af5dcb8c3bd79bf06b')
receipt('workloadAdoption', '1370-c0-b109-shared-workload-accounting-parent-adoption-20261009-r1', '1c7e4dec', 'ADOPTION.json')
receipt('cacheControlsObserved', '1370-c0-b109-string-token-cache-controls-independent-observed-review-20261009-r1', 'fb9e8714fc18b4e31103a4e5d68a839cf7e9ec9e795bb461284001464bd653fe')
cache = receipt('cacheBenchmarkObserved', '1370-c0-b109-string-token-cache-benchmark-independent-observed-review-20261009-r1', 'fe9889d0f063e383803523c24e327ff1f404eba3951fa4a0a52e6a9127dfb69c')
cache_adoption = receipt('cacheAdoption', '1370-c0-b109-string-token-cache-parent-recorded-20261009-r1', '702fee19', 'BENCHMARK-ADOPTION.json')
receipt('m0CopyObserved', '1370-c0-m0-observed-copy-independent-review-20261009-r1', '381ec5af685ce78f002ff260e166e9a13aa40ac1432e2a635900511a8a30d78d')
receipt('m0AdditiveBodySource', '1370-c0-m0-additive-independent-source-review-20261009-r2', None)
route = receipt('m0AdditiveRouteSource', '1370-c0-m0-additive-recorded-independent-source-review-20261009-r2', '81492801', 'ROUTE-RECEIPT.json')
tiny = receipt('m0TinyControlsObserved', '1370-c0-m0-additive-controls-observed-independent-review-20261009-r2', '9da1cfa0797a7bc85c1193e6481cf84ee690f04bb309edda6fd70eccec27b075')
tiny_adoption = receipt('m0TinyControlsAdoption', '1370-c0-m0-additive-controls-parent-recorded-20261009-r2', '924fe37d', 'ADOPTION.json')
archive = json.loads(read('priorAiArchiveManifest', REPO/'docs/engineering/playability-launch-review/evidence/p14b4-20260919/1370-ai-recorded-m0-copy-and-encoder-qualification/ARCHIVE-MANIFEST.json', '0ab10ce492ff9ef0a22b341f510f1e64536940e91715231257a5c00c75e5e04b'))
assert renewal['renewalsAttributed'] == 0 and renewal['executionAuthorized'] is False
assert counts['perArmExactBoundedJsonCalls'] == dict(state=1763, wholeRow=992)
assert counts['bothArmsExactBoundedJsonCalls'] == dict(state=3526, wholeRow=1984)
assert (counts['sharedElapsedChildClockSeconds'], counts['activeSeconds'], counts['wholeSeconds']) == (300, 375, 390)
assert cache_adoption['benchmarkPassed'] is True and cache_adoption['full109RetryOrIntegrationAuthorized'] is False
assert abs(cache_adoption['coarseWeightedCostIncreasePercent'] - 10.642868321918852) < 1e-12
assert tiny_adoption['methods'] == 7 and tiny_adoption['actualAdditiveLaunchAuthorized'] is False
assert archive['summary']['localHashSizeOnlyRoles'] == 14
assert route['decision'] == 'ACCEPT_SOURCE_ONLY_UNRUN_ADDITIVE_RECORDED_ROUTE'
facts = dict(roles=roles, autoBlockIdentical=True, autoBlockSha256=hashlib.sha256(draft_auto[0].encode()).hexdigest(), reviewedClaims=['22 initial causes admitted plus known row0; 16 renewals unresolved', '23 numerical draws and 23 H/A pay pairs; 44 exposed immutable pairs, source transport rather than historical locals', '1763 state/992 row calls per arm; 3526/1984 both arms under shared 300, active 375, whole 390', 'early-fixture projections are arithmetic illustrations, not runtime measurements or lower bounds', '33/353 cache controls passed; valid benchmark has +10.642868% weighted cost and cache is not promoted', 'seven tiny M0 controls passed; actual extension, types and game unrun', 'P17/P18 runtime remains incomplete and no main merge claimed', 'historical AI archive retains 14 local hash/size-only raw-machine/padding roles'], corrections=[dict(file='HANDOFF-DRAFT.md', old='No additional annual cause closes.', new='That source-phase proof alone closed no additional annual cause.'), dict(file='HANDOFF-DRAFT.md', change="Relabel the six historical '- NEW ' AI bullets as '- Prior AI: '; retain all five '- AJ NEW ' bullets.")], limits=['Finite existing-artifact human-claim review only; no tests, imports, Node, draws, arithmetic pricing, game, guards, full inventories or Git commands.', 'No current HEAD/remote/clean assertion independently executed; production identities are parent-attributed checkpoint context.', 'AJ archive completion, exact payload/blob readback and publication are separate root-owned checks; pending archive is not a review defect.'])
out = HERE/'FACTS.json'
with out.open('x') as f: json.dump(facts, f, indent=2, sort_keys=True); f.write('\n')
print(json.dumps(dict(autoBlockIdentical=True, authenticatedRoles=len(roles), factsSha256=hashlib.sha256(out.read_bytes()).hexdigest(), substantiveBlockers=[])))
