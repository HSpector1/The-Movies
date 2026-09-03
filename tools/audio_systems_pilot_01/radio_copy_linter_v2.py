#!/usr/bin/env python3
"""Publish immutable v2 Studio Radio clean copy and a location-bearing lint report."""

from __future__ import annotations

import argparse
import csv
import hashlib
import io
import json
import re
from collections import Counter
from pathlib import Path
from typing import Any, Pattern

from common import MARATHON_ROOT, PILOT_ROOT, atomic_write_json, atomic_write_text, sha256_file
from radio_copy_linter import clean_spoken as clean_spoken_v1


SOURCE_BANK = MARATHON_ROOT / "06_radio/script-bank/STUDIO-RADIO-SCRIPT-BANK-01.json"
OUTPUT_BANK = PILOT_ROOT / "06_radio/script-bank/STUDIO-RADIO-SCRIPT-BANK-01-CLEAN.v2.json"
OUTPUT_CSV = PILOT_ROOT / "06_radio/script-bank/STUDIO-RADIO-SCRIPT-BANK-01-CLEAN.v2.csv"
LINT_REPORT = PILOT_ROOT / "06_radio/script-bank/RADIO-COPY-LINT.v2.json"
TOOL_VERSION = "project-studio-radio-copy-linter-v2"
EVIDENCE_CREATED_AT = "2026-09-03T00:00:00Z"


Rule = tuple[str, Pattern[str], str]
RULES: tuple[Rule, ...] = (
    (
        "SPOKEN_META_FICTION",
        re.compile(r"\b(?:fictional|imaginary|imagined|invented|make[- ]believe|non-authoritative|story[- ]world|our story|concept bulletin)\b", re.I),
        "Spoken copy must remain in-world; status language belongs in metadata.",
    ),
    (
        "DRAFT_PLACEHOLDER",
        re.compile(r"\b(?:TODO|TBD|FIXME|TK)\b", re.I),
        "Draft markers are never speakable.",
    ),
    (
        "INTERNAL_OR_DEBUG_ID",
        re.compile(r"\b(?:SR-E\d\d-[A-Z]{2,4}-\d\d|APS01-[A-Z0-9_-]+|LAB-(?:RECEIPT|TECH|PRODUCTION|RELEASE|PA|STING)-[A-Z0-9_-]+|FIXTURE-[A-Z0-9_-]+|(?:DEBUG|DEV|INTERNAL)[-_][A-Z0-9_-]+)\b", re.I),
        "Internal identities belong in payload metadata, not speech.",
    ),
    (
        "UNCAPTURED_VARIABLE",
        re.compile(r"(?:\$\{[^}]+\}|\{\{[^{}]+\}\}|\{[A-Za-z_][A-Za-z0-9_.-]*\}|<[A-Z][A-Z0-9_ -]+>|\[[A-Z][A-Z0-9_ -]+\]|%(?:\d+\$)?[sdif])"),
        "Every variable must be resolved before copy reaches the scheduler.",
    ),
    (
        "PLACEHOLDER_LEGAL_LANGUAGE",
        re.compile(
            r"\b(?:placeholder legal|for legal|rights pending|clearance pending|authoritative (?:system|implementation|design|game data)|"
            r"not (?:a|an) (?:real|production|studio)|no (?:real|actual) |concept bulletin|narrative color|grants? no clearance|"
            r"prototype only|owner approval pending|no gameplay state)\b",
            re.I,
        ),
        "Rights and implementation caveats belong in metadata.",
    ),
    (
        "UNSUPPORTED_MECHANIC_OR_STATE",
        re.compile(
            r"\b(?:(?:press|click|tap|hold) (?:the |a )?(?:button|key|control)|"
            r"(?:unlocks?|awards?|grants?|charges?|refunds?|saves?|loads?|changes?|completes?) (?:the |your )?(?:game|mechanic|production|objective|mission|account|save)|"
            r"(?:your|the) (?:score|money|budget|inventory|production|objective|mission|save) (?:is|has been|will be) (?:changed|saved|loaded|complete|updated)|"
            r"gameplay (?:feature|effect|status)|you (?:won|lost|failed|completed) (?:the|this))\b",
            re.I,
        ),
        "Mechanical truth must come from a typed authoritative payload.",
    ),
    (
        "REAL_PERSON_IMPERSONATION_CUE",
        re.compile(r"\b(?:imitat(?:e|es|ing|ion)|impersonat(?:e|es|ing|ion)|in the (?:voice|style|manner) of|sound(?:s|ing)? like|voice clone of)\b", re.I),
        "No real-person, celebrity, broadcaster, or protected-character target is allowed.",
    ),
    (
        "REAL_WORLD_CLAIM_CUE",
        re.compile(r"\b(?:according to (?:the )?(?:real|actual)|officially endorsed by|licensed by|sponsored by (?:a real|the actual)|true story of a living|real-world breaking news)\b", re.I),
        "Unverified real-world claims require explicit editorial sourcing and are withheld.",
    ),
)


