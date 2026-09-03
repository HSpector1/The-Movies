#!/usr/bin/env python3
"""Reconcile explicit audio manifests into one hash-bound systems register."""

from __future__ import annotations

import hashlib
import json
from pathlib import Path
from typing import Any

from common import PILOT_ROOT, atomic_write_json, canonical_contained, probe_audio, sha256_file, utc_now


INDEX_PATH = PILOT_ROOT / "10_provenance/audio-assets-index.v4.json"
CATALOGUE_PATH = PILOT_ROOT / "01_catalogue/AudioPrototypeCatalogue.v1.json"
RADIO_INDEX_PATH = PILOT_ROOT / "06_radio/STUDIO-RADIO-RUNTIME-INDEX.v2.json"
TRANSITION_PATH = PILOT_ROOT / "03_transitions/rendered-transition-catalogue.v4.json"
LIVING_PATH = PILOT_ROOT / "04_living-lot/living-lot-soundscape-catalogue.v3.json"
DERIVATIVE_PATH = PILOT_ROOT / "10_provenance/audio-derivative-source-register.v4.json"
VALIDATION_PATH = PILOT_ROOT / "10_provenance/audio-assets-validation.v4.json"
ANCHOR_PATH = PILOT_ROOT / "02_music-bundles/responsive/responsive-anchor-authority.v2.json"
SFX_GATE_PATH = PILOT_ROOT / "10_provenance/sfx-route-gate.v2.json"
OUTPUT_PATH = PILOT_ROOT / "10_provenance/SYSTEM-AUDIO-ASSET-REGISTER.v5.json"
RADIO_DEMO_ROOT = PILOT_ROOT / "06_radio/demos-v2"
MILESTONE_STING_PATH = PILOT_ROOT / "06_radio/milestone-stings/LAB-MILESTONE-STING-01.wav"
MILESTONE_STING_SHA256 = "8b4e0b9a4e609737d91a3fc95fe313213c496d531c00e802628c62457f02acd6"
MILESTONE_CAPTION = "[important sound] Milestone sting. No mechanical change."
BAKED_FULL_MIX_REFUSAL = "BAKED_FULL_MIX_REFUSED_IN_AUDIO_LAB_INDEPENDENT_BUSES_AND_TIMED_CAPTIONS_UNAVAILABLE"

RADIO_AUTHORITIES = {
    "E02": {
        "slug": "EARLY-NETWORK-GOLDEN-STUDIO-V2",
        "epoch_alias": "network_sound_1933_1945",
        "presenter_id": "PRESENTER-MAE-CALDER",
        "presenter_display_name": "Mae Calder",
        "daypart": "MORNING",
        "functional": ("P13_AUDIO_LAB_FIXTURE", "LAB-E02-FUNCTIONAL-BULLETIN", "LAB-RECEIPT-E02-0001"),
        "pa": ("PA_HELP_AUDIO_LAB_FIXTURE", "LAB-PA-E02-ACCESS-PAUSED", "LAB-RECEIPT-PA-E02-0001"),
    },
    "E03": {
        "slug": "POSTWAR-PERSONALITY-TAPE-HIFI-V2",
        "epoch_alias": "tape_hifi_1946_1959",
        "presenter_id": "PRESENTER-ARTHUR-VALE",
        "presenter_display_name": "Arthur Vale",
        "daypart": "AFTERNOON",
        "functional": ("P05_AUDIO_LAB_FIXTURE", "LAB-E03-FUNCTIONAL-BULLETIN", "LAB-RECEIPT-E03-0001"),
        "pa": ("PA_HELP_AUDIO_LAB_FIXTURE", "LAB-PA-E03-ACCESS-PAUSED", "LAB-RECEIPT-PA-E03-0001"),
    },
    "E07": {
        "slug": "DIGITAL-NETWORKED-HYBRID-V2",
        "epoch_alias": "networked_hybrid_2000_2014",
        "presenter_id": "PRESENTER-RINA-SHORE",
        "presenter_display_name": "Rina Shore",
        "daypart": "EVENING",
        "functional": ("P06_AUDIO_LAB_FIXTURE", "LAB-E07-FUNCTIONAL-BULLETIN", "LAB-RECEIPT-E07-0001"),
        "pa": ("PA_HELP_AUDIO_LAB_FIXTURE", "LAB-PA-E07-ACCESS-PAUSED", "LAB-RECEIPT-PA-E07-0001"),
    },
}

