# Fable setup — source and authority index

Prepared 2026-09-13 from verified published text. **These pins describe available inputs; they
are not automatic authority to run any build or start implementation.** Current Ops must confirm
newer orders and ownership at launch. Existing operational files should be reused rather than copied
into this setup directory. The setup does not read private campaigns or other workers' mutable files.

## Read first

1. `FABLE-COORDINATOR.md` and the active Current Ops order.
2. Owner whole-overhaul clarification and 1A/2B/3A/4B at `f2921730a6ff6cb5f0b8e952995978a8ecb8407f`:
   `docs/operations/UIUX-WHOLE-GAME-OVERHAUL-OWNER-CLARIFICATION.md`.
3. Current published playability entry inspected at `06a852acdf58e2e02404efdfc980b0bf32ec54a9`:
   `docs/engineering/playability-launch-review/00-PLAYABILITY-REVIEW-INDEX.md`;
   read its 05 reconciliation and issued 04 order before historical 01/02.
   It retains an existing implementation/native-input owner and a locally gated continuation.
   Full-overhaul sizing is still open; setup neither resets usage nor expands the allowance.
4. Selected R3 hybrid at `b56088d63e5b8eb66c78584c7b0f40f915c08d8b`:
   `docs/operations/uiux-visual-blueprint/r3-picture-cards/README.md`, DESIGN.md, REVIEW.md.
5. Corrected independent advisory at `ba3854108bfe86b81f0ed4d5259c96101d89c887`:
   `docs/operations/uiux-opus-advisory-20260913/RECONCILIATION-01.md`.

## On-demand downstream inputs (not launch authorization)

- P13B corrected preparation/scheduling handoff: `9db31137662afe9d6ef9eb44b6390f611feeadf6`,
  `docs/engineering/P13B-AND-PLAYABILITY-HANDOFF.md`. Verify what remains of P13B before P14.
- P14 retained preparation: `8ef5246aec115cc32d01d9fb8c916e3538342dca`,
  `docs/engineering/P14-PREPARATION-REVIEW-INDEX.md`. Needs accepted-upstream refresh.
- P15 corrected research: `c5b52b4d8147d9de7d1478d12397cdface08bf70`,
  `docs/research/p15-independent-verification-01/INDEX.md` then RECONCILIATION-02.md.
- P16 corrected research: `084713980ef884ac4b7be44f22e97fcaaec13683`,
  `docs/research/p16-independent-verification-01/P16-INDEPENDENT-VERIFICATION-REVIEW-INDEX.md`.
  Its cited older P15 14-week-estate statement was withdrawn by later P15 correction;
  reconcile current producer contracts before any P16 implementation. No second studio/label.
- Opus visual research: `6b2a659bcaa1e577c8d90a10aae390e3855a2985`,
  `docs/operations/uiux-opus-r2-independent-review/00-INDEX.md`. Later R3/advisory corrections control.

Main repository: HSpector1/The-Movies. Native client: HSpector1/project-studio-unity-visual-spike.
Historical P13A TS `45ca33650074ad5413c39fb9d4a5c04cd6571c3a` and Unity
`6420a4d91de52db1bffca2988f2c995672e7d53e` are reference identities, not presumed current runtime.

## Existing profiles inspected, not local-install claims

At `06a852acdf58e2e02404efdfc980b0bf32ec54a9`, `.claude/agents/` contains contract-auditor, sim-core, test-author and instrumentation.
They refer to historical build-contract revisions; sim/instrumentation retain M0A-only stops.
The root CLAUDE.md includes historical overrides. This kit preserves the useful deterministic,
source-first and independent-test discipline while replacing the workers' stale authority lookup.
The Mac may have newer versions, local/user-level agents or policy settings: inspect before copying.

## Official tool references (checked 2026-09-13)

- https://code.claude.com/docs/en/sub-agents — project .claude/agents, YAML frontmatter,
  separate context, model/tool controls and version-dependent creation/reloading behavior.
- https://code.claude.com/docs/en/vs-code — CLI in VS Code terminal; standalone install needed.
- https://code.claude.com/docs/en/cli-reference — --model, --permission-mode, --settings;
  `claude agents` is not a reliable cross-version registry listing.
- https://code.claude.com/docs/en/model-config — aliases/account restrictions and actual model checks.
- https://code.claude.com/docs/en/permissions — session-scoped disableAllHooks and permissions.

Current documentation differs from older tutorials: /agents is no longer a creation wizard on
newer builds. Write the Markdown files and test actual delegation. Verify your installed version
rather than automatically upgrading. Avoid user-level forced-model overrides and blind
isolation: worktree defaults. No font files or external code are included in this kit.
