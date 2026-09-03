#!/usr/bin/env python3
"""Create the explicit, hash-bound source list for the offline audition desk."""

from __future__ import annotations

import json
import os
import subprocess
import tempfile
from pathlib import Path
from typing import Any

from common import PILOT_ROOT, atomic_write_json, probe_audio, sha256_file, utc_now


SYSTEM_REGISTER = PILOT_ROOT / "10_provenance/SYSTEM-AUDIO-ASSET-REGISTER.v2.json"
ACCESSIBILITY_INDEX = PILOT_ROOT / "07_audio-oracle/accessibility-renders-v2/ACCESSIBILITY-PRESETS.v2.json"
ORACLE_INDEX = PILOT_ROOT / "07_audio-oracle/AUDIO-ORACLE-INDEX.json"
MANAGEMENT_CATALOGUE = PILOT_ROOT / "05_management-sfx/semantic-pack/management-semantic-catalogue.v2.json"
PREVIEW_ROOT = PILOT_ROOT / "11_return-package/audition-previews"
OUTPUT_PATH = PILOT_ROOT / "11_return-package/AUDITION-SOURCE-REGISTER.json"
CONVERSION_MANIFEST = PREVIEW_ROOT / "AUDITION-PREVIEW-DERIVATIVES.json"


def verified(path: Path, expected_hash: str) -> Path:
    if not path.is_file() or sha256_file(path) != expected_hash:
        raise RuntimeError(f"audition source file missing or hash-mismatched: {path}")
    return path


def preview(source: Path, expected_hash: str, stable_id: str, duration: float) -> dict[str, Any]:
    source = verified(source, expected_hash)
    if source.suffix.lower() == ".m4a":
        return {"path": str(source), "sha256": expected_hash, "duration_seconds": probe_audio(source)["duration_seconds"], "derivation": "EXISTING_VERIFIED_AAC_PREVIEW"}
    if duration <= 2:
        return {"path": str(source), "sha256": expected_hash, "duration_seconds": probe_audio(source)["duration_seconds"], "derivation": "SHORT_VERIFIED_PCM_SOURCE"}
    destination = PREVIEW_ROOT / f"{stable_id}.m4a"
    if not destination.exists():
        destination.parent.mkdir(parents=True, exist_ok=True)
        descriptor, name = tempfile.mkstemp(prefix=f".{stable_id}.", suffix=".m4a", dir=destination.parent)
        os.close(descriptor)
        temporary = Path(name)
        temporary.unlink()
        completed = subprocess.run([
            "ffmpeg", "-hide_banner", "-nostdin", "-v", "error", "-y", "-i", str(source),
            "-map_metadata", "-1", "-ar", "48000", "-ac", "2", "-c:a", "aac", "-b:a", "160k",
            "-movflags", "+faststart", str(temporary),
        ], check=False, capture_output=True, text=True)
        if completed.returncode != 0:
            temporary.unlink(missing_ok=True)
            raise RuntimeError(f"audition AAC derivation failed for {stable_id}: {completed.stderr[-2000:]}")
        os.chmod(temporary, 0o444)
        os.replace(temporary, destination)
    probe = probe_audio(destination)
    if abs(probe["duration_seconds"] - duration) > 0.1:
        raise RuntimeError(f"audition preview duration mismatch for {stable_id}")
    return {
        "path": str(destination), "sha256": sha256_file(destination), "duration_seconds": probe["duration_seconds"],
        "derivation": "AAC_AUDITION_DERIVATIVE", "source_path": str(source), "source_sha256": expected_hash,
    }


def add_item(
    items: list[dict[str, Any]], *, source: dict[str, Any], item_id: str, title: str, collection: str,
    epoch: str | None = None, context: str | None = None, classification: str | None = None,
    bus: str | None = None, caption: str | None = None, status: str = "PENDING_OWNER_AUDITION",
    rights_status: str = "PROTOTYPE_ONLY", caption_track: dict[str, str] | None = None,
    transcript: dict[str, str] | None = None,
) -> None:
    items.append({
        "id": item_id,
        "title": title,
        "collection": collection,
        "epoch": epoch,
        "context": context,
        "classification": classification,
        "bus": bus,
        "caption_text": caption,
        "important_sound_caption": caption,
        "source_path": source["path"],
        "sha256": source["sha256"],
        "duration_seconds": source["duration_seconds"],
        "rights_status": rights_status,
        "status": status,
        "caption_track": caption_track,
        "transcript": transcript,
    })