RADIO_VOICE_ROLES = {"opening", "functional", "interruptible", "pa"}
RADIO_EVENT_ROLE = {
    "opening": lambda item: str(item.get("id", "")).endswith("-OPENING"),
    "functional": lambda item: item.get("contentType") == "FUNCTIONAL",
    "interruptible": lambda item: str(item.get("id", "")).endswith("-INTERRUPTIBLE"),
    "pa": lambda item: item.get("contentType") == "PA_HELP",
}

FUNCTIONAL_STRING_FIELDS = {
    "ownerDomain", "eventId", "receiptId", "headline", "body", "expiresAt", "captionText", "spokenText",
}


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


def validated_functional_payload(
    event: dict[str, Any], voice_role: str, authority: dict[str, Any]
) -> dict[str, Any] | None:
    payload = event.get("payload")
    if voice_role not in {"functional", "pa"}:
        if payload is not None:
            raise RuntimeError(f"decorative radio item unexpectedly owns a typed payload: {event.get('id')}")
        return None
    if (not isinstance(payload, dict)
            or any(not isinstance(payload.get(field), str) or not payload[field].strip()
                   for field in FUNCTIONAL_STRING_FIELDS)
            or type(payload.get("priority")) is not int):
        raise RuntimeError(f"radio functional payload field contract mismatch: {event.get('id')}")
    expected_owner, expected_event, expected_receipt = authority[voice_role]
    expected_item_id = expected_event if voice_role == "pa" else f"{expected_event}@{expected_receipt}"
    if (payload["ownerDomain"] != expected_owner
            or payload["eventId"] != expected_event
            or payload["receiptId"] != expected_receipt
            or event.get("id") != expected_item_id
            or event.get("captionText") != payload["captionText"]
            or event.get("spokenText") != payload["spokenText"]
            or event.get("expiresAt") != payload["expiresAt"]
            or event.get("priority") != payload["priority"]
            or payload["expiresAt"] != "2099-01-01T00:00:00Z"):
        raise RuntimeError(f"radio functional payload identity mismatch: {event.get('id')}")
    return payload


