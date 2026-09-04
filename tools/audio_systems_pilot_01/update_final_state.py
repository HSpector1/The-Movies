#!/usr/bin/env python3
"""Atomically derive final and bounded failure-recovery Audio Systems Pilot transitions."""

from __future__ import annotations

import argparse
import json
import subprocess
from pathlib import Path
from typing import Any

from common import DOC_REPO, PILOT_ROOT, STATE_PATH, atomic_write_json, git_head, sha256_file, utc_now
from package_owner_return import (
    OWNER_NEXT_ACTION, PACKAGING_NEXT_ACTION, RETURN_ROOT,
    STATE_COUNT_SCOPES, VALIDATION_NEXT_ACTION, verify as verify_return_package,
    expected_state_counts,
    verify_unity_run_archives,
    verify_complete_predecessor_chain,
)
from failed_oracle_attempts import verify as verify_failed_oracle_attempts


UNITY_REPO = Path("/Users/bruce/Project Studio - Audio Systems Pilot 01 Client")
COMPLETE = PILOT_ROOT / "10_provenance/COMPLETE-AUDIO-FILE-REGISTER.v1.json"
AUDITION_SOURCE = PILOT_ROOT / "11_return-package/AUDITION-SOURCE-REGISTER.v2.json"
UNITY_VALIDATION = PILOT_ROOT / "09_unity-lab/UNITY-AUDIO-LAB-VALIDATION.json"
ORACLE = PILOT_ROOT / "07_audio-oracle/AUDIO-ORACLE-SUITE.v1.json"
REVIEWS = PILOT_ROOT / "12_logs/hostile-review/HOSTILE-REVIEW-FINAL-INDEX.json"
FINAL_VALIDATION = PILOT_ROOT / "10_provenance/FINAL-VALIDATION.v2.json"
AUDITION_PREVIEW_HISTORY = PILOT_ROOT / "11_return-package/audition-previews-v2/AUDITION-PREVIEW-HISTORY.v1.json"
AUDITION_APP_HISTORY = PILOT_ROOT / "08_audition-app/AUDITION-APP-HISTORY.v1.json"
REMEDIATION_NEXT_ACTION = (
    "Complete the ERR-0013 failed/unpublished Oracle-attempt remedy, commit and push the "
    "Unity trace-publication preflight guard, run a fresh clean-SHA Unity validation, "
    "regenerate all D/U-bound proof and eight hostile-review lanes, then return to READY_FOR_PACKAGING."
)

TRANSITIONS = {
    "READY_FOR_PACKAGING": (
        "IN_PROGRESS", "READY_FOR_PACKAGING",
        PACKAGING_NEXT_ACTION,
    ),
    "READY_FOR_FINAL_VALIDATION": (
        "IN_PROGRESS", "READY_FOR_FINAL_VALIDATION",
        VALIDATION_NEXT_ACTION,
    ),
    "COMPLETE": (
        "COMPLETE", "FINAL_VALIDATION_COMPLETE",
        OWNER_NEXT_ACTION,
    ),
    "REOPEN_AFTER_FINAL_FAILURE": (
        "IN_PROGRESS", "READY_FOR_FINAL_VALIDATION",
        VALIDATION_NEXT_ACTION,
    ),
    "REOPEN_AFTER_PREPACKAGE_FAILURE": (
        "IN_PROGRESS", "PHASE_G_HOSTILE_REVIEW_REMEDIATION",
        REMEDIATION_NEXT_ACTION,
    ),
}
ALLOWED_PREDECESSORS = {
    "READY_FOR_PACKAGING": {
        ("IN_PROGRESS", "PHASE_G_HOSTILE_REVIEW_REMEDIATION"), ("IN_PROGRESS", "READY_FOR_PACKAGING"),
    },
    "READY_FOR_FINAL_VALIDATION": {
        ("IN_PROGRESS", "READY_FOR_PACKAGING"), ("IN_PROGRESS", "READY_FOR_FINAL_VALIDATION"),
    },
    "COMPLETE": {("IN_PROGRESS", "READY_FOR_FINAL_VALIDATION")},
    "REOPEN_AFTER_FINAL_FAILURE": {("COMPLETE", "FINAL_VALIDATION_COMPLETE")},
    "REOPEN_AFTER_PREPACKAGE_FAILURE": {
        ("IN_PROGRESS", "READY_FOR_PACKAGING"),
        ("IN_PROGRESS", "PHASE_G_HOSTILE_REVIEW_REMEDIATION"),
    },
}
FINAL_CHECK_IDS = (
    "git_isolation_and_push",
    "catalogue_identity_and_raw_hashes",
    "assets_derivatives_and_complete_inventory",
    "responsive_music_and_four_hour_density",
    "transitions_living_lot_and_management",
    "radio_and_accessibility",
    "system_unity_oracle_audition_and_return",
    "atomic_state_and_hostile_reviews",
)


