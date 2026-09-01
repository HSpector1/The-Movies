#!/usr/bin/env python3
"""Reconcile canonical and sole-round R1 machine-jury evidence.

The output is the shortlist input pool, not a human judgment.  Canonical and
R1 rows must already have cleared their respective technical gates.  Technical
rejections are recorded in the summary but never emitted.  Severe semantic
machine-jury mismatches remain present as MACHINE-REJECTED so that evidence is
not erased while downstream selectors still fail closed.
"""

from __future__ import annotations

import argparse
import csv
import io
import json
import math
import os
import re
import tempfile
from collections import Counter, defaultdict
from dataclasses import dataclass
from pathlib import Path
from typing import Any

from foundry_common import MARATHON_ROOT, PILOT_ROOT, sha256_file


RECONCILER_VERSION = "audio-foundry-jury-pool-reconciler-v1"
RIGHTS_STATUS = "PROTOTYPE_ONLY"
SIGNAL_STATUS = "ANALYSIS SIGNAL ONLY"

CANONICAL_JURY = MARATHON_ROOT / "03_analysis" / "all-candidates-v3-machine-jury.csv"
RESCUE_JURY = MARATHON_ROOT / "03_analysis" / "rescue-r1-machine-jury.csv"
RESCUE_INVENTORY = MARATHON_ROOT / "01_catalogue" / "rescue-r1-inventory.csv"
RESCUE_RECONCILIATION = MARATHON_ROOT / "03_analysis" / "rescue-r1-reconciliation.csv"
CANONICAL_SCREENING = MARATHON_ROOT / "03_analysis" / "screening-v3-final.csv"
OUTPUT = MARATHON_ROOT / "03_analysis" / "shortlist-ready-all-candidates-v3-machine-jury.csv"

EPOCHS = (
    "acoustic_electrical_1920_1932",
    "network_sound_1933_1945",
    "tape_hifi_1946_1959",
    "multitrack_fm_1960_1974",
    "format_plurality_1975_1986",
    "sampled_digital_1987_1999",
    "networked_hybrid_2000_2014",
    "streaming_plural_2015_2029",
    "legacy_future_2030_2040",
)

REQUIRED_JURY_FIELDS = {
    "candidate_id",
    "epoch",
    "prompt_id",
    "prompt_family",
    "seed",
    "absolute_path",
    "source_sha256",
    "source_screening_status",
    "family_rank",
    "machine_label",
    "machine_score",
    "severe_machine_mismatch",
    "mismatch_reasons",
    "rights_status",
}

REQUIRED_SCREENING_FIELDS = {
    "candidate_id",
    "epoch",
    "prompt_id",
    "absolute_path",
    "source_sha256",
    "technical_automatic_pass",
    "screening_status",
    "automatic_failure_reasons",
    "rights_status",
}

REQUIRED_RESCUE_INVENTORY_FIELDS = {
    "candidate_id",
    "epoch",
    "prompt_id",
    "parent_prompt_id",
    "absolute_path",
    "sha256",
    "bytes",
    "rescue_round",
    "revision_id",
    "failure_pattern",
    "rights_status",
}

REQUIRED_RESCUE_RECONCILIATION_FIELDS = {
    "candidate_id",
    "epoch",
    "source_sha256",
    "technical_automatic_pass",
    "severe_machine_mismatch",
    "machine_score",
    "rescue_machine_status",
    "rescue_machine_reasons",
    "rescue_round",
    "rights_status",
}

SHA256_RE = re.compile(r"^[0-9a-f]{64}$")


class ReconciliationError(RuntimeError):
    """A fail-closed evidence or identity inconsistency."""


@dataclass(frozen=True)
class Inputs:
    canonical_jury: Path
    rescue_jury: Path
    rescue_inventory: Path
    rescue_reconciliation: Path
    canonical_screening: Path
    output: Path
    verify_source_files: bool = True


def read_csv(path: Path, required: set[str]) -> tuple[list[dict[str, str]], list[str]]:
    if not path.is_file():
        raise ReconciliationError(f"required evidence is absent: {path}")
    with path.open(newline="", encoding="utf-8-sig") as handle:
        reader = csv.DictReader(handle)
        fields = list(reader.fieldnames or [])
        missing = sorted(required - set(fields))
        if missing:
            raise ReconciliationError(f"{path} lacks fields: {missing}")
        rows = list(reader)
    if not rows:
        raise ReconciliationError(f"required evidence is empty: {path}")
    return rows, fields


def csv_text(rows: list[dict[str, Any]], fields: list[str]) -> str:
    buffer = io.StringIO(newline="")
    writer = csv.DictWriter(buffer, fieldnames=fields, extrasaction="ignore", lineterminator="\n")
    writer.writeheader()
    writer.writerows(rows)
    return buffer.getvalue()


def is_true(value: Any) -> bool:
    return str(value).strip().upper() in {"TRUE", "1", "YES", "PASS", "PASSED"}


def unique_map(rows: list[dict[str, str]], label: str) -> dict[str, dict[str, str]]:
    output: dict[str, dict[str, str]] = {}
    for row in rows:
        candidate_id = row.get("candidate_id", "").strip()
        if not candidate_id:
            raise ReconciliationError(f"{label} contains a blank candidate_id")
        if candidate_id in output:
            raise ReconciliationError(f"{label} repeats candidate_id {candidate_id}")
        output[candidate_id] = row
    return output


def validate_hash(value: str, context: str) -> None:
    if not SHA256_RE.fullmatch(value):
        raise ReconciliationError(f"{context} has invalid SHA-256: {value!r}")


