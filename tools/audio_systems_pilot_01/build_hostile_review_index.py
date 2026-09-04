#!/usr/bin/env python3
"""Publish the hash-bound final index for all eight independent hostile-review lanes."""

from __future__ import annotations

import argparse
import hashlib
import json
import subprocess
from pathlib import Path
from typing import Any

from common import DOC_REPO, PILOT_ROOT, atomic_write_json, sha256_file, utc_now


OUTPUT = PILOT_ROOT / "12_logs/hostile-review/HOSTILE-REVIEW-FINAL-INDEX.json"
SOURCE_PATH = "tools/audio_systems_pilot_01/build_hostile_review_index.py"
UNITY_REPO = Path("/Users/bruce/Project Studio - Audio Systems Pilot 01 Client")
SYSTEM_REGISTER = PILOT_ROOT / "10_provenance/SYSTEM-AUDIO-ASSET-REGISTER.v5.json"
ORACLE_SUITE = PILOT_ROOT / "07_audio-oracle/AUDIO-ORACLE-SUITE.v1.json"
ORACLE_FAILED_ATTEMPT_REGISTER = PILOT_ROOT / "07_audio-oracle/AUDIO-ORACLE-FAILED-ATTEMPT-REGISTER.v1.json"
COMPLETE_AUDIO = PILOT_ROOT / "10_provenance/COMPLETE-AUDIO-FILE-REGISTER.v1.json"
REPORTS = (
    ("LANE-01", "Unity technical audio architecture", "LANE-01-UNITY-TECHNICAL-AUDIO-ARCHITECTURE-FINAL.md"),
    ("LANE-02", "Adaptive-music honesty", "LANE-02-ADAPTIVE-MUSIC-HONESTY-FINAL.md"),
    ("LANE-03", "Historical and era treatment", "LANE-03-HISTORICAL-ERA-TREATMENT-FINAL.md"),
    ("LANE-04", "Radio copy and broadcaster credibility", "LANE-04-RADIO-COPY-BROADCASTER-CREDIBILITY-FINAL.md"),
    ("LANE-05", "Accessibility and fatigue", "LANE-05-ACCESSIBILITY-FATIGUE-FINAL.md"),
    ("LANE-06", "Rights and provenance", "LANE-06-RIGHTS-PROVENANCE-FINAL.md"),
    ("LANE-07", "P05 collision and future integration", "LANE-07-P05-COLLISION-FUTURE-INTEGRATION-FINAL.md"),
    ("LANE-08", "Audio Oracle evidence", "LANE-08-AUDIO-ORACLE-EVIDENCE-FINAL.md"),
)
HUMAN_OR_LEGAL_GATES = (
    "Owner listening and long-session comfort",
    "musical quality and Project: Studio identity",
    "historical and cultural review",
    "disabled-player accessibility/usability review",
    "Community-license registration/revenue/AUP/attribution review",
    "Small-SFX canonical licence capture",
    "local system-voice output redistribution review",
    "presenter name/mark and final casting review",
    "copyrightability, exclusivity, non-infringement, and commercial-clearance decisions",
)


def git(*arguments: str) -> str:
    return subprocess.run(["git", *arguments], cwd=DOC_REPO, check=True, capture_output=True, text=True).stdout.strip()


def source_binding() -> dict[str, Any]:
    commit = git("rev-parse", "HEAD")
    committed = subprocess.run(
        ["git", "show", f"{commit}:{SOURCE_PATH}"], cwd=DOC_REPO, check=True, capture_output=True
    ).stdout
    committed_hash = hashlib.sha256(committed).hexdigest()
    working_hash = sha256_file(DOC_REPO / SOURCE_PATH)
    if committed_hash != working_hash:
        raise RuntimeError("hostile-review index builder differs from its bound commit")
    return {
        "repository": str(DOC_REPO),
        "branch": git("branch", "--show-current"),
        "commit": commit,
        "path": SOURCE_PATH,
        "blob_sha256": committed_hash,
        "working_file_matches_commit": True,
    }


def evidence_bindings() -> dict[str, str]:
    return {
        "documentation_sha": git("rev-parse", "HEAD"),
        "unity_sha": subprocess.run(
            ["git", "rev-parse", "HEAD"], cwd=UNITY_REPO, check=True, capture_output=True, text=True
        ).stdout.strip(),
        "system_register_sha256": sha256_file(SYSTEM_REGISTER),
        "audio_oracle_suite_sha256": sha256_file(ORACLE_SUITE),
        "audio_oracle_failed_attempt_register_sha256": sha256_file(ORACLE_FAILED_ATTEMPT_REGISTER),
        "complete_audio_register_sha256": sha256_file(COMPLETE_AUDIO),
    }


def required_binding_lines(bindings: dict[str, str]) -> tuple[str, ...]:
    return (
        f"Documentation SHA: `{bindings['documentation_sha']}`",
        f"Unity SHA: `{bindings['unity_sha']}`",
        f"System register SHA-256: `{bindings['system_register_sha256']}`",
        f"Audio Oracle suite SHA-256: `{bindings['audio_oracle_suite_sha256']}`",
        f"Audio Oracle failed-attempt register SHA-256: `{bindings['audio_oracle_failed_attempt_register_sha256']}`",
        f"Complete audio register SHA-256: `{bindings['complete_audio_register_sha256']}`",
    )


