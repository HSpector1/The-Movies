#!/usr/bin/env python3
"""Clean and lint spoken Studio Radio copy without altering its source bank."""

from __future__ import annotations

import argparse
import csv
import io
import json
import re
from collections import Counter
from pathlib import Path
from typing import Any

from common import MARATHON_ROOT, PILOT_ROOT, atomic_write_json, atomic_write_text, sha256_file, utc_now


SOURCE_BANK = MARATHON_ROOT / "06_radio/script-bank/STUDIO-RADIO-SCRIPT-BANK-01.json"
OUTPUT_BANK = PILOT_ROOT / "06_radio/script-bank/STUDIO-RADIO-SCRIPT-BANK-01-CLEAN.json"
OUTPUT_CSV = PILOT_ROOT / "06_radio/script-bank/STUDIO-RADIO-SCRIPT-BANK-01-CLEAN.csv"
LINT_REPORT = PILOT_ROOT / "06_radio/script-bank/RADIO-COPY-LINT.json"
TOOL_VERSION = "project-studio-radio-copy-linter-v1"

META_TERMS = re.compile(
    r"\b(?:fictional|imaginary|imagined|invented|make[- ]believe|non-authoritative|story[- ]world|concept bulletin)\b",
    re.IGNORECASE,
)
TODO = re.compile(r"\bTODO\b", re.IGNORECASE)
INTERNAL_ID = re.compile(r"\b(?:SR-E\d\d-[A-Z]{2,4}-\d\d|APS01-[A-Z0-9_-]+|FIXTURE-[A-Z0-9_-]+)\b")
VARIABLE = re.compile(r"(?:\$\{[^}]+\}|\{\{?[^{}]+\}?\}|<[A-Z][A-Z0-9_ -]+>|\[[A-Z][A-Z0-9_ -]+\])")
PLACEHOLDER_LEGAL = re.compile(
    r"\b(?:placeholder legal|for legal|authoritative (?:system|implementation|design)|"
    r"no (?:real|actual) |not (?:a|an) (?:real|production|studio)|"
    r"(?:feature|capability|date|implementation|workflow|equipment change) (?:is |are )?(?:promised|announced)|"
    r"concept bulletin|narrative color|grants? no clearance|authoritative game data|no gameplay state)\b",
    re.IGNORECASE,
)
UNSUPPORTED_MECHANIC = re.compile(
    r"\b(?:press|click|tap) (?:the |a )?(?:button|key)|\b(?:unlocks?|awards?|changes?) (?:the )?(?:game|mechanic|production)|"
    r"\bgameplay (?:feature|effect|status)\b",
    re.IGNORECASE,
)
IMPERSONATION = re.compile(
    r"\b(?:imitat(?:e|es|ing|ion)|impersonat(?:e|es|ing|ion)|in the (?:voice|style) of|sound(?:s|ing)? like)\b",
    re.IGNORECASE,
)

DROP_SENTENCE = re.compile(
    r"(?:"
    r"\b(?:no|not) (?:real|actual|project: studio)\b|"
    r"\bnot (?:a|an) (?:production|studio|real)\b|"
    r"\bany (?:real|actual|future)\b.*\b(?:require|depend|must come)\b|"
    r"\b(?:makes|carries|announces|predicts) no\b|"
    r"\bno .* (?:is promised|is announced|feature is promised)\b|"
    r"\b(?:remains|exists) (?:story material|only in this concept)\b|"
    r"\bit is (?:a demonstration only|narrative color)\b|"
    r"\bthis (?:describes|bulletin announces) no\b|"
    r"\bno gameplay state\b|"
    r"\bauthoritative game data\b|"
    r"\bwithout pretending the future has already happened\b"
    r")",
    re.IGNORECASE,
)

