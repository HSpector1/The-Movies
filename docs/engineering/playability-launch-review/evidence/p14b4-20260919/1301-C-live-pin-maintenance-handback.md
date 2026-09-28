# 1301-C — live-pin maintenance, staged (test-author)

Task 1301-C: stage one cause-scoped maintenance patch correcting live-version literals left at
superseded values after the Save39/Save40 and projection54/55 bumps. Mode: IMPLEMENT, staged
evidence only. **No live-tree edit was made.** No `vitest`, `tsc`, `node`, `vite-node`, generator
or fixture read was run. Model: Claude Sonnet 5 (per environment banner).

Read in full before any classification: `1301-A-live-pin-broad-regression-plan.md`,
`1301-B-live-pin-broad-regression-plan-review.md` (REFINE), `1301-F-parent-plan-adoption.md`
(binding amendments 1-4 and rule 1b), `1301-live-pin-inventory.json`, and precedent records
`1197-A-p3-neighbor-maintenance-handback.md` / `1197-p3-neighbor-maintenance.patch` /
`1299-C-save-compatibility-source-handback.md`.

## Source identity

- Preparation/reading HEAD: `4ff4a3510124375c9e523a5b634391e2d143d7a0` (the assigned published
  HEAD; `docs(p14): adopt live-pin maintenance and broad regression plan 1301`, the commit that
  itself publishes 1301-A/B/F/inventory).
