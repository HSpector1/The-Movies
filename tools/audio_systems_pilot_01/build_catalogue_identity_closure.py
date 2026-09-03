#!/usr/bin/env python3
"""Publish a non-null identity closure over the required canonical v1 catalogue."""

from __future__ import annotations

import json
import subprocess
from copy import deepcopy
from pathlib import Path
from typing import Any

from common import DOC_REPO, MARATHON_ROOT, PILOT_ROOT, atomic_write_json, sha256_file


CREATED_AT = "2026-09-03T00:00:00Z"
SOURCE = PILOT_ROOT / "01_catalogue/AudioPrototypeCatalogue.identity-closure.v2.json"
OUTPUT = PILOT_ROOT / "01_catalogue/AudioPrototypeCatalogue.identity-closure.v3.json"
MEDIUM_ROUTE = MARATHON_ROOT / "09_provenance/medium-challenge/medium-generation-route.json"
MOTIF_PROVENANCE = MARATHON_ROOT / "04_processed/motif-shape-sketches/provenance.json"
MODEL_FAMILY_REVISION = "0fef1392cd842149a2b6d445e181c97608faac06"


def require_hash(path: Path, digest: str) -> None:
    if not path.is_file() or sha256_file(path) != digest:
        raise RuntimeError(f"hash mismatch: {path}")


def source_binding() -> dict[str, Any]:
    commit = subprocess.run(
        ["git", "rev-parse", "HEAD"], cwd=DOC_REPO, check=True, capture_output=True, text=True
    ).stdout.strip()
    relative = "tools/audio_systems_pilot_01/build_catalogue_identity_closure.py"
    committed = subprocess.run(
        ["git", "show", f"{commit}:{relative}"], cwd=DOC_REPO, check=True, capture_output=True
    ).stdout
    import hashlib
    committed_hash = hashlib.sha256(committed).hexdigest()
    current_hash = sha256_file(DOC_REPO / relative)
    if committed_hash != current_hash:
        raise RuntimeError("identity-closure builder is not committed at current HEAD")
    return {
        "repository": str(DOC_REPO),
        "branch": "codex/audio-systems-pilot-01",
        "commit": commit,
        "path": relative,
        "blob_sha256": committed_hash,
        "working_file_matches_commit": True,
    }


