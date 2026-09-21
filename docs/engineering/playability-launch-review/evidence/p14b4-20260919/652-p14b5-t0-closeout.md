# Record 652 — P14B.5 T0: genuine outgoing Save V30 corpus and projection-47 runtime checkpoint preserved

T0 preservation evidence complete; independently reviewed KEEP WITH RECORD-ONLY ITEMS (651-B).
Not B.5 implementation, forward-migration verification, native or Owner acceptance. Authority:
P14 plan :414-415 ("genuine fixtures of the outgoing save version minted at its final writer
before any source change"); record 645 NEXT645 (1); the B4 T0 pattern (records 01–09).

## Producer identity

- Mint HEAD (published, remote-verified before the mint): `d6c11b9b4809d361e356ef74495e731f9296acc2`.
- Tested V30 behavioural writer: `61833f0df4ffdb5673903d5a81680b2d37ba254b` (629-W S2). The only
  producer-path commit after it, `651fea8ba28450ad20dccf45f209bde6ab058aaa` (638-W), is comment-only;
  the minter's gate asserts the ancestry, an empty producer diff since 651fea8b, and pins the
  comment-only diff by sha256 `456a099e448f5c4f…` (equal to the 638-W patch identity).
- Closeout: `637-cancel-causal-qualified-checkpoint.md` sha256 `382eee59…`; schema
  `sha256:6f6b4880…`; projection 47; protocol 4; Save V30; PROMISE_RULES_VERSION 4.
- 41 producing source files hashed in the MANIFEST (the B4 23 + 18 additions); re-hashed by the
  parent at `ce04e49e` with zero drift (650b).

## Corpus (tests/fixtures/p14/genuine-v30-pre-b5; MANIFEST written last)

Record-check 648 (`STUDIO_MINT_V30_APPROVED_FINAL` = the published HEAD): PASS, 2 tests (DRY, then
ONE-SHOT), 2026-09-21T22:11:42Z–22:12:11Z, one worker, no concurrent heavy run; fixedSource false
explained exactly by the 21 new fixture files (untracked 3 → 24). Ten genuine worlds, every world
built and read back (export → validateSaveV30 → import → BridgeSession) BEFORE the output directory
existed; seed `p13a-core-causal-01`:

| case | week | route (real actions only) |
|---|---|---|
| empty | 0 | generated campaign |
| current-p1 | 45 | retentionFixture: two CURRENT attached P1 proposals, unbound |
| bound-open-p1 | 52 | real settle; two bound OPEN P1 roots |
| bound-open-p2-lead / -lead-or-antagonist | 52 | the outcomes test's tagged route (copied, never imported): real submit@45 + attach {castRoleCount 1, class} → real freeze@52 |
| kept-and-broken | 61 | SATISFIED at first-take-event-24 (prod-0052) with its own receipt; BROKEN by the real `releaseTalent` (termination owner), own receipt |
| rival-current-p1-and-p2 (renamed) | 196 | 48 CURRENT rival attachments: 42 P1 + 6 tagged leadOrAntagonist P2 — a source fact since 600-W S2 rival authoring |
| rival-shared-take-terminal | 213 | first-take-event-45 on r01 film 11 settles promise-12/16/18 (receipts talent-market-event-120/121/122) — identical to the landed 619-T2 facts |
| first-take-at-five | 60 | player picture at remainingTicks 5, promised lead seated, task unassigned, no take; discarded-clone probe proves the next scheduled tick takes at 61 |
| legacy-count-only-p2-current-draft (substituted) | 45 | ORIGIN the genuine V29 corpus (`refused-p2-count-only-current-draft`, gz `dedd68ed…`), carried by the real `migrateToV30`; state deep-equal to V29; promise-2 count-only P2 v3/rules-3 IMPOSSIBLE, unbound |

Dropped: `legacy-count-only-p2-bound` — no genuine V29 fixture holds a bound count-only P2 (P2 was
nonofferable in V29) and HEAD refuses one at any freeze; the only bound one anywhere is the
outcomes test's synthetic `variant()`, which the no-hand-written-field rule forbids.

## Runtime checkpoint (tests/fixtures/p14/genuine-projection47-runtime)

Record-check 649 (`STUDIO_MINT_PROJECTION47_APPROVED`): PASS, 2 tests, 22:12:23Z–22:12:38Z;
fixedSource false = exactly the 3 new files (24 → 27); the 648 end patch equals the 649 start
patch (corpus bytes unmoved between mints). Current-p1 world → BridgeSession
`p14b5-genuine-outgoing47` → real save → real quote/commit withdraw: schema `6f6b4880…`, protocol
4, revision 1, journal [save, command]; savedSaveSha256 `b7a32680…` = the corpus current-p1 raw
(byte-identical, as B4); the −0→0 canonical premise of records 03/05/08 preserved (each slot
against `exportSave(makeSave(own state))`; decode without migration; reopen; retry replay; bytes
unchanged). Outer checkpoint hashes carry `processingMs` and are not comparable across mints; the
inner slot hashes, journal routes, intent id and command id are the comparable facts.

## Parent checks and independent review

- 650: every gz/raw hash pinned in provenance and equal to the 646-T dry-run table; every save V30;
  patch reconstruction 21 + 3 files under `tests/fixtures/p14/`. 650b (651-B item 1): keyed on
  `MANIFEST.fixtures`, zero MANIFEST↔file↔provenance mismatches; the archived executed minter,
  support and runtime-minter sources equal the MANIFEST/provenance `minterSha256`/`supportSha256`
  (`46b8306e…`/`1133a180…`/`a91c3168…`); closeoutSha256 equals the 637 record at HEAD.
- 651-B (contract-auditor, read-only): KEEP WITH RECORD-ONLY ITEMS — producer identity, genuineness
  (routes, no restamp, no receipt edit, honest substitution and drop), readback order and −0→0
  premise, evidence integrity and coverage all MET WITH EVIDENCE; record-only: the runtime
  provenance carries no `supportSha256` key (its support identity rests on the 649 start patch,
  byte-identical to 648's); the processingMs sentence; 645-A's "at HEAD 40451858" vs the actual
  d6c11b9b (docs-only interval, producer diff proven empty).
- Executed minter sources archived (`648-mint-final-v30.executed.ts.txt`,
  `648-mint-support.executed.ts.txt`, `649-mint-runtime47.executed.ts.txt`) and removed from the
  tree as in B4 T0, so the gated one-shot never runs in a routine suite.

## Forward needs (651-B Q5; mintable later at the then-HEAD while no source change lands)

A V30 world holding a RELEASED player film joined to its first take (the no-backfill witness for
`sharedSuccess`/`sharedFailure`), and a V30 world after a player cancel following a first take
(the `cancelledAfterFirstTake` driver's migration witness). A later mint needs a re-pinned
authority block at the then-HEAD with the same 61833f0d/651fea8b/diff-hash pins and a NEW corpus
directory (the gate refuses an existing one).

## Next

NEXT652: the 647-B audit disposition of the B.5 expansion draft → insert into the P14 plan →
T1 RED (test-author) against the absent `src/core/relationships.ts` and the V31/48 allocation.
