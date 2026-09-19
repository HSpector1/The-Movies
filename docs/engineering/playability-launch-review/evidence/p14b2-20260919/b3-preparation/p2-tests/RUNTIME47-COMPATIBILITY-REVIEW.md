# Independent runtime47 compatibility draft review

2026-09-19. Native `contract-auditor`. **KEEP as an inert future test contract.**
No blocking assertion/API/authority contradiction found in this bounded draft.
This is not reached RED, a typecheck result, migration execution or publication
of the preservation checkpoint.

Reviewed complete draft SHA256:
`71478f15faa1fb94b24d4c0ec5dd7d127014bed085cec2a5bb19c339af319966`.
Reviewed complete brief SHA256:
`6700e35b37318d0cd06d28fc9fbafb4e0daf062209d2974729cf9fed8a1a394d`.
Authority remains reviewed B4 plan
`382252e23b6353acf602d87f38032ff961e9f7f9740bbfdf2b2ae368c30df4e4`.

## Exact registry and artifact boundary

Statically extracted the existing `SUPPORTED_PRIOR_PROTOCOL_4_SCHEMA_IDS` owner
entries, resolving its three named constants without importing/executing the
module. Compared them with the separate literal array in
`tests/bridge-runtime-checkpoint.test.ts` and the draft's literal array.
The existing owner and independent test each contain the SAME 34 identities.
The future draft contains exactly those 34 plus independently preserved
outgoing46:
`sha256:584bdd8565030f049d548b1af4fcbf8c517ca7c9150016736f632f1ef8fcb98c`.
Its 35 entries are sorted and unique. No predecessor was removed, substituted or
derived from the runtime registry as a test oracle. Exact `projection-v46` label,
live protocol4/projection47/Save30 literals, changed running identity and current-
schema exclusion remain asserted. The inherited 32–44 registry gap is not closed
or represented as supported by this addition.

Independently rehashed actual gzip/raw/provenance/manifest and inner-slot bytes:
all literal PINS match the already reviewed genuine runtime46 corpus. The old
journal digest and saved proposal digest `19e1ce0ad4681452` match actual bytes.
The inspected old artifact really has both same-week45 slots with differing
CURRENT/withdrawn proposal membership and retained rules3 root/receipt history.
Producer publication c06db6e and tested source89b5 remain original producer
authority, not an invented later preservation-publication SHA.

## Own-slot migration and authority reset

`bridge/runtime-checkpoint.ts:841` uses the core import/migrate/export chain for
each prior slot separately. Its prior-envelope law treats old journal bodies as
opaque history, and `:1007` creates a different logical session, revision0 and
empty journal. The draft's six expanded cases preserve that law:

- Each genuine slot is strictly read as frozen V29, compared to its OWN expected
  governed V30 export, and checked for exact old promises, first takes, complete
  talent-market history and Hollywood preservation. Distinct slots cannot be
  silently swapped or collapsed.
- The expected complete outer object changes only governed slot bytes/digests,
  schema, session, revision and cleared journal/digest. The expected-object
  spread is never supplied as a synthetic positive migration input.
- Hydration through the real BridgeSession and subsequent current47 reload must
  retain canonical bytes without another session factory call or migration.
- Explicit unknown-ID corruption must fail through the existing refusal family
  without invoking migration. That negative is transparently synthetic; all
  positive old inputs remain the actual pinned original bytes.

The migration function is also used as a per-slot serialization oracle, so that
equality alone would not detect every possible shared migration defect. The
independent old-root/history assertions prevent the scoped history-loss false
positive; the separately reviewed V30 save draft retains the wider whole-envelope
migration obligation. This file does not replace it or claim old-journal replay
under the new schema.

## Future interfaces, neighbors and limits

`migrateToV30` is the only planned new imported API in this file. Current source
still exposes V29, so collection/missing-export diagnostics, a future body
failure and reached behavioral assertions must be reported separately. No
execution or type correctness has been established here. Default timeouts remain
unchanged; no todo, weakened validator, restamped positive or special harness was
introduced. Preservation KEEP plus committed/pushed/exact-remote-verified
checkpoint remains the external installation gate stated in the brief.

Two bounded carry-forward obligations must not be mistaken for regressions or
silently weakened when the actual Save30/projection47 work begins:

1. The existing independent exact registry test needs the same one-entry
   outgoing46 addition, preserving every old literal and refusal/control check.
2. `tests/bridge-p14b2-checkpoint.test.ts` currently explicitly assumes Save29
   unchanged and compares migrated outgoing45 inner bytes/digests directly with
   the old29 bytes. Once live Save30 is introduced, that neighbor needs explicit
   current-vs-historical expectation reconciliation: preserve the genuine45 hash,
   old29 assertions and own-slot gameplay history while expecting the governed
   live migration. This is not permission to alter the old fixture or blanket-
   repin history. The separate live-helper `makeSave`/frozen-V29 issue remains as
   recorded in the brief.

No additional policy/architecture or whole-project audit is requested by this
review. Future runtime construction, RED/GREEN, typechecks, full verification,
native UI/UX, rendering, Unity and Owner acceptance remain outside this KEEP.

Reviewer activity: bounded read-only draft/owner/test-source inspection and
filesystem/crypto/gzip/JSON parsing, plus this sole authorized review document.
No live source/test/config/fixture edits, repository-module execution, tests,
probes, typechecks, git commands, network, commits or delegation.