def clean_spoken(text: str) -> str:
    cleaned = clean_spoken_v1(text)
    cleaned = re.sub(r"\bwhenever our story allows\b", "when the programme pauses", cleaned, flags=re.I)
    cleaned = re.sub(r"\bour story\b", "the programme", cleaned, flags=re.I)
    cleaned = re.sub(r"\s+([,.;:!?])", r"\1", cleaned)
    return re.sub(r" {2,}", " ", cleaned).strip()


def lint_text(stable_id: str, field: str, text: str, *, item_index: int | None = None) -> list[dict[str, Any]]:
    findings: list[dict[str, Any]] = []
    for rule, pattern, rationale in RULES:
        for match in pattern.finditer(text):
            prefix = text[: match.start()]
            line = prefix.count("\n") + 1
            column = len(prefix.rsplit("\n", 1)[-1]) + 1
            finding: dict[str, Any] = {
                "stable_id": stable_id,
                "field": field,
                "rule": rule,
                "match": match.group(0),
                "char_start": match.start(),
                "char_end": match.end(),
                "utf8_byte_start_in_field": len(prefix.encode("utf-8")),
                "field_line": line,
                "field_column": column,
                "rationale": rationale,
            }
            if item_index is not None:
                finding["json_pointer"] = f"/units/{item_index}/{field}"
            findings.append(finding)
    return findings


def lint_units(units: list[dict[str, Any]], fields: tuple[str, ...] = ("transcript", "caption")) -> list[dict[str, Any]]:
    findings: list[dict[str, Any]] = []
    for item_index, unit in enumerate(units):
        stable_id = str(unit.get("stable_id") or unit.get("eventId") or "UNKNOWN")
        for field in fields:
            value = unit.get(field)
            if isinstance(value, str):
                findings.extend(lint_text(stable_id, field, value, item_index=item_index))
    return findings


def csv_payload(rows: list[dict[str, Any]]) -> str:
    fields = [
        "stable_id", "epoch_code", "epoch_alias", "function", "content_class",
        "runtime_eligible", "presenter_id", "transcript", "caption", "historical_review",
        "cultural_review", "status",
    ]
    buffer = io.StringIO(newline="")
    writer = csv.DictWriter(buffer, fieldnames=fields, extrasaction="ignore", lineterminator="\n")
    writer.writeheader()
    writer.writerows(rows)
    return buffer.getvalue()