- Verification-at-handback HEAD: `d05ce0554c2295a9177380714fa95dfea7e307fd` (the parent published
  one further commit, `test(p14): close actual Save30 compatibility verification (gate 1300)`,
  concurrently with this task — the other test-author's E/1299-I gate closure, unrelated to this
  task's 1296-A-excluded and in-scope files). `git apply --check` of the final patch and
  `git status --short tests/ ui/ src/ bridge/` were both re-run after that commit landed and
  confirm it touched none of the 66 files this patch changes; the patch still applies cleanly.
- Live declarations, read directly, not computed: `src/core/save.ts:6538`
  `export const LIVE_SAVE_VERSION = 40 as const;`; `bridge/schema/bridge-schema.ts:281`
  `export const PROJECTION_VERSION = 55 as const`; `bridge/schema/bridge-schema.ts:3760`
  `` $id: `urn:project-studio:bridge:protocol-${PROTOCOL_VERSION}:projection-${PROJECTION_VERSION}` ``
  with `PROTOCOL_VERSION = 4` (`bridge/schema/bridge-schema.ts:21`) — current `$id` =
  `urn:project-studio:bridge:protocol-4:projection-55`, read from source, not computed by running
  code.

## Scope and counts

The inventory (`1301-live-pin-inventory.json`) carries 202 rows; 2 are flagged `excluded: true`
(the one A-direct and one C-derived row inside `tests/bridge-owner-ux-projection20-migration.test.ts`,
a 1296-A file) and were neither read for editing purposes beyond confirming the exclusion flag,
nor touched. The 200 in-scope rows split A-direct 56, B-projection-form 26, C-derived-saveVersion
118, matching the counts 1301-F records.

Every one of the 200 in-scope rows was classified individually by reading its surrounding source
(the producing line for C-derived rows, the containing describe/it block for A/B rows). Decisions
and per-line reasons are in
[`1301-live-pin-classification.json`](1301-live-pin-classification.json) (200 rows, one per
in-scope inventory row; no extra row was added — see "Pin forms not addressed" below for the one
generator-dependent site the inventory already flags as B-projection-form but that this patch
could not correct).

| Class | CHANGE | KEEP | Total |
|---|---:|---:|---:|
| A-direct | 56 | 0 | 56 |
| B-projection-form | 16 | 10 | 26 |
| C-derived-saveVersion | 73 | 45 | 118 |
| **Total** | **145** | **55** | **200** |

## Method

- **A-direct**: every in-scope row is `expect(LIVE_SAVE_VERSION|PROJECTION_VERSION|BRIDGE_SCHEMA['x-project-studio'].projectionVersion).toBe(N)` — a direct comparison against the live-imported
  binding itself. Because the binding always reflects the current source value, none of these can
  be historical; all 56 are CHANGE (53/54→55, 38/39→40).
- **B-projection-form**: classified per row whether it describes the CURRENT generated schema
  (`BRIDGE_SCHEMA.$id`/`x-project-studio.projectionVersion` read directly, or a `.toThrow(/expected
  literal N/)` whose N is what the live parser demands) → CHANGE (16), or fixture provenance /
  a plain comment / a historical title / a site that needs re-measurement rather than a literal
  swap → KEEP (10, reasons below).
- **C-derived-saveVersion**: CHANGE only where the row's `saveVersion` literal is asserted against
  a value produced in-test by `makeSave`, `migrateToLive`, a `BridgeSession.save()`/
  `session.save()` call on a fresh or hydrated-current state, or a `loadBridgeRuntimeCheckpoint`
  "governed prior path" result (traced to `bridge/runtime-checkpoint.ts:886`'s internal
  `migrateToLive` call) — 73 rows, each with its producing line cited in the classification JSON.
  KEEP (45) covers: forged/injected "downgrade target" probes (`{ ...save, saveVersion: 39 }` and
  siblings, always paired with a `.toThrow(...)` refusal, per rule 2's explicit KEEP category and
  its paired title where one exists); frozen-validator input scaffolds (`validateSaveV38({
  saveVersion: 38, ... })`, where 38 is a *required* argument to a per-version-locked validator,
  not a live pin — changing it would make the call itself throw); a historical step-converter
  (`convertV37ToV38`) explicitly excluded by 1301-F Amendment 3's exact three-literal list; fixture
  provenance (`MANIFEST.json` / captured-artifact metadata); and one genuine pre-existing defect
  (below).

No `it`/`describe` title was changed. None of the 145 CHANGE rows required a title edit under
rule 5 ("update a title only where it names the old live literal"): every title touching a stale
number in this inventory either narrates the forged/historical probe value of a KEEP row, or
narrates a historical cutover/introduction point (matching 1301-F Amendment 3's own treatment of
the `p14c3-save-v38.test.ts` describe title as history), not the present live fact the way 1197's
changed titles ("PROJECTION_VERSION is 52..." → "...is 54...") did. This is a deliberately
conservative choice, stated for the record rather than silently decided.

### `tests/p14c3-save-v38.test.ts` — Amendment 3 line-number note

1301-F Amendment 3 and this task's rule 4 cite "lines 19, 20 and 32". The inventory JSON itself
(amendment 1) correctly lists line **38**, not 32, for the `migrateToLive` assertion; at the
current source, line 32 is a bare `})` closing brace, while the exact text Amendment 3 quotes
("`actual migration must change the current envelope`") is verbatim at line 38. This is a
line-number typo in the 1301-F prose (not a stale-source drift — the inventory and the live file
agree with each other), resolved by using the inventory's line 38, matching the amendment's own
quoted content. Lines 19, 20 and 38 are CHANGE (38/39→40); line 63 (`convertV37ToV38` output) is
correctly excluded by the amendment's "the three version literals" cap and is KEEP.

## B-projection-form KEEP reasons (10)

- `tests/bridge-contract-generator.test.ts:564` — needs re-measurement, not a literal-only fix.
  `schema` here is `FIXTURES.F10_CURRENT_QUOTE_UNIONS.schema` (`tests/fixtures/bridge-contract-union-fixtures.ts:226-229`,
  read-only, `=== BRIDGE_SCHEMA`), so the call generates C# from the live schema with an explicit
  `projectionVersion: 54` argument and compares the result to a byte hash (`a9708ee3...`, the 1197
  measurement) that embeds 54. Bumping the literal to 55 without regenerating and rehashing turns a
  currently-passing assertion red; regenerating requires running `generateCsharpContract`, which is
  outside this task's authorized tools (no generators, no `node`/`vitest` on project code). Flagged
  for a dedicated re-measurement increment in the style of 1195/1196/1197.
- `tests/bridge-operations-events.test.ts:323` — an `it` title ("...validates inside the served
  projection-50 envelope") narrating the projection this leaf was authored under, not a present
  claim about `PROJECTION_VERSION`; the paired A-direct assertion at line 333 is corrected.
- `tests/bridge-p14b4-runtime47-compatibility.test.ts:61`, `tests/bridge-runtime-checkpoint.test.ts:995`
  — plain comments; explicit KEEP form under rule 1b.
- `tests/bridge-p14b6-relationship-read-models.test.ts:756` — an `it` title narrating this family's
  own historical state; the adjacent assertion compares `PROJECTION_VERSION` to a local named
  constant (`INCOMING_PROJECTION`), not a numeric literal, so nothing here restates a live fact.
- `tests/bridge-p14c2rm-runtime.test.ts:45`, `tests/bridge-p14c2s-scientist-runtime.test.ts:63`,
  `tests/bridge-p14c3-promise-digest-continuity.test.ts:34`, `tests/bridge-p14c3-runtime.test.ts:143`,
  `tests/p14c3-promise-digest-continuity.test.ts:35` — all five are `toMatchObject`/`toEqual`
  checks of a `MANIFEST.json` read from a historical fixture corpus (fixture provenance, the
  explicit rule 1b KEEP form).

## Regressions found (present at published HEAD regardless of this patch)

Two are reported here because they are reproducible from source alone and remain true whether or
not this patch's 145 literal corrections are applied — neither is fixed by this patch, by design
(both require a non-literal code change, out of this task's scope).

**1. `tests/bridge-p14c2s-scientist-runtime.test.ts:99-100` is already broken.**
`loaded.hydrated.checkpoint[slot]` (line 97) is produced by `loadBridgeRuntimeCheckpoint`'s
governed-prior-path migration, which calls `migrateToLive` internally
(`bridge/runtime-checkpoint.ts:886`, inside `importPriorSaveViaCanonicalChain`, re-exported through
`exportSaveJson`) — so `actualJson`'s real `saveVersion` is the live value (40 today), not 38.
Line 99 then calls `validateSaveV38(importSave(actualJson!))`; `validateSaveV38`
(`src/core/save.ts:10308`) requires `saveVersion === 38` exactly (via `proveProfessionSave(save,
38)` → `checkEnvelope`) and throws otherwise. The leaf therefore fails at line 99, before it ever
reaches its own `.toBe(38)` assertion at line 100 — correcting that literal to 40 would not repair
the test; the defect is the validator selection at line 99 (`validateSaveV38` should presumably be
`validateSaveV40`/an equivalent live check), a non-literal edit outside this patch's authority.
Classified KEEP with this reason in the classification JSON.

**2. Twelve files assert a stale "unknown saveVersion" boundary MESSAGE that no longer matches the
live runtime text — all twelve currently RED at published HEAD.** `src/core/save.ts:5416`'s
current message is:
```
validateSave: unknown saveVersion ${JSON.stringify(s.saveVersion)} (this build handles versions 1 through 40 only)
```
(the "40" is a plain hardcoded literal in production source, itself worth a future maintenance
note, not touched here since production edits are out of scope). Twelve test files still assert
`.toThrow(/…versions 1 through 38 only/)` or `/unknown saveVersion 39.*…38 only/` verbatim:
`tests/p13b-r07-save-v25.test.ts:268`, `tests/p13b-s8-save-v27.test.ts:215`,
`tests/script-projects-save-v9.test.ts:419` (and its sibling regex at :416),
`tests/p13b-s6-save-v26.test.ts:225`, `tests/property-state-v13.test.ts:944`,
`tests/p14a1-save-v28.test.ts:256`, `tests/construction-save-v11.test.ts:554`,
`tests/save.test.ts:456`, `tests/p13b-s2-save-v22.test.ts:214`,
`tests/p13b-s3-save-v23.test.ts:123`, `tests/p14b1-save-v29.test.ts:206`,
`tests/p13b-s5-save-v24.test.ts:215`. Each of these regexes will fail to match the real thrown
message today. One sibling file, `tests/p14b5-save-v31.test.ts:203-204`, avoids this entirely by
building the regex dynamically from the live constant
(`` new RegExp(`versions 1 through ${String(LIVE_SAVE_VERSION)} only`) ``) — proof the codebase
already has the correct pattern available. All twelve are classified KEEP here (each is a
"downgrade target" per rule 2's explicit KEEP category — the forged probe value itself, e.g.
`saveVersion: 39`, is a deliberate one-past-old-boundary probe, not a live pin) and are **not**
repaired by this patch: the correct fix is a rule/content decision (dynamic regex vs. hand-bumping
the numeral) beyond a mechanical literal swap, and is exactly the kind of failure the plan's
broad-run gates (1302/1303) are meant to surface and attribute, not something this maintenance
increment should decide unilaterally. Reported so the broad run's failures at these twelve sites
are not mistaken for something this patch caused or should have prevented.

**3. `tests/film-chronicle.test.ts:923`'s guard, left unfixed, would have silently skipped its own
assertion.** Not a remaining regression (this patch fixes it) but worth recording: line 923 is
`if (restored.saveVersion !== 38) return;`, guarding the real check at line 926
(`expect(after).toEqual(before)`). Since `restored` (line 921) is the live writer's own round-trip
output, this guard was *always* true (today `restored.saveVersion === 40`, never 38), meaning the
real assertion was silently unreachable regardless of whether `before`/`after` actually agreed.
This patch changes the guard's literal alongside its paired `expect` (both cite the same `restored`
variable) so the intended check executes again.

## Pin forms the given three patterns do not reach

- Inline `expect(x, 'message string').toBe(N)` custom-message text that itself states a stale
  number, independent of the numeral being asserted: `tests/bridge-p14b8-waiver-surface.test.ts:817`
  reads `expect(hydrated.currentSave.saveVersion, 'P3: each historical slot reaches actual live
  Save39').toBe(39)`. The numeral inside `.toBe(...)` is corrected here (39→40, a genuine current
  writer output per the classification), but the *message string* ("actual live Save39") is left
  as-is: rule 5 scopes title edits to `it`/`describe` titles only, and an `expect()` message
  argument is neither. Flagged as a form the given patterns (and this task's rules) do not
  address, not silently normalized.
- `it` titles asserting a specific "handled range" number in prose without the literal word
  `saveVersion` on the same line, e.g. `tests/p13b-r07-save-v25.test.ts:266`'s title says
  `"...naming the handled range \"1 through 36 only\"..."` while its own paired regex two lines
  below asserts `/versions 1 through 38 only/` — the title and the regex it describes already
  disagree with each other at published HEAD (independent of the live-runtime-message regression
  above), and neither number is caught by the C-derived `saveVersion`-literal grep pattern. Not
  edited (out of rule 5's narrow scope and this row is itself a KEEP/downgrade-target unit); named
  here as a form the inventory misses.
- The `generateCsharpContract({ ..., projectionVersion: 54 })` explicit-argument form
  (`tests/bridge-contract-generator.test.ts:564`) is already caught by the given B-projection-form
  pattern (it matched `projectionVersion: 54`), but its correct handling needs a generator
  re-run/rehash, not a literal swap — see the B-KEEP reasons above. Not a missed *pattern*, but a
  form this literal-only patch genuinely cannot finish; named again here per the checkpoint's
  "state any pin form the inventory patterns miss" instruction.

## Staged artifacts

- [`1301-stage/<path>`](1301-stage/) — 66 full postimage files (one per changed test file; listed
  below with preimage/postimage bytes and SHA256).
- [`1301-live-pin-maintenance.patch`](1301-live-pin-maintenance.patch) — 79,410 bytes,
  SHA256 `00016979a17de2ae78a82a1b256e4ed07a10cd5c9bba8f12db9e92e6cd179303`. One `git diff --no-index`
  hunk set per file, concatenated, with the `b/` side rewritten back to the repo-relative path so
  the patch applies against the live tree with `git apply -p1` from the repo root.
- [`1301-live-pin-classification.json`](1301-live-pin-classification.json) — 85,990 bytes,
  SHA256 `67002f7bf83021de446b0ddb61d02a1ab7c06c5e39dbe017d73ae090c07c5777`. 200 rows: `path`, `line`,
  `class`, `text` (verbatim from the inventory), `decision`, `oldValue`/`newValue` (CHANGE rows),
  `reason`, `titleChange` (`null` throughout — see "no title changed" above).

### Per-file preimage/postimage table (66 files, 145 line-edits)

| File | Pre bytes | Pre SHA256 | Post bytes | Post SHA256 | Edits |
|---|---:|---|---:|---|---:|
| `tests/bridge-operations-events.test.ts` | 17322 | `97792124793123986fbee89ed741f479e0864d53b8d15923fd005fe176b0b05f` | 17322 | `dbd21207a905e884f7b66ac70e5d65c871cae4832e19e034bca57c54db64e1a1` | 1 |
| `tests/bridge-owner-ux-projection21-schema.test.ts` | 5026 | `70becdc9e9d924536c4cdcf96a6a9f0f2addedd70be91c5351692493f4655398` | 5026 | `90750cc7940f6f5c3160cda6ddf57f45202f68297e2240f230135aec45d7ac95` | 2 |
| `tests/bridge-p10a-w0-people-projection.test.ts` | 18217 | `6848d209c62d0f968e2b929168d41ab3795c153fce72ffa2961bb6816190f9fa` | 18217 | `b0f21957de6b6bce0837ed089e18cd2b3706337e6a0134d7f7ce171e73e68f0e` | 2 |
| `tests/bridge-p11-capital-contributors.test.ts` | 9715 | `643bc42c93a469d6685bea1a793783ca0dfe2343af3152022afe4ae252ca3c41` | 9715 | `7981d31b823676b06adba05a893904bded07fad3e54ebae39798b48e30cf3232` | 1 |
| `tests/bridge-p11-ready.test.ts` | 23497 | `7b449f1e9cd1c4c2fec2c464b5adaf0ad36eee0004fb11f8fc64103cf23616fd` | 23497 | `da8f61501cdda8a2a9665e40cf27298ae08103d6b1d48618658e52f1986d70b2` | 1 |
| `tests/bridge-p13b-r07-setup.test.ts` | 35925 | `ac79267facf37c7361be7324b2d75f062d1c51a2420d2d3297e8b35a0e9e7ac8` | 35925 | `14ea067d8f07bdddaac403efacc51c5381a4a0433f01ef0941eda11a1d04c4ef` | 3 |
| `tests/bridge-p13b-s1b-seats.test.ts` | 11197 | `de6af5efca8e3acc0ae717727553860744d6e3b11d5e4effb0c9b29dd9d376a3` | 11197 | `903c9dabed865c880bfc5d2edfe30013f6a86760abf3025ab933973304f6f15b` | 1 |
| `tests/bridge-p13b-s2-labs.test.ts` | 32713 | `368d32666d274a0f53ef9b7eacfcdc532504a5beac7c97480a14fa591c15f2f5` | 32713 | `72ec697293d03ab68ecd291a5fa724799375543f45e6b3657f39aa9369d68e4f` | 1 |
| `tests/bridge-p13b-s3-plans.test.ts` | 35579 | `8dd3f516e713b34e51ed803eaccdf83dfce4dec32fd4ffe19dd7c193afb2003f` | 35579 | `bfa3094d2efdffc2016ddc200afc48cce343b1720e77eab353c862611790fe63` | 1 |
| `tests/bridge-p13b-s4-office.test.ts` | 37203 | `54d2aa5dc1e461c2fced881adb60e128c1fe5dd49f436b9ed2fbf13ec3a44be9` | 37203 | `74bafcced4aeb9f378e185806c6e45409f6f97a2fe1e1d2ba4c1a803502bfec3` | 1 |
| `tests/bridge-p13b-s5-adoption.test.ts` | 33491 | `886c51dce0319efbb0335e6df18402f96ca0e9173ff96eccd62656b3151fbf97` | 33491 | `a3d46a7a48152e97184934b745e20fec689183c3789cfe487838f52a82d1ef37` | 3 |
| `tests/bridge-p13b-s6-cancellation.test.ts` | 42938 | `af33e82e7de7eabc5f3cfb679f8b61c7e7d7d257bab2e4390331850626141856` | 42938 | `dbc710936393e9237fa9efe85eb489f27dc94ede52c2533a311bd8715313c909` | 3 |
| `tests/bridge-p13b-s7-disclosure.test.ts` | 44739 | `cc92901957549dca40501b2ecd2d94cc6faebfee1b55b40c2ea87370cc086052` | 44739 | `1a185019119f69f49031b6300576e4e9caeb9b81121da1b73e3d69afc8a1c1ae` | 3 |
| `tests/bridge-p13b-s8-rivals.test.ts` | 35212 | `d61dcab5ddf606568d008c145789fb7897621e0692b5ebcb952fa2928e72a94e` | 35212 | `ec924d47f4bc17917f99aeef98b377133a9c791e642e954fd834371c8dfe395b` | 5 |
| `tests/bridge-p14a1-market.test.ts` | 37520 | `e3dbc76b1924e39dd17658650d1829d0b40652811a6d13530d4fbc687c30f34c` | 37520 | `606df1eb69316e5bef29ae91b7efe8b4be2054c3efe204c63e2e4fce07ec99b2` | 4 |
| `tests/bridge-p14a2-market.test.ts` | 56043 | `792bb1c98b71d20941d2e5415294e945a09911039ef859b557bbfe5fea64a8d1` | 56043 | `843b2716b0d4d452dfd1f20e7ff632bd5ba00ae07347f490ef2e24d9ce7a411e` | 9 |
| `tests/bridge-p14a3-world.test.ts` | 41214 | `48308bf92e23cd5457660986d3f53ba4201394f4cba5d854aa3f2ede7b3ad471` | 41214 | `57f95213cef609fa9f80e918495062411b9ebf862eb0de731ec4c4d1be0f2df7` | 7 |
| `tests/bridge-p14b1-promises.test.ts` | 37996 | `21b42f2ced4cab2c1fcb55ddc1db04ea3c3272c0d3c918c08746e7ab219f340d` | 37996 | `38c221447456d7f5eb39df5dd51bc9ae31ecd59eb831ee27b21ef6bb2600f626` | 6 |
| `tests/bridge-p14b2-checkpoint.test.ts` | 5961 | `bd05bb29a71aff646c066c50a3cff07501631d7cabdc5bada5987ea0d5bad2e7` | 5961 | `d998d2bfe850d662bd5ff53c098297190ee1aba1dd846181bcb7e7d78e0130d2` | 2 |
| `tests/bridge-p14b4-runtime47-compatibility.test.ts` | 17641 | `7c645b9c96c9592352b9ca3cfe0cb05c53e22a029b64b6de26588da5c625034d` | 17641 | `5f16dccf41d060ecd7a7321ed6732a101b7d5d8f4ea7fefcc5f1fdfa963b26f4` | 2 |
| `tests/bridge-p14b5-relationships.test.ts` | 46462 | `dd0422e47aa4dbc42fb38b56757f6b05f055f9683c02761fbf0c069e2276cca2` | 46462 | `e4e57155357e4f17313b2a3f3f95a6f79fbdec06a59818473d77672584b9cc26` | 2 |
| `tests/bridge-p14b6-relationship-read-models.test.ts` | 61647 | `58e79a72b5a3364ade7b4b71583141674e4d7c57f0250fcfe098d565c6161de1` | 61647 | `9cad05582dd20ec4a5e96531342cdb5ff7fe32909d24b3dc199a0f20434be764` | 1 |
| `tests/bridge-p14b7-promise-waiver.test.ts` | 16891 | `7b74e1d63fa175c70808a0f883b308d1808e1874ef64bc0caa1bcd6d0ab6516e` | 16891 | `fe594f7ca8eebefd358a892a1b7ba50cb076707853cf1d714a6a8c3677715adf` | 1 |
| `tests/bridge-p14b8-waiver-surface.test.ts` | 62598 | `478b0f07da3209a3f483c893fbab84fef64ccbbe79f51e9675337b6291cbc2de` | 62598 | `a0eacc3968d6799c48f6dc9de54501e96c8f490638bce7f208d550f20c09a131` | 5 |
| `tests/bridge-p14c2rm-runtime.test.ts` | 10726 | `785939bf289decc507567c79f441458427d3000d5adf9bbc82d878a794a9ff93` | 10726 | `8e92852ecc7582074439af7163992be1ce854bbcf1e6e730d104924ee7213be7` | 3 |
| `tests/bridge-p14c2s-scientist-runtime.test.ts` | 13313 | `bd21d8a1715c12eb081ce0ec0f6a4fbdff5157f2b7d48eb3fa9f5d7ee6937869` | 13313 | `9ed10e2b17f8b16e934c4ac8976bf117b098bd9a9ea9baeca953f1dbab019cfd` | 2 |
| `tests/bridge-p14c3-promise-digest-continuity.test.ts` | 9801 | `382f2eda1c07cc478c55457739207f303790c2289a91597a88be65d11cb7b331` | 9801 | `6b9a6997d3abedba74e25e7fcdb2fb21b83a8370364b8a29240a450ffa951d0f` | 2 |
| `tests/bridge-p14c3-runtime.test.ts` | 21791 | `6e276c73d64206f2e65cd167a40d98d572afa771e8369154acff142149c5950b` | 21791 | `a77414813a77c65ba16fb4bc32e6afbe2196985b9534288f63f1aa80eb0f31ef` | 2 |
| `tests/bridge-process-restart.test.ts` | 43186 | `c77e2cd32cd04262e54bcd97e538b9bd42a6a4c48104f0ca7c2f5e2a0c6c444c` | 43186 | `c0761e1a9335c754d1acfa0770405320722b252c253d5bfec5ba3e3f87160160` | 2 |
| `tests/bridge-r3n4-read-model-deltas.test.ts` | 17677 | `52589665f715361fb9fe759e7a09dd231081196b26d179294bb0d2bd85755e64` | 17677 | `9b570fb225856535b4ccf65dfccf888f1d17e65b5688e679af00555bf79f433e` | 2 |
| `tests/bridge-runtime-checkpoint.test.ts` | 48789 | `09dd5144d0635f216d535ef66ee4e542d38bbd43d830ece94787692f0795e057` | 48789 | `3477391ce3e835cd5df04722cb41d3d1360c60d1c3af643cec3f7dee07dab6f1` | 9 |
| `tests/bridge-schema.test.ts` | 40989 | `6db6a763808d3f1e8401c63e8579a41ccea83daf78d2f09ddf082869e8b59369` | 40989 | `2c5f802ac1252bb7b9fe777bd4bfcfb2148411c33360fbc35be9a17db702068e` | 4 |
| `tests/c2a-m3-rename-and-pooling.test.ts` | 14808 | `b3a128bbd223ad4aaab88e8407add35e077715a8e464d1beabada670338e580c` | 14808 | `0c565cc9f6e4b77414f02a121aeaae5aa2e2651b191a5061e143136a1bc177c9` | 2 |
| `tests/c2a-m3-screenplay-mint.test.ts` | 14992 | `6df8def2362901a77ecd18a905c1547cb0a1f51f69074160d6241a18f4795973` | 14992 | `aeb2bbe0062cae93243bce551228217d18997a479d02270ef9709c813e87773a` | 1 |
| `tests/construction-save-v11.test.ts` | 19084 | `ff0e2da598f8d4d6b6af722f2762415f80b454809a2b8530812862789fd0a191` | 19084 | `e230fc9aab4177edecbb39c01663c66e585e5075abb37231dc8856ab476095df` | 1 |
| `tests/contracts/v14-byte-parity.contract.test.ts` | 8772 | `4a7aea1519d4ce829c4fbc9b78329e02ad6e60616d9c33e9a752b1209f685148` | 8772 | `98f35c3101eacd687a226f1fd492b611be6720b2741bd612726f104425b62305` | 1 |
| `tests/d11-employment.test.ts` | 30183 | `cb4c13f5228b489420f6b46c6632b470be5b04d262cf1376e83aa4ad50276477` | 30183 | `0281854186c66d6783f3e63a6c5a227d064ff3b13111db1b9d8920843901bc21` | 1 |
| `tests/d17-engagement-persistence.test.ts` | 26985 | `7c216d5b19d942d2ab23d7864aafcaab9cbeab3676df213c2a6f02bcb76e32f0` | 26985 | `030b9d516de1805575f596ed660b697bab0aba6c770c85f29ff936e4f956b141` | 1 |
| `tests/d17a-adv-reconciliation.test.ts` | 15958 | `3a8435c39b24eb3e5177836b9f3d7dc0d7cc11e8b35f7d25987f579dacb70daf` | 15958 | `bb0cc1c92b3737112043899b82e747bee1065c803efdedf0c4ce86bee8a3d8b3` | 1 |
| `tests/film-chronicle.test.ts` | 33266 | `98b5ffed9ec029f614852bfbd252329ab3f709acd5f869d41220f89f982516c6` | 33266 | `f4bca91a070439ebdfed6fb6c8bd00ec80f74b3b1ad47a6ffa6a51f7b53520a8` | 3 |
| `tests/p04a2-writer-credit-law.test.ts` | 42390 | `e91ff8d58f873a23f0169ff192037b935d31ab82726bad445310f838280477b2` | 42390 | `8fa8beed57e2de56c48d93598032a8625770feea9a09d9288f6a7498914395b3` | 1 |
| `tests/p09a-w0-founding-regime.test.ts` | 29658 | `5eb56fc84d6f3763b83cc7ad8951187380e65c9061ac537113c6c52c0352adf2` | 29658 | `3825a50fbc4e223215f1a3698979514cbf77c2c5b3b5946d49fb7cdc8c272bb2` | 1 |
| `tests/p13b-s2-save-v22.test.ts` | 13998 | `ee91965dfee31125d0e5cde296f8c4909394619af2e4dcec06b97ffb8f329cdb` | 13998 | `1df7b42b7c42703578a4da9b02b7fef23a63d7fddec7e5b931ac457e23ec43e7` | 1 |
| `tests/p13b-s3-save-v23.test.ts` | 8069 | `f2bfd8a18b5382804bf7d71f715e3248fcb14a7ab05a38729074e7a880474334` | 8069 | `bf02c4812e014703a8b6a835f70faec2f6624fe813be0ef7a3532a508bbe81c5` | 1 |
| `tests/p13b-s5-save-v24.test.ts` | 16042 | `6af392dd374dd202208067a29d5b2134ce8e68b44e2d6ecd1237772b3cd15e96` | 16042 | `05ae131d3b916a626d34606d37271129a1511d938958a4aeb677e0d22ea7906e` | 1 |
| `tests/p13b-s6-save-v26.test.ts` | 24039 | `46e9d7048a148b062bb4f95e09358c6c1aaf3c628a5074b9cb81e33d38e168a3` | 24039 | `d584389f186052c033b4c747134cfc9de5fd3e97b968089ce033faba4fa9ee52` | 1 |
| `tests/p13b-s7-announcements.test.ts` | 8216 | `da81b487276a039843495b3077302ba05385e690e800b0b49bc287eb665b962b` | 8216 | `669dcba0c8cc121142898b3a8978b76e6031e6e81fd1ee98639276344b4b8c27` | 1 |
| `tests/p13b-s8-save-v27.test.ts` | 14877 | `acf21e24e037e05070f461e17b702f37f31d92806e2bcc465f79e1b69a506f26` | 14877 | `5e51a7e2df90768b8690bbf49fdb8e82bc19c3890558646d3666ca2d0932836d` | 1 |
| `tests/p14b4-cancel-causal-proof.test.ts` | 53697 | `1cb805aab03b2f0b81bf7eb3dc17ee3bd312cea6935261a22b2577f7211af8e5` | 53697 | `5a388698f2c448cca4a8a10e43d143845d3bf2cbff339d11153849b1e4819fc6` | 1 |
| `tests/p14b4-cast-class-outcomes.test.ts` | 32559 | `35bf57bca02334e7e7481e421260390f7135946b1ee28cb6a8ea14370605625d` | 32559 | `07bc3e64c45e41c0f8accf66e478f5518c55bd2aa122b7449c0b00ab66b98b2e` | 1 |
| `tests/p14b4-rival-seating-preference.test.ts` | 73890 | `4cefab0d090dd9c9251233b42231617e679cccf338885a281cdce09f8b8f57a1` | 73890 | `34c8470c71cd2b3d626238bcfcf448aa926ae318e2a4ca088b3cbe6d2fb7f84d` | 1 |
| `tests/p14b5-save-v31.test.ts` | 23013 | `ee45f64f19282f57da86a408274884f5b5bd1aabc51a59d1b4fd213ac2d34e0d` | 23013 | `00cbc90f34171083fbecd1fb2b29f4e57b2a36c2b7b50b93550719f61669d8ed` | 1 |
| `tests/p14b7-promise-waiver.test.ts` | 65957 | `684bac7c2dc83d0633805d83d965fb6db3a567610914a770715b0d4b58c5e2dc` | 65957 | `4cdd090241c7c6f4b54d0c2695dec5e83abc06767fcd87c0463f116104203f36` | 1 |
| `tests/p14c1-materialized-aging.test.ts` | 64447 | `5e7bf5e4d4e74964854e7334285b7e8a132e646da7793ff9ba42038a56518357` | 64447 | `6aff5b7ab7d684a002c300473b1a883db9ce9791f25272a0c2c59c2f73c3b884` | 1 |
| `tests/p14c2a-save-and-settlement.test.ts` | 25978 | `c372e5132eaa4f76f474ae5f5737ca9c3d9133f676552aea631f2de32c2e6bbe` | 25978 | `1824a9930cafd3d0dd5b9da88d37fbda8cb750287d5b2f231e15bd67fb5a96a6` | 1 |
| `tests/p14c2b-save-v36.test.ts` | 10217 | `7681fe59201572c28daf5f8fb521a0333ed3617b8cd404918a59523301d60b46` | 10217 | `a0f4f15e5823918dca167f1fa46d3fa6cc403f715c645a0da621019efb964007` | 2 |
| `tests/p14c2s-scientist-retirement.test.ts` | 22282 | `6b556a1ed615fd983fd176b9c543bfc8f50c396280527a1b4f6f0fa3da0273a5` | 22282 | `dd1ca9620197c809adc1faa7528d982e299d8a30ebf8781439c6e3388465fb29` | 4 |
| `tests/p14c3-save-v38.test.ts` | 33121 | `81f9497db53fecb12ca28d0fbcd96c3d029bab9071e4aed9bbb55152577a7f00` | 33121 | `c9b865ec6c92e9765bf23eef0c8b381374ec6c3949c1cea895c3c5a687f99f47` | 3 |
| `tests/p14c4-save-v35.test.ts` | 18793 | `c66a99fc9f749e4d1b48361b4ad651c8a73229a257ce13bcb3bb4e21369ecf79` | 18793 | `2446684364b745578bc4cdc14d741ec53b950d521a43b2597380224d0ff53c1a` | 2 |
| `tests/p14p3-directing-promises.test.ts` | 98958 | `1bcbbe03552f5815c3e88fc1f0937ef51f37d7b84ca0f3bd8fd693f5058e2e16` | 98958 | `83e19c40ffb9ba1f95b7f2228647f31ee2ed0c2e37c1dc44e1a82486189bf0fc` | 5 |
| `tests/property-state-v13.test.ts` | 42083 | `48b740e25eac42f4f893cfbc015c9dd694dca4e5ae18761be4fe05f01e6fe003` | 42083 | `acb7560216008e74d1ae907b87ace31db291f54d4c1a8dbdeb694309a2d6c499` | 2 |
| `ui/src/engine/d17-save-migration.test.ts` | 7025 | `bd51c8e7bf1e11ed46b955899e79fed121341bf72c52ddc5c072235f673b12b8` | 7025 | `a52b76119e86b7e39d3cf1f0fc5ca165b9edd47ea42b5ce6d824d4cd49b4f9be` | 2 |
| `ui/src/engine/film-chronicle-adapter.test.ts` | 11752 | `1ecb8abe92e5e1cd8127252cf9bb462d09855f7834c8a1ad7d7a200e80a3d9af` | 11752 | `a532baaf20aaee7809269baf7895dbe566f557bbe7cd35a06683f89f050462cf` | 1 |
| `ui/src/lot/snapshot/v14SetHolderBoundary.test.ts` | 5289 | `5ebbe1f456155cf2984068afd6b65ed7b1b96a5dd32e5a86cc7c7bd180d74950` | 5289 | `3d5487422b51e4b1f731e3a49203ded50c3a20bf9423e51b60e4001d09df7d6c` | 1 |
| `ui/src/saves.test.tsx` | 16216 | `8132a6a7ed50264a414dc7dbab2ccd09c064dfbabfeed6cc01dd05e5357648d6` | 16216 | `bd689dafc53df4093e7cce53f2cf6eb2a56e495bb56c2d9fb2dd92975b8c2f23` | 1 |
| `ui/src/session.test.tsx` | 18321 | `665807eb59579a2cbd1575092db1c0664b57a1c7ee6e9075fa6b6b9557157d2a` | 18321 | `fd4c55bfca8e9bc67f0d8e410715d2261bab160b211f67709b68add8f60dc3b3` | 3 |

66 files, 145 line-edits total (one file, `tests/bridge-p14c3-runtime.test.ts`, carries two
independent literal corrections on the same physical line 160 — `PROJECTION_VERSION).toBe(53)` and
`LIVE_SAVE_VERSION).toBe(38)` in one compound statement — so 145 edits land on 144 distinct
changed lines across the patch; confirmed by `diff` hunk counts below).

## Proofs (all commands actually run)

1. **Preimage/postimage identity** — every row in the per-file table above was computed by
   `hashlib.sha256` over the exact bytes read from the live file (preimage) and the exact bytes
   written to `1301-stage/<path>` (postimage), inside a single Python pass that also asserted each
   target line's old fragment (e.g. `toBe(53)`, `projection-53'`, `saveVersion: 38`) occurred
   **exactly once** on its target line before replacing it — any zero or duplicate match would have
   raised and stopped the whole run before any file was written. No exception was raised; all 145
   edits applied cleanly on the first pass.
2. **`git apply --check` from the repository root (read-only)**:
   `git apply --check docs/engineering/playability-launch-review/evidence/p14b4-20260919/1301-live-pin-maintenance.patch`
   → exit 0. Re-run after the parent's concurrent gate-1300 commit landed (HEAD advanced from
   `4ff4a351` to `d05ce055`) — still exit 0. `git status --short` before and after both checks
   shows no write to any live path; only the three new evidence paths this task created appear
   untracked throughout.
3. **Forward application in scratch, independent of the staged copies**: the 66 *preimage* files
   (freshly copied from the live tree, not from `1301-stage/`) were seeded into
   `scratchpad/1301c/apply-check/`, then `git apply --unsafe-paths -p1
   1301-live-pin-maintenance.patch` was run there. Exit 0. Every one of the 66 resulting files'
   bytes/SHA256 was then independently re-hashed and compared against the `1301-stage/` postimage
   table above: **0 mismatches** (66/66 exact).
4. **Complete inverse, same scratch copy**: `git apply -R -p1 1301-live-pin-maintenance.patch` on
   the now-forward-applied scratch tree. Exit 0. Every one of the 66 files' bytes/SHA256 was
   re-hashed again and compared against the original preimage table above: **0 mismatches** (66/66
   exact) — a full round trip (preimage → forward apply → postimage → reverse apply → preimage)
   with no residual difference.
5. **Live tree integrity**: `git status --short tests/ ui/ src/ bridge/` returned empty at every
   checkpoint in this task (before staging, after staging, after patch generation, after both
   `apply --check` runs, and at handback time) — no write to the live tree occurred at any point.

## Commands actually run

```sh
git rev-parse HEAD
git status --short
sed -n '6530,6545p' src/core/save.ts
sed -n '275,290p' bridge/schema/bridge-schema.ts
grep -n "\$id" bridge/schema/bridge-schema.ts
grep -n "urn:project-studio" bridge/ src/ -r
grep -n "export const PROTOCOL_VERSION" bridge/schema/bridge-schema.ts
grep -n "export const BRIDGE_SCHEMA" bridge/schema/bridge-schema.ts
grep -n "function migratePriorCheckpoint\|migratePriorProtocol4Checkpoint\|migrateToLive\|validateCanonicalCurrentSave" bridge/runtime-checkpoint.ts
grep -n "export function validateSaveV38\|validateSaveV40\|migrateToLive" src/core/save.ts
grep -rn "versions 1 through" tests/ ui/src/
grep -n "unknown saveVersion\|versions 1 through" src/core/save.ts
grep -n "F10_CURRENT_QUOTE_UNIONS" tests/fixtures/bridge-contract-union-fixtures.ts tests/bridge-contract-generator.test.ts
# per-row source reads (Read tool) of every file carrying an in-scope inventory row, with
# +/-4..12 lines of context, to locate each row's producing line
python3 <inventory load + per-file context dump, read-only>
python3 <edit table application: read live bytes, assert-count-1 fragment match, write staged
         postimage, sha256 pre/post, refuse to overwrite an existing staged file (open(...,'xb'))>
python3 <classification JSON generation: one row per in-scope inventory row, decision/reason>
git diff --no-index -- <path> 1301-stage/<path>   # once per changed file, concatenated into the patch
git apply --check docs/engineering/playability-launch-review/evidence/p14b4-20260919/1301-live-pin-maintenance.patch
git status --short                                 # before and after the check
cp <66 live preimage files> scratchpad/1301c/apply-check/<path>
git apply --unsafe-paths -p1 1301-live-pin-maintenance.patch     # in scratch only
python3 <rehash all 66 scratch files, compare to staged postimage hashes>
git apply -R -p1 1301-live-pin-maintenance.patch                 # in scratch only, the inverse
python3 <rehash all 66 scratch files, compare to original preimage hashes>
wc -c / shasum -a 256 <every created evidence file>
```

No `vitest`, `tsc`, `node`, `vite-node`, generator, fixture payload read (`tests/fixtures/`,
`ui/e2e/`, `ui/public/`), Git index/ref mutation, or commit was run at any point. Reading
`tests/fixtures/bridge-contract-union-fixtures.ts` (to resolve `F10_CURRENT_QUOTE_UNIONS.schema`)
is a source read of a fixture-defining `.ts` module (for classification only, not a fixture
payload read, and not edited), consistent with "read source to locate interfaces and understand
failures."

## Limits and what was not done

- Did not run any broad or targeted suite; 1302/1303 remain the parent's next concrete action after
  independent 1301-D review of this handback.
- Did not verify the 12-file "versions 1 through N only" mismatch or the
  `bridge-p14c2s-scientist-runtime.test.ts` defect by executing Vitest — both are traced from
  source (message templates, validator signatures, migration call graphs) and are reproducible by
  any reader who runs the cited grep/read commands; they are not confirmed by an actual red run in
  this task.
- Did not exhaustively search for every conceivable additional stale-pin form beyond the two named
  in "Pin forms the given three patterns do not reach" above; those two were found incidentally
  while classifying the given 200 rows, not from a separate systematic sweep.
- Did not touch any of the six 1296-A files or the two rows flagged `excluded: true`.
- Did not touch `PROMISE_RULES_VERSION` (stays 4, live `src/core/promises.ts:52`, confirmed
  unrelated to this task's classes) or any production file.
- The B-projection-form KEEP at `tests/bridge-contract-generator.test.ts:564` and the C-KEEP defect
  at `tests/bridge-p14c2s-scientist-runtime.test.ts:100` both need a follow-up increment with
  broader authority (a generator run for the former, a validator-call correction for the latter);
  neither is resolvable inside this task's literal-only, no-execution contract.

## Return

DONE for the assigned scope (stage one cause-scoped maintenance patch, per-row classification,
complete inverse proof, `git apply --check` from repo root). No live-tree edit was made. Next
concrete action: independent 1301-D review of this handback, the patch and the classification
JSON, then parent application (1301-E) and the two broad gates (1302, 1303) per 1301-F's ordering.