def radio_voice_items(demos: list[dict[str, Any]]) -> tuple[list[dict[str, Any]], list[dict[str, Any]]]:
    """Bind the existing item-level voice units without inferring stems from a baked mix."""
    items: list[dict[str, Any]] = []
    source_manifests: list[dict[str, Any]] = []
    seen_metadata: set[Path] = set()
    seen_schedules: set[Path] = set()
    for demo in demos:
        slug = demo["slug"]
        epoch_code = demo["epoch_code"]
        authority = RADIO_AUTHORITIES.get(epoch_code)
        if (authority is None or slug != authority["slug"]
                or demo.get("epoch_alias") != authority["epoch_alias"]
                or demo.get("presenter_id") != authority["presenter_id"]):
            raise RuntimeError(f"radio demo authority mismatch: {slug}")
        schedule_path = RADIO_DEMO_ROOT / slug / "SCHEDULE.v2.json"
        schedule = json.loads(schedule_path.read_text(encoding="utf-8"))
        if schedule.get("schema") != "project-studio-runtime-radio-schedule/v2":
            raise RuntimeError(f"unexpected radio schedule schema: {schedule_path}")
        if schedule_path not in seen_schedules:
            source_manifests.append({"path": str(schedule_path), "sha256": sha256_file(schedule_path)})
            seen_schedules.add(schedule_path)
        event_rows = schedule.get("events", [])
        delivered_rows = schedule.get("deliveredVoiceEvents", [])
        if (not isinstance(event_rows, list) or len(event_rows) != 5
                or not isinstance(delivered_rows, list) or len(delivered_rows) != 4
                or len({row.get("item", {}).get("id") for row in delivered_rows}) != 4):
            raise RuntimeError(f"radio schedule/delivery cardinality mismatch: {slug}")
        voice_records = demo.get("voice_records", [])
        roles = [str(row.get("role", "")).lower() for row in voice_records]
        if len(voice_records) != 4 or set(roles) != RADIO_VOICE_ROLES or len(roles) != len(set(roles)):
            raise RuntimeError(f"radio demo voice-role cardinality mismatch: {slug}")

        for voice_record in voice_records:
            voice_role = str(voice_record["role"]).lower()
            indexed_period_path = canonical_contained(PILOT_ROOT, Path(voice_record["path"]))
            expected_voice_root = canonical_contained(
                PILOT_ROOT, RADIO_DEMO_ROOT / slug / "voice" / voice_role.upper()
            )
            expected_period_path = canonical_contained(PILOT_ROOT, expected_voice_root / "PERIOD-TREATED.wav")
            expected_clean_path = canonical_contained(PILOT_ROOT, expected_voice_root / "CLEAN.wav")
            metadata_path = canonical_contained(PILOT_ROOT, expected_voice_root / "metadata.v2.json")
            if indexed_period_path != expected_period_path:
                raise RuntimeError(f"radio voice cross-program/role path substitution refused: {slug}:{voice_role}")
            metadata = json.loads(metadata_path.read_text(encoding="utf-8"))
            if metadata_path not in seen_metadata:
                source_manifests.append({"path": str(metadata_path), "sha256": sha256_file(metadata_path)})
                seen_metadata.add(metadata_path)
            if (metadata.get("schema") != "project-studio-radio-voice-render/v2"
                    or metadata.get("role", "").lower() != voice_role
                    or metadata.get("rights_status") != "PROTOTYPE_ONLY"
                    or metadata.get("human_disposition") != "PENDING"):
                raise RuntimeError(f"radio voice metadata contract mismatch: {metadata_path}")
            period = metadata.get("period_treated", {})
            if (canonical_contained(PILOT_ROOT, Path(period.get("path", ""))) != indexed_period_path
                    or period.get("sha256") != voice_record.get("sha256")):
                raise RuntimeError(f"radio index/voice metadata identity mismatch: {metadata_path}")
            clean = metadata.get("clean", {})
            if canonical_contained(PILOT_ROOT, Path(clean.get("path", ""))) != expected_clean_path:
                raise RuntimeError(f"radio clean voice path identity mismatch: {metadata_path}")
            spoken_text = metadata.get("spoken_text", "")
            spoken_hash = hashlib.sha256(spoken_text.encode("utf-8")).hexdigest()
            if not spoken_text or spoken_hash != metadata.get("spoken_text_sha256"):
                raise RuntimeError(f"radio voice spoken-text identity mismatch: {metadata_path}")
            matching_event_rows = [row for row in event_rows if RADIO_EVENT_ROLE[voice_role](row.get("item", {}))]
            if len(matching_event_rows) != 1:
                raise RuntimeError(f"radio schedule voice-event mapping mismatch: {slug}:{voice_role}")
            event_row = matching_event_rows[0]
            event = event_row["item"]
            expected_speech_owner = "PA_HELP" if voice_role == "pa" else "RADIO_VOICE"
            expected_caption_context = "OVER_PA" if voice_role == "pa" else "OVER_RADIO"
            expected_content_type = "PA_HELP" if voice_role == "pa" else "FUNCTIONAL" if voice_role == "functional" else "DECORATIVE"
            expected_event_id = (authority["pa"][1] if voice_role == "pa"
                else f"{authority['functional'][1]}@{authority['functional'][2]}" if voice_role == "functional"
                else f"{slug}-{voice_role.upper()}")
            if (event_row.get("speechOwner") != expected_speech_owner
                    or event.get("contentType") != expected_content_type
                    or event.get("id") != expected_event_id
                    or event.get("dayparts") != [authority["daypart"]]):
                raise RuntimeError(f"radio schedule item/owner/daypart mismatch: {slug}:{voice_role}")
            if (event.get("spokenText") != spoken_text or event.get("captionText") != spoken_text
                    or abs(float(event.get("durationSeconds", 0.0)) - float(metadata["clean"]["probe"]["duration_seconds"])) > 0.000001):
                raise RuntimeError(f"radio schedule text/duration parity mismatch: {slug}:{voice_role}")
            schedule_presenters = event.get("presenters", [])
            if schedule_presenters != [demo["presenter_id"]]:
                raise RuntimeError(f"radio schedule programme-presenter mismatch: {slug}:{voice_role}")
            if (voice_role == "pa" and metadata.get("presenter_id") != "PRESENTER-RINA-SHORE"):
                raise RuntimeError(f"radio PA speaker identity mismatch: {slug}")
            if (voice_role != "pa" and metadata.get("presenter_id") != demo["presenter_id"]):
                raise RuntimeError(f"radio programme voice speaker identity mismatch: {slug}:{voice_role}")
            expected_speaker = (RADIO_AUTHORITIES["E07"]["presenter_display_name"]
                if voice_role == "pa" else authority["presenter_display_name"])
            if metadata.get("presenter_display_name") != expected_speaker:
                raise RuntimeError(f"radio delivered-speaker display identity mismatch: {slug}:{voice_role}")
            matching_deliveries = [row for row in delivered_rows if row.get("item", {}).get("id") == event.get("id")]
            if len(matching_deliveries) != 1:
                raise RuntimeError(f"radio delivered-voice mapping mismatch: {slug}:{voice_role}")
            delivery = matching_deliveries[0]
            expected_delivery_status = "INTERRUPTED_BY_PA" if voice_role == "interruptible" else "PLAYED"
            declared_duration = float(event["durationSeconds"])
            played_duration = float(delivery.get("audioPlayedSeconds", -1.0))
            if (delivery.get("item") != event
                    or delivery.get("speechOwner") != expected_speech_owner
                    or delivery.get("captionContext") != expected_caption_context
                    or delivery.get("speaker") != expected_speaker
                    or delivery.get("deliveryStatus") != expected_delivery_status
                    or abs(float(delivery.get("declaredDurationSeconds", -1.0)) - declared_duration) > 0.000001
                    or played_duration <= 0.0 or played_duration - declared_duration > 0.000001
                    or (voice_role != "interruptible" and abs(played_duration - declared_duration) > 0.000001)
                    or (voice_role == "interruptible" and played_duration >= declared_duration)
                    or (voice_role == "pa" and (delivery.get("interruptedItemId") != f"{slug}-INTERRUPTIBLE"
                        or event_row.get("interruptedItemId") != f"{slug}-INTERRUPTIBLE"))
                    or (voice_role != "pa" and delivery.get("interruptedItemId") is not None)):
                raise RuntimeError(f"radio delivered-voice identity mismatch: {slug}:{voice_role}")
            functional_payload = validated_functional_payload(event, voice_role, authority)

            for treatment, metadata_key in (("CLEAN", "clean"), ("PERIOD", "period_treated")):
                audio = metadata[metadata_key]
                path = canonical_contained(PILOT_ROOT, Path(audio["path"]))
                require(path, audio["sha256"])
                actual_probe = probe_audio(path)
                if actual_probe != audio["probe"]:
                    raise RuntimeError(f"radio voice format probe mismatch: {path}")
                if abs(float(event["durationSeconds"]) - float(actual_probe["duration_seconds"])) > 0.000001:
                    raise RuntimeError(f"radio scheduled/audio duration mismatch: {slug}:{voice_role}:{treatment}")
                bus = "PA_HELP" if voice_role == "pa" else "RADIO_VOICE"
                items.append({
                    "id": f"ASP01-RADIO-VOICE-{epoch_code}-{voice_role.upper()}-{treatment}",
                    "role": "PA_VOICE" if voice_role == "pa" else "RADIO_VOICE",
                    "path": str(path),
                    "relative_path": str(path.relative_to(PILOT_ROOT)),
                    "sha256": audio["sha256"],
                    "duration_seconds": float(actual_probe["duration_seconds"]),
                    "format": actual_probe,
                    "rights_status": metadata["rights_status"],
                    "human_disposition": metadata["human_disposition"],
                    "epoch": demo["epoch_alias"],
                    "epoch_code": epoch_code,
                    "program_slug": slug,
                    "program_presenter_id": demo["presenter_id"],
                    "presenter_id": metadata["presenter_id"],
                    "presenter_display_name": metadata["presenter_display_name"],
                    "voice_role": voice_role.upper(),
                    "treatment": treatment,
                    "spoken_text": spoken_text,
                    "spoken_text_sha256": spoken_hash,
                    "bus": bus,
                    "source_metadata": {"path": str(metadata_path), "sha256": sha256_file(metadata_path)},
                    "derivative_source": None if treatment == "CLEAN" else {
                        "id": f"ASP01-RADIO-VOICE-{epoch_code}-{voice_role.upper()}-CLEAN",
                        "path": metadata["clean"]["path"],
                        "sha256": metadata["clean"]["sha256"],
                    },
                    "schedule_item_id": event["id"],
                    "schedule_presenter_ids": schedule_presenters,
                    "schedule_speech_owner": event_row["speechOwner"],
                    "content_type": event["contentType"],
                    "caption_text": event["captionText"],
                    "functional_payload": functional_payload,
                    "source_delivery": {
                        "at_seconds": delivery["atSeconds"],
                        "end_seconds": delivery["endSeconds"],
                        "declared_duration_seconds": delivery["declaredDurationSeconds"],
                        "audio_played_seconds": delivery["audioPlayedSeconds"],
                        "delivery_status": delivery["deliveryStatus"],
                        "caption_context": delivery["captionContext"],
                        "speech_owner": delivery["speechOwner"],
                        "speaker": delivery["speaker"],
                        "interrupted_item_id": delivery.get("interruptedItemId"),
                    },
                    "classification": "HASH_BOUND_ITEM_LEVEL_GENERIC_SYNTHETIC_VOICE_PROTOTYPE",
                    "redistribution_caveat": metadata["redistribution_caveat"],
                })
    return items, source_manifests


