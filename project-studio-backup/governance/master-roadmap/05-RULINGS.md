# Project: Studio — Owner Rulings Ledger

Verbatim record of explicit owner rulings that govern this program. **Newest first. These are authoritative.** An agent may not override, silently reinterpret, or "resolve around" them. Recorded read-only by the Roadmap Curator, 2026-07-27. When any package document disagrees with a ruling here, **the ruling wins** and the document is corrected to match.

---

## R-2026-07-27-A — SOURCE PRECEDENCE

> **PROJECT: STUDIO SOURCE PRECEDENCE**
>
> 1. Accepted Build Contracts govern currently authorized simulation mechanics and implementation scope.
> 2. The Visual Charter governs long-range presentation intent, visual identity, and final-product aspiration.
> 3. The Master Roadmap governs sequencing, proof milestones, dependencies, and authorization gates.
> 4. CURRENT-STATE governs what presently exists in repositories and what work is in flight.
> 5. When these sources conflict, no agent may resolve the conflict silently. The conflict returns to the owner for an explicit ruling.
> 6. The Visual Charter does not independently authorize mechanics, integration, or implementation work.

**Status: IN FORCE.** Resolves the previously-open governance question (formerly `00 §6.4` / `03 §1.3`: "charter-vs-build-contract precedence is unresolved").

**What it establishes — domain ownership (each source is authoritative *within its own domain*):**

| Rank | Source | Governs (its domain) | Canonical location |
|---|---|---|---|
| 1 | **Accepted Build Contracts** | Currently **authorized simulation mechanics + implementation scope** | `The Movies/docs/build-contract.md` (+ `rev4-open-questions.md`, D-11/D-12 contracts) |
| 2 | **Visual Charter** | **Long-range** presentation intent, visual identity, final-product aspiration | `Project Studio Source Docs/PROJECT-STUDIO-VISUAL-CHARTER.md` |
| 3 | **Master Roadmap** | Sequencing, proof milestones, dependencies, **authorization gates** | `MASTER-ROADMAP/00-MASTER-ROADMAP.md` (this package) |
| 4 | **CURRENT-STATE** | What **presently exists** in repos + what is **in flight** | `MASTER-ROADMAP/01-CURRENT-STATE.md` + live git |

**How to apply:**
- Use the ranking to decide **which source owns a question**, not as a license to override another source. Rule 5 forbids silent resolution: a genuine conflict between sources **escalates to the owner** — an agent records it and stops, it does not pick a winner.
- **Rule 6 is load-bearing:** the Visual Charter **cannot authorize** mechanics, integration, or implementation. Only the **Build Contracts** (mechanics/scope) and the **Master Roadmap** (sequencing/gates) authorize work. The charter expresses *intent and aspiration*; it never greenlights a build. Wanting to start charter/V-sequence work is therefore never sufficient on the charter's authority alone — it needs a build-contract/roadmap gate.
- If a proof milestone (roadmap, rank 3) or reality (CURRENT-STATE, rank 4) contradicts an authorized mechanic (rank 1) or a stated aspiration (rank 2), that is a conflict → escalate; do not quietly downgrade the higher-ranked source.

---

## R-2026-07-27-B — PROTECTION-GUARD RULING

> **PROTECTION-GUARD RULING**
>
> The existing exact-HEAD protection check is deprecated because the protected main track legitimately advances.
>
> The replacement must verify structural isolation:
> - no visual-spike source paths copied into protected repositories;
> - no forbidden imports or dependencies;
> - correct repository and branch identity;
> - frozen spike baselines remain recoverable;
> - no unapproved presentation integration;
> - no save or simulation contamination.
>
> Exact commit pins remain valid only for genuinely frozen evidence or release baselines.
> Do not implement this replacement while the main simulation is dirty or while D-12 is actively changing relevant files.

**Status: RECORDED — implementation DEFERRED and currently BLOCKED.**

**How to apply:**
- The current guard `The Movies - 3D Visual Spike/tools/verify-protected.mjs` (exact-HEAD pin of `main`) is **deprecated**. It is presently **RED** as a known false positive (`HEAD 0f9e4bd`, pins `0f9d23d`) precisely because main legitimately advanced — this is the failure mode the ruling names.
- The **replacement** is a **structural-isolation verifier** meeting the six bullet requirements above. It is a *specification*, not yet built.
- **Exact commit pins are still valid for genuinely frozen evidence / release baselines** — so pinning the frozen spikes (`studio-lot-spike @ 3806ef6`, `studio-3d-visual-spike @ 591f3aa`) by exact HEAD remains correct. Only the pin on the **advancing main track** is deprecated.
- **Hard precondition (do not violate):** the replacement **must not be implemented while the main simulation is dirty or while D-12 is actively changing relevant files.** As of 2026-07-27 main is dirty (~32 paths) and D-12 is actively changing `src/core` + `ui`, so **implementation is blocked now.** It becomes eligible only once main is clean and D-12 has landed — and then only by a session explicitly authorized to modify the spike tooling.
- This ruling unblocks **Gate-D entry condition #2** *conceptually* (the false-positive tripwire is retired), but the *actual* Gate-D block persists until (a) the structural replacement exists and (b) the moving-base condition clears.

---

*Add new rulings above this line, newest first, quoting the owner verbatim. Every ruling recorded here must be reflected in the affected package documents.*
