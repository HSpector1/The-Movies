import hashlib,json,os,re
from pathlib import Path
S=Path('/Users/zacheryspector/studio-scratch');A=S/'1370-am-root-continuation-20261009-r1';D=Path(__file__).parent;R=Path('/Users/zacheryspector/The-Movies-headless-program')
B=S/'1370-am-checkpoint-documentation-drafts-independent-after-al-20261009-r3'
def role(p):
 b=p.read_bytes();return {'path':str(p),'bytes':len(b),'sha256':hashlib.sha256(b).hexdigest()}
def put(p,text):
 with p.open('x') as f:f.write(text);f.flush();os.fsync(f.fileno())
 p.chmod(0o444);return role(p)
adp=A/'M0-R6-METADATA-STOP-OBSERVED-ADOPTION.json';ad=json.loads(adp.read_bytes());assert ad['status']=='ROOT_ADOPTED_OBSERVED_STOP_M0_TYPES_ROOT_METADATA_DRIFT_WITH_SHARED_FULL_POSTFLIGHT' and ad['typesAccepted'] is False and ad['m0SourcePreservationAccepted'] is False
post=json.loads(Path(ad['fullPostflightReadback']['path']).read_bytes());assert post['actualToolSessionId']==98815 and post['actualToolExit']==0
for x in [ad['independentObservedReview'],ad['fullPostflightSnapshot'],ad['fullPostflightReadback']]:assert role(Path(x['path']))==x
lessons=A/'LESSONS-r22.md';lr=role(lessons)
prefix='docs/engineering/playability-launch-review/evidence/p14b4-20260919/'
archive='1370-am-natural208-and-renewal-pricing-closure'
reportname='1370-AM-natural208-and-renewal-pricing-closure.md'
lessonrel=archive+'/payload/'+A.name+'/LESSONS-r22.md'
old=(R/'HANDOFF.md').read_text();auto=old[old.index('<!-- AUTO:BEGIN'):old.index('<!-- AUTO:END -->')+len('<!-- AUTO:END -->')]
assert hashlib.sha256(auto.encode()).hexdigest()=='39c20c726e9779c2f8ba73dd37ba55476302ac7b17040bf3d5e487f5c7268a4d'
active=old.split('## Active order\n\n',1)[1].split('\n## State',1)[0].strip()
snap=ad['fullPostflightSnapshot']['sha256'];rev=ad['independentObservedReview']['sha256'];adh=role(adp)['sha256']
handoff=f'''# HANDOFF

Last writer: Codex, 2026-10-09, with GPT-6.1 Sol specialists. Continue toward canonical P17 and bounded P18. No standing 9:05 deadline or pending Owner action. P17/P18 runtime remains unimplemented.

## Where the work is

- Live repo `/Users/zacheryspector/The-Movies-headless-program`, branch `wip/headless-program-20260916-ts`; scratch `/Users/zacheryspector/studio-scratch`. Always set cwd explicitly. Never recover from the deleted Downloads directory.
- This AM checkpoint follows published AL `8cb704e2f18e6a635943893422c9cfdc206e106d`. Resolve the committed AM HEAD and advertised working ref before the next recorded route. Production `HEAD:src` remains `13880d9b0ba72aff5d4c5bcf5d12fe682c5de554`. Main remains `c902a704eb948cc576083d0973c8c23e59937dc1`, unmerged. Use explicit fetch refs and disable optional locks, GC and maintenance. Local main is `refs/remotes/origin/main`; local `refs/heads/main` is absent.
- Required reading: [{reportname}]({prefix}{reportname}), [AM archive manifest]({prefix}{archive}/ARCHIVE-MANIFEST.json), [major lessons]({prefix}{lessonrel}), then AL/AK/AJ reports and `docs/engineering/playability-launch-review/plans/HEADLESS-REMAINDER-IMPLEMENTATION-PLAN.md`. Manifest resolves finite scratch evidence to copied payloads, authenticated prior Git blobs or local-only raw hashes.

## Active order

{active}

## State

No heavy job is active at the AM checkpoint. The completed A208 capture and all sixteen renewal calculations are independently admitted. R6 repairs the compiler option but remains a failed preservation route. No P17/P18 completion or main promotion is claimed.

- A208 actual51117 completes all416 weeks/44 employment rows and captures16 genuine natural208 vectors32249B/caf921cc. Employment4cff, settlement706e54, receiptsaf8c4, takes8af116 and expected RNG remain exact. Original720/742/750 and all output caps unchanged. Independent e0708335/root17fdc208 admit game plus full postflight692260. Internal supervisor/Node numeric IDs remain unknown; source-backed protocol cleanup is separate from measured helper34390 absence. Producer4990ms is not precise whole-recorder timing or B109 headroom.
- Pure16 controls9aff22 pass1 method/6 cases/10 assertions. Actual pricing94067 completes0 in1.543980176s:16 salary/bonus/full-term pairs and44 nonpay stable identity/occurrence/order pairs, no mismatch; independent4610a4ee/root2c3111b3. Five vectors differ only in age; eleven also differ in fame/perceived skill. Accepted explanation is exact original pricing over complete authenticated H-to-natural-A208 vectors and shared draw/premium/floor, not isolated per-field/upstream causality or an original offer-local capture. Prior23 initial pairs remain separately closed.
- Encoder candidatef382 passes34 groups/665 comparisons/3 specific mutants, but paired actual82873 is3.050402735% worse by declared both-consumer weighting. Independent3965/root1baf decline promotion. Keep selected2529; preserve all eight pairs and original B109 timeout40421/STOP7f3c. Weighted453.611/467.448s are constant-early-fixture illustrations, not measured full109 runtime or lower bounds. No fishing rerun.
- Pre-R6 current M0 proof20818 and original fullpostflight39284 pass; independent09300660/root8ef61c8f admit1740 files119393120B, complete original/nonroot metadata and dependency equality. M0 deps12484 excludes root; shared map12485 includes root. Original1740-file mirror stays in place; do not rematerialize it or R9. This earlier proof does not establish preservation after later R6 root drift.
- R5 actual79362 fails root compiler2 with11 TS5097 diagnostics in5 canonical bridge files; UI/collection unrun. Fullpostflight51441 passes; independent749e76fe/rootf3f4c538 admit protected STOP only. R6 source05ca/review0b240 adds only allowImportingTsExtensions to root noEmit, keeping scope/UI/source/clocks. Corrected parentR4f27d/review63f348 and rootbindingproofeca05 preserve wrong MAP4b7 and inverse-builder preparation STOPs without replay or relabeling.
- R6 actual97276: four child0 (root50.663s, UI45.133s, collection7.832s) but tool/helper/recorder/runner1, result85e1f676 STOP_POSTFLIGHT_UNVERIFIED. Fourth child changes M0 root mtime/ctime with identical immediate roster and stable remaining root fields. No sourceAfter/dependencyAfter proofs exist. Readback1456317c records three owned IDs27153/27410/27430 absent and lane released. Required original shared fullpostflight98815/scanner39702 completes0; snapshot{snap}, independent{rev}, root{adh}. Shared R9/dependency protections pass; M0 full source preservation/types/collection remain unaccepted.
- Static source proposal3341 identifies nested Vitest2.1.9/Vite5.4.21 sibling config writes as a possible mechanism; top-level Vite6 options do not apply. Root direction1aba12bd adopts external root AND workspace configs, exact resolution semantics, disposable real-loader metadata RED/GREEN first, then complete M0 content/nonroot verification and explicit evidence-based treatment of known root drift. Actual transient-write cause is not yet proven. No timestamp restoration, unexplained repin, guard waiver or blind M0 retry.
- Full-body source R3 pins2703e145/reviewb2a2e12c/root2d528f4e repairs issuerStudioId matching and all12 freeze predicate positions. Twelve implementation roles stay exact. Two proposed GREEN/16 expected RED consumer inputs, real pre-market196/197/208 fixtures, baseline/catch-mutant controls and runtime adapter remain unqualified. Returned195/207 is not the pre-market196/208 boundary. Synthetic replay cases stay distinct from natural states. Neutral416 follows genuine controls, with original417 boundaries/10 artifacts/40 contexts/43 external rows/caps.
- AL repaired real Python17 controls44123 and exact JS reuse remain closed. Original10832/66101/micro25659, H13 metadata STOP15e901, H8708, all original timeouts/source STOPs and historical authority remain preserved. Do not replay already admitted work. All major lessons, including unfavorable measurements, remain in the linked r22 log with earlier versions.

## Next step

1. Verify committed AM/remote equality, AL ancestry, archive readback and unchanged src. Publication ends the prior production/common metadata interval; bind genuine current authority before any next original guard. Never reuse AL current-ref claims after the checkpoint.
2. Continue the adopted configuration-write repair direction1aba: independently review and run disposable real nested-loader metadata RED/GREEN controls through a finite recorded route. Use fresh external root/workspace configs with exact collection/resolution semantics; keep the original M0 untouched. Preserve failed controls and all original R6 evidence. Root owns the one heavy lane.
3. Establish complete actual M0 files and nonroot metadata against authentic facts and explain/explicitly qualify the known root drift using observed evidence. A separately reviewed fresh M0 type/collection route must retain300/320/330, full guards/source/dependency proofs and cleanup. Earlier four child0 do not pass it. Then qualify full-body fixtures/resolver/control route, actual baseline/catch-mutant parity and neutral416.
4. Continue unresolved A-to-M0 shared39/eight changed pay/31same plus5left-only/5right-only, four protected C0 digests, adoption48-to42 and p13a40-to18 attribution by pinned intermediate source arms and stable identity/occurrence. H8708 and historical promise attribution remain separate. Follow the active-order closure/recovery/regression/promotion gates before production changes or downstream implementation.

## Open decisions for the Owner

None. Restart/cache cleanup are complete. Continue authorized work and GitHub backups using GPT-6.1 Sol specialists; no new deletion or restart is requested.

## Blockers and warnings

1363 attribution still gates gameplay source changes and downstream P16-P18. M0 strict root metadata drift remains open despite repaired compiler commands; shared postflight is a different scope. P15B principal/installments/closure/claims remains incomplete; P17/P18 are unimplemented. Do not claim native/Unity acceptance.

One production writer and one recorded heavy lane. Original fullguard runs directly with lock absent,180-second individual commands and no invented whole-scan clock. Avoid worker-detector literals in shell argv during guards. Nine strict roots differ from informational shared scratch timestamps. Whole-machine PS/FD stays local hash/size-only; AM classifies41 exact roles. Never export raw bytes under an unfamiliar suffix. Helper `.log.meta` is text, not JSON. Preserve physical Python identity despite opt-alias reporting, real PID/PGID distinctions, original clocks/caps and current versus historical authority.

## Auto snapshot
{auto}
'''
report=(B/reportname).read_text()
def replace_paragraph_start(text,start,replacement):
 parts=text.split('\n\n');hits=[i for i,x in enumerate(parts) if x.startswith(start)];assert len(hits)==1,(start,hits);parts[hits[0]]=replacement;return '\n\n'.join(parts)
