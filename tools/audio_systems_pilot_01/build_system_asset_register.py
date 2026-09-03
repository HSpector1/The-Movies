#!/usr/bin/env python3
"""Reconcile explicit audio manifests into one hash-bound systems register."""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any

from common import PILOT_ROOT, atomic_write_json, probe_audio, sha256_file, utc_now


INDEX_PATH = PILOT_ROOT / "10_provenance/audio-assets-index.v1.json"
CATALOGUE_PATH = PILOT_ROOT / "01_catalogue/AudioPrototypeCatalogue.v1.json"
RADIO_INDEX_PATH = PILOT_ROOT / "06_radio/STUDIO-RADIO-RUNTIME-INDEX.json"
TRANSITION_PATH = PILOT_ROOT / "03_transitions/rendered-transition-catalogue.json"
OUTPUT_PATH = PILOT_ROOT / "10_provenance/SYSTEM-AUDIO-ASSET-REGISTER.json"


def require(path: Path, expected: str) -> None:
    if not path.is_file() or sha256_file(path) != expected:
        raise RuntimeError(f"manifest-bound file is missing or changed: {path}")


def base_item(record: dict[str, Any], role: str) -> dict[str, Any]:
    path = PILOT_ROOT / record["relative_path"]
    require(path, record["sha256"])
    return {
        "id": record["stable_prototype_id"],
        "role": role,
        "path": str(path),
        "relative_path": record["relative_path"],
        "sha256": record["sha256"],
        "duration_seconds": float(record["duration_seconds"]),
        "format": record["format"],
        "rights_status": record["rights_status"],
        "human_disposition": record["human_disposition"],
    }


