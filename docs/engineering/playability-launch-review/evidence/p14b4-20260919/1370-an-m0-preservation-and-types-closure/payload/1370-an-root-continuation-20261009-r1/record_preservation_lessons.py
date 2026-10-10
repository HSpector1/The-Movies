import hashlib,json
from pathlib import Path
A=Path(__file__).parent
old=(A/'LESSONS-r3.md').read_bytes();assert hashlib.sha256(old).hexdigest()=='a7b6ce86c402bca33b061dd384e68dfe18622d38f9d505ea23c2d866b5e18721'
extra='''
## A complete audit can establish an explained new baseline without rewriting history

The real post-R6 diagnostic64460 passed two complete scans in67.606 runner seconds and70.325 recorder seconds. All1740 files119393120 bytes retain the exact file proof fbbfed3e; all112 nonroot directories, file metadata and the one dependency link retain their exact remainder digest0c9cfd7e. Both complete12484-entry dependency scans348223802 content bytes agree with a06e929a. The physical root tuple is precisely the after-tuple recorded by failed R6, with no additional difference. The actual current full metadata digest is12c3dd50. Substituting only the authentic historical root tuple reconstructs the original complete digest5ce91601. An independent reviewer separately reconstructed all four source digests from retained historical facts.

This is a hard-won, actual content-and-metadata result. It does not make historicalRootUnchanged true, pass original R6, execute compiler commands or admit collection. A fresh current baseline remains pending the mandatory full shared postflight and final independent observed adoption. Never restore timestamps or accept whatever current tuple happens to exist; the diagnostic permits only the separately recorded after-tuple and checks it at both scans.

## Preserve config matching semantics when moving configuration files

The actual installed test runner matches some include patterns against relative file IDs. Converting every pattern to an absolute glob would change that behavior even if one collection happened to pass. The reviewed repair keeps the original relative includes with explicit absolute project roots, preserves both inline core/UI project objects, rebases the UI setup file and external cache/config locations, and supplies the same package-resolution link. The immutable config templates are copied to a fresh writable external directory because the real loader writes temporary siblings. Sealed source directories themselves are not suitable runtime config locations.

## Check inherited code before sealing a derivative

The first diagnostic source package retained an unused original helper that assigns HOME. Although this diagnostic never calls that helper, it conflicts with the current instruction and should not survive into newly generated source. R1 remains frozen and unrun; R2 removes that assignment and preserves exact inverse evidence. Check environment handling across the inherited file before sealing it, including dormant helpers, rather than assuming previous acceptance covers every later instruction.
'''
p=A/'LESSONS-r4.md'
with p.open('xb') as f:f.write(old+extra.encode())
p.chmod(0o444);print(json.dumps({'path':str(p),'bytes':p.stat().st_size,'sha256':hashlib.sha256(p.read_bytes()).hexdigest()}))