def validate_rights(rows: list[dict[str, str]], label: str) -> None:
    wrong = sorted(row["candidate_id"] for row in rows if row.get("rights_status") != RIGHTS_STATUS)
    if wrong:
        raise ReconciliationError(f"{label} contains non-{RIGHTS_STATUS} rows: {wrong}")


def validate_epoch(epoch: str, candidate_id: str) -> None:
    if epoch not in EPOCHS:
        raise ReconciliationError(f"{candidate_id} has unknown epoch {epoch!r}")


def source_identity(row: dict[str, str], *, inventory: bool = False) -> tuple[str, str]:
    path = row.get("absolute_path", "").strip()
    digest = (row.get("sha256") if inventory else row.get("source_sha256", "")).strip()
    if not path:
        raise ReconciliationError(f"{row.get('candidate_id')} has no absolute_path")
    validate_hash(digest, row.get("candidate_id", "<unknown>"))
    return path, digest


def assert_identity(
    left: dict[str, str],
    right: dict[str, str],
    context: str,
    *,
    left_inventory: bool = False,
    right_inventory: bool = False,
) -> None:
    left_path, left_hash = source_identity(left, inventory=left_inventory)
    right_path, right_hash = source_identity(right, inventory=right_inventory)
    if left_path != right_path or left_hash != right_hash:
        raise ReconciliationError(
            f"{context} source identity differs: ({left_path}, {left_hash}) != ({right_path}, {right_hash})"
        )
    if left.get("epoch") != right.get("epoch"):
        raise ReconciliationError(f"{context} epoch differs: {left.get('epoch')} != {right.get('epoch')}")


def validate_jury_row(row: dict[str, str], label: str) -> None:
    candidate_id = row["candidate_id"]
    validate_epoch(row["epoch"], candidate_id)
    source_identity(row)
    if row["source_screening_status"] != "MACHINE_ELIGIBLE":
        raise ReconciliationError(
            f"{label} jury row did not clear its technical source gate: {candidate_id}: "
            f"{row['source_screening_status']}"
        )
    try:
        score = float(row["machine_score"])
    except ValueError as exc:
        raise ReconciliationError(f"{label} jury row has invalid machine_score: {candidate_id}") from exc
    if not math.isfinite(score):
        raise ReconciliationError(f"{label} jury row has nonfinite machine_score: {candidate_id}")
    severe = is_true(row["severe_machine_mismatch"])
    rejected = row["machine_label"] == "MACHINE-REJECTED"
    if severe != rejected:
        raise ReconciliationError(
            f"{label} jury severe/rejected law differs for {candidate_id}: "
            f"severe={row['severe_machine_mismatch']}, label={row['machine_label']}"
        )
    if severe and not row.get("mismatch_reasons", "").strip():
        raise ReconciliationError(f"{label} severe jury row lacks mismatch reasons: {candidate_id}")
    if row.get("rights_status") != RIGHTS_STATUS:
        raise ReconciliationError(f"{label} jury row has unexpected rights status: {candidate_id}")


def validate_canonical_screening(rows: list[dict[str, str]]) -> tuple[dict[str, dict[str, str]], set[str]]:
    if len(rows) != 144:
        raise ReconciliationError(f"canonical Screening V3 must contain 144 rows, found {len(rows)}")
    mapping = unique_map(rows, "canonical Screening V3")
    validate_rights(rows, "canonical Screening V3")
    families: dict[str, list[dict[str, str]]] = defaultdict(list)
    for row in rows:
        validate_epoch(row["epoch"], row["candidate_id"])
        source_identity(row)
        families[row["prompt_id"]].append(row)
    if len(families) != 36 or any(len(group) != 4 for group in families.values()):
        raise ReconciliationError("canonical Screening V3 is not exactly 36 parent families x four candidates")
    if {row["epoch"] for row in rows} != set(EPOCHS):
        raise ReconciliationError("canonical Screening V3 does not contain exactly the nine commissioning epochs")
    return mapping, set(families)


def validate_rescue_inventory(rows: list[dict[str, str]], parent_families: set[str]) -> dict[str, dict[str, str]]:
    if len(rows) != 20:
        raise ReconciliationError(f"R1 inventory must contain exactly 20 rows, found {len(rows)}")
    mapping = unique_map(rows, "R1 inventory")
    validate_rights(rows, "R1 inventory")
    family_seeds: dict[str, set[int]] = defaultdict(set)
    for row in rows:
        candidate_id = row["candidate_id"]
        validate_epoch(row["epoch"], candidate_id)
        source_identity(row, inventory=True)
        parent = row["parent_prompt_id"]
        revision = row["revision_id"]
        if parent not in parent_families:
            raise ReconciliationError(f"{candidate_id} maps to unknown canonical parent family {parent}")
        if row["rescue_round"] != "R1" or row["prompt_id"] != revision or revision != f"{parent}-R1":
            raise ReconciliationError(f"{candidate_id} violates sole-round R1 parent/revision identity")
        if not candidate_id.startswith(f"{revision}__seed-"):
            raise ReconciliationError(f"{candidate_id} does not encode its R1 revision ID")
        try:
            family_seeds[parent].add(int(row["seed"]))
        except ValueError as exc:
            raise ReconciliationError(f"{candidate_id} has a nonnumeric rescue seed") from exc
        if not row.get("failure_pattern", "").strip():
            raise ReconciliationError(f"{candidate_id} lacks preserved R1 failure_pattern provenance")
    expected_seeds = {262147, 324503, 400009, 499979}
    if len(family_seeds) != 5 or any(seeds != expected_seeds for seeds in family_seeds.values()):
        raise ReconciliationError("R1 inventory is not five parent families x four fixed rescue seeds")
    return mapping


