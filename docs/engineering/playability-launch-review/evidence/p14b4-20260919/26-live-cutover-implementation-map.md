# P14B.4 live cutover — bounded implementation map

2026-09-20 local date. READ-ONLY preparation except this reserved document.
Assignment source: published RED `d39a9a04e4eae7767d5a15225de36e86f0440c14`
plus the unchanged four-file additive candidate reviewed KEEP in21 (protected
diff `bb0858bc0968dff124f157b47de42095f5aa85e889a180238bdb720e2b03594b`).
No production/test/fixture/harness edits, executable checks, Git or network calls.
This document is not source release, behavioral acceptance or a new product gate.

Authority: reviewed `plans/P14B4-HEADLESS-PLAN.md`, SHA256
`382252e23b6353acf602d87f38032ff961e9f7f9740bbfdf2b2ae368c30df4e4`;
owner-adapter preparation/review13–14 in `evidence/p14bf2-20260919`; current17
mode correction; installed outcome/runtime tests and original RED11–12/15.
Line references below describe the inspected additive candidate, not a future patch.

## 1. Safe next staging boundary

The additive foundation is already present. Two small pure changes can precede
live activation, after directly reached independent RED and explicit writer release:

- In `src/core/promises.ts:147`, broaden the material reader to accept the V30
  record union and give tagged P2 a distinct ordered tuple containing kind and
  selected class as well as family/count/window. Keep the old four-value tuple
  EXACTLY for every count-only family. `attachedPromiseDigest:155` can accept the
  V30 promises pick; its empty-string/no-promise and ordered-ID behavior stays
  unchanged. No stored proposal digest is rewritten on load or upgrade.
- Extract a pure predicate-to-cast-mask / qualifying-first-takes helper near
  `qualifyingTakes:543`, typed against `ProfessionalPromiseV30` and only the
  first-take input it reads. Legacy count-only of every family -> all three
  cast slots; tagged lead -> lead; tagged flexible -> lead+antagonist. Shape,
  never root/receipt version, selects the branch. Match issuer and exact
  half-open window, retain recording order, count distinct production IDs.
  It allocates no outcome, progress, contract or receipt. The current legacy
  caller can reuse it without changing any reachable V29 result.

Neither step needs to change `GameState`, `ProfessionalPromise`, `makeSave`,
LIVE_SAVE_VERSION, rules3, capacity, rival policy, bridge payloads or schemas.
Do not widen/activate attachment or the V30 weekly mutator as part of this pure
stage. Keep the strict V29 validator branch frozen; do not replace it with a
generic helper whose evolving new-family policy can reinterpret old evidence.

Evidence distinction: raw22's named class/material-digest test fails at
`pureRead`'s rulesVersion3-versus4 assertion (lines184–202), before its material
assertions. Original outcome12's matrix stops at the live30 gate or natural
rival prerequisites. Those logs are not directly reached RED for the isolated
helpers. The test-author can add focused observations without changing any of
the existing literal30/47/4 obligations. Do not bump rules4 just to unblock them.

## 2. Coordinated core activation

The later live boundary must be coherent across these owners:

| Owner | Minimal coordinated change |
| --- | --- |
| `types.ts:2233–2234` | Switch live `ProfessionalPromise` to V30 and `GameState` to V30; retain frozen V29 aliases/root and the replacement-root V30 definition. |
| `promises.ts:184,430,459` | Make draft/attachment material shape-correlated: legacy count or P2-tagged class. Copy the COMPLETE selected predicate into a detached root; current `:490` deliberately copies only count. Retain at-most-one attachment, actual proposal replacement, ordinal and material redigest. No new blanket core draft-staging refusal. |
| `promises.ts:288,361,414` | Install the reviewed owner-adapter/class-capacity result and relevant input digest, for fresh P1 AND tagged P2. Then stamp rules4 on new evaluations/roots only. Classless legacy P2 stays nonofferable at a new quote/freeze; existing bound evidence remains generic cast. No placeholder capacity or version-only change. |
| `promises.ts:539–629` | Use shared class-qualified takes for actual weekly progress/satisfaction/due outcomes. Retain bound-open gating, terminal idempotence, stable evidence ordering and one OWN outcome receipt per promise. Shared takes can satisfy several people or several separate promises; do not impose planning's additive reservations on actual evidence. |
| `promises.ts:552` | When widening the record union, restrict `settle`'s update type to outcome/progress/evidence fields, rather than a broad `Partial<ProfessionalPromise>` that could erase family/predicate correlation through spread. No semantic lifecycle rewrite is needed. |
| `talentMarket.ts:735,1026,1077–1124` | Preserve live attached classification, material-change check and EXACT pre-employment-commit freeze receipt. Carry full predicate; do not recompute after employment changes. No migration-time reclassification or root-version rewrite. |
| `save.ts:6396–6404` | Move LIVE_SAVE_VERSION and `makeSave` to30/SaveFileV30/validateSaveV30 together. Preserve validation before JSON detachment. Existing import/export dispatch already supports30; frozen29 converters/validator stay historical. |
| `index.ts` | Retain all additive/frozen exports; export any new shared predicate or preference readers actually needed. No new save/chooser root. |