def build() -> dict[str, Any]:
    existing_output = json.loads(OUTPUT_PATH.read_text(encoding="utf-8")) if OUTPUT_PATH.is_file() else None
    source_index = json.loads(INDEX_PATH.read_text(encoding="utf-8"))
    if source_index.get("schema") != "project-studio-audio-assets-index/v4":
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
            "machine_proof_scope": selection.get("machine_proof_scope", "FILE_FITNESS_ONLY"),
            "contextual_differentiation": selection.get(
                "contextual_differentiation", "NOT_PROVEN_REQUIRES_OWNER_LISTENING"
            ),
            "transition_metadata": selection["transition_metadata"],
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
            "natural_ending_claimed": transition["natural_ending_claimed"],
        })
        items.append(item)

    living_manifest = json.loads(LIVING_PATH.read_text(encoding="utf-8"))
    living_layers = {row["stable_prototype_id"]: row for row in living_manifest["layers"]}
    for record in records:
        category = record["category"]
        if category == "LIVING_LOT_LAYER":
            item = base_item(record, "LIVING_LAYER")
            item["layer"] = record["zoom"]
            item["fixture"] = "BASE"
            authority = living_layers[record["stable_prototype_id"]]
            item["scheduled_detail_event_count"] = authority["scheduled_detail_event_count"]
            item["scheduled_detail_sources"] = authority["scheduled_detail_sources"]
            item["classification"] = authority["generation"]
            items.append(item)
        elif category == "LIVING_LOT_FIXTURE_PRESENTATION":
            item = base_item(record, "LIVING_MIX")
            item["fixture"] = record["fixture"]
            item["classification"] = "TEN_MINUTE_LIVING_LOT_FIXTURE_PRESENTATION"
            items.append(item)
        elif category == "LIVING_LOT_ERA_PRESENTATION":
            item = base_item(record, "LIVING_ERA_PRESENTATION")
            item["presentation"] = record["presentation"]
            authority = next(
                row for row in living_manifest["era_presentations"]
                if row["stable_prototype_id"] == record["stable_prototype_id"]
            )
            item["classification"] = authority["classification"]
            item["era_proof_eligible"] = authority["era_proof_eligible"]
            item["historical_disposition"] = authority["historical_disposition"]
            item["cultural_review"] = authority["cultural_review"]
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
    voice_items, radio_voice_source_manifests = radio_voice_items(radio_index["demos"])
    items.extend(voice_items)
    require(MILESTONE_STING_PATH, MILESTONE_STING_SHA256)
    sting_probe = probe_audio(MILESTONE_STING_PATH)
    if (sting_probe != {
            "bits_per_sample": 16,
            "channels": 1,
            "codec": "pcm_s16le",
            "duration_seconds": 1.25,
            "sample_rate_hz": 48000,
    }):
        raise RuntimeError("milestone sting format identity changed")
    sting_schedule_ids: list[str] = []
    sting_caption_authorities: list[dict[str, Any]] = []
    for demo in radio_index["demos"]:
        schedule_path = RADIO_DEMO_ROOT / demo["slug"] / "SCHEDULE.v2.json"
        schedule = json.loads(schedule_path.read_text(encoding="utf-8"))
        authority = RADIO_AUTHORITIES[demo["epoch_code"]]
        sting_rows = [row for row in schedule["events"] if row["item"].get("contentType") == "MILESTONE_STING"]
        expected_sting_id = f"LAB-STING-{demo['epoch_code']}-V2"
        if (len(sting_rows) != 1 or sting_rows[0].get("speechOwner") != "NONE"
                or sting_rows[0]["item"].get("id") != expected_sting_id
                or sting_rows[0]["item"].get("presenters") != [authority["presenter_id"]]
                or sting_rows[0]["item"].get("dayparts") != [authority["daypart"]]
                or sting_rows[0]["item"].get("captionText") != ""
                or sting_rows[0]["item"].get("spokenText") != ""
                or sting_rows[0]["item"].get("payload") is not None
                or abs(float(sting_rows[0]["item"].get("durationSeconds", 0.0)) - float(sting_probe["duration_seconds"])) > 0.000001):
            raise RuntimeError(f"milestone sting schedule contract mismatch: {demo['slug']}")
        sting_schedule_ids.append(sting_rows[0]["item"]["id"])
        expected_caption_path = canonical_contained(
            PILOT_ROOT, RADIO_DEMO_ROOT / demo["slug"] / "CAPTIONS.v2.vtt"
        )
        declared_caption_path = canonical_contained(PILOT_ROOT, Path(demo["captions"]["path"]))
        if declared_caption_path != expected_caption_path:
            raise RuntimeError(f"milestone caption cross-program path substitution refused: {demo['slug']}")
        require(declared_caption_path, demo["captions"]["sha256"])
        caption_text = declared_caption_path.read_text(encoding="utf-8")
        if caption_text.splitlines().count(MILESTONE_CAPTION) != 1:
            raise RuntimeError(f"milestone important-sound caption authority mismatch: {demo['slug']}")
        sting_caption_authorities.append({
            "path": str(declared_caption_path),
            "sha256": demo["captions"]["sha256"],
            "cue_text": MILESTONE_CAPTION,
        })
    items.append({
        "id": "ASP01-RADIO-MILESTONE-STING-01",
        "role": "MILESTONE_STING",
        "path": str(MILESTONE_STING_PATH),
        "relative_path": str(MILESTONE_STING_PATH.relative_to(PILOT_ROOT)),
        "sha256": MILESTONE_STING_SHA256,
        "duration_seconds": float(sting_probe["duration_seconds"]),
        "format": sting_probe,
        "rights_status": "PROTOTYPE_ONLY",
        "human_disposition": "PENDING",
        "bus": "MILESTONE_STINGS",
        "classification": "PROCEDURAL_MILESTONE_STING_PROTOTYPE",
        "caption_text": MILESTONE_CAPTION,
        "source_audio_identity": {
            "sha256": MILESTONE_STING_SHA256,
            "binding": "EXACT_PINNED_SHA256_IN_COMMITTED_REGISTER_BUILDER",
        },
        "caption_authorities": sorted(sting_caption_authorities, key=lambda row: row["path"]),
        "schedule_item_ids": sorted(sting_schedule_ids),
    })
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
            "classification": "SCHEDULER_RENDERED_BAKED_FULL_PROGRAMME_OFFLINE_AUDITION_ONLY",
            "playback_policy": "OFFLINE_AUDITION_ONLY",
            "permitted_lab_contexts": ["OFFLINE_AUDITION"],
            "runtime_refusal_reason": BAKED_FULL_MIX_REFUSAL,
            "scheduler_evidence": demo["scheduler_evidence"],
            "caption_text": "Full caption file and transcript are supplied beside this program.",
            "caption_track": demo["captions"],
            "transcript": demo["transcript"],
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
        "MILESTONE_STING": 1,
        "PA_VOICE": 6,
        "RADIO_DEMO": 3,
        "RADIO_VOICE": 18,
    }
    if any(counts.get(role) != count for role, count in expected.items()):
        raise RuntimeError(f"system audio asset count mismatch: expected={expected}, actual={counts}")
    output = {
        "schema": "project-studio-system-audio-asset-register/v5",
        "generated_utc": existing_output["generated_utc"] if existing_output else utc_now(),
        "status": "PROTOTYPE_READY_FOR_OWNER_AUDITION",
        "human_acceptance": "NONE_RECORDED",
        "commercial_clearance": "NOT_CLAIMED",
        "source_manifests": [
            {"path": str(INDEX_PATH), "sha256": sha256_file(INDEX_PATH)},
            {"path": str(CATALOGUE_PATH), "sha256": sha256_file(CATALOGUE_PATH)},
            {"path": str(RADIO_INDEX_PATH), "sha256": sha256_file(RADIO_INDEX_PATH)},
            {"path": str(TRANSITION_PATH), "sha256": sha256_file(TRANSITION_PATH)},
            {"path": str(LIVING_PATH), "sha256": sha256_file(LIVING_PATH)},
            {"path": str(DERIVATIVE_PATH), "sha256": sha256_file(DERIVATIVE_PATH)},
            {"path": str(VALIDATION_PATH), "sha256": sha256_file(VALIDATION_PATH)},
            {"path": str(ANCHOR_PATH), "sha256": sha256_file(ANCHOR_PATH)},
            {"path": str(SFX_GATE_PATH), "sha256": sha256_file(SFX_GATE_PATH)},
        ] + sorted(radio_voice_source_manifests + [
            {"path": row["path"], "sha256": row["sha256"]}
            for row in sting_caption_authorities
        ], key=lambda row: row["path"]),
        "counts": counts,
        "responsive_policy": source_index["responsive_policy"],
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