def build() -> dict[str, Any]:
    system = json.loads(SYSTEM_REGISTER.read_text(encoding="utf-8"))
    if system.get("schema") != "project-studio-system-audio-asset-register/v2":
        raise RuntimeError("unexpected systems register schema")
    source_items = system["items"]
    items: list[dict[str, Any]] = []
    conversions: list[dict[str, Any]] = []

    for item in [row for row in source_items if row["role"] == "ERA_PICK"]:
        source = preview(Path(item["path"]), item["sha256"], item["id"], item["duration_seconds"])
        add_item(items, source=source, item_id=item["id"], title=f"Era pick · {item['source_candidate_id']}", collection="ERA_LIBRARY", epoch=item["epoch"], classification=item["classification"], bus="SCORE", caption="Instrumental provisional era pick; no gameplay information.", rights_status=item["rights_status"])
        conversions.append({"id": item["id"], **source})

    for item in [row for row in source_items if row["role"] == "RESPONSIVE_VARIANT"]:
        source = preview(Path(item["preview"]["path"]), item["preview"]["sha256"], item["id"], item["preview"]["duration_seconds"])
        add_item(items, source=source, item_id=item["id"], title=f"Responsive {item['context'].title()} · {item['epoch']}", collection="RESPONSIVE_MUSIC", epoch=item["epoch"], context=item["context"], classification="HORIZONTAL_VARIANT_BUNDLE_NOT_STEMS", bus="SCORE", caption=f"Instrumental {item['context'].lower()} full-mix variant; no gameplay information.", rights_status=item["rights_status"])
        conversions.append({"id": item["id"], **source})

    for item in [row for row in source_items if row["role"] == "ERA_TRANSITION"]:
        source = preview(Path(item["path"]), item["sha256"], item["id"], item["duration_seconds"])
        add_item(items, source=source, item_id=item["id"], title=f"{item['boundary']} · {item['treatment'].replace('-', ' ').title()}", collection="ERA_TRANSITIONS", epoch=f"{item['outgoing_epoch']} → {item['incoming_epoch']}", context=item["treatment"], classification=item["classification"], bus="SCORE", caption="Adjacent-era transition audition; no authoritative era change is performed.", rights_status=item["rights_status"])
        conversions.append({"id": item["id"], **source})

    living_roles = {"LIVING_LAYER", "LIVING_MIX", "LIVING_ERA_PRESENTATION"}
    for item in [row for row in source_items if row["role"] in living_roles]:
        source = preview(Path(item["path"]), item["sha256"], item["id"], item["duration_seconds"])
        detail = item.get("fixture") or item.get("layer") or item.get("presentation")
        add_item(items, source=source, item_id=item["id"], title=f"Living Lot · {detail.replace('_', ' ').title()}", collection="LIVING_LOT", epoch=item.get("presentation"), context=detail, classification=item.get("classification", item["role"]), bus="AMBIENCE", caption=f"Living-lot ambience: {detail.replace('_', ' ').lower()}. Activity and era are explicit lab presentation fixtures only.", rights_status=item["rights_status"])
        conversions.append({"id": item["id"], **source})

    vocabulary = {row["id"]: row for row in json.loads(MANAGEMENT_CATALOGUE.read_text(encoding="utf-8"))["vocabulary"]}
    for item in [row for row in source_items if row["role"] == "MANAGEMENT_CANDIDATE"]:
        source = preview(Path(item["path"]), item["sha256"], item["id"], item["duration_seconds"])
        semantic = item["semantic_event"]
        meaning = vocabulary[semantic]["meaning"]
        add_item(items, source=source, item_id=item["id"], title=f"{semantic.replace('_', ' ').title()} · {item['selection_role'].replace('_', ' ').title()}", collection="MANAGEMENT_SFX", context=semantic, classification=f"{item['classification']} · {item['selection_role']}", bus=vocabulary[semantic]["bus"], caption=f"Important sound: {meaning}. A visible/text equivalent is required.", status="PROTOTYPE_ONLY_PENDING_OWNER_AUDITION", rights_status=item["rights_status"])
        conversions.append({"id": item["id"], **source})

    for item in [row for row in source_items if row["role"] == "RADIO_DEMO"]:
        source = preview(Path(item["path"]), item["sha256"], item["id"], item["duration_seconds"])
        for related in (item["caption_track"], item["transcript"]):
            verified(Path(related["path"]), related["sha256"])
        add_item(items, source=source, item_id=item["id"], title=item["id"].removeprefix("ASP01-RADIO-").replace("-", " ").title(), collection="STUDIO_RADIO", epoch=item["epoch"], classification=item["classification"], bus="RADIO_VOICE", caption=item["caption_text"], rights_status=item["rights_status"], caption_track=item["caption_track"], transcript=item["transcript"])
        conversions.append({"id": item["id"], **source})

    accessibility = json.loads(ACCESSIBILITY_INDEX.read_text(encoding="utf-8"))
    for render in accessibility["renders"]:
        source = preview(Path(render["path"]), render["sha256"], f"ASP01-ACCESSIBILITY-{render['preset']}", render["probe"]["duration_seconds"])
        add_item(items, source=source, item_id=f"ASP01-ACCESSIBILITY-{render['preset']}", title=f"Accessibility · {render['preset'].replace('_', ' ').title()}", collection="ACCESSIBILITY", context=render["preset"], classification="ACCESSIBILITY_MIX_DEMONSTRATION", bus="MASTER", caption=f"Mix demonstration: {render['preset'].replace('_', ' ').lower()}.", rights_status=accessibility["status"])
        conversions.append({"id": f"ASP01-ACCESSIBILITY-{render['preset']}", **source})

    oracle = json.loads(ORACLE_INDEX.read_text(encoding="utf-8"))
    for trace in oracle["traces"]:
        render = trace.get("render")
        if not render:
            continue
        item_id = f"ASP01-ORACLE-{trace['number']:02d}"
        source = preview(Path(render["path"]), render["sha256"], item_id, render["probe"]["duration_seconds"])
        add_item(items, source=source, item_id=item_id, title=f"Audio Oracle {trace['number']:02d} · {trace['scenario'].replace('_', ' ').title()}", collection="AUDIO_ORACLE", context=trace["scenario"], classification="MACHINE_EVIDENCE_LISTENING_DEMONSTRATION", bus="MASTER", caption=f"Audio Oracle demonstration: {trace['scenario'].replace('_', ' ').lower()}.", rights_status=oracle["status"])
        conversions.append({"id": item_id, **source})

    ids = [item["id"] for item in items]
    if len(ids) != len(set(ids)):
        raise RuntimeError("audition source register contains duplicate IDs")
    counts = {collection: sum(item["collection"] == collection for item in items) for collection in sorted({item["collection"] for item in items})}
    expected = {"ERA_LIBRARY": 27, "RESPONSIVE_MUSIC": 12, "ERA_TRANSITIONS": 9, "LIVING_LOT": 11, "MANAGEMENT_SFX": 45, "STUDIO_RADIO": 3, "ACCESSIBILITY": 6}
    if any(counts.get(key) != value for key, value in expected.items()) or counts.get("AUDIO_ORACLE", 0) < 8:
        raise RuntimeError(f"audition coverage incomplete: {counts}")
    conversion_output = {
        "schema": "project-studio-audition-preview-derivatives/v1", "generated_utc": utc_now(),
        "status": "PROTOTYPE_READY_FOR_OWNER_AUDITION", "records": conversions,
        "source_relationships_explicit": True,
    }
    atomic_write_json(CONVERSION_MANIFEST, conversion_output)
    output = {
        "schema": "project-studio-audio-systems-audition-source/v1",
        "generated_utc": utc_now(),
        "status": "PROTOTYPE_READY_FOR_OWNER_AUDITION",
        "human_acceptance": "NONE_RECORDED",
        "network_required": False,
        "telemetry": False,
        "counts": counts,
        "items": items,
        "derivative_manifest": {"path": str(CONVERSION_MANIFEST), "sha256": sha256_file(CONVERSION_MANIFEST)},
    }
    atomic_write_json(OUTPUT_PATH, output)
    return output


def main() -> None:
    output = build()
    print(json.dumps({"path": str(OUTPUT_PATH), "sha256": sha256_file(OUTPUT_PATH), "counts": output["counts"]}, indent=2, sort_keys=True))


if __name__ == "__main__":
    main()