def build() -> dict[str, Any]:
    source = json.loads(SOURCE_BANK.read_text(encoding="utf-8"))
    source_units = source["units"]
    original_findings = lint_units(source_units)
    presenters = ("PRESENTER-MAE-CALDER", "PRESENTER-ARTHUR-VALE", "PRESENTER-RINA-SHORE")
    cleaned_units: list[dict[str, Any]] = []
    corrected_ids: list[str] = []
    for index, unit in enumerate(source_units):
        cleaned = dict(unit)
        cleaned_text = clean_spoken(unit["transcript"])
        if cleaned_text != unit["transcript"]:
            corrected_ids.append(unit["stable_id"])
        is_technology = unit["function"] == "fictional_industry_technology_bulletin"
        cleaned.update({
            "source_transcript_sha256": hashlib.sha256(unit["transcript"].encode("utf-8")).hexdigest(),
            "transcript": cleaned_text,
            "caption": cleaned_text,
            "caption_parity": "VERBATIM_CORE_TEXT",
            "content_class": "FUNCTIONAL_TEMPLATE_WITHHELD" if is_technology else "DECORATIVE",
            "runtime_eligible": not is_technology,
            "withheld_reason": "REQUIRES_TYPED_P13_PAYLOAD_AND_EDITORIAL_SOURCE" if is_technology else None,
            "owner_domain": "P13_FUTURE_CONSUMER_BOUNDARY" if is_technology else "AUDIO_DECORATIVE_COPY",
            "presenter_id": presenters[(index + int(unit["epoch_code"][1:])) % len(presenters)],
            "historical_review": "PENDING",
            "cultural_review": "PENDING",
            "human_disposition": "PENDING",
            "status": "PROTOTYPE_ONLY",
        })
        cleaned_units.append(cleaned)
    findings = lint_units(cleaned_units)
    parity_failures = [unit["stable_id"] for unit in cleaned_units if unit["transcript"] != unit["caption"]]
    if findings or parity_failures:
        raise RuntimeError(f"v2 cleaned bank failed closed: findings={findings[:8]} parity={parity_failures[:8]}")
    output = {
        "schema_version": "project-studio-radio-clean-copy/v2",
        "source_bank": {"path": str(SOURCE_BANK), "sha256": sha256_file(SOURCE_BANK)},
        "generated_utc": EVIDENCE_CREATED_AT,
        "status": "PROTOTYPE_ONLY",
        "content_boundary": {
            "decorative_runtime_eligible": sum(unit["runtime_eligible"] for unit in cleaned_units),
            "functional_templates_withheld": sum(not unit["runtime_eligible"] for unit in cleaned_units),
            "law": "Technology/workflow assertions are withheld until resolved from a typed P13-owned payload and editorial source. They are not decorative runtime copy.",
        },
        "presenter_assignment": {
            "identities": list(presenters),
            "status": "PROVISIONAL FICTIONAL IDENTITIES; NAME/MARK REVIEW PENDING",
            "voice_policy": "Generic local synthetic voices only; no imitation, cloning, celebrity, protected character, or real broadcaster target.",
        },
        "units": cleaned_units,
    }
    atomic_write_json(OUTPUT_BANK, output)
    atomic_write_text(OUTPUT_CSV, csv_payload(cleaned_units))
    report = {
        "schema": "project-studio-radio-copy-lint/v2",
        "tool_version": TOOL_VERSION,
        "generated_utc": EVIDENCE_CREATED_AT,
        "status": "PASS" if not findings and not parity_failures else "FAIL",
        "source": {"path": str(SOURCE_BANK), "sha256": sha256_file(SOURCE_BANK)},
        "source_units": len(source_units),
        "cleaned_units": len(cleaned_units),
        "corrected_unit_count": len(set(corrected_ids)),
        "corrected_unit_ids": sorted(set(corrected_ids)),
        "source_finding_count": len(original_findings),
        "source_finding_rules": dict(sorted(Counter(item["rule"] for item in original_findings).items())),
        "source_findings": original_findings,
        "cleaned_finding_count": len(findings),
        "cleaned_findings": findings,
        "caption_parity_failures": parity_failures,
        "reviewed_exceptions": [],
        "unresolved_blockers": [],
        "registered_rules": [{"rule": name, "pattern": pattern.pattern, "rationale": rationale} for name, pattern, rationale in RULES],
        "output": {"path": str(OUTPUT_BANK), "sha256": sha256_file(OUTPUT_BANK)},
        "limitations": [
            "A deterministic linter proves only its registered patterns and byte parity.",
            "Human editorial, historical, cultural, localization, performance, naming/mark, and legal review remain required.",
        ],
    }
    atomic_write_json(LINT_REPORT, report)
    return report


def self_test() -> None:
    assert clean_spoken("A fictional message from an imaginary desk.") == "A message from a studio desk."
    assert "our story" not in clean_spoken("A clean table whenever our story allows.").lower()
    adversarial = {
        "SPOKEN_META_FICTION": "This fictional item remains in our story.",
        "DRAFT_PLACEHOLDER": "TBD and FIXME.",
        "INTERNAL_OR_DEBUG_ID": "Read APS01-RADIO-SECRET.",
        "UNCAPTURED_VARIABLE": "Hello %s and {{name}}.",
        "PLACEHOLDER_LEGAL_LANGUAGE": "This is prototype only.",
        "UNSUPPORTED_MECHANIC_OR_STATE": "This awards your game score.",
        "REAL_PERSON_IMPERSONATION_CUE": "Speak in the voice of a broadcaster.",
        "REAL_WORLD_CLAIM_CUE": "Officially endorsed by the actual network.",
    }
    for expected, sample in adversarial.items():
        found = {item["rule"] for item in lint_text("TEST", "spokenText", sample)}
        assert expected in found, (expected, found)
    assert not lint_text("TEST", "spokenText", "The picture lot opens for another working day.")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--self-test", action="store_true")
    args = parser.parse_args()
    if args.self_test:
        self_test()
    print(json.dumps(build(), indent=2, sort_keys=True))


if __name__ == "__main__":
    main()