def build() -> dict[str, Any]:
    existing = json.loads(OUTPUT.read_text(encoding="utf-8")) if OUTPUT.is_file() else None
    lanes: list[dict[str, Any]] = []
    review_root = OUTPUT.parent
    bindings = evidence_bindings()
    binding_lines = required_binding_lines(bindings)
    for lane_id, concern, filename in REPORTS:
        path = review_root / filename
        if not path.is_file():
            raise RuntimeError(f"final hostile-review report missing: {path}")
        text = path.read_text(encoding="utf-8")
        if ("Final mechanical verdict: PASS" not in text or "Open mechanical findings: 0" not in text
                or not all(line in text for line in binding_lines)):
            raise RuntimeError(f"hostile-review lane has not recorded mechanical closure: {lane_id}")
        lanes.append({
            "lane_id": lane_id,
            "concern": concern,
            "mechanical_verdict": "PASS",
            "open_mechanical_findings": 0,
            "human_or_legal_acceptance": "NOT_INFERRED",
            "evidence_bindings": bindings,
            "report": {"path": str(path), "bytes": path.stat().st_size, "sha256": sha256_file(path)},
        })
    output = {
        "schema": "project-studio-audio-systems-hostile-review-index/v1",
        "generated_utc": existing.get("generated_utc", utc_now()) if existing else utc_now(),
        "status": "PROTOTYPE_ONLY",
        "machine_verdict": "PASS",
        "lane_count": len(lanes),
        "open_mechanical_findings": sum(row["open_mechanical_findings"] for row in lanes),
        "lanes": lanes,
        "human_or_legal_gates": list(HUMAN_OR_LEGAL_GATES),
        "evidence_bindings": bindings,
        "source_code": source_binding(),
        "boundary": "Mechanical hostile-review closure is not Owner, listening, historical, cultural, accessibility, legal, commercial, production, or shipping acceptance.",
    }
    atomic_write_json(OUTPUT, output)
    return output


def verify() -> dict[str, Any]:
    output = json.loads(OUTPUT.read_text(encoding="utf-8"))
    if (output.get("schema") != "project-studio-audio-systems-hostile-review-index/v1"
            or output.get("status") != "PROTOTYPE_ONLY" or output.get("machine_verdict") != "PASS"):
        raise RuntimeError("hostile-review index status/schema failed")
    if output.get("lane_count") != 8 or output.get("open_mechanical_findings") != 0:
        raise RuntimeError("hostile-review index is incomplete")
    if [row.get("lane_id") for row in output.get("lanes", [])] != [row[0] for row in REPORTS]:
        raise RuntimeError("hostile-review lane identities/order failed")
    expected_by_id = {lane_id: (concern, filename) for lane_id, concern, filename in REPORTS}
    bindings = evidence_bindings()
    if output.get("evidence_bindings") != bindings:
        raise RuntimeError("hostile-review evidence bindings are stale")
    binding_lines = required_binding_lines(bindings)
    seen_paths: set[Path] = set()
    for row in output["lanes"]:
        concern, filename = expected_by_id[row["lane_id"]]
        path = Path(row["report"]["path"]).resolve(strict=True)
        try:
            path.relative_to(OUTPUT.parent.resolve(strict=True))
        except ValueError as error:
            raise RuntimeError(f"hostile-review report escaped review root: {path}") from error
        if path != (OUTPUT.parent / filename).resolve(strict=True) or path in seen_paths:
            raise RuntimeError(f"hostile-review report path/identity failed: {row['lane_id']}")
        seen_paths.add(path)
        if (row.get("concern") != concern or row.get("mechanical_verdict") != "PASS"
                or row.get("open_mechanical_findings") != 0
                or row.get("human_or_legal_acceptance") != "NOT_INFERRED"
                or row.get("evidence_bindings") != bindings):
            raise RuntimeError(f"hostile-review lane projection failed: {row['lane_id']}")
        report_text = path.read_text(encoding="utf-8")
        if (sha256_file(path) != row["report"]["sha256"] or path.stat().st_size != row["report"]["bytes"]
                or "Final mechanical verdict: PASS" not in report_text
                or "Open mechanical findings: 0" not in report_text
                or not all(line in report_text for line in binding_lines)):
            raise RuntimeError(f"hostile-review report changed: {row['lane_id']}")
    if output.get("human_or_legal_gates") != list(HUMAN_OR_LEGAL_GATES):
        raise RuntimeError("hostile-review human/legal gate list changed")
    binding = output.get("source_code", {})
    if binding != source_binding():
        raise RuntimeError("hostile-review index source binding is stale")
    return {"machine_verdict": "PASS", "lane_count": 8, "open_mechanical_findings": 0, "index_sha256": sha256_file(OUTPUT)}


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--verify-only", action="store_true")
    arguments = parser.parse_args()
    if arguments.verify_only:
        print(json.dumps(verify(), indent=2, sort_keys=True))
        return
    output = build()
    print(json.dumps({
        "path": str(OUTPUT),
        "sha256": sha256_file(OUTPUT),
        "lane_count": output["lane_count"],
        "open_mechanical_findings": output["open_mechanical_findings"],
        "machine_verdict": output["machine_verdict"],
    }, indent=2, sort_keys=True))


if __name__ == "__main__":
    main()