report=replace_paragraph_start(report,'This is a documentation checkpoint draft', 'This AM evidence checkpoint follows published AL `8cb704e2f18e6a635943893422c9cfdc206e106d`; production `HEAD:src` remains `13880d9b0ba72aff5d4c5bcf5d12fe682c5de554`. It preserves completed results and the failed M0 metadata route. Resolve the resulting AM commit from Git and its advertised working ref; no main merge or downstream completion is claimed.')
report=replace_paragraph_start(report,'The required R6 failure fullpostflight98815',f'The required R6 failure fullpostflight98815/scanner39702 completes0 under unchanged original guard and reviewed metadata-STOP adapter15304. Snapshot `{snap}` retains the full immutable shared map, nine strict roots and scoped ownership. Independent `{rev}` and root `{adh}` admit this observed STOP with shared protections only. Four new whole-machine PS/FD roles are explicitly local hash/size-only. This success does not replace missing final M0 source/dependency proofs or turn R6 into accepted types. No heavy job is active at checkpoint.')
report=replace_paragraph_start(report,'Original archive readiness79/17',f'Original readiness drafts79/17,100/21 and139/37 remain immutable. The [final archive manifest]({archive}/ARCHIVE-MANIFEST.json) records the final explicit finite role set, authenticated previous-HEAD blobs and41 exact local hash/size-only raw roles. Original failures, all actual results and current source-only proposals are preserved. No private mirror, dependency tree or whole-machine raw payload is copied. The original guard ancestor covers its evidence children without duplicate inventory paths. Publication ends the previous production/common metadata interval; subsequent operations need genuine current authority.')
report=report.replace('lessons-r21','lessons-r22').replace('LESSONS-r21.md','LESSONS-r22.md').replace('efe3afd635d51a1c0d3d21487773fa15a3c4f36c0b17212318ffa9fb549aaf06',lr['sha256'])
report=report.replace('/Users/zacheryspector/studio-scratch/'+A.name+'/LESSONS-r22.md',lessonrel)
report=replace_paragraph_start(report,'Scratch draft only.', 'The root finalized this report from retained actual outcomes, independently reviewed observations and the finite archive. The prior drafts remain preserved as drafts. The next concrete work is the independently reviewed disposable config-loader control route, complete current M0 preservation verification, and a fresh corrected type/collection route before full-body controls or neutral capture.')
report+='\n\nFinal R6 metadata STOP admission: `'+adh+'`; observed independent review: `'+rev+'`. The proposed repair remains source-only; the actual metadata mutation cause has not been established.\n'
assert 'fullpostflight98815/scanner39702 is running' not in report and 'pending failurefullpostflight' not in handoff
assert handoff[handoff.index('<!-- AUTO:BEGIN'):handoff.index('<!-- AUTO:END -->')+len('<!-- AUTO:END -->')]==auto
print(json.dumps({'handoff':put(D/'HANDOFF-FINAL.md',handoff),'report':put(D/'REPORT-FINAL.md',report),'autoPreserved':True,'repoWritten':False}))
