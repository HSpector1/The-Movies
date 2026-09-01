#!/usr/bin/env python3
"""Reconcile immutable pilot audio and V1/V2 evidence without copying it."""

from __future__ import annotations

import csv
import io
import json
import re
from pathlib import Path

from foundry_common import MARATHON_ROOT, PILOT_ROOT, atomic_write_json, atomic_write_text, sha256_file, utc_now


RAW_ROOT = PILOT_ROOT / "02_raw"
PROMPTS_PATH = PILOT_ROOT / "01_prompt-register" / "prompts.csv"
GENERATION_LOG = PILOT_ROOT / "07_logs" / "generation.jsonl"
FINAL_DISPOSITION = PILOT_ROOT / "03_screening" / "gate-v2" / "final-disposition.csv"
V1_MANIFEST = PILOT_ROOT / "03_screening" / "gate-v2" / "v1-preservation-manifest.json"
CALIBRATION_WORKTREE = Path("/private/tmp/studio-era-music-pilot.W0mGCP")

GENERATION_TUPLE = {
    "code_repository": "Stability-AI/stable-audio-3",
    "code_commit": "c3909628db1ae2b57bed40a493c73c67ad674dc5",
    "backend": "Apple MLX / Metal",
    "canonical_model": "stabilityai/stable-audio-3-small-music",
    "canonical_model_revision": "0fef1392cd842149a2b6d445e181c97608faac06",
    "optimized_weights_revision": "b5182df73f4aca4336c5c1b642ca6c44d5b085ec",
    "dit": "sm-music",
    "decoder": "same-s",
    "seconds": 120,
    "steps": 8,
    "init_noise_level": 1.0,
    "cfg": 2.0,
    "apg": 1.0,
    "dit_dtype": "fp16",
    "guide_audio": False,
    "lora": False,
    "hf_hub_offline": True,
}


def read_csv(path: Path) -> list[dict[str, str]]:
    with path.open(newline="", encoding="utf-8-sig") as handle:
        return list(csv.DictReader(handle))


def csv_text(rows: list[dict[str, object]], fieldnames: list[str]) -> str:
    buffer = io.StringIO(newline="")
    writer = csv.DictWriter(buffer, fieldnames=fieldnames, lineterminator="\n")
    writer.writeheader()
    writer.writerows(rows)
    return buffer.getvalue()