def build() -> dict[str, Any]:
    source_index = json.loads(INDEX_PATH.read_text(encoding="utf-8"))
    if source_index.get("schema") != "project-studio-audio-assets-index/v1":
        raise RuntimeError("unexpected generated audio index schema")
    for manifest in source_index["source_manifests"]:
        require(Path(manifest["path"]), manifest["sha256"])
    records = source_index["audio_assets"]
    indexed = {record["stable_prototype_id"]: record for record in records}
    items: list[dict[str, Any]] = []

    for selection in source_index["responsive_selections"]:
        wanted_id = next(asset_id for asset_id in selection["asset_ids"] if asset_id.endswith("-LOOP"))
        preview_id = next(asset_id for asset_id in selection["asset_ids"] if asset_id.endswith("-PREVIEW"))
        item = base_item(indexed[wanted_id], "RESPONSIVE_VARIANT")
        preview_record = indexed[preview_id]
        preview_path = PILOT_ROOT / preview_record["relative_path"]
        require(preview_path, preview_record["sha256"])
        item.update({
            "id": selection["stable_bundle_variant_id"],
            "source_asset_id": wanted_id,
            "epoch": selection["commissioning_alias"],
            "context": selection["context"],
            "classification": selection["classification"],
            "family": selection["commissioning_alias"],
            "selected_candidate_id": selection["selected_candidate_id"],
            "trusted_phrase_grid": False,
            "preview": {
                "id": preview_id,
                "path": str(preview_path),
                "relative_path": preview_record["relative_path"],
                "sha256": preview_record["sha256"],
                "duration_seconds": float(preview_record["duration_seconds"]),
                "format": preview_record["format"],
            },
        })
        items.append(item)

    transitions = json.loads(TRANSITION_PATH.read_text(encoding="utf-8"))
    for transition in transitions["renders"]:
        record = indexed[transition["stable_prototype_id"]]
        item = base_item(record, "ERA_TRANSITION")
        item.update({
            "boundary": transition["boundary_id"],
            "outgoing_epoch": transition["outgoing_alias"],
            "incoming_epoch": transition["incoming_alias"],
            "treatment": transition["treatment"],
            "classification": transition["classification"],
            "honesty": transition["honesty"],
        })
        items.append(item)

    for record in records:
        category = record["category"]
        if category == "LIVING_LOT_LAYER":
            item = base_item(record, "LIVING_LAYER")
            item["layer"] = record["stable_prototype_id"].removeprefix("ASP01-LIVING-")
            item["fixture"] = "BASE"
            items.append(item)
        elif category == "LIVING_LOT_FIXTURE_PRESENTATION":
            item = base_item(record, "LIVING_MIX")
            item["fixture"] = record["stable_prototype_id"].removeprefix("ASP01-LIVING-FIXTURE-")
            item["classification"] = "TEN_MINUTE_LIVING_LOT_FIXTURE_PRESENTATION"
            items.append(item)
        elif category == "LIVING_LOT_ERA_PRESENTATION":
            item = base_item(record, "LIVING_ERA_PRESENTATION")
            item["presentation"] = record["stable_prototype_id"].removeprefix("ASP01-LIVING-").removesuffix("-PRESENTATION")
            item["classification"] = "LAB_PRESENTATION_COLOR_ONLY_NO_ERA_TRUTH"
            items.append(item)
        elif category == "GENERATED_LOT_DETAIL_SFX":
            item = base_item(record, "LOT_DETAIL_SFX")
            item["classification"] = "SMALL_SFX_GENERATED_PROTOTYPE"
            items.append(item)

    selections: dict[str, tuple[str, str]] = {}
    for selection in source_index["management_selections"]:
        selections[selection["provisional_pick"]] = (selection["semantic_event"], "PROVISIONAL_PICK")
        selections[selection["alternate"]] = (selection["semantic_event"], "ALTERNATE")
    for record in records:
        if record["category"] != "MANAGEMENT_SEMANTIC_SFX":
            continue
        item = base_item(record, "MANAGEMENT_CANDIDATE")
        semantic = record["stable_prototype_id"].removeprefix("ASP01-UI-").rsplit("-C", 1)[0]
        selection = selections.get(record["stable_prototype_id"])
        item.update({
            "semantic_event": selection[0] if selection else semantic,
            "selection_role": selection[1] if selection else "UNSELECTED_CANDIDATE",
            "classification": "RESTRAINED_PROCEDURAL_MANAGEMENT_SOUND",
        })
        items.append(item)

    catalogue = json.loads(CATALOGUE_PATH.read_text(encoding="utf-8"))
    for entry in catalogue["entries"]:
        preview = next((row for row in entry.get("derivatives", []) if row.get("selection_role") == "PRIMARY" and row.get("derivative_type") == "aac_preview"), None)
        if preview is None:
            continue
        path = PILOT_ROOT / preview["pilot_relative_path"]
        require(path, preview["sha256"])
        probe = probe_audio(path)
        items.append({
            "id": entry["stable_prototype_id"],
            "role": "ERA_PICK",
            "path": str(path),
            "relative_path": preview["pilot_relative_path"],
            "sha256": preview["sha256"],
            "duration_seconds": probe["duration_seconds"],
            "format": probe,
            "rights_status": entry["rights_status"],
            "human_disposition": entry["human_disposition"],
            "epoch": entry["commissioning_alias"],
            "family": entry["family"],
            "source_candidate_id": entry["source_candidate_id"],
            "classification": "CURRENT_MACHINE_PROVISIONAL_ERA_PICK_PENDING_OWNER_LISTENING",
        })

    radio_index = json.loads(RADIO_INDEX_PATH.read_text(encoding="utf-8"))
    for demo in radio_index["demos"]:
        preview = demo["preview"]
        path = Path(preview["path"])
        require(path, preview["sha256"])
        items.append({
            "id": f"ASP01-RADIO-{demo['slug']}",
            "role": "RADIO_DEMO",
            "path": str(path),
            "relative_path": str(path.relative_to(PILOT_ROOT)),
            "sha256": preview["sha256"],
            "duration_seconds": preview["probe"]["duration_seconds"],
            "format": preview["probe"],
            "rights_status": demo["status"],
            "human_disposition": "PENDING",
            "epoch": demo["epoch_alias"],
            "presenter_id": demo["presenter_id"],
            "classification": "RUNTIME_PACED_RADIO_DEMO",
            "caption_text": "Full caption file and transcript are supplied beside this program.",
        })

    ids = [item["id"] for item in items]
    if len(ids) != len(set(ids)):
        raise RuntimeError("system audio asset register has duplicate IDs")
    counts = {role: sum(item["role"] == role for item in items) for role in sorted({item["role"] for item in items})}
    expected = {
        "ERA_PICK": 27,
        "RESPONSIVE_VARIANT": 12,
        "ERA_TRANSITION": 9,
        "LIVING_LAYER": 3,
        "LIVING_MIX": 5,
        "LIVING_ERA_PRESENTATION": 3,
        "LOT_DETAIL_SFX": 15,
        "MANAGEMENT_CANDIDATE": 45,
        "RADIO_DEMO": 3,
    }
    if any(counts.get(role) != count for role, count in expected.items()):
        raise RuntimeError(f"system audio asset count mismatch: expected={expected}, actual={counts}")
    output = {
        "schema": "project-studio-system-audio-asset-register/v1",
        "generated_utc": utc_now(),
        "status": "PROTOTYPE_READY_FOR_OWNER_AUDITION",
        "human_acceptance": "NONE_RECORDED",
        "commercial_clearance": "NOT_CLAIMED",
        "source_manifests": [
            {"path": str(INDEX_PATH), "sha256": sha256_file(INDEX_PATH)},
            {"path": str(CATALOGUE_PATH), "sha256": sha256_file(CATALOGUE_PATH)},
            {"path": str(RADIO_INDEX_PATH), "sha256": sha256_file(RADIO_INDEX_PATH)},
        ],
        "counts": counts,
        "items": sorted(items, key=lambda item: (item["role"], item["id"])),
        "loading_law": "EXPLICIT_PATH_AND_SHA256_ONLY; NO_RECURSIVE_SCAN; NO_NETWORK; FAIL_CLOSED",
        "limitations": ["The register expresses prototype presentation eligibility only; it owns no era, activity, production, blocker, result, or save truth."],
    }
    atomic_write_json(OUTPUT_PATH, output)
    return output


def main() -> None:
    output = build()
    print(json.dumps({"path": str(OUTPUT_PATH), "sha256": sha256_file(OUTPUT_PATH), "counts": output["counts"]}, indent=2, sort_keys=True))


if __name__ == "__main__":
    main()
