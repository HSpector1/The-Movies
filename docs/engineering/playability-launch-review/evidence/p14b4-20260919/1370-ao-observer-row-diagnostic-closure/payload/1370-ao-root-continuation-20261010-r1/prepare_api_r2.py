import hashlib,json,os
from pathlib import Path
A=Path(__file__).parent;S=A.parent;old=S/'1370-ao-observer-row-diagnostic-api-20261010-r1/API.md';D=S/'1370-ao-observer-row-diagnostic-api-20261010-r2'
def role(p):
 b=p.read_bytes();return {'path':str(p),'bytes':len(b),'sha256':hashlib.sha256(b).hexdigest()}
authority=json.loads((A/'STARTING-AUTHORITY.json').read_bytes());assert role(old)==authority['rootApiPlan']
review=S/'1370-ao-observer-row-diagnostic-api-independent-review-20261010-r1/RECEIPT.json';assert role(review)['sha256']=='fe12c55a1f93f73b9a2e2875f2ebf78959415a2f894c613264f7f1a498bdc341'
before=old.read_text();after=before
replacements=[('Fullbody arm checks throwIfFailed immediately after advance returns. Its catch emits before the existing nested end/reset finally, then rethrows the caught original Error; emit must not replace the original. Keep all normal assertions, gameplay call order and fault controls unchanged. Diagnostic failure remains STOP, never a qualified baseline or meaningful mutant RED.', 'Fullbody arm keeps throwIfFailed immediately after advance returns and delegates its original body plus end/reset callbacks to the shared synchronous runObserverArm helper below. Sticky original row Error wins even if advance swallowed it and later threw another Error, and survives secondary end/reset errors. Keep all normal assertions, gameplay call order and fault controls unchanged. Diagnostic failure remains STOP, never a qualified baseline or meaningful mutant RED.'),('exact same Error propagation and retained first failure; simulated swallowing followed by throwIfFailed;', 'exact same Error propagation and retained first failure; simulated swallowing followed by throwIfFailed; actual shared runObserverArm controls for swallowed-then-unrelated throw and secondary end/reset errors, with both cleanup calls attempted;')]
for x,y in replacements:assert after.count(x)==1;after=after.replace(x,y)
after+='''

## R2 correction: actual shared arm/error/cleanup implementation

R1 independent reviewfe12c55a found two source-level gaps before any execution. A swallowed first row Error E followed by unrelated Error F bypasses the post-return check; catch must select sticky E. Existing end/reset finally can replace pending E. Preserve R1 and its STOP; do not infer that either combination occurred in actual56544.

Keep the four-method factory interface unchanged. Export one additional pure synchronous function runObserverArm(diagnostic, body, end, reset, writeLine) from m0ObserverRowDiagnostic.mjs. The actual fullbody arm uses this exact helper; the independent pure controls import the SAME helper. This avoids testing a handwritten imitation of the integration. No game/private module import is needed by those controls.

The helper calls body synchronously; before accepting its returned result it calls diagnostic.throwIfFailed. On any caught error, capture whether a sticky row failure exists by calling throwIfFailed in a small local try/catch; retain the exact thrown value in a local variable and a separate presence boolean before emission or reset. Emit the bounded first diagnostic. Emit/diagnostic exceptions cannot replace the retained primary row Error. Rethrow sticky row Error if present; otherwise rethrow the original caught error.

Finally always attempt end first and reset second. When a sticky row Error was locally retained, secondary cleanup failures cannot replace it: preserve that already-fatal Error through both cleanup attempts even if reset clears factory state. No success or suppression of the primary refusal occurs. When no sticky row Error was retained, preserve the original nested try-end/finally-reset behavior exactly, including fatal cleanup errors and reset precedence when both fail. No extra output or schema fields are needed for secondary failures. The helper must not reset before taking the local error snapshot.

Actual fullbody arm still calls throwIfFailed immediately after advance to prevent post-game assertions or trace reads from proceeding after swallowed observer failure. Its existing normal body and returned value remain unchanged inside the callback. One validated integration-helper call binds actual m0WiringProbe.end and m0WiringTestApi.reset; do not apply substitutions to unrelated finally blocks. Test callbacks assert cleanup order and exact propagated Error identity for E swallowed then F, end failure, reset failure, both failures, successful reset clearing state, ordinary F with no sticky E, and ordinary cleanup failures retaining original semantics. Pure tests are evidence for this helper/witness interface only; real fullfunction runtime is still required.
'''
D.mkdir(mode=0o700)
for n,b in [('API.md',after.encode()),('BASELINE-API.md',before.encode())]:
 p=D/n
 with p.open('xb') as f:f.write(b);f.flush();os.fsync(f.fileno())
 p.chmod(0o444)
p=D/'SOURCE-PROOF.json';v={'schema':'1370-ao-api-r2-source-proof/v1','predecessor':role(old),'predecessorReview':role(review),'source':role(D/'API.md'),'twoSingleSubstitutions':replacements,'appendedSection':'R2 correction: actual shared arm/error/cleanup implementation','implementationAccepted':False,'executionAuthorization':False}
with p.open('x') as f:json.dump(v,f,sort_keys=True,indent=2);f.write('\n')
p.chmod(0o444);print(json.dumps({'api':role(D/'API.md'),'proof':role(p)}))