`tick.ts:1099–1110` already appends the actual player/rival first takes, then
evaluates promises, then runs the terminal talent-market step. Preserve that
order and `operations.ts`'s real scheduled5->4 event owner; no synthetic receipt,
shooting-entry credit, retiming of an old take, or changed production admission.

Immediate-causes are a separate necessary correction, not a shortcut through
the new offer service. `breakPromisesOnCancel:656` currently treats
`reclassifyPromise(...).classification === IMPOSSIBLE` as a causal proof.
That cannot remain the P2 rule: a joint reservation conflict, unsupported legacy
family, protected-path failure or UNCERTIFIED analysis is not target-specific
physical impossibility. Replace that coupling with the plan's separate actual
target-specific proof, and check whether the cancelled picture could satisfy
this class. Retain first-take-then-cancel immunity and early termination owner.
Inspect only the successful greenlight/cancel integration sites in `actions.ts`
(`applyGreenlight:321`, cancellation `:739–746`); no broad action-engine rewrite.
Do not route a bound legacy P2 through fresh-offer refusal to decide its outcome.

Capacity/policy prerequisites are not solved by the save cutover. Existing
`talentMarket.ts:680` isProven/public preference owners, `bandsFor:776` D3,
`authorRivalPromise:1237`, `hollywoodTick.ts:162` initial actor selection and
`hollywoodPolicy.ts:32–63` final six billing permutations need the already
reviewed preference/authoring/seating changes and independent behavioral RED.
The runtime and synthetic player outcome subset can be verified before those
natural rival cases pass; that is partial evidence, not B4 closeout. No extra
Owner choice or new eligibility gate is implied here.

## 3. Live load and runtime identity cutover

Switch the following actual load-to-play consumers to `migrateToV30` in the same
integration boundary as the writer; do not numerically sweep historical APIs:

- `bridge/session.ts:41,132–136` (`importSaveJsonCurrent`); keep converted based
  on LIVE_SAVE_VERSION, not a new hardcoded consumer literal.
- `bridge/runtime/campaign-library.ts:5,48,127` (both current-save reads).
- `ui/src/engine/adapter.ts:112,3790–3822`: normal import AND the explicit V2 and
  V1 import arms. This is serialization plumbing, not rendered UI acceptance.
- Live D17 drivers `src/harness/d16/run-d17b-continuation.ts:37,183` and
  `run-d17b-week86.ts:35,124`, when that narrow consumer sweep is authorized.
  Do not rewrite `src/harness/p14/legacy-v28-fixtures.ts` or genuine minters.

`bridge/runtime-checkpoint.ts` requires coordinated changes to import/type
`:6–7`, CurrentEnvelopeSave/strict canonical-current validation `:439–461`,
prior-slot migration `:839–850`, and the R05 historical-draft state annotation
`:992`. Current47 must require exact canonical V30 bytes; preserve the R05
origin guard, not widen its historical admission policy.

Register ONLY outgoing46
`sha256:584bdd8565030f049d548b1af4fcbf8c517ca7c9150016736f632f1ef8fcb98c`
as `projection-v46` in the prior registry `:59`. Preserve the other34 pins,
unknown rejection and current-ID exclusion; do not fabricate missing32–44.
Keep protocol4 and checkpoint format/version unchanged.

The genuine46 test requires both SAME-week DIFFERENT gameplay slots to migrate
from their OWN bytes. Existing `migratePriorProtocol4Checkpoint:976–1022` already
does two separate canonical-chain calls and resets only runtime authority:
new session, revision0, empty journal, recomputed slot/journal digests. Reuse it;
never replace saved with current, parse old journal commands under the new
schema, or re-migrate a current47 checkpoint on reopen.