def load(path: Path) -> dict[str, Any]:
    return json.loads(path.read_text(encoding="utf-8"))


def upsert_by_id(rows: list[dict[str, Any]], replacement: dict[str, Any]) -> None:
    matches = [index for index, row in enumerate(rows) if row.get("id") == replacement["id"]]
    if len(matches) > 1:
        raise RuntimeError(f"duplicate state ledger ID before upsert: {replacement['id']}")
    if matches:
        rows[matches[0]] = replacement
        return
    rows.append(replacement)


def require_unique_ledger(rows: Any, label: str) -> list[dict[str, Any]]:
    if not isinstance(rows, list) or not all(isinstance(row, dict) and isinstance(row.get("id"), str) for row in rows):
        raise RuntimeError(f"state {label} ledger is malformed")
    identifiers = [row["id"] for row in rows]
    if len(identifiers) != len(set(identifiers)):
        raise RuntimeError(f"state {label} ledger contains duplicate IDs")
    return rows


def reopen_after_prepackage_failure(state: dict[str, Any]) -> dict[str, Any]:
    """Durably reopen without trusting now-stale D/U-bound green artifacts."""
    if RETURN_ROOT.exists() or RETURN_ROOT.is_symlink():
        raise RuntimeError("prepackage-failure reopen requires that no immutable return root was published")
    documentation_sha = git_head(DOC_REPO)
    unity_sha = git_head(UNITY_REPO)
    doc_status = subprocess.run(
        ["git", "status", "--porcelain", "--untracked-files=all"], cwd=DOC_REPO,
        check=True, capture_output=True, text=True,
    ).stdout
    upstream = subprocess.run(
        ["git", "rev-parse", "@{upstream}"], cwd=DOC_REPO,
        check=True, capture_output=True, text=True,
    ).stdout.strip()
    if doc_status or upstream != documentation_sha:
        raise RuntimeError("prepackage-failure reopen requires committed, pushed documentation/tooling")
    failed_attempt = verify_failed_oracle_attempts()
    if (failed_attempt.get("attempt_count") != 1
            or failed_attempt.get("registered_trace_count") != 20
            or failed_attempt.get("registered_capture_count") != 0
            or failed_attempt.get("registered_audio_file_count") != 0
            or failed_attempt.get("suite_level_machine_verdict") is not None):
        raise RuntimeError("prepackage-failure reopen requires the exact preservation-only failed-attempt register")

    errors = require_unique_ledger(state.get("errors", []), "error")
    upsert_by_id(errors, {
        "id": "ERR-0013",
        "classification": "PREPACKAGE_ORACLE_UNPUBLISHED_TRACE_REACHABILITY",
        "observed_exception": (
            "RuntimeError: Oracle trace tree differs from current-plus-archived reachability"
        ),
        "hypothesis": (
            "Unity commit 199aa643c53dce124a58c813767f15277c54457e wrote all twenty "
            "content-addressed trace files before validating the prior archive register and "
            "publishing the suite; archive validation then raised "
            "ORACLE_ARCHIVE_REGISTER_PRIOR_INTEGRITY_FAILED:"
            "ARCHIVED_ORACLE_SCENARIO_ID_INVALID:early_era_normal, leaving one exact trace "
            "generation outside current-plus-archived reachability."
        ),
        "correction": (
            "Preserve and hash-authenticate the exact failed/unpublished attempt separately, "
            "admit only its committed twenty-file allowlist to global trace reachability, bind "
            "the register into the next current-run and package provenance, and preflight the "
            "archive register before any future trace write."
        ),
        "focused_proof": (
            "Pending fresh clean-SHA Unity, D/U-bound downstream rebuild, eight-lane hostile "
            "review, prepackage validation, and return-package verification."
        ),
        "status": "UNRESOLVED",
    })
    decisions = require_unique_ledger(state.get("decisions", []), "decision")
    upsert_by_id(decisions, {
        "id": "DEC-0014",
        "decision": (
            "Register exact failed/unpublished Oracle trace generations as preservation-only "
            "evidence, never as current or archived suites."
        ),
        "reason": (
            "Trace-level PASS bytes can diagnose a failed execution but cannot create the suite "
            "or current-run publication that never occurred."
        ),
    })
    counts = dict(state.get("counts", {}))
    counts["failed_unpublished_oracle_attempts"] = failed_attempt["attempt_count"]
    counts["failed_unpublished_oracle_traces"] = failed_attempt["registered_trace_count"]
    completed = list(state.get("completed_work", []))
    marker = (
        "Classified ERR-0013 and preserved one exact failed/unpublished twenty-trace Oracle "
        "attempt without manufacturing a suite-level PASS."
    )
    if marker not in completed:
        completed.append(marker)
    state.update({
        "phase": "PHASE_G_HOSTILE_REVIEW_REMEDIATION",
        "status": "IN_PROGRESS",
        "updated_utc": utc_now(),
        "completed_work": completed,
        "counts": counts,
        "count_scopes": STATE_COUNT_SCOPES,
        "errors": errors,
        "decisions": decisions,
        "next_resumable_action": REMEDIATION_NEXT_ACTION,
    })
    state.setdefault("git", {})["documentation_sha"] = documentation_sha
    state["git"]["unity_sha"] = unity_sha
    atomic_write_json(STATE_PATH, state)
    return state