REPLACEMENTS: tuple[tuple[re.Pattern[str], str], ...] = (
    (re.compile(r"\bnon-authoritative future story\b", re.I), "future studio column"),
    (re.compile(r"\bfictional hollywood news\b", re.I), "studio news"),
    (re.compile(r"\bfictional industry\b", re.I), "industry"),
    (re.compile(r"\bfictional advertisement\b", re.I), "advertisement"),
    (re.compile(r"\bfictional commercial\b", re.I), "commercial"),
    (re.compile(r"\bfictional message\b", re.I), "message"),
    (re.compile(r"\bfictional program\b", re.I), "program"),
    (re.compile(r"\bfictional service\b", re.I), "service"),
    (re.compile(r"\bfictional lot\b", re.I), "picture lot"),
    (re.compile(r"\bfictional studio\b", re.I), "studio"),
    (re.compile(r"\bfictional city\b", re.I), "city"),
    (re.compile(r"\bfictional crew(?:s)?\b", re.I), "crew"),
    (re.compile(r"\bfictional (?:picture|film|production|team|camera department|sound editor|review system|future service)\b", re.I), lambda m: m.group(0).split(" ", 1)[1]),
    (re.compile(r"\bimaginary soundstage\b", re.I), "soundstage"),
    (re.compile(r"\bimaginary lot\b", re.I), "working lot"),
    (re.compile(r"\bimaginary city\b", re.I), "city"),
    (re.compile(r"\bimaginary (?:afternoon|team|engineering desk|production office|archive|editor|car|guests|entrances|soup)\b", re.I), lambda m: m.group(0).split(" ", 1)[1]),
    (re.compile(r"\bimaginary\b", re.I), "studio"),
    (re.compile(r"\bmake[- ]believe\b", re.I), "studio"),
    (re.compile(r"\bfictional\b", re.I), "studio"),
    (re.compile(r"\bour story world\b", re.I), "the picture lot"),
    (re.compile(r"\bstory-world\b", re.I), "studio"),
    (re.compile(r"\bstory world\b", re.I), "lot"),
    (re.compile(r"\bin our story\b", re.I), "on the lot"),
    (re.compile(r"\bconcept-message\b", re.I), "message"),
    (re.compile(r"\bconcept story\b", re.I), "studio story"),
    (re.compile(r"\bconcept bulletin\b", re.I), "studio bulletin"),
    (re.compile(r"\bnon-authoritative\b", re.I), ""),
    (re.compile(r"\bimagined\b", re.I), ""),
    (re.compile(r"\binvented\b", re.I), ""),
    (re.compile(r"\bimagines\b", re.I), "describes"),
)


def sentence_chunks(text: str) -> list[str]:
    return [chunk.strip() for chunk in re.split(r"(?<=[.!?])\s+", text.strip()) if chunk.strip()]


def clean_spoken(text: str) -> str:
    text = re.sub(
        r"without pretending the future has already happened",
        "with another studio story",
        text,
        flags=re.IGNORECASE,
    )
    kept = [sentence for sentence in sentence_chunks(text) if not DROP_SENTENCE.search(sentence)]
    cleaned = " ".join(kept)
    for pattern, replacement in REPLACEMENTS:
        cleaned = pattern.sub(replacement, cleaned)
    cleaned = re.sub(r"\b(?:in|across|from) our studio studio\b", "on our studio", cleaned, flags=re.I)
    cleaned = re.sub(r"\bstudio studio\b", "studio", cleaned, flags=re.I)
    cleaned = re.sub(r"\bstudio’s studio\b", "studio’s", cleaned, flags=re.I)
    cleaned = re.sub(r"\bour studio lot\b", "our lot", cleaned, flags=re.I)
    cleaned = re.sub(r"\b(?:picture lot|studio) world\b", "lot", cleaned, flags=re.I)
    cleaned = re.sub(r"\bstudio Project Studio\b", "Project Studio", cleaned, flags=re.I)
    cleaned = re.sub(r"\bstudio 2030s\b", "2030s", cleaned, flags=re.I)
    cleaned = re.sub(r"\ban working\b", "a working", cleaned, flags=re.I)
    cleaned = re.sub(r"\ban soundstage\b", "a soundstage", cleaned, flags=re.I)
    cleaned = re.sub(r"\ban studio\b", "a studio", cleaned, flags=re.I)
    cleaned = re.sub(r"\bThis is a advertisement\b", "This is an advertisement", cleaned, flags=re.I)
    cleaned = re.sub(r"\bthe story is studio\b", "the scene is ready", cleaned, flags=re.I)
    cleaned = re.sub(r"\bthe studio lot service\b", "the lot service", cleaned, flags=re.I)
    cleaned = re.sub(r"\s+([,.;:!?])", r"\1", cleaned)
    cleaned = re.sub(r" {2,}", " ", cleaned).strip()
    if not cleaned:
        raise ValueError(f"cleaning removed the complete spoken unit: {text}")
    return cleaned