def validate_rescue_reconciliation(
    rows: list[dict[str, str]], rescue_inventory: dict[str, dict[str, str]]
) -> dict[str, dict[str, str]]:
    all_rows = unique_map(rows, "R1 Screening V3 reconciliation")
    if set(all_rows) != set(rescue_inventory):
        raise ReconciliationError(
            "R1 reconciliation IDs do not exactly equal the 20 generated rescue raws: "
            f"missing={sorted(set(rescue_inventory) - set(all_rows))}, "
            f"extra={sorted(set(all_rows) - set(rescue_inventory))}"
        )
    rescue_rows = all_rows
    for candidate_id, row in rescue_rows.items():
        validate_epoch(row["epoch"], candidate_id)
        inventory = rescue_inventory[candidate_id]
        validate_hash(row["source_sha256"], candidate_id)
        if row["source_sha256"] != inventory["sha256"] or row["epoch"] != inventory["epoch"]:
            raise ReconciliationError(f"R1 inventory/reconciliation source identity differs: {candidate_id}")
        analysis_prompt_id = row.get("revision_id") or row.get("prompt_id") or ""
        if analysis_prompt_id != inventory["prompt_id"]:
            raise ReconciliationError(f"R1 inventory/reconciliation prompt ID differs: {candidate_id}")
        if row.get("parent_prompt_id") and row["parent_prompt_id"] != inventory["parent_prompt_id"]:
            raise ReconciliationError(f"R1 inventory/reconciliation parent prompt ID differs: {candidate_id}")
        if row["rescue_round"] not in {"R1", "R1_ONLY"}:
            raise ReconciliationError(f"R1 reconciliation has an unsupported rescue round: {candidate_id}")
        if row.get("rights_status") != RIGHTS_STATUS:
            raise ReconciliationError(f"R1 reconciliation has unexpected rights status: {candidate_id}")
        passed = is_true(row["technical_automatic_pass"])
        status = row["rescue_machine_status"]
        severe = is_true(row["severe_machine_mismatch"])
        reasons = row["rescue_machine_reasons"].strip()
        if passed and severe != (status == "MACHINE_REJECTED"):
            raise ReconciliationError(f"R1 severe jury/status law differs: {candidate_id}")
        if passed and not severe and status != "MACHINE_ELIGIBLE":
            raise ReconciliationError(f"R1 nonsevere pass is not machine eligible: {candidate_id}")
        if not passed and status != "MACHINE_REJECTED":
            raise ReconciliationError(f"R1 technical rejection is not machine rejected: {candidate_id}")
        if not passed and not reasons:
            raise ReconciliationError(f"R1 technical rejection lacks failure reasons: {candidate_id}")
        if passed:
            try:
                score = float(row["machine_score"])
            except ValueError as exc:
                raise ReconciliationError(f"R1 technical pass lacks a valid reconciled machine score: {candidate_id}") from exc
            if not math.isfinite(score):
                raise ReconciliationError(f"R1 reconciled machine score is nonfinite: {candidate_id}")
        elif row["machine_score"].strip() or row["severe_machine_mismatch"].strip():
            raise ReconciliationError(f"R1 technical rejection improperly carries jury analysis: {candidate_id}")
    return rescue_rows


def rescue_reconciliation_status(row: dict[str, str]) -> str:
    return row.get("rescue_machine_status") or row.get("screening_status") or (
        "MACHINE_ELIGIBLE" if is_true(row.get("technical_automatic_pass", "")) else "MACHINE_REJECTED"
    )


def rescue_reconciliation_reasons(row: dict[str, str]) -> str:
    return row.get("rescue_machine_reasons") or row.get("automatic_failure_reasons", "")


def verify_source_file(row: dict[str, str], expected_bytes: str | None, allowed_roots: tuple[Path, ...] | None) -> None:
    path_text, expected_hash = source_identity(row)
    path = Path(path_text)
    if not path.is_file() or path.is_symlink():
        raise ReconciliationError(f"raw source is missing, non-file, or symlinked: {path}")
    resolved = path.resolve()
    if allowed_roots is not None:
        in_scope = False
        for root in allowed_roots:
            try:
                resolved.relative_to(root.resolve())
                in_scope = True
            except ValueError:
                pass
        if not in_scope:
            raise ReconciliationError(f"raw source is outside authorized evidence roots: {resolved}")
    if expected_bytes and path.stat().st_size != int(expected_bytes):
        raise ReconciliationError(f"raw source byte count differs: {path}")
    actual_hash = sha256_file(path)
    if actual_hash != expected_hash:
        raise ReconciliationError(f"raw source hash differs: {path}: expected {expected_hash}, got {actual_hash}")


def technical_pass_ids(rows: dict[str, dict[str, str]]) -> set[str]:
    return {candidate_id for candidate_id, row in rows.items() if is_true(row["technical_automatic_pass"])}


def evidence_record(path: Path, row_count: int) -> dict[str, Any]:
    return {
        "path": str(path),
        "bytes": path.stat().st_size,
        "sha256": sha256_file(path),
        "rows": row_count,
    }