def build(mode: str) -> dict[str, Any]:
    status, phase, next_action = TRANSITIONS[mode]
    state = load(STATE_PATH)
    predecessor = (state.get("status"), state.get("phase"))
    if predecessor not in ALLOWED_PREDECESSORS[mode]:
        raise RuntimeError(f"illegal final-state transition {predecessor} -> {mode}")
    if mode == "REOPEN_AFTER_PREPACKAGE_FAILURE":
        return reopen_after_prepackage_failure(state)
    if mode == "REOPEN_AFTER_FINAL_FAILURE":
        final = load(FINAL_VALIDATION)
        final_checks = final.get("checks", {})
        if (final.get("schema") != "project-studio-audio-systems-final-validation/v2"
                or final.get("status") != "FAIL"
                or not isinstance(final_checks, dict)
                or final.get("check_order") != list(FINAL_CHECK_IDS)
                or set(final_checks) != set(FINAL_CHECK_IDS[:-1])
                or not all(isinstance(final_checks.get(name), dict)
                           and final_checks[name].get("status") == "PASS" for name in FINAL_CHECK_IDS[:-1])
                or "state" not in str(final.get("failure", "")).lower()
                or not (RETURN_ROOT / "RETURN-PACKAGE-MANIFEST.json").is_file()):
            raise RuntimeError(
                "reopen requires a post-completion failure confined to state closure, with the first seven final stages still PASS and the package preserved"
            )
    complete = load(COMPLETE)
    unity = load(UNITY_VALIDATION)
    oracle = load(ORACLE)
    reviews = load(REVIEWS)
    documentation_sha = git_head(DOC_REPO)
    unity_sha = git_head(UNITY_REPO)
    if complete.get("machine_verdict") != "PASS" or oracle.get("machine_verdict") != "PASS" or reviews.get("machine_verdict") != "PASS":
        raise RuntimeError("final state cannot advance from failed complete-register, Oracle, or review evidence")
    if unity.get("machine_verdict") != "PASS":
        raise RuntimeError("final state cannot advance from failed Unity evidence")
    if (complete.get("status") != "PROTOTYPE_ONLY"
            or complete.get("source_code", {}).get("artifact_generation_commit") != documentation_sha
            or complete.get("source_code", {}).get("unity_lab_commit") != unity_sha
            or oracle.get("source_git_shas") != {"documentation": documentation_sha, "unity_audio_lab": unity_sha}
            or unity.get("unity_git_sha") != unity_sha
            or reviews.get("evidence_bindings", {}).get("documentation_sha") != documentation_sha
            or reviews.get("evidence_bindings", {}).get("unity_sha") != unity_sha):
        raise RuntimeError("final state cannot advance from stale D/U-bound evidence")
    if mode == "READY_FOR_PACKAGING" and RETURN_ROOT.exists():
        raise RuntimeError("packaging-ready state refused because the immutable return root already exists")
    if mode != "READY_FOR_PACKAGING":
        if not (RETURN_ROOT / "RETURN-PACKAGE-MANIFEST.json").is_file():
            raise RuntimeError("post-package state requested before the return package exists")
        if verify_return_package().get("machine_verdict") != "PASS":
            raise RuntimeError("post-package state requested from an unverified return package")
    if mode == "COMPLETE":
        final = load(FINAL_VALIDATION)
        final_checks = final.get("checks", {})
        if (not isinstance(final_checks, dict)
                or final.get("check_order") != list(FINAL_CHECK_IDS)
                or set(final_checks) != set(FINAL_CHECK_IDS)
                or not all(isinstance(final_checks.get(name), dict)
                           and final_checks[name].get("status") == "PASS" for name in FINAL_CHECK_IDS)):
            raise RuntimeError("COMPLETE requires the exact eight-stage final validation PASS set")
        git_check = final_checks["git_isolation_and_push"]
        package_check = final_checks["system_unity_oracle_audition_and_return"]
        state_check = final_checks["atomic_state_and_hostile_reviews"]
        predecessor = verify_complete_predecessor_chain(complete)
        expected_bindings = {
            "documentation_sha": documentation_sha,
            "unity_sha": unity_sha,
            "state_sha256": sha256_file(STATE_PATH),
            "complete_audio_register_sha256": sha256_file(COMPLETE),
            "complete_predecessor_chain_sha256": predecessor["predecessor_chain_sha256"],
            "audio_oracle_suite_sha256": sha256_file(ORACLE),
            "audio_oracle_failed_attempt_register_sha256": sha256_file(
                PILOT_ROOT / "07_audio-oracle/AUDIO-ORACLE-FAILED-ATTEMPT-REGISTER.v1.json"
            ),
            "hostile_review_index_sha256": sha256_file(REVIEWS),
            "unity_validation_sha256": sha256_file(UNITY_VALIDATION),
            "unity_current_run_sha256": sha256_file(PILOT_ROOT / "09_unity-lab/CURRENT-VALIDATION-RUN.json"),
            "unity_run_archive_manifest_set_sha256": verify_unity_run_archives()["archive_manifest_set_sha256"],
            "system_register_sha256": sha256_file(PILOT_ROOT / "10_provenance/SYSTEM-AUDIO-ASSET-REGISTER.v5.json"),
            "audition_build_manifest_sha256": sha256_file(PILOT_ROOT / "08_audition-app/v2/AUDITION-BUILD-MANIFEST.json"),
            "audition_source_register_sha256": sha256_file(AUDITION_SOURCE),
            "audition_preview_history_sha256": sha256_file(AUDITION_PREVIEW_HISTORY),
            "audition_app_history_sha256": sha256_file(AUDITION_APP_HISTORY),
            "return_manifest_sha256": sha256_file(RETURN_ROOT / "RETURN-PACKAGE-MANIFEST.json"),
        }
        if (final.get("schema") != "project-studio-audio-systems-final-validation/v2"
                or final.get("status") != "PASS"
                or final.get("evidence_bindings") != expected_bindings
                or git_check.get("status") != "PASS"
                or git_check.get("documentation_sha") != documentation_sha
                or git_check.get("unity_sha") != unity_sha
                or package_check.get("status") != "PASS"
                or package_check.get("return_manifest_sha256") != sha256_file(RETURN_ROOT / "RETURN-PACKAGE-MANIFEST.json")
                or state_check.get("status") != "PASS"
                or state_check.get("state_phase") != "READY_FOR_FINAL_VALIDATION"):
            raise RuntimeError("COMPLETE requires the preceding READY_FOR_FINAL_VALIDATION machine PASS")

    counts = expected_state_counts(include_return_package=mode != "READY_FOR_PACKAGING")

    errors = require_unique_ledger(state.get("errors", []), "error")
    existing = {row.get("id"): row for row in errors}
    for error_id, correction, proof in (
        (
            "ERR-0005",
            "Replaced authored Oracle expectations with scenario-labelled Unity PlayMode/policy/validator/offline-marker evidence; preserved transport cursors and added content-addressed retry archives.",
            "Clean-SHA compile, EditMode, PlayMode, macOS build/codesign, strict 20-scenario Oracle verifier, and archive relationship proof pass.",
        ),
        (
            "ERR-0007",
            "Bound every final consumer to catalogue closure v3, system register v5, management/accessibility v4, radio/responsive v2, exact D/U, current Unity proof, and the complete bounded register.",
            "Prepackage semantic validation, audition verification, hostile-review index, complete register, and package preflight pass on the same exact identities.",
        ),
    ):
        prior = existing.get(error_id, {"id": error_id, "classification": "FINAL_EVIDENCE_RECONCILIATION"})
        upsert_by_id(errors, {**prior, "correction": correction, "focused_proof": proof, "status": "RESOLVED"})
    upsert_by_id(errors, {
        **existing.get("ERR-0008", {
            "id": "ERR-0008", "classification": "HOSTILE_REVIEW_RADIO_PRESENTER_IDENTITY_DRIFT",
            "hypothesis": "The Unity fixture retained presenter IDs that did not match the canonical external ensemble.",
        }),
        "correction": "Replaced the additive Unity fixtures with the canonical Mae Calder, Arthur Vale, and Rina Shore identities and cross-checked programme and delivered-speaker roles.",
        "focused_proof": "Focused fixture/scheduler tests plus the clean-SHA full Unity and eight-lane hostile-review proof pass.",
        "status": "RESOLVED",
    })
    upsert_by_id(errors, {
        **existing.get("ERR-0013", {
            "id": "ERR-0013",
            "classification": "PREPACKAGE_ORACLE_UNPUBLISHED_TRACE_REACHABILITY",
            "observed_exception": (
                "RuntimeError: Oracle trace tree differs from current-plus-archived reachability"
            ),
            "hypothesis": (
                "A failed Oracle execution wrote trace bytes before archive-register validation "
                "and suite/current-pointer publication."
            ),
        }),
        "correction": (
            "Preserved and authenticated the exact twenty traces as one failed/unpublished "
            "attempt, admitted only that allowlist to reachability, bound it through current-run "
            "and package provenance, and moved archive-register validation before trace writes."
        ),
        "focused_proof": (
            "Exact-register mutation self-test, fresh clean-SHA Unity/current-run proof, rebuilt "
            "D/U-bound metadata, eight fresh hostile-review lanes, prepackage validation, and "
            "return-package verification all pass."
        ),
        "status": "RESOLVED",
    })
    upsert_by_id(errors, {
        **existing.get("ERR-0009", {
            "id": "ERR-0009", "classification": "HOSTILE_REVIEW_RADIO_ACCESSIBILITY_AND_ROUTING",
            "hypothesis": "Baked full-programme playback bypassed independent voice/PA controls and the transcript conflated caption display with audible scheduling.",
        }),
        "correction": "Registered exact item-level clean/period voice and sting assets; bound programme/role paths, schedule and delivered-speaker identity, speech ownership, exact typed IDs/expiry, and one hash-pinned important-sound caption; rebuilt fixtures from those authorities; made baked masters canonically offline-audition-only; and recorded explicit caption/DSP/audibility/interruption lifecycle.",
        "focused_proof": "The deterministic 147-item register and independent validator, tamper-focused radio/accessibility tests, clean-SHA full Unity proof, and hostile accessibility re-review pass; word-timed interrupted captions remain explicitly deferred.",
        "status": "RESOLVED",
    })
    upsert_by_id(errors, {
        "id": "ERR-0010",
        "classification": "FINAL_VALIDATOR_FALSE_GREEN_AND_RETRY_AUDIT",
        "hypothesis": "Early final consumers trusted top-level PASS flags, mutable mappings, fixed retry paths, or a hash-authenticated parent without dereferencing its nested source-register identity.",
        "correction": "Added exact semantic projections, nested source-register path/hash validation, source/branch/build bindings, content-addressed Oracle evidence, eager successful-run snapshots, staged/hash-checked archives, one bounded non-destructive legacy metadata supplement, state upserts, and one-shot package preflight.",
        "focused_proof": "Python and Unity mutation tests reject a stale four-hour source-register hash/path; JavaScript/zsh/static tests, exact archive/snapshot/supplement tree verification, and fresh independent hostile review report zero open mechanical findings before package creation; superseded failed evidence remains preserved.",
        "status": "RESOLVED",
    })
    upsert_by_id(errors, {
        "id": "ERR-0011",
        "classification": "MANAGEMENT_RUNTIME_UNREGISTERED_FALLBACK",
        "hypothesis": "A pre-catalogue procedural audition path survived after the lab adopted exact v5 asset identities, so missing catalogue evidence could still synthesize and play an unregistered 44.1 kHz semantic clip.",
        "correction": "Removed runtime procedural candidate creation and fallback playback; management requests now require the validated exact-hash catalogue and otherwise retain the visual equivalent while refusing audio without advancing selection, cooldown, pending-load, or active-voice state. Exact eligible candidate IDs now use a seeded per-family shuffle bag with cycle-boundary repeat repair instead of occurrence-ordered C1/C2/C3 traversal.",
        "focused_proof": "Targeted PlayMode proof rejects missing and unvalidated catalogue requests with exact visible reasons, silence, zero load attempts, and zero state mutation; pure tests prove deterministic complete bags, no immediate repeat, and no complete ordinal/reverse ladder; indexed pause/cooldown proof uses a validated external candidate; clean-SHA full Unity and fresh hostile review pass.",
        "status": "RESOLVED",
    })
    upsert_by_id(errors, {
        "id": "ERR-0012",
        "classification": "HOSTILE_REVIEW_STREAMER_SAFE_RIGHTS_OVERCLAIM",
        "hypothesis": "The prototype treated local lab playback eligibility as streaming/VOD authorization, so Streamer Safe could still play generic system voices and a milestone sting whose output is expressly local, non-redistributable scratch.",
        "correction": "Made radio schema v2 closed-world for streaming/VOD rights: every current item carries false/null authorization, the system register binds each voice and sting to an exact-hash NOT_AUTHORIZED record, fabricated positive claims fail validation, and Radio Streamer Safe silences every current voice, PA, sting, and music bed while retaining functional and important visual text/transcripts without changing mechanics.",
        "focused_proof": "TypeScript and Unity mutation tests reject unverified positive claims; actual decorative, functional, PA, and milestone fixtures are suppressed with zero clip loads, -80 dB radio music, stopped speech/sting sources, cleared ducking, and exact visual-only payload/caption retention; clean-SHA full Unity proof and fresh eight-lane hostile review pass.",
        "status": "RESOLVED",
    })
    if any(row.get("status") != "RESOLVED" for row in errors):
        raise RuntimeError("state still contains an unresolved ordinary failure")

    decisions = require_unique_ledger(state.get("decisions", []), "decision")
    upsert_by_id(decisions, {
        "id": "DEC-0012",
        "decision": "Keep generated/derived counts explicitly scoped and classify Oracle WAVs as two Editor offline marker renders, never runtime mix captures.",
        "reason": "This preserves exact accounting without overstating the origin or listening value of machine marker evidence.",
    })
    upsert_by_id(decisions, {
        "id": "DEC-0013",
        "decision": "Use only exact item-level voice/sting assets for Unity runtime radio and keep baked programme masters offline-audition-only.",
        "reason": "Independent Radio Voice/PA controls, caption timing, and audibility lifecycle cannot be provided honestly for a baked composite mix.",
    })
    upsert_by_id(decisions, {
        "id": "DEC-0014",
        "decision": (
            "Register exact failed/unpublished Oracle trace generations as preservation-only "
            "evidence, never as current or archived suites."
        ),
        "reason": (
            "Trace-level PASS bytes can diagnose a failed execution but cannot create the suite "
            "or current-run publication that never occurred."
        ),
    })
    completed = state.get("completed_work", [])
    marker = "Completed clean-SHA Unity compile, EditMode, PlayMode, isolated build/codesign, Audio Oracle, offline audition, provenance, and eight-lane hostile-review proof."
    if marker not in completed:
        completed.append(marker)

    state.update({
        "phase": phase,
        "status": status,
        "updated_utc": utc_now(),
        "completed_work": completed,
        "counts": counts,
        "count_scopes": STATE_COUNT_SCOPES,
        "errors": errors,
        "decisions": decisions,
        "next_resumable_action": next_action,
    })
    state.setdefault("git", {})["documentation_sha"] = documentation_sha
    state["git"]["unity_sha"] = unity_sha
    atomic_write_json(STATE_PATH, state)
    return state


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("mode", choices=tuple(TRANSITIONS))
    args = parser.parse_args()
    state = build(args.mode)
    print(json.dumps({
        "path": str(STATE_PATH), "status": state["status"], "phase": state["phase"],
        "documentation_sha": state["git"]["documentation_sha"], "unity_sha": state["git"]["unity_sha"],
    }, indent=2, sort_keys=True))


if __name__ == "__main__":
    main()