Do not expose live30 under unchanged46. The current schema hash is the exact
checkpoint routing discriminator; a version-counter-only bump likewise cannot
stand in for completing the promised class wire contract.

## 4. Exact bridge and generator scope

`bridge/schema/bridge-schema.ts:1756` must represent a closed family-discriminated
draft: P2 REQUIRES explicit seatClass lead/flexible, other catalogue families
must not accept a class. Preserve the still-refused P3–P5 enum members. The DSL
and existing generator support closed string-discriminated object unions; use
disjoint P2 versus non-P2 family values, not permissive optional-class validation.
Missing/extra/inapplicable class is rejected before mutation, with no default.

`bridge/contract.ts:338,358,434–480,589` and
`bridge/promises.ts:43,111–137` must share the same wire-to-core tagged material
conversion for quote and attach. Preserve B3's immutable nested draft,
replacement-before-feasibility, module-level apply identity and no partial effects
on refusal. `session.ts:1897–1925` already clones the payload and hashes ALL its
values for intent identity; retain that path, pending16, revision/state-digest,
replay/session checks and no registration when the whole quote is nonofferable.

Own disclosure/history changes belong to `talentMarket.ts:458,535`,
`bridge/promises.ts:80–104`, and schema own snapshot/history `:2219,2229`.
A minimal representation is nullable seatClass: real class for tagged P2;
null with family context means not applicable for P1 or genuinely unknown for
legacy P2. It must never be rendered as a fabricated lead choice. Profile and
workspace already reuse shared history (`people.ts:1000`, `trust.ts:30`,
`market.ts:230`); do not introduce divergent class copies. The public preference
reader should feed existing preference schema `:2283` and `people.ts:978–989`.
Final DTO spelling is a routine contract detail for the bridge/test owners.

Rival proposal terms remain the WHOLE `UNKNOWN` value from caseDisclosure;
never add class beside it. Public Pulse `industry.ts:135–147` keeps its exact
outcomeEventId join and verbatim public receipt reasons. Do not leak selected
class/window/count via new public cause/reason prose. Existing industry-schema
shape need not change solely to add private class terms.

Set PROJECTION_VERSION47 at `bridge-schema.ts:222` with the complete wire shape;
`bridge/protocol.ts:34–35` derives snapshot/schema identity. Run the existing
generator only after the parent's runtime handoff. It owns exactly:

- `bridge/schema/project-studio-bridge.schema.json`
- `generated/unity/StudioBridgeDtos.Generated.cs`
- `generated/unity/project-studio-bridge.contract-manifest.json`

No `--unity-project`, handwritten C# or consumer-repository edits. Native class
selector, preference/legacy display, new-schema/save loading remain backlog.
Current-schema generator tests F10/F11 both reference the WHOLE BRIDGE_SCHEMA
(`tests/fixtures/bridge-contract-union-fixtures.ts:226–232`), so their exact
declaration hashes legitimately move together. The independent author must pin
actual new bytes and current identity; never replace them with self-equality.
The frozen positive F01–F04/F09/F12 aggregate at `:261` remains projection1 and
does NOT incorporate F10/F11: its generated fixture artifact must not be reminted
merely because live47 changed. Historical save/runtime corpora remain byte-frozen.

## 5. Verification order and evidence limits

After author/parent gates: pure material/evidence RED->GREEN; owner-adapter and
class-capacity bounded cases; coherent core/writer/load/wire candidate; isolated
save and genuine runtime47 group; player outcome matrix; natural rival authored
binding/actualtake routes; chooser/seating and bridge atomicity/privacy; root/UI
and bridge typechecks plus generator checks; then the parent's fixed-source full
boundary. Keep later assertions explicitly unexecuted when an earlier gate fails.

Preserve correction17: the genuine bound-open fixture has LEGACY script
DEVELOPMENT and MANAGED production OPERATIONS. Direct stock is lawful there
(`actions.ts:334`), and managed5->4 emits an actual first take
(`operations.ts:1585–1604`). Managed DEVELOPMENT needs the real Ready script;
legacy OPERATIONS emit no take. These are independent axes. Do not rewrite
that lawful outcome fixture or impose commissioning merely because operations
are managed. Player scenery READY still needs its subsequent schedule command;
rival stage policy has its existing assign/clear/schedule decision boundary.

No implemented capacity, full class outcome, generator compatibility, runtime47
pass or Owner/Unity acceptance is asserted by this map.