def main() -> None:
    prompts = {row["prompt_id"]: row for row in read_csv(PROMPTS_PATH)}
    disposition = {row["candidate_id"]: row for row in read_csv(FINAL_DISPOSITION)}
    generation = {}
    for line in GENERATION_LOG.read_text(encoding="utf-8").splitlines():
        entry = json.loads(line)
        generation[f"{entry['promptId']}__seed-{entry['seed']}"] = entry

    raw_paths = sorted(RAW_ROOT.glob("*/*.wav"))
    if len(raw_paths) != 24:
        raise SystemExit(f"expected 24 pilot raw files, found {len(raw_paths)}")

    inventory: list[dict[str, object]] = []
    errors: list[str] = []
    for path in raw_paths:
        candidate_id = path.stem
        match = re.fullmatch(r"([A-Z]+-\d+)__seed-(\d+)", candidate_id)
        if not match:
            errors.append(f"unrecognized candidate name: {candidate_id}")
            continue
        prompt_id, seed_text = match.groups()
        prompt = prompts[prompt_id]
        gen = generation[candidate_id]
        actual_hash = sha256_file(path)
        actual_bytes = path.stat().st_size
        if actual_hash != gen["outputSha256"]:
            errors.append(f"raw hash mismatch: {candidate_id}")
        if actual_bytes != gen["outputBytes"]:
            errors.append(f"raw byte mismatch: {candidate_id}")
        disp = disposition[candidate_id]
        excluded = disp["overall_v2_status"] == "FAILED_NONCLIPPING_GATE"
        inventory.append(
            {
                "absolute_path": str(path),
                "bytes": actual_bytes,
                "sha256": actual_hash,
                "candidate_id": candidate_id,
                "epoch": path.parent.name,
                "prompt_id": prompt_id,
                "prompt_family": prompt["family"],
                "seed": int(seed_text),
                "generation_tuple": json.dumps(GENERATION_TUPLE, sort_keys=True, separators=(",", ":")),
                "screening_status": "MACHINE_REJECTED" if excluded else "MACHINE_ELIGIBLE",
                "screening_gate": "V2",
                "v2_status_preserved": disp["overall_v2_status"],
                "exclusion_reason": disp["nonclipping_automatic_reasons"],
                "rights_status": "PROTOTYPE_ONLY",
            }
        )

    expected_exclusions = {
        "FND-02__seed-155921": "STEREO_NEGATIVE_CORRELATION",
        "DFG-03__seed-196613": "TRAILING_SILENCE",
    }
    actual_exclusions = {
        row["candidate_id"]: row["exclusion_reason"]
        for row in inventory
        if row["screening_status"] == "MACHINE_REJECTED"
    }
    if actual_exclusions != expected_exclusions:
        errors.append(f"exclusion mismatch: {actual_exclusions!r}")

    v1_checks = []
    for item in json.loads(V1_MANIFEST.read_text(encoding="utf-8"))["preserved"]:
        path = Path(item["path"])
        actual = {"bytes": path.stat().st_size, "sha256": sha256_file(path)}
        match = actual["bytes"] == item["bytes"] and actual["sha256"] == item["sha256"]
        v1_checks.append({"path": str(path), "expected": item, "actual": actual, "match": match})
        if not match:
            errors.append(f"V1 preservation mismatch: {path}")

    evidence_roots = [
        PILOT_ROOT / "03_screening",
        PILOT_ROOT / "04_working" / "gate-v2",
        PILOT_ROOT / "07_logs" / "screening-gate-v2",
    ]
    evidence_paths = {GENERATION_LOG}
    for root in evidence_roots:
        if root.exists():
            evidence_paths.update(path for path in root.rglob("*") if path.is_file())
    evidence_rows = [
        {
            "absolute_path": str(path),
            "bytes": path.stat().st_size,
            "sha256": sha256_file(path),
            "scope": "V1/V2_EXISTING_EVIDENCE",
        }
        for path in sorted(evidence_paths)
    ]

    calibration_names = [
        "CODEX-AUDIO-REFERENCE-CALIBRATION-01.md",
        "CODEX-PERIOD-GAME-AUDIO-COMPARATOR-ATLAS-01.md",
        "CODEX-HISTORICAL-BROADCAST-VOICE-BIBLE-01.md",
        "CODEX-GENERATED-CANDIDATE-REFERENCE-COMPARISON-01.md",
    ]
    calibration = []
    for name in calibration_names:
        path = CALIBRATION_WORKTREE / "docs" / "audio" / name
        calibration.append(
            {"path": str(path), "bytes": path.stat().st_size, "sha256": sha256_file(path)}
        )

    inventory_csv = MARATHON_ROOT / "01_catalogue" / "existing-24-read-only-inventory.csv"
    inventory_json = MARATHON_ROOT / "09_provenance" / "existing-24-read-only-inventory.json"
    evidence_csv = MARATHON_ROOT / "09_provenance" / "existing-evidence-hash-manifest.csv"
    report_json = MARATHON_ROOT / "09_provenance" / "phase-a-reconciliation.json"
    atomic_write_text(inventory_csv, csv_text(inventory, list(inventory[0].keys())))
    atomic_write_json(inventory_json, {"generated_utc": utc_now(), "source_copy_policy": "ABSOLUTE_REFERENCE_ONLY; NO RAW AUDIO COPIED", "rows": inventory})
    atomic_write_text(evidence_csv, csv_text(evidence_rows, list(evidence_rows[0].keys())))
    report = {
        "generated_utc": utc_now(),
        "status": "PASS" if not errors else "FAIL",
        "raw": {
            "count": len(inventory),
            "all_generation_hashes_match": not any("raw" in error for error in errors),
            "machine_eligible": sum(row["screening_status"] == "MACHINE_ELIGIBLE" for row in inventory),
            "machine_rejected": sum(row["screening_status"] == "MACHINE_REJECTED" for row in inventory),
            "raw_copied": False,
        },
        "exclusions": actual_exclusions,
        "v1_preservation_checks": v1_checks,
        "v1_v2_evidence_files_hashed": len(evidence_rows),
        "calibration_documents": calibration,
        "pilot_tip_after_preservation": "65596e47f9e7b9de33bd9530ee573390416d329e",
        "errors": errors,
        "outputs": [str(inventory_csv), str(inventory_json), str(evidence_csv)],
    }
    atomic_write_json(report_json, report)
    atomic_write_text(
        MARATHON_ROOT / "10_logs" / "phase-a-audit.log",
        f"{report['generated_utc']} phase-a status={report['status']} raw=24 eligible=22 rejected=2 evidence_files={len(evidence_rows)}\n",
    )
    print(json.dumps(report, indent=2))
    if errors:
        raise SystemExit(1)


if __name__ == "__main__":
    main()