def lint_text(stable_id: str, field: str, text: str) -> list[dict[str, str]]:
    checks = (
        ("SPOKEN_META_FICTION", META_TERMS),
        ("TODO", TODO),
        ("INTERNAL_ID", INTERNAL_ID),
        ("UNCAPTURED_VARIABLE", VARIABLE),
        ("PLACEHOLDER_LEGAL_LANGUAGE", PLACEHOLDER_LEGAL),
        ("UNSUPPORTED_MECHANIC", UNSUPPORTED_MECHANIC),
        ("REAL_PERSON_IMPERSONATION_CUE", IMPERSONATION),
    )
    return [
        {"stable_id": stable_id, "field": field, "rule": name, "match": match.group(0)}
        for name, pattern in checks
        for match in pattern.finditer(text)
    ]


def lint_units(units: list[dict[str, Any]], fields: tuple[str, ...] = ("transcript", "caption")) -> list[dict[str, str]]:
    findings: list[dict[str, str]] = []
    for unit in units:
        stable_id = str(unit.get("stable_id") or unit.get("eventId") or "UNKNOWN")
        for field in fields:
            value = unit.get(field)
            if isinstance(value, str):
                findings.extend(lint_text(stable_id, field, value))
    return findings


def csv_payload(rows: list[dict[str, Any]]) -> str:
    fields = [
        "stable_id", "epoch_code", "epoch_alias", "function", "content_class",
        "presenter_id", "transcript", "caption", "status",
    ]
    buffer = io.StringIO(newline="")
    writer = csv.DictWriter(buffer, fieldnames=fields, extrasaction="ignore", lineterminator="\n")
    writer.writeheader()
    writer.writerows(rows)
    return buffer.getvalue()


def build() -> dict[str, Any]:
    source = json.loads(SOURCE_BANK.read_text(encoding="utf-8"))
    original_findings = lint_units(source["units"])
    presenters = ("PRESENTER-MAE-CALDER", "PRESENTER-ARTHUR-VALE", "PRESENTER-RINA-SHORE")
    cleaned_units: list[dict[str, Any]] = []
    for index, unit in enumerate(source["units"]):
        cleaned = dict(unit)
        cleaned_text = clean_spoken(unit["transcript"])
        cleaned["source_transcript_sha256"] = __import__("hashlib").sha256(unit["transcript"].encode()).hexdigest()
        cleaned["transcript"] = cleaned_text
        cleaned["caption"] = cleaned_text
        cleaned["caption_parity"] = "VERBATIM"
        cleaned["content_class"] = "DECORATIVE"
        cleaned["presenter_id"] = presenters[(index + int(unit["epoch_code"][1:])) % len(presenters)]
        cleaned["status"] = "PROTOTYPE_ONLY"
        cleaned_units.append(cleaned)
    findings = lint_units(cleaned_units)
    parity_failures = [unit["stable_id"] for unit in cleaned_units if unit["transcript"] != unit["caption"]]
    if findings or parity_failures:
        raise RuntimeError(f"cleaned bank failed lint: findings={findings[:8]} parity={parity_failures[:8]}")
    output = {
        "schema_version": "project-studio-radio-clean-copy/v1",
        "source_bank": {"path": str(SOURCE_BANK), "sha256": sha256_file(SOURCE_BANK)},
        "generated_utc": utc_now(),
        "status": "PROTOTYPE_ONLY",
        "content_boundary": "All preserved bank items remain DECORATIVE. Functional runtime bulletins use separately typed lab fixtures.",
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
        "schema": "project-studio-radio-copy-lint/v1",
        "tool_version": TOOL_VERSION,
        "generated_utc": utc_now(),
        "status": "PASS",
        "source_units": len(source["units"]),
        "cleaned_units": len(cleaned_units),
        "source_finding_count": len(original_findings),
        "source_finding_rules": dict(sorted(Counter(item["rule"] for item in original_findings).items())),
        "cleaned_finding_count": len(findings),
        "caption_parity_failures": parity_failures,
        "output": {"path": str(OUTPUT_BANK), "sha256": sha256_file(OUTPUT_BANK)},
        "limitations": [
            "A deterministic linter proves only its registered patterns and caption byte parity.",
            "Human editorial, historical, localization, performance, and legal review remain required.",
        ],
    }
    atomic_write_json(LINT_REPORT, report)
    return report


def self_test() -> None:
    assert clean_spoken("A fictional message from an imaginary desk.") == "A message from a studio desk."
    assert lint_text("X", "spoken", "TODO: imitate a real host")
    assert not lint_text("X", "spoken", "The picture lot opens for another working day.")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--self-test", action="store_true")
    args = parser.parse_args()
    if args.self_test:
        self_test()
    print(json.dumps(build(), indent=2, sort_keys=True))


if __name__ == "__main__":
    main()