def build() -> dict[str, Any]:
    source = json.loads(SOURCE.read_text(encoding="utf-8"))
    output = deepcopy(source)
    medium_route = json.loads(MEDIUM_ROUTE.read_text(encoding="utf-8"))
    motif = json.loads(MOTIF_PROVENANCE.read_text(encoding="utf-8"))
    medium_count = 0
    motif_count = 0
    for entry in output["entries"]:
        identities = entry["identities"]
        if entry["asset_type"] == "MOTIF_SHAPE_SKETCH":
            motif_count += 1
            if entry.get("seed") is None:
                entry["seed_disposition"] = "NOT_APPLICABLE_NO_RANDOMNESS"
                entry["seed_nullable_reason"] = "Deterministic additive motif generator uses no random source or seed."
            identities.update({
                "model_revision": "NOT_APPLICABLE_NO_MODEL_USED",
                "code_repository": "LOCAL_PRESERVED_GENERATOR",
                "code_commit": f"SHA256:{motif['generator_sha256']}",
                "optimized_weights_revision": "NOT_APPLICABLE_NO_WEIGHTS_USED",
                "identity_status": "EXACT_PROCEDURAL_GENERATOR_HASH; MODEL_AND_WEIGHTS_NOT_APPLICABLE",
                "identity_evidence": {
                    "path": str(MOTIF_PROVENANCE),
                    "sha256": sha256_file(MOTIF_PROVENANCE),
                    "generator_path": motif["generator_absolute_path"],
                    "generator_sha256": motif["generator_sha256"],
                    "reproduction_command": motif["reproduction_command"],
                },
            })
        elif identities["model"] == "Stable Audio 3 Medium":
            medium_count += 1
            identities["model_revision"] = MODEL_FAMILY_REVISION
            identities["identity_status"] = "EXACT_MODEL_FAMILY_CODE_AND_OPTIMIZED_WEIGHT_REVISIONS"
            identities["identity_evidence"] = {
                "path": str(MEDIUM_ROUTE),
                "sha256": sha256_file(MEDIUM_ROUTE),
                "model_family_revision_source": str(MARATHON_ROOT / "01_catalogue/nine-epoch-small-music-prompt-catalogue.json"),
                "model_family_revision": MODEL_FAMILY_REVISION,
                "optimized_weights_repository": medium_route["optimized_weights_repository"],
                "optimized_weights_revision": medium_route["optimized_weights_revision"],
                "weight_files": medium_route["weights"],
            }
        else:
            identities["identity_status"] = "EXACT_PINNED_MODEL_CODE_AND_WEIGHT_REVISIONS"
        require_hash(Path(entry["raw"]["absolute_authoritative_path"]), entry["raw"]["sha256"])
        for derivative in entry.get("derivatives", []):
            path_value = derivative.get("absolute_path")
            if path_value is None and derivative.get("pilot_relative_path"):
                path_value = str(PILOT_ROOT / derivative["pilot_relative_path"])
            if path_value is not None and derivative.get("sha256"):
                require_hash(Path(path_value), derivative["sha256"])
    required = ("model", "model_revision", "code_repository", "code_commit", "optimized_weights_revision", "identity_status")
    null_identity_fields = [
        {"stable_prototype_id": entry["stable_prototype_id"], "field": field}
        for entry in output["entries"]
        for field in required
        if entry["identities"].get(field) in (None, "")
    ]
    def is_machine_excluded(entry: dict[str, Any]) -> bool:
        disposition = entry.get("machine_disposition", {})
        return (
            disposition.get("disposition") in {"MACHINE_EXCLUDED", "MACHINE-EXCLUDED", "EXCLUDE"}
            or disposition.get("screening_status") in {"MACHINE_EXCLUDED", "MACHINE-EXCLUDED", "EXCLUDE"}
        )

    excluded_primary = [
        entry["stable_prototype_id"]
        for entry in output["entries"]
        if any(row.get("selection_role") == "PRIMARY" for row in entry.get("derivatives", []))
        and is_machine_excluded(entry)
    ]
    unresolved_seed_fields = [
        entry["stable_prototype_id"]
        for entry in output["entries"]
        if entry.get("seed") is None and entry.get("seed_disposition") != "NOT_APPLICABLE_NO_RANDOMNESS"
    ]
    output.update({
        "schema": "project-studio-audio-prototype-catalogue-identity-closure/v3",
        "created_at": CREATED_AT,
        "supersedes": {"path": str(SOURCE), "sha256": sha256_file(SOURCE), "reason": "Adds explicit seed disposition and committed-builder binding."},
        "source_code": source_binding(),
        "identity_closure": {
            "entry_count": len(output["entries"]),
            "motif_procedural_entries": motif_count,
            "medium_entries": medium_count,
            "null_identity_fields": null_identity_fields,
            "unresolved_seed_fields": unresolved_seed_fields,
            "machine_excluded_primary_entries": excluded_primary,
            "raw_hashes_reverified": len(output["entries"]),
            "model_family_revision_note": "The Stable Audio 3 family revision is the pinned canonical model/config revision; Medium DiT/decoder/T5Gemma file identities remain separately pinned by repository revision, byte size, and SHA-256.",
        },
        "machine_verdict": "PASS" if not null_identity_fields and not unresolved_seed_fields and not excluded_primary else "FAIL",
    })
    atomic_write_json(OUTPUT, output)
    return output


def main() -> None:
    output = build()
    print(json.dumps({
        "path": str(OUTPUT),
        "sha256": sha256_file(OUTPUT),
        "entry_count": len(output["entries"]),
        "identity_closure": output["identity_closure"],
        "machine_verdict": output["machine_verdict"],
    }, indent=2, sort_keys=True))


if __name__ == "__main__":
    main()