def output_fields(canonical_fields: list[str], rescue_fields: list[str]) -> list[str]:
    union = list(canonical_fields) + [field for field in rescue_fields if field not in canonical_fields]
    additions_after = {
        "prompt_id": ["analysis_prompt_id", "parent_prompt_id", "revision_id", "rescue_round"],
        "prompt_family": ["analysis_prompt_family", "failure_pattern"],
        "source_screening_status": [
            "source_class",
            "technical_automatic_pass",
            "technical_screening_status",
            "technical_failure_reasons",
            "rescue_reconciliation_status",
            "rescue_reconciliation_reasons",
        ],
        "family_rank": ["analysis_family_rank"],
        "machine_label": ["analysis_machine_label"],
    }
    fields: list[str] = []
    for field in union:
        fields.append(field)
        fields.extend(item for item in additions_after.get(field, []) if item not in fields)
    fields.extend(
        item
        for item in (
            "canonical_screening_v3_sha256",
            "rescue_inventory_sha256",
            "rescue_reconciliation_sha256",
            "jury_pool_reconciler_version",
        )
        if item not in fields
    )
    return fields


def normalize_row(
    jury: dict[str, str],
    technical: dict[str, str],
    *,
    canonical_screening_hash: str,
    rescue_inventory_hash: str,
    rescue_reconciliation_hash: str,
    rescue_inventory: dict[str, str] | None,
) -> dict[str, Any]:
    row: dict[str, Any] = dict(jury)
    row["analysis_prompt_id"] = jury["prompt_id"]
    row["analysis_prompt_family"] = jury["prompt_family"]
    row["analysis_family_rank"] = jury["family_rank"]
    row["analysis_machine_label"] = jury["machine_label"]
    row["technical_automatic_pass"] = "TRUE"
    if rescue_inventory is None:
        row["technical_screening_status"] = technical["screening_status"]
        row["technical_failure_reasons"] = technical.get("automatic_failure_reasons", "")
        row["rescue_reconciliation_status"] = ""
        row["rescue_reconciliation_reasons"] = ""
    else:
        row["technical_screening_status"] = "MACHINE_ELIGIBLE"
        row["technical_failure_reasons"] = ""
        row["rescue_reconciliation_status"] = rescue_reconciliation_status(technical)
        row["rescue_reconciliation_reasons"] = rescue_reconciliation_reasons(technical)
    row["source_screening_status"] = "MACHINE_ELIGIBLE"
    row["source_class"] = technical.get("source_class", "CANONICAL_SCREENING_V3")
    row["canonical_screening_v3_sha256"] = canonical_screening_hash
    row["rescue_inventory_sha256"] = rescue_inventory_hash if rescue_inventory else ""
    row["rescue_reconciliation_sha256"] = rescue_reconciliation_hash if rescue_inventory else ""
    row["jury_pool_reconciler_version"] = RECONCILER_VERSION
    row["rights_status"] = RIGHTS_STATUS
    if rescue_inventory is None:
        row["parent_prompt_id"] = ""
        row["revision_id"] = ""
        row["rescue_round"] = ""
        row["failure_pattern"] = ""
    else:
        parent = rescue_inventory["parent_prompt_id"]
        row["prompt_id"] = parent
        row["parent_prompt_id"] = parent
        row["revision_id"] = rescue_inventory["revision_id"]
        row["rescue_round"] = "R1"
        row["failure_pattern"] = rescue_inventory["failure_pattern"]
        row["source_class"] = "RESCUE_R1_SCREENING_V3"
    return row


def rerank_parent_families(rows: list[dict[str, Any]]) -> None:
    grouped: dict[str, list[dict[str, Any]]] = defaultdict(list)
    for row in rows:
        grouped[row["prompt_id"]].append(row)
    for family_rows in grouped.values():
        ordered = sorted(
            family_rows,
            key=lambda row: (
                is_true(row["severe_machine_mismatch"]),
                -float(row["machine_score"]),
                row["candidate_id"],
            ),
        )
        eligible_rank = 0
        for family_rank, row in enumerate(ordered, start=1):
            row["family_rank"] = str(family_rank)
            if is_true(row["severe_machine_mismatch"]):
                row["machine_label"] = "MACHINE-REJECTED"
            else:
                eligible_rank += 1
                row["machine_label"] = (
                    "MACHINE-PREFERRED"
                    if eligible_rank == 1
                    else "MACHINE-ALTERNATE"
                    if eligible_rank == 2
                    else "MACHINE-ELIGIBLE"
                )


def publish_once_or_same(path: Path, payload: bytes) -> None:
    if path.exists():
        if not path.is_file() or path.read_bytes() != payload:
            raise ReconciliationError(f"output exists with different content; refusing overwrite: {path}")
        return
    path.parent.mkdir(parents=True, exist_ok=True)
    descriptor, temp_name = tempfile.mkstemp(prefix=f".{path.name}.", suffix=".tmp", dir=path.parent)
    temp_path = Path(temp_name)
    try:
        with os.fdopen(descriptor, "wb") as handle:
            handle.write(payload)
            handle.flush()
            os.fsync(handle.fileno())
        try:
            os.link(temp_path, path)
        except FileExistsError as exc:
            raise ReconciliationError(f"output appeared during no-overwrite publication: {path}") from exc
    finally:
        temp_path.unlink(missing_ok=True)


def reconcile(inputs: Inputs, allowed_roots: tuple[Path, ...] | None = None) -> dict[str, Any]:
    canonical_jury_rows, canonical_jury_fields = read_csv(inputs.canonical_jury, REQUIRED_JURY_FIELDS)
    rescue_jury_rows, rescue_jury_fields = read_csv(inputs.rescue_jury, REQUIRED_JURY_FIELDS)
    rescue_inventory_rows, _ = read_csv(inputs.rescue_inventory, REQUIRED_RESCUE_INVENTORY_FIELDS)
    rescue_reconciliation_rows, _ = read_csv(
        inputs.rescue_reconciliation, REQUIRED_RESCUE_RECONCILIATION_FIELDS
    )
    canonical_screening_rows, _ = read_csv(inputs.canonical_screening, REQUIRED_SCREENING_FIELDS)

    canonical_screening, parent_families = validate_canonical_screening(canonical_screening_rows)
    rescue_inventory = validate_rescue_inventory(rescue_inventory_rows, parent_families)
    rescue_reconciliation = validate_rescue_reconciliation(rescue_reconciliation_rows, rescue_inventory)

    canonical_jury = unique_map(canonical_jury_rows, "canonical machine jury")
    canonical_pass = technical_pass_ids(canonical_screening)
    if set(canonical_jury) != canonical_pass:
        raise ReconciliationError(
            "canonical machine jury IDs do not exactly equal canonical technical-pass IDs: "
            f"missing={sorted(canonical_pass - set(canonical_jury))}, "
            f"extra={sorted(set(canonical_jury) - canonical_pass)}"
        )
    for candidate_id, row in canonical_jury.items():
        validate_jury_row(row, "canonical")
        assert_identity(row, canonical_screening[candidate_id], f"canonical jury/Screening V3 {candidate_id}")
        if row["prompt_id"] != canonical_screening[candidate_id]["prompt_id"]:
            raise ReconciliationError(f"canonical prompt identity differs: {candidate_id}")
        screen = canonical_screening[candidate_id]
        if screen.get("severe_machine_mismatch", "") and is_true(screen["severe_machine_mismatch"]) != is_true(
            row["severe_machine_mismatch"]
        ):
            raise ReconciliationError(f"canonical severe mismatch differs from Screening V3: {candidate_id}")

    rescue_jury_all = unique_map(rescue_jury_rows, "R1 machine jury")
    rescue_pass = technical_pass_ids(rescue_reconciliation)
    rejected_rescue_jury = sorted((set(rescue_jury_all) & set(rescue_inventory)) - rescue_pass)
    if rejected_rescue_jury:
        raise ReconciliationError(f"R1 machine jury contains technical-rejected rescue raws: {rejected_rescue_jury}")
    unknown_rescue_jury = sorted(set(rescue_jury_all) - set(rescue_inventory) - canonical_pass)
    if unknown_rescue_jury:
        raise ReconciliationError(f"R1 machine jury contains unknown candidate IDs: {unknown_rescue_jury}")
    rescue_jury = {candidate_id: rescue_jury_all[candidate_id] for candidate_id in rescue_pass if candidate_id in rescue_jury_all}
    if set(rescue_jury) != rescue_pass:
        raise ReconciliationError(
            "R1 machine jury IDs do not exactly equal R1 technical-pass IDs: "
            f"missing={sorted(rescue_pass - set(rescue_jury))}"
        )
    for candidate_id, row in rescue_jury.items():
        validate_jury_row(row, "R1")
        inventory = rescue_inventory[candidate_id]
        technical = rescue_reconciliation[candidate_id]
        assert_identity(row, inventory, f"R1 jury/inventory {candidate_id}", right_inventory=True)
        if row["source_sha256"] != technical["source_sha256"] or row["epoch"] != technical["epoch"]:
            raise ReconciliationError(f"R1 jury/reconciliation source identity differs: {candidate_id}")
        if row["prompt_id"] != inventory["revision_id"] or row["prompt_id"] != (
            technical.get("revision_id") or technical.get("prompt_id")
        ):
            raise ReconciliationError(f"R1 analysis prompt/revision identity differs: {candidate_id}")
        if is_true(row["severe_machine_mismatch"]) != is_true(technical["severe_machine_mismatch"]):
            raise ReconciliationError(f"R1 jury/reconciliation severe mismatch differs: {candidate_id}")
        if row["machine_score"] != technical["machine_score"]:
            raise ReconciliationError(f"R1 jury/reconciliation machine score differs: {candidate_id}")
        expected_reconciled_status = (
            "MACHINE_REJECTED" if is_true(row["severe_machine_mismatch"]) else "MACHINE_ELIGIBLE"
        )
        if technical["rescue_machine_status"] != expected_reconciled_status:
            raise ReconciliationError(f"R1 jury/reconciliation machine status differs: {candidate_id}")
        if row["mismatch_reasons"] != technical["rescue_machine_reasons"]:
            raise ReconciliationError(f"R1 jury/reconciliation mismatch reasons differ: {candidate_id}")

    canonical_screening_hash = sha256_file(inputs.canonical_screening)
    rescue_inventory_hash = sha256_file(inputs.rescue_inventory)
    rescue_reconciliation_hash = sha256_file(inputs.rescue_reconciliation)
    output_rows: list[dict[str, Any]] = []
    for candidate_id, row in canonical_jury.items():
        output_rows.append(
            normalize_row(
                row,
                canonical_screening[candidate_id],
                canonical_screening_hash=canonical_screening_hash,
                rescue_inventory_hash=rescue_inventory_hash,
                rescue_reconciliation_hash=rescue_reconciliation_hash,
                rescue_inventory=None,
            )
        )
    for candidate_id, row in rescue_jury.items():
        output_rows.append(
            normalize_row(
                row,
                rescue_reconciliation[candidate_id],
                canonical_screening_hash=canonical_screening_hash,
                rescue_inventory_hash=rescue_inventory_hash,
                rescue_reconciliation_hash=rescue_reconciliation_hash,
                rescue_inventory=rescue_inventory[candidate_id],
            )
        )

    rerank_parent_families(output_rows)
    ids = [row["candidate_id"] for row in output_rows]
    hashes = [row["source_sha256"] for row in output_rows]
    if len(ids) != len(set(ids)) or len(hashes) != len(set(hashes)):
        raise ReconciliationError("shortlist-ready jury pool contains duplicate candidate IDs or source hashes")
    if {row["epoch"] for row in output_rows} != set(EPOCHS):
        raise ReconciliationError("shortlist-ready jury pool does not contain exactly the nine commissioning epochs")
    if any(not is_true(row["technical_automatic_pass"]) for row in output_rows):
        raise ReconciliationError("technical-rejected raw escaped into shortlist-ready jury pool")
    if any(row["machine_label"] == "MACHINE-REJECTED" and not is_true(row["severe_machine_mismatch"]) for row in output_rows):
        raise ReconciliationError("combined rerank created an unsupported machine rejection")
    if inputs.verify_source_files:
        for row in output_rows:
            expected_bytes = (
                rescue_inventory[row["candidate_id"]]["bytes"]
                if row["candidate_id"] in rescue_inventory
                else canonical_screening[row["candidate_id"]].get("source_bytes", "")
            )
            verify_source_file(row, expected_bytes, allowed_roots)

    epoch_order = {epoch: index for index, epoch in enumerate(EPOCHS)}
    output_rows.sort(
        key=lambda row: (
            epoch_order[row["epoch"]],
            row["prompt_id"],
            int(row["family_rank"]),
            row["candidate_id"],
        )
    )
    fields = output_fields(canonical_jury_fields, rescue_jury_fields)
    payload = csv_text(output_rows, fields).encode("utf-8")
    publish_once_or_same(inputs.output, payload)

    canonical_rejected = [row for row in canonical_screening_rows if not is_true(row["technical_automatic_pass"])]
    rescue_rejected = [row for row in rescue_reconciliation.values() if not is_true(row["technical_automatic_pass"])]
    summary = {
        "reconciler_version": RECONCILER_VERSION,
        "status": "RECONCILED_SHORTLIST_INPUT",
        "classification": SIGNAL_STATUS,
        "rights_status": RIGHTS_STATUS,
        "inputs": {
            "canonical_machine_jury": evidence_record(inputs.canonical_jury, len(canonical_jury_rows)),
            "rescue_r1_machine_jury": evidence_record(inputs.rescue_jury, len(rescue_jury_rows)),
            "rescue_r1_generation_inventory": evidence_record(inputs.rescue_inventory, len(rescue_inventory_rows)),
            "rescue_r1_screening_reconciliation": evidence_record(
                inputs.rescue_reconciliation, len(rescue_reconciliation_rows)
            ),
            "canonical_screening_v3": evidence_record(inputs.canonical_screening, len(canonical_screening_rows)),
        },
        "counts": {
            "canonical_raw": len(canonical_screening_rows),
            "canonical_technical_eligible_emitted": len(canonical_jury),
            "canonical_technical_rejected_excluded": len(canonical_rejected),
            "rescue_r1_raw": len(rescue_inventory),
            "rescue_r1_technical_eligible_emitted": len(rescue_jury),
            "rescue_r1_technical_rejected_excluded": len(rescue_rejected),
            "combined_rows": len(output_rows),
            "unique_candidate_ids": len(set(ids)),
            "unique_source_hashes": len(set(hashes)),
            "parent_families_authorized": len(parent_families),
            "parent_families_represented": len({row["prompt_id"] for row in output_rows}),
            "epochs": len({row["epoch"] for row in output_rows}),
            "machine_rejected_retained": sum(row["machine_label"] == "MACHINE-REJECTED" for row in output_rows),
            "machine_eligible_for_shortlist": sum(row["machine_label"] != "MACHINE-REJECTED" for row in output_rows),
        },
        "technical_rejections_excluded": {
            "canonical": [
                {
                    "candidate_id": row["candidate_id"],
                    "reason": rescue_reconciliation_reasons(row),
                    "source_sha256": row["source_sha256"],
                }
                for row in sorted(canonical_rejected, key=lambda item: item["candidate_id"])
            ],
            "rescue_r1": [
                {
                    "candidate_id": row["candidate_id"],
                    "reason": rescue_reconciliation_reasons(row),
                    "source_sha256": row["source_sha256"],
                }
                for row in sorted(rescue_rejected, key=lambda item: item["candidate_id"])
            ],
        },
        "mapping_law": (
            "R1 output prompt_id is the preserved canonical parent family ID; analysis_prompt_id, "
            "revision_id, rescue_round, failure_pattern, analysis_family_rank, and analysis_machine_label "
            "preserve revision-analysis provenance."
        ),
        "machine_rejection_law": (
            "Technical rejections are excluded. Severe jury mismatches remain present and MACHINE-REJECTED. "
            "Nonsevere rows are reranked within the mapped parent family."
        ),
        "output": {
            "path": str(inputs.output),
            "bytes": inputs.output.stat().st_size,
            "sha256": sha256_file(inputs.output),
            "rows": len(output_rows),
            "epochs": list(EPOCHS),
        },
        "limitations": [
            "This pool is machine evidence for provisional shortlisting, not human listening or Owner approval.",
            "Semantic scores and mismatch labels are analysis signals, not historical or cultural truth.",
            "No automated analysis establishes copyrightability, exclusivity, non-infringement, commercial clearance, or human listening quality.",
        ],
    }
    summary_path = inputs.output.with_suffix(".summary.json")
    summary_payload = (json.dumps(summary, indent=2, sort_keys=True, ensure_ascii=False) + "\n").encode("utf-8")
    publish_once_or_same(summary_path, summary_payload)
    return summary


def write_fixture_csv(path: Path, rows: list[dict[str, Any]], fields: list[str]) -> None:
    path.write_text(csv_text(rows, fields), encoding="utf-8")


def self_test() -> None:
    jury_fields = [
        "candidate_id", "epoch", "prompt_id", "prompt_family", "seed", "absolute_path",
        "source_sha256", "source_screening_status", "jury_status", "family_rank", "machine_label",
        "machine_score", "severe_machine_mismatch", "mismatch_reasons", "rights_status",
    ]
    screening_fields = [
        "candidate_id", "epoch", "prompt_id", "prompt_family", "seed", "absolute_path",
        "source_sha256", "source_bytes", "source_class", "technical_automatic_pass",
        "screening_status", "automatic_failure_reasons", "severe_machine_mismatch", "rights_status",
    ]
    inventory_fields = [
        "candidate_id", "epoch", "prompt_id", "parent_prompt_id", "prompt_family", "seed",
        "absolute_path", "sha256", "bytes", "rescue_round", "revision_id", "failure_pattern",
        "rights_status",
    ]
    rescue_reconciliation_fields = [
        "candidate_id", "revision_id", "parent_prompt_id", "epoch", "prompt_family", "seed",
        "source_sha256", "technical_automatic_pass", "severe_machine_mismatch", "machine_score",
        "rescue_machine_status", "rescue_machine_reasons", "rescue_round", "analysis_status",
        "rights_status",
    ]
    with tempfile.TemporaryDirectory(prefix="jury-pool-self-test-") as temp_name:
        root = Path(temp_name)
        raw = root / "raw"
        raw.mkdir()
        canonical_screening_rows: list[dict[str, Any]] = []
        canonical_jury_rows: list[dict[str, Any]] = []
        rescue_inventory_rows: list[dict[str, Any]] = []
        rescue_reconciliation_rows: list[dict[str, Any]] = []
        rescue_jury_rows: list[dict[str, Any]] = []

        def source(candidate_id: str) -> tuple[str, str, int]:
            path = raw / f"{candidate_id}.wav"
            payload = (candidate_id + "\n").encode("utf-8")
            path.write_bytes(payload)
            return str(path), sha256_file(path), len(payload)

        for epoch_index, epoch in enumerate(EPOCHS, start=1):
            for family_index in range(1, 5):
                prompt_id = f"E{epoch_index:02d}-{family_index:02d}"
                for candidate_index in range(1, 5):
                    candidate_id = f"{prompt_id}__seed-{candidate_index}"
                    path, digest, byte_count = source(candidate_id)
                    passed = candidate_index != 4
                    severe = candidate_index == 3
                    screen = {
                        "candidate_id": candidate_id, "epoch": epoch, "prompt_id": prompt_id,
                        "prompt_family": f"family {prompt_id}", "seed": candidate_index,
                        "absolute_path": path, "source_sha256": digest, "source_bytes": byte_count,
                        "source_class": "CANONICAL", "technical_automatic_pass": str(passed).upper(),
                        "screening_status": "MACHINE_ELIGIBLE" if passed else "MACHINE_REJECTED",
                        "automatic_failure_reasons": "" if passed else "FIXTURE_TECHNICAL_REJECTION",
                        "severe_machine_mismatch": str(severe).upper() if passed else "",
                        "rights_status": RIGHTS_STATUS,
                    }
                    canonical_screening_rows.append(screen)
                    if passed:
                        canonical_jury_rows.append({
                            "candidate_id": candidate_id, "epoch": epoch, "prompt_id": prompt_id,
                            "prompt_family": f"family {prompt_id}", "seed": candidate_index,
                            "absolute_path": path, "source_sha256": digest,
                            "source_screening_status": "MACHINE_ELIGIBLE", "jury_status": SIGNAL_STATUS,
                            "family_rank": candidate_index,
                            "machine_label": "MACHINE-REJECTED" if severe else "MACHINE-PREFERRED" if candidate_index == 1 else "MACHINE-ALTERNATE",
                            "machine_score": f"{0.9 - candidate_index / 10:.3f}",
                            "severe_machine_mismatch": str(severe).upper(),
                            "mismatch_reasons": "FIXTURE_SEVERE" if severe else "",
                            "rights_status": RIGHTS_STATUS,
                        })

        parent_ids = [f"E{index:02d}-01" for index in range(1, 6)]
        for parent_index, parent in enumerate(parent_ids, start=1):
            epoch = EPOCHS[parent_index - 1]
            revision = f"{parent}-R1"
            for seed_index, seed in enumerate((262147, 324503, 400009, 499979), start=1):
                candidate_id = f"{revision}__seed-{seed}"
                path, digest, byte_count = source(candidate_id)
                passed = seed_index <= 2
                inventory = {
                    "candidate_id": candidate_id, "epoch": epoch, "prompt_id": revision,
                    "parent_prompt_id": parent, "prompt_family": f"family {parent}", "seed": seed,
                    "absolute_path": path, "sha256": digest, "bytes": byte_count, "rescue_round": "R1",
                    "revision_id": revision, "failure_pattern": "FIXTURE_PATTERN", "rights_status": RIGHTS_STATUS,
                }
                rescue_inventory_rows.append(inventory)
                severe = passed and seed_index == 2
                score = f"{0.95 - seed_index / 10:.3f}" if passed else ""
                reasons = (
                    "FIXTURE_RESCUE_SEVERE"
                    if severe
                    else ""
                    if passed
                    else "FIXTURE_RESCUE_TECHNICAL_REJECTION"
                )
                rescue_reconciliation_rows.append({
                    "candidate_id": candidate_id, "revision_id": revision, "parent_prompt_id": parent,
                    "epoch": epoch, "prompt_family": f"family {parent}", "seed": seed,
                    "source_sha256": digest,
                    "technical_automatic_pass": str(passed).upper(),
                    "severe_machine_mismatch": str(severe).upper() if passed else "",
                    "machine_score": score,
                    "rescue_machine_status": "MACHINE_REJECTED" if severe or not passed else "MACHINE_ELIGIBLE",
                    "rescue_machine_reasons": reasons,
                    "rescue_round": "R1_ONLY", "analysis_status": SIGNAL_STATUS,
                    "rights_status": RIGHTS_STATUS,
                })
                if passed:
                    rescue_jury_rows.append({
                        "candidate_id": candidate_id, "epoch": epoch, "prompt_id": revision,
                        "prompt_family": f"family {parent}", "seed": seed, "absolute_path": path,
                        "source_sha256": digest, "source_screening_status": "MACHINE_ELIGIBLE",
                        "jury_status": SIGNAL_STATUS, "family_rank": seed_index,
                        "machine_label": "MACHINE-REJECTED" if severe else "MACHINE-PREFERRED",
                        "machine_score": score,
                        "severe_machine_mismatch": str(severe).upper(),
                        "mismatch_reasons": "FIXTURE_RESCUE_SEVERE" if severe else "",
                        "rights_status": RIGHTS_STATUS,
                    })

        paths = {
            "canonical_jury": root / "canonical-jury.csv",
            "rescue_jury": root / "rescue-jury.csv",
            "rescue_inventory": root / "rescue-inventory.csv",
            "rescue_reconciliation": root / "rescue-reconciliation.csv",
            "canonical_screening": root / "canonical-screening.csv",
            "output": root / "output.csv",
        }
        write_fixture_csv(paths["canonical_jury"], canonical_jury_rows, jury_fields)
        write_fixture_csv(paths["rescue_jury"], rescue_jury_rows, jury_fields)
        write_fixture_csv(paths["rescue_inventory"], rescue_inventory_rows, inventory_fields)
        write_fixture_csv(
            paths["rescue_reconciliation"], rescue_reconciliation_rows, rescue_reconciliation_fields
        )
        write_fixture_csv(paths["canonical_screening"], canonical_screening_rows, screening_fields)
        summary = reconcile(Inputs(**paths), allowed_roots=(raw,))
        output_rows, _ = read_csv(paths["output"], REQUIRED_JURY_FIELDS | {"analysis_prompt_id", "parent_prompt_id"})
        expected = len(canonical_jury_rows) + len(rescue_jury_rows)
        if len(output_rows) != expected or summary["counts"]["combined_rows"] != expected:
            raise AssertionError("self-test output count differs")
        rescue_output = [row for row in output_rows if row["rescue_round"] == "R1"]
        if len(rescue_output) != 10 or any(row["prompt_id"] != row["parent_prompt_id"] for row in rescue_output):
            raise AssertionError("self-test R1 parent mapping differs")
        if {row["epoch"] for row in output_rows} != set(EPOCHS):
            raise AssertionError("self-test nine-epoch invariant differs")
        rejected_ids = {
            row["candidate_id"] for row in rescue_reconciliation_rows if not is_true(row["technical_automatic_pass"])
        }
        if rejected_ids & {row["candidate_id"] for row in output_rows}:
            raise AssertionError("self-test technical exclusion differs")
        print(json.dumps({
            "self_test": "PASS",
            "canonical_screening_rows": len(canonical_screening_rows),
            "rescue_inventory_rows": len(rescue_inventory_rows),
            "combined_output_rows": len(output_rows),
            "epochs": len({row["epoch"] for row in output_rows}),
        }, sort_keys=True))


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--canonical-jury", type=Path, default=CANONICAL_JURY)
    parser.add_argument("--rescue-jury", type=Path, default=RESCUE_JURY)
    parser.add_argument("--rescue-inventory", type=Path, default=RESCUE_INVENTORY)
    parser.add_argument("--rescue-reconciliation", type=Path, default=RESCUE_RECONCILIATION)
    parser.add_argument("--canonical-screening", type=Path, default=CANONICAL_SCREENING)
    parser.add_argument("--output", type=Path, default=OUTPUT)
    parser.add_argument("--self-test", action="store_true")
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    if args.self_test:
        self_test()
        return
    allowed_roots = ((PILOT_ROOT / "02_raw").resolve(), (MARATHON_ROOT / "02_raw").resolve())
    summary = reconcile(
        Inputs(
            canonical_jury=args.canonical_jury,
            rescue_jury=args.rescue_jury,
            rescue_inventory=args.rescue_inventory,
            rescue_reconciliation=args.rescue_reconciliation,
            canonical_screening=args.canonical_screening,
            output=args.output,
        ),
        allowed_roots=allowed_roots,
    )
    print(json.dumps(summary, indent=2, sort_keys=True, ensure_ascii=False))


if __name__ == "__main__":
    try:
        main()
    except ReconciliationError as exc:
        raise SystemExit(f"JURY POOL RECONCILIATION STOPPED: {exc}") from exc
