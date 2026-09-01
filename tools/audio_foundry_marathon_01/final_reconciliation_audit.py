#!/usr/bin/env python3
"""Strict, read-mostly final reconciliation for Audio Foundry Marathon 01.

The auditor reads immutable source/manifests and writes only two atomic reports:

* 09_provenance/final-reconciliation-audit.json
* 10_logs/final-reconciliation-audit.log

It intentionally distinguishes deterministic evidence from claims which require
human listening or legal/cultural review.  It never launches Unity, an audio
player, a browser, a web server, inference, or any production application.
"""

from __future__ import annotations

import argparse
import csv
import hashlib
import json
import os
import plistlib
import re
import stat
import subprocess
import sys
import tempfile
import wave
from collections import Counter, defaultdict
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Iterable, Iterator, Mapping, Sequence


VERSION = "audio-foundry-final-reconciliation-v1"
DEFAULT_MARATHON_ROOT = Path("/Users/bruce/Project Studio Audio Foundry Marathon 01")
DEFAULT_RETURN_ROOT = Path("/Users/bruce/Desktop/Project-Studio-Audio-Return-Package-01")
DEFAULT_REPO = Path("/Users/bruce/The Movies - Audio Marathon 01")
EXPECTED_EPOCHS = (
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
EPOCH_CODES = {alias: f"E{i:02d}" for i, alias in enumerate(EXPECTED_EPOCHS, 1)}
PRIMARY_SEEDS = {104729, 130363, 155921, 196613}
RESCUE_SEEDS = {262147, 324503, 400009, 499979}
REFINEMENT_SEEDS = {602221, 700001, 800011, 900019, 1000003, 1100009, 1200017, 1300021, 1400033}
EXPECTED_GENERATION = {
    "backend": "Apple MLX / Metal",
    "canonical_model": "stabilityai/stable-audio-3-small-music",
    "canonical_model_revision": "0fef1392cd842149a2b6d445e181c97608faac06",
    "optimized_weights_revision": "b5182df73f4aca4336c5c1b642ca6c44d5b085ec",
    "code_commit": "c3909628db1ae2b57bed40a493c73c67ad674dc5",
    "seconds": 120,
    "steps": 8,
    "cfg": 2.0,
    "apg": 1.0,
    "guide_audio": False,
    "lora": False,
    "hf_hub_offline": True,
}
RAW_ID_RE = re.compile(r"^[A-Z]{3}-\d{2}(?:-R1)?__seed-\d+$")
REFINEMENT_ID_RE = re.compile(r"^[A-Z]{3}-\d{2}-F1__seed-\d+$")
HEX64_RE = re.compile(r"^[0-9a-f]{64}$")
FORBIDDEN_GIT_SUFFIXES = {
    ".aac", ".aif", ".aiff", ".alac", ".bin", ".ckpt", ".flac", ".m4a",
    ".mp3", ".npz", ".ogg", ".onnx", ".opus", ".pt", ".pth", ".safetensors", ".wav",
}
SECRET_PATTERNS = {
    "private_key": re.compile(rb"-----BEGIN (?:RSA |EC |OPENSSH |DSA )?PRIVATE KEY-----"),
    "openai_key": re.compile(rb"\bsk-[A-Za-z0-9_-]{20,}\b"),
    "huggingface_token": re.compile(rb"\bhf_[A-Za-z0-9]{30,}\b"),
    "github_token": re.compile(rb"\bgh[pousr]_[A-Za-z0-9]{30,}\b"),
    "aws_access_key": re.compile(rb"\b(?:AKIA|ASIA)[A-Z0-9]{16}\b"),
    "google_api_key": re.compile(rb"\bAIza[0-9A-Za-z_-]{35}\b"),
}


def utc_now() -> str:
    return datetime.now(timezone.utc).replace(microsecond=0).isoformat().replace("+00:00", "Z")


def sha256_file(path: Path, cache: dict[tuple[str, int, int, int], str] | None = None) -> str:
    st = path.stat()
    key = (str(path.resolve()), st.st_size, st.st_mtime_ns, st.st_ino)
    if cache is not None and key in cache:
        return cache[key]
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for block in iter(lambda: handle.read(4 * 1024 * 1024), b""):
            digest.update(block)
    result = digest.hexdigest()
    if cache is not None:
        cache[key] = result
    return result


def read_json(path: Path) -> Any:
    return json.loads(path.read_text(encoding="utf-8"))


def read_csv(path: Path) -> list[dict[str, str]]:
    with path.open(newline="", encoding="utf-8-sig") as handle:
        return list(csv.DictReader(handle))


def as_bool(value: Any) -> bool:
    if isinstance(value, bool):
        return value
    return str(value).strip().upper() in {"1", "TRUE", "YES", "PASS"}


def resolved_path(value: Any, base: Path | None = None) -> Path:
    path = Path(str(value))
    if not path.is_absolute() and base is not None:
        path = base / path
    return path


def atomic_write(path: Path, data: bytes, mode: int = 0o644) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    fd, name = tempfile.mkstemp(prefix=f".{path.name}.", suffix=".tmp", dir=path.parent)
    try:
        with os.fdopen(fd, "wb") as handle:
            handle.write(data)
            handle.flush()
            os.fsync(handle.fileno())
        os.chmod(name, mode)
        os.replace(name, path)
    finally:
        try:
            os.unlink(name)
        except FileNotFoundError:
            pass


def probe_pcm_wav(path: Path) -> dict[str, Any]:
    try:
        with wave.open(str(path), "rb") as wav:
            channels = wav.getnchannels()
            sample_rate = wav.getframerate()
            sample_width = wav.getsampwidth()
            frames = wav.getnframes()
        return {
            "ok": True,
            "channels": channels,
            "sample_rate": sample_rate,
            "sample_width_bytes": sample_width,
            "frames": frames,
            "duration_seconds": round(frames / sample_rate, 9) if sample_rate else None,
        }
    except (wave.Error, EOFError, OSError) as exc:
        return {"ok": False, "error": f"{type(exc).__name__}: {exc}"}


def run_readonly(command: Sequence[str], cwd: Path | None = None) -> subprocess.CompletedProcess[str]:
    return subprocess.run(
        list(command), cwd=cwd, check=False, text=True, capture_output=True,
        env={**os.environ, "LC_ALL": "C"},
    )


def parse_sha256sums(path: Path) -> list[tuple[str, str]]:
    rows: list[tuple[str, str]] = []
    for raw in path.read_text(encoding="utf-8").splitlines():
        line = raw.strip()
        if not line or line.startswith("#"):
            continue
        match = re.match(r"^([0-9a-fA-F]{64})\s+[ *]?(.+)$", line)
        if not match:
            raise ValueError(f"invalid SHA256SUMS line: {raw!r}")
        rows.append((match.group(1).lower(), match.group(2)))
    return rows


def iter_json_values(value: Any) -> Iterator[Any]:
    if isinstance(value, dict):
        for item in value.values():
            yield from iter_json_values(item)
    elif isinstance(value, list):
        for item in value:
            yield from iter_json_values(item)
    else:
        yield value


class Auditor:
    def __init__(self, marathon_root: Path, return_root: Path, repo_root: Path) -> None:
        self.root = marathon_root.resolve()
        self.return_root = return_root.resolve()
        self.repo = repo_root.resolve()
        self.checks: list[dict[str, Any]] = []
        self.sha_cache: dict[tuple[str, int, int, int], str] = {}
        self.inventory_164: dict[str, dict[str, str]] = {}
        self.primary_selections: list[dict[str, Any]] = []

    def add(
        self,
        check_id: str,
        status: str,
        summary: str,
        *,
        mandatory: bool = True,
        evidence: Mapping[str, Any] | None = None,
        errors: Sequence[str] | None = None,
        limitations: Sequence[str] | None = None,
    ) -> None:
        if status not in {"PASS", "FAIL", "PENDING", "SKIPPED", "NOT_PROVABLE"}:
            raise ValueError(f"invalid check status: {status}")
        self.checks.append({
            "id": check_id,
            "status": status,
            "mandatory": mandatory,
            "summary": summary,
            "evidence": dict(evidence or {}),
            "errors": list(errors or []),
            "limitations": list(limitations or []),
        })

    def audited_file(
        self,
        path: Path,
        expected_sha: str,
        expected_bytes: int | str | None,
        errors: list[str],
        label: str,
    ) -> bool:
        if not path.is_file():
            errors.append(f"{label}: missing file: {path}")
            return False
        if expected_bytes not in (None, "") and path.stat().st_size != int(expected_bytes):
            errors.append(f"{label}: byte mismatch: {path}")
            return False
        actual = sha256_file(path, self.sha_cache)
        if not HEX64_RE.fullmatch(str(expected_sha).lower()) or actual != str(expected_sha).lower():
            errors.append(f"{label}: SHA-256 mismatch: {path}")
            return False
        return True

    def verify_raw_wav(self, path: Path, errors: list[str], label: str) -> bool:
        info = probe_pcm_wav(path)
        expected = {
            "channels": 2,
            "sample_rate": 44100,
            "sample_width_bytes": 2,
            "frames": 5_292_000,
            "duration_seconds": 120.0,
        }
        if not info.get("ok"):
            errors.append(f"{label}: unreadable WAV: {path}: {info.get('error')}")
            return False
        mismatches = {key: (info.get(key), value) for key, value in expected.items() if info.get(key) != value}
        if mismatches:
            errors.append(f"{label}: WAV format mismatch {mismatches}: {path}")
            return False
        if path.stat().st_mode & (stat.S_IWUSR | stat.S_IWGRP | stat.S_IWOTH):
            errors.append(f"{label}: raw WAV is writable: {path}")
            return False
        return True

    def audit_phase_a(self) -> None:
        inventory_path = self.root / "09_provenance/existing-24-read-only-inventory.json"
        phase_path = self.root / "09_provenance/phase-a-reconciliation.json"
        errors: list[str] = []
        if not inventory_path.is_file() or not phase_path.is_file():
            missing = [str(p) for p in (inventory_path, phase_path) if not p.is_file()]
            self.add("phase_a_original_24", "FAIL", "Phase A authority is incomplete.", evidence={"missing": missing})
            return
        try:
            payload = read_json(inventory_path)
            phase = read_json(phase_path)
            rows = payload["rows"]
        except (OSError, ValueError, KeyError, TypeError) as exc:
            self.add("phase_a_original_24", "FAIL", "Phase A authority is unreadable.", errors=[str(exc)])
            return
        ids = [str(row.get("candidate_id", "")) for row in rows]
        hashes = [str(row.get("sha256", "")) for row in rows]
        for row in rows:
            path = resolved_path(row.get("absolute_path"))
            cid = str(row.get("candidate_id", "<missing-id>"))
            self.audited_file(path, str(row.get("sha256", "")), row.get("bytes"), errors, cid)
            self.verify_raw_wav(path, errors, cid)
            if not str(path).startswith("/Users/bruce/Project Studio Music Pilot 01/"):
                errors.append(f"{cid}: original source is outside the authoritative pilot root: {path}")
        exclusions = phase.get("exclusions", {})
        required_exclusions = {
            "FND-02__seed-155921": "negative",
            "DFG-03__seed-196613": "trailing",
        }
        for cid, token in required_exclusions.items():
            value = json.dumps(exclusions.get(cid, "")).lower()
            if token not in value:
                errors.append(f"missing preserved exclusion reason for {cid}")
        raw = phase.get("raw", {})
        conditions = {
            "row_count": len(rows) == 24,
            "candidate_ids_unique": len(set(ids)) == 24,
            "source_hashes_unique": len(set(hashes)) == 24,
            "phase_status_pass": phase.get("status") == "PASS",
            "phase_hash_flag": raw.get("all_generation_hashes_match") is True,
            "phase_count": raw.get("count") == 24,
            "eligible_count": raw.get("machine_eligible") == 22,
            "rejected_count": raw.get("machine_rejected") == 2,
            "raw_not_copied": raw.get("raw_copied") is False,
        }
        errors.extend(f"condition failed: {key}" for key, passed in conditions.items() if not passed)
        self.add(
            "phase_a_original_24", "PASS" if not errors else "FAIL",
            "All 24 authoritative pilot raws match the Phase A inventory and the two V2 exclusions are preserved." if not errors else "Original pilot reconciliation failed.",
            evidence={
                "inventory": str(inventory_path),
                "inventory_sha256": sha256_file(inventory_path, self.sha_cache),
                "phase_a": str(phase_path),
                "count": len(rows),
                "eligible": raw.get("machine_eligible"),
                "rejected": raw.get("machine_rejected"),
                "conditions": conditions,
            },
            errors=errors,
        )

    def audit_pool_164(self) -> None:
        inventory_path = self.root / "01_catalogue/canonical-plus-rescue-164-inventory.csv"
        reconciliation_path = self.root / "09_provenance/canonical-plus-rescue-164-reconciliation.json"
        errors: list[str] = []
        if not inventory_path.is_file() or not reconciliation_path.is_file():
            missing = [str(p) for p in (inventory_path, reconciliation_path) if not p.is_file()]
            self.add("canonical_plus_rescue_164", "FAIL", "The canonical/rescue inventory is incomplete.", evidence={"missing": missing})
            return
        try:
            rows = read_csv(inventory_path)
            reconciliation = read_json(reconciliation_path)
        except (OSError, ValueError) as exc:
            self.add("canonical_plus_rescue_164", "FAIL", "The canonical/rescue inventory is unreadable.", errors=[str(exc)])
            return
        ids = [row.get("candidate_id", "") for row in rows]
        hashes = [row.get("sha256", "") for row in rows]
        canonical = [row for row in rows if not row.get("rescue_round") and "-R1__" not in row.get("candidate_id", "")]
        rescue = [row for row in rows if row not in canonical]
        per_epoch = Counter(row.get("epoch", "") for row in rows)
        per_family = Counter(row.get("prompt_id", "").replace("-R1", "") for row in canonical)
        route_mismatches: list[str] = []
        for row in rows:
            cid = row.get("candidate_id", "<missing-id>")
            path = resolved_path(row.get("absolute_path"))
            self.audited_file(path, row.get("sha256", ""), row.get("bytes"), errors, cid)
            self.verify_raw_wav(path, errors, cid)
            if not RAW_ID_RE.fullmatch(cid):
                errors.append(f"invalid candidate ID: {cid}")
            try:
                generation = json.loads(row.get("generation_tuple", "{}"))
            except ValueError:
                generation = {}
                errors.append(f"{cid}: invalid generation tuple JSON")
            for key, expected in EXPECTED_GENERATION.items():
                observed = generation.get(key)
                if isinstance(expected, float):
                    try:
                        matched = float(observed) == expected
                    except (TypeError, ValueError):
                        matched = False
                else:
                    matched = observed == expected
                if not matched:
                    route_mismatches.append(f"{cid}:{key}")
            seed = int(row.get("seed", "-1"))
            expected_seeds = RESCUE_SEEDS if row in rescue else PRIMARY_SEEDS
            if seed not in expected_seeds:
                errors.append(f"{cid}: unexpected seed {seed}")
            if row.get("rights_status") != "PROTOTYPE_ONLY":
                errors.append(f"{cid}: rights status is not PROTOTYPE_ONLY")
        if route_mismatches:
            errors.append(f"generation tuple mismatches: {route_mismatches[:20]}")
        conditions = {
            "row_count_164": len(rows) == 164,
            "canonical_count_144": len(canonical) == 144,
            "rescue_count_20": len(rescue) == 20,
            "candidate_ids_unique": len(set(ids)) == 164,
            "source_hashes_unique": len(set(hashes)) == 164,
            "epochs_exact": set(per_epoch) == set(EXPECTED_EPOCHS),
            "canonical_plus_rescue_distribution": sorted(per_epoch.values()) == [16, 16, 16, 16, 16, 16, 20, 20, 28],
            "canonical_four_per_family": len(per_family) == 36 and set(per_family.values()) == {4},
            "reconciliation_pass": reconciliation.get("status") == "PASS",
            "reconciliation_inventory_hash": reconciliation.get("output", {}).get("sha256") == sha256_file(inventory_path, self.sha_cache),
        }
        errors.extend(f"condition failed: {key}" for key, passed in conditions.items() if not passed)
        self.inventory_164 = {row["candidate_id"]: row for row in rows if row.get("candidate_id")}
        self.add(
            "canonical_plus_rescue_164", "PASS" if not errors else "FAIL",
            "The 144 canonical plus 20 bounded-rescue sources are uniquely identified, hash-stable, read-only 120-second PCM16 raws." if not errors else "Canonical/rescue reconciliation failed.",
            evidence={
                "inventory": str(inventory_path),
                "inventory_sha256": sha256_file(inventory_path, self.sha_cache),
                "counts": {"total": len(rows), "canonical": len(canonical), "rescue": len(rescue)},
                "per_epoch": dict(sorted(per_epoch.items())),
                "conditions": conditions,
            },
            errors=errors,
        )

    def audit_refinements(self) -> None:
        inventory_path = self.root / "01_catalogue/refinement-f1-inventory.csv"
        integrity_path = self.root / "09_provenance/refinement-f1-integrity-manifest.json"
        comparison_path = self.root / "03_analysis/refinement-f1/refinement-vs-original.json"
        screening_path = self.root / "03_analysis/refinement-f1/screening-technical.csv"
        errors: list[str] = []
        required = (inventory_path, integrity_path, comparison_path, screening_path)
        if any(not p.is_file() for p in required):
            self.add(
                "bounded_refinement_9", "PENDING", "The nine-track refinement lane is not fully published yet.",
                evidence={"missing": [str(p) for p in required if not p.is_file()]},
            )
            return
        try:
            rows = read_csv(inventory_path)
            integrity = read_json(integrity_path)
            comparison = read_json(comparison_path)
            screening = read_csv(screening_path)
        except (OSError, ValueError) as exc:
            self.add("bounded_refinement_9", "FAIL", "Refinement evidence is unreadable.", errors=[str(exc)])
            return
        primary_map = {row.get("candidate_id"): row for row in self.primary_selections}
        ids = [row.get("candidate_id", "") for row in rows]
        hashes = [row.get("sha256", "") for row in rows]
        epochs = Counter(row.get("epoch", "") for row in rows)
        seeds: set[int] = set()
        for row in rows:
            cid = row.get("candidate_id", "<missing-id>")
            path = resolved_path(row.get("absolute_path"))
            self.audited_file(path, row.get("sha256", ""), row.get("bytes"), errors, cid)
            self.verify_raw_wav(path, errors, cid)
            if not REFINEMENT_ID_RE.fullmatch(cid):
                errors.append(f"invalid refinement ID: {cid}")
            try:
                seeds.add(int(row.get("seed", "-1")))
            except ValueError:
                errors.append(f"{cid}: invalid refinement seed")
            source_id = row.get("source_candidate_id", "")
            source = primary_map.get(source_id)
            if source is None:
                errors.append(f"{cid}: source is not one of the 27 frozen primaries: {source_id}")
            elif source.get("source_sha256") != row.get("source_sha256"):
                errors.append(f"{cid}: frozen source hash mismatch")
        screen_map = {row.get("candidate_id"): row for row in screening}
        for cid, row in ((row.get("candidate_id"), row) for row in rows):
            screen = screen_map.get(cid)
            if not screen:
                errors.append(f"{cid}: missing refinement Screening V3 row")
            elif screen.get("sha256") != row.get("sha256"):
                errors.append(f"{cid}: refinement screening source hash mismatch")
        counts = integrity.get("counts", {})
        comparison_counts = comparison.get("counts", {})
        conditions = {
            "row_count_9": len(rows) == 9,
            "unique_ids_9": len(set(ids)) == 9,
            "unique_hashes_9": len(set(hashes)) == 9,
            "one_per_epoch": set(epochs) == set(EXPECTED_EPOCHS) and set(epochs.values()) == {1},
            "fixed_seed_set": seeds == REFINEMENT_SEEDS,
            "screening_rows_9": len(screening) == 9,
            "integrity_pass": integrity.get("status") == "PASS",
            "integrity_counts": counts.get("raw_refinements") == 9 and counts.get("unique_refinement_ids") == 9 and counts.get("unique_refinement_hashes") == 9,
            "both_versions_preserved": integrity.get("source_and_revision_both_preserved") is True,
            "no_automatic_replacement": integrity.get("automatic_shortlist_replacement") == "FORBIDDEN" and comparison.get("automatic_shortlist_replacement") == "FORBIDDEN",
            "comparison_epochs_9": comparison_counts.get("epochs") == 9 and comparison_counts.get("refinement_tracks_preserved") == 9 and comparison_counts.get("source_tracks_preserved") == 9,
        }
        errors.extend(f"condition failed: {key}" for key, passed in conditions.items() if not passed)
        self.add(
            "bounded_refinement_9", "PASS" if not errors else "FAIL",
            "Nine one-shot refinements are unique, source-mapped, screened, and preserved without automatic shortlist replacement." if not errors else "Refinement reconciliation failed.",
            evidence={
                "inventory": str(inventory_path),
                "inventory_sha256": sha256_file(inventory_path, self.sha_cache),
                "counts": counts,
                "comparison_counts": comparison_counts,
                "conditions": conditions,
            },
            errors=errors,
            limitations=["A machine comparison cannot establish audible improvement."],
        )

    def discover_medium_inventory(self) -> tuple[Path | None, list[dict[str, Any]]]:
        preferred = [
            self.root / "01_catalogue/medium-challenge-18-inventory.csv",
            self.root / "01_catalogue/medium-quality-challenge-inventory.csv",
            self.root / "09_provenance/medium-challenge-integrity-manifest.json",
            self.root / "09_provenance/medium-quality-challenge-integrity-manifest.json",
        ]
        candidates = preferred + sorted((self.root / "01_catalogue").glob("*medium*inventory*.csv"))
        seen: set[Path] = set()
        for path in candidates:
            if path in seen or not path.is_file():
                continue
            seen.add(path)
            try:
                rows: list[dict[str, Any]]
                if path.suffix == ".csv":
                    rows = list(read_csv(path))
                else:
                    value = read_json(path)
                    rows = []
                    for key in ("rows", "raw_candidates", "raw_medium", "candidates", "tracks"):
                        if isinstance(value, dict) and isinstance(value.get(key), list):
                            rows = value[key]
                            break
                if len(rows) == 18:
                    return path, rows
            except (OSError, ValueError, TypeError):
                continue
        return None, []

    @staticmethod
    def medium_row_path(row: Mapping[str, Any]) -> Any:
        return row.get("absolute_path") or row.get("path") or row.get("raw_path") or row.get("wav_path")

    def audit_medium(self) -> None:
        inventory_path, rows = self.discover_medium_inventory()
        if inventory_path is None:
            skip_markers = []
            for path in (self.root / "00_state/MARATHON-STATE.json", self.root / "11_return-package/RESUME-STATE.json"):
                if path.is_file() and "MEDIUM QUALITY CHALLENGE SKIPPED" in path.read_text(encoding="utf-8", errors="ignore"):
                    skip_markers.append(str(path))
            if skip_markers:
                self.add(
                    "optional_medium_18", "SKIPPED", "The optional Medium quality challenge has a recorded skip decision.",
                    mandatory=False, evidence={"skip_markers": skip_markers},
                )
            else:
                self.add(
                    "optional_medium_18", "PENDING", "No 18-row Medium inventory or recorded skip decision exists yet.",
                    mandatory=False,
                )
            return
        errors: list[str] = []
        ids = [str(row.get("candidate_id") or row.get("id") or "") for row in rows]
        hashes = [str(row.get("sha256") or row.get("source_sha256") or "") for row in rows]
        epochs = Counter(str(row.get("epoch") or row.get("epoch_alias") or "") for row in rows)
        for index, row in enumerate(rows):
            cid = ids[index] or f"medium-row-{index + 1}"
            path_value = self.medium_row_path(row)
            if not path_value:
                errors.append(f"{cid}: missing raw path")
                continue
            path = resolved_path(path_value, inventory_path.parent)
            self.audited_file(path, hashes[index], row.get("bytes"), errors, cid)
            info = probe_pcm_wav(path) if path.is_file() else {"ok": False}
            if not info.get("ok") or info.get("channels") != 2 or abs(float(info.get("duration_seconds") or 0) - 120.0) > 0.01:
                errors.append(f"{cid}: expected a 120-second stereo PCM WAV")
            if row.get("rights_status") not in (None, "", "PROTOTYPE_ONLY"):
                errors.append(f"{cid}: invalid rights status")
        conditions = {
            "row_count_18": len(rows) == 18,
            "unique_ids_18": len(set(ids)) == 18 and "" not in ids,
            "unique_hashes_18": len(set(hashes)) == 18 and all(HEX64_RE.fullmatch(item) for item in hashes),
            "two_per_epoch": set(epochs) == set(EXPECTED_EPOCHS) and set(epochs.values()) == {2},
        }
        errors.extend(f"condition failed: {key}" for key, passed in conditions.items() if not passed)
        self.add(
            "optional_medium_18", "PASS" if not errors else "FAIL",
            "The optional Medium comparison has 18 unique, source-hashed, 120-second stereo candidates (two per epoch)." if not errors else "Medium challenge reconciliation failed.",
            mandatory=False,
            evidence={"inventory": str(inventory_path), "inventory_sha256": sha256_file(inventory_path, self.sha_cache), "conditions": conditions},
            errors=errors,
        )

    def audit_shortlist(self) -> None:
        shortlist_path = self.root / "05_shortlists/provisional-machine-shortlist.json"
        jury_path = self.root / "03_analysis/shortlist-ready-all-candidates-v3-machine-jury-final-v2.csv"
        errors: list[str] = []
        if not shortlist_path.is_file() or not jury_path.is_file():
            self.add("primary_shortlist_and_derivatives", "FAIL", "Shortlist or final-v2 jury authority is missing.")
            return
        try:
            shortlist = read_json(shortlist_path)
            jury_rows = read_csv(jury_path)
            selections = shortlist["selections"]
        except (OSError, ValueError, KeyError, TypeError) as exc:
            self.add("primary_shortlist_and_derivatives", "FAIL", "Shortlist evidence is unreadable.", errors=[str(exc)])
            return
        primaries = [row for row in selections if row.get("role_type") == "PRIMARY"]
        alternates = [row for row in selections if row.get("role_type") == "ALTERNATE"]
        self.primary_selections = primaries
        jury = {row.get("candidate_id"): row for row in jury_rows}
        per_epoch = Counter(row.get("epoch_alias") for row in primaries)
        families: dict[str, set[str]] = defaultdict(set)
        all_derivative_hashes: list[str] = []
        for row in primaries:
            cid = row.get("candidate_id", "<missing-id>")
            epoch = row.get("epoch_alias", "")
            families[epoch].add(row.get("family_id", ""))
            source = self.inventory_164.get(cid)
            if source is None:
                errors.append(f"{cid}: primary does not map to the canonical/rescue 164 inventory")
            else:
                if source.get("sha256") != row.get("source_sha256"):
                    errors.append(f"{cid}: shortlist source hash differs from 164 inventory")
                if resolved_path(source.get("absolute_path")) != resolved_path(row.get("source_path")):
                    errors.append(f"{cid}: shortlist source path differs from 164 inventory")
            juror = jury.get(cid)
            if juror is None:
                errors.append(f"{cid}: missing final-v2 jury row")
            else:
                if not as_bool(juror.get("technical_automatic_pass")):
                    errors.append(f"{cid}: primary is technically rejected")
                if juror.get("machine_label") == "MACHINE-REJECTED" or as_bool(juror.get("severe_machine_mismatch")):
                    errors.append(f"{cid}: primary is machine-rejected or severely mismatched")
                if juror.get("source_sha256") != row.get("source_sha256"):
                    errors.append(f"{cid}: jury and shortlist source hashes differ")
            source_path = resolved_path(row.get("source_path"))
            self.audited_file(source_path, row.get("source_sha256", ""), row.get("source_bytes"), errors, f"{cid}:raw")
            derivative_specs = {
                "normalized_wav": ("normalized_wav_path", "normalized_wav_sha256"),
                "loop_wav": ("loop_wav_path", "loop_wav_sha256"),
                "seam_audition": ("seam_audition_path", "seam_audition_sha256"),
                "aac_preview": ("aac_preview_path", "aac_preview_sha256"),
                "waveform": ("waveform_path", "waveform_sha256"),
                "spectrogram": ("spectrogram_path", "spectrogram_sha256"),
                "metadata": ("metadata_path", "metadata_sha256"),
            }
            for label, (path_key, hash_key) in derivative_specs.items():
                path = resolved_path(row.get(path_key))
                expected_hash = str(row.get(hash_key, ""))
                if self.audited_file(path, expected_hash, None, errors, f"{cid}:{label}"):
                    all_derivative_hashes.append(expected_hash)
                if label == "metadata" and path.is_file():
                    try:
                        metadata = read_json(path)
                        if metadata.get("candidate_id") != cid or metadata.get("raw_source", {}).get("sha256") != row.get("source_sha256"):
                            errors.append(f"{cid}: metadata does not map to its raw source")
                        for derivative in metadata.get("derivatives", {}).values():
                            sidecar_value = derivative.get("provenance_sidecar")
                            if sidecar_value:
                                sidecar = resolved_path(sidecar_value)
                                if not sidecar.is_file():
                                    errors.append(f"{cid}: missing derivative provenance sidecar: {sidecar}")
                                    continue
                                provenance = read_json(sidecar)
                                if provenance.get("spec", {}).get("raw_source_sha256") != row.get("source_sha256"):
                                    errors.append(f"{cid}: derivative sidecar has wrong raw source hash: {sidecar.name}")
                                if provenance.get("output_sha256") != derivative.get("sha256"):
                                    errors.append(f"{cid}: derivative sidecar output hash mismatch: {sidecar.name}")
                    except (OSError, ValueError, TypeError) as exc:
                        errors.append(f"{cid}: unreadable metadata/sidecar: {exc}")
        counts = shortlist.get("counts", {})
        conditions = {
            "selection_count_54": len(selections) == 54,
            "primary_count_27": len(primaries) == 27 and counts.get("primary") == 27,
            "alternate_count_27": len(alternates) == 27 and counts.get("alternate") == 27,
            "three_primaries_per_epoch": set(per_epoch) == set(EXPECTED_EPOCHS) and set(per_epoch.values()) == {3},
            "distinct_primary_families": all(len(families[epoch]) == 3 for epoch in EXPECTED_EPOCHS),
            "primary_ids_unique": len({row.get("candidate_id") for row in primaries}) == 27,
            "derivative_hashes_unique": len(all_derivative_hashes) == 189 and len(set(all_derivative_hashes)) == 189,
            "prototype_status": shortlist.get("shortlist_status") == "PROVISIONAL MACHINE SHORTLIST" and shortlist.get("rights_status") == "PROTOTYPE_READY_FOR_OWNER_AUDITION",
        }
        errors.extend(f"condition failed: {key}" for key, passed in conditions.items() if not passed)
        self.add(
            "primary_shortlist_and_derivatives", "PASS" if not errors else "FAIL",
            "All 27 primaries map to eligible final-v2 jury sources and have fully hash-bound audition derivative suites." if not errors else "Primary shortlist/derivative reconciliation failed.",
            evidence={
                "shortlist": str(shortlist_path),
                "shortlist_sha256": sha256_file(shortlist_path, self.sha_cache),
                "jury": str(jury_path),
                "jury_sha256": sha256_file(jury_path, self.sha_cache),
                "counts": counts,
                "per_epoch": dict(sorted(per_epoch.items())),
                "conditions": conditions,
            },
            errors=errors,
            limitations=["Machine eligibility and ranking do not establish human listening quality or rights clearance."],
        )

    def audit_radio_scripts(self) -> None:
        directory = self.root / "06_radio/script-bank"
        bank_path = directory / "STUDIO-RADIO-SCRIPT-BANK-01.json"
        validation_path = directory / "STUDIO-RADIO-SCRIPT-BANK-01-VALIDATION.json"
        errors: list[str] = []
        if not bank_path.is_file() or not validation_path.is_file():
            self.add("radio_script_bank_126", "FAIL", "Radio script-bank authority is missing.")
            return
        try:
            bank = read_json(bank_path)
            validation = read_json(validation_path)
        except (OSError, ValueError) as exc:
            self.add("radio_script_bank_126", "FAIL", "Radio script-bank evidence is unreadable.", errors=[str(exc)])
            return
        units = bank.get("units", [])
        per_epoch = Counter(unit.get("epoch_code") for unit in units)
        functions: dict[str, Counter[str]] = defaultdict(Counter)
        ids: list[str] = []
        transcripts: list[str] = []
        for unit in units:
            epoch = str(unit.get("epoch_code", ""))
            functions[epoch][str(unit.get("function", ""))] += 1
            ids.append(str(unit.get("stable_id", "")))
            transcripts.append(re.sub(r"\s+", " ", str(unit.get("transcript", "")).strip()).casefold())
            if unit.get("caption") != unit.get("transcript"):
                errors.append(f"{unit.get('stable_id')}: caption/transcript mismatch")
            if unit.get("status") != "PROTOTYPE_ONLY":
                errors.append(f"{unit.get('stable_id')}: status is not PROTOTYPE_ONLY")
            for field in ("archetype", "pace_target_wpm", "formality", "function", "performance_notes", "fact_authority"):
                if not unit.get(field):
                    errors.append(f"{unit.get('stable_id')}: missing {field}")
        expected_mix = bank.get("bank_summary", {}).get("required_function_distribution_per_epoch", {})
        for epoch in [f"E{i:02d}" for i in range(1, 10)]:
            if dict(functions[epoch]) != expected_mix:
                errors.append(f"{epoch}: function distribution mismatch")
        artifact_hashes = validation.get("artifact_sha256", {})
        for filename, expected in artifact_hashes.items():
            path = directory / filename
            self.audited_file(path, expected, None, errors, filename)
        conditions = {
            "unit_count_126": len(units) == 126,
            "nine_epochs_fourteen_each": set(per_epoch) == {f"E{i:02d}" for i in range(1, 10)} and set(per_epoch.values()) == {14},
            "stable_ids_unique": len(set(ids)) == 126 and "" not in ids,
            "transcripts_unique": len(set(transcripts)) == 126 and "" not in transcripts,
            "validation_checks_pass": all(validation.get("checks", {}).values()),
            "prototype_only": bank.get("status") == "PROTOTYPE_ONLY",
        }
        errors.extend(f"condition failed: {key}" for key, passed in conditions.items() if not passed)
        self.add(
            "radio_script_bank_126", "PASS" if not errors else "FAIL",
            "The original fictional script bank contains 126 unique, caption-parity units across all nine epochs." if not errors else "Radio script-bank reconciliation failed.",
            evidence={
                "bank": str(bank_path), "bank_sha256": sha256_file(bank_path, self.sha_cache),
                "validation": str(validation_path), "per_epoch": dict(sorted(per_epoch.items())),
                "conditions": conditions,
            },
            errors=errors,
            limitations=["Structural/originality assertions are documented provenance; only human/legal review can make a final originality or clearance ruling."],
        )

    def audit_voice(self) -> None:
        directory = self.root / "06_radio/voice-prototypes"
        manifest_path = directory / "VOICE-PROTOTYPE-MANIFEST.json"
        validation_path = directory / "VOICE-PROTOTYPE-VALIDATION.json"
        errors: list[str] = []
        if not manifest_path.is_file() or not validation_path.is_file():
            self.add("voice_prototypes_30", "FAIL", "Voice prototype authority is missing.")
            return
        try:
            manifest = read_json(manifest_path)
            validation = read_json(validation_path)
        except (OSError, ValueError) as exc:
            self.add("voice_prototypes_30", "FAIL", "Voice prototype evidence is unreadable.", errors=[str(exc)])
            return
        clips = manifest.get("clips", [])
        per_anchor = Counter(clip.get("anchor_epoch") for clip in clips)
        for clip in clips:
            cid = str(clip.get("prototype_id", "<missing-id>"))
            if clip.get("transcript") != clip.get("caption"):
                errors.append(f"{cid}: caption/transcript mismatch")
            for path_key, hash_key in (("clean_path", "clean_sha256"), ("period_path", "period_sha256")):
                path = resolved_path(clip.get(path_key), directory)
                self.audited_file(path, clip.get(hash_key, ""), None, errors, f"{cid}:{path_key}")
            for path_key in ("transcript_path", "caption_path", "metadata_path"):
                path = resolved_path(clip.get(path_key), directory)
                if not path.is_file():
                    errors.append(f"{cid}: missing {path_key}: {path}")
        for artifact in manifest.get("clip_asset_inventory", []):
            path = resolved_path(artifact.get("path"), directory)
            self.audited_file(path, artifact.get("sha256", ""), artifact.get("bytes"), errors, f"voice-asset:{artifact.get('path')}")
        route = manifest.get("route", {})
        checks = validation.get("checks", {})
        summary = manifest.get("summary", {})
        conditions = {
            "clip_count_30": len(clips) == 30 and summary.get("clip_count") == 30,
            "ten_per_anchor": set(per_anchor) == {"E02", "E03", "E06"} and set(per_anchor.values()) == {10},
            "asset_inventory_150": len(manifest.get("clip_asset_inventory", [])) == 150,
            "validation_pass": validation.get("status") == "PASS" and all(checks.values()),
            "clean_and_period_30": validation.get("asset_counts", {}).get("clean_wav") == 30 and validation.get("asset_counts", {}).get("period_wav") == 30,
            "local_built_in_route": route.get("cloud") is False and route.get("network_upload") is False and route.get("payment") is False,
            "no_cloning": route.get("voice_cloning") is False and route.get("real_person_impersonation") is False and route.get("personal_voice") is False,
            "prototype_status": manifest.get("status") == "SCRATCH_DELIVERY_PROTOTYPE" and manifest.get("rights_status") == "PROTOTYPE_ONLY",
        }
        errors.extend(f"condition failed: {key}" for key, passed in conditions.items() if not passed)
        self.add(
            "voice_prototypes_30", "PASS" if not errors else "FAIL",
            "Thirty local built-in scratch voice units have clean and bounded period versions, captions, transcripts, hashes, and no cloning route." if not errors else "Voice prototype reconciliation failed.",
            evidence={
                "manifest": str(manifest_path), "manifest_sha256": sha256_file(manifest_path, self.sha_cache),
                "validation": str(validation_path), "per_anchor": dict(sorted(per_anchor.items())),
                "conditions": conditions,
            },
            errors=errors,
            limitations=["Manifest/process evidence proves the configured generic route; it cannot prove subjective resemblance without human listening."],
        )

    def audit_radio_demos(self) -> None:
        directory = self.root / "06_radio/demos-v2"
        index_path = directory / "RADIO-DEMO-INDEX.json"
        errors: list[str] = []
        if not index_path.is_file():
            self.add("radio_demo_v2_3", "PENDING", "Authoritative radio demo v2 index is missing.")
            return
        try:
            index = read_json(index_path)
        except (OSError, ValueError) as exc:
            self.add("radio_demo_v2_3", "FAIL", "Radio demo v2 index is unreadable.", errors=[str(exc)])
            return
        programs = index.get("programs", [])
        expected_slugs = {"EARLY-STUDIO", "POSTWAR", "DIGITAL-ERA"}
        for program in programs:
            slug = str(program.get("slug", "<missing-slug>"))
            program_dir = resolved_path(program.get("directory"), directory)
            wav_path = resolved_path(program.get("wav_path"), program_dir)
            self.audited_file(wav_path, program.get("wav_sha256", ""), None, errors, f"{slug}:wav")
            metadata_path = program_dir / "METADATA.json"
            self.audited_file(metadata_path, program.get("metadata_sha256", ""), None, errors, f"{slug}:metadata")
            for filename in ("CAPTIONS.vtt", "TRANSCRIPT.md", "CUE-SHEET.csv", "CUE-SHEET.json", "SHA256SUMS.txt"):
                if not (program_dir / filename).is_file():
                    errors.append(f"{slug}: missing {filename}")
            if metadata_path.is_file():
                try:
                    metadata = read_json(metadata_path)
                    for artifact in metadata.get("artifacts", []):
                        artifact_path = program_dir / artifact.get("relative_path", "")
                        self.audited_file(artifact_path, artifact.get("sha256", ""), artifact.get("bytes"), errors, f"{slug}:{artifact.get('relative_path')}")
                    assertions = metadata.get("assertions", {})
                    required_true = (
                        "clean_speech_preserved_and_hash_verified", "original_fictional_script_units",
                        "period_speech_used_for_mix",
                    )
                    if not all(assertions.get(key) is True for key in required_true):
                        errors.append(f"{slug}: required metadata assertions failed")
                    forbidden_true = (
                        "cloud_or_network_service_used", "gameplay_critical_facts_are_audio_only",
                        "real_person_impersonation_requested", "voice_cloning_used",
                    )
                    if any(assertions.get(key) is True for key in forbidden_true):
                        errors.append(f"{slug}: forbidden metadata assertion is true")
                    if assertions.get("fictional_advertisement_count") != 1 or assertions.get("technology_bulletin_count") != 1:
                        errors.append(f"{slug}: bulletin/advertisement cue count mismatch")
                except (OSError, ValueError, TypeError) as exc:
                    errors.append(f"{slug}: unreadable metadata: {exc}")
            sums_path = program_dir / "SHA256SUMS.txt"
            if sums_path.is_file():
                try:
                    for expected, relative in parse_sha256sums(sums_path):
                        self.audited_file(program_dir / relative, expected, None, errors, f"{slug}:SHA256SUMS:{relative}")
                except (OSError, ValueError) as exc:
                    errors.append(f"{slug}: invalid SHA256SUMS: {exc}")
        validation = index.get("validation", {})
        validation_contract = {
            "captions_and_transcripts_present": validation.get("captions_and_transcripts_present") is True,
            "clean_speech_preserved": validation.get("clean_speech_preserved") is True,
            "controlled_music_ducking": validation.get("controlled_music_ducking") is True,
            "exact_fictional_advertisements_per_reel": validation.get("exact_fictional_advertisements_per_reel") == 1,
            "exact_technology_bulletins_per_reel": validation.get("exact_technology_bulletins_per_reel") == 1,
            "network_not_used": validation.get("network_used") is False,
            "no_voice_cloning": validation.get("no_voice_cloning") is True,
            "reels_4_to_7_minutes": validation.get("reels_4_to_7_minutes") is True,
            "script_units_126": validation.get("script_units") == 126,
            "voice_prototypes_30": validation.get("voice_prototypes") == 30,
        }
        conditions = {
            "program_count_3": len(programs) == 3 and index.get("program_count") == 3,
            "expected_slugs": {item.get("slug") for item in programs} == expected_slugs,
            "durations_4_to_7_minutes": all(240.0 <= float(item.get("duration_seconds", 0)) <= 420.0 for item in programs),
            "v2_pipeline": index.get("pipeline_version") == "studio-radio-demo-builder-v2",
            "validation_contract": all(validation_contract.values()),
            "concept_status": index.get("status") == "RADIO CONCEPT PROTOTYPE" and index.get("rights_status") == "PROTOTYPE_ONLY",
        }
        errors.extend(f"condition failed: {key}" for key, passed in conditions.items() if not passed)
        self.add(
            "radio_demo_v2_3", "PASS" if not errors else "FAIL",
            "Three authoritative v2 radio concept reels are hash-complete, captioned, transcribed, cue-sheeted, and 4–7 minutes long." if not errors else "Radio demo v2 reconciliation failed.",
            evidence={
                "index": str(index_path), "index_sha256": sha256_file(index_path, self.sha_cache),
                "durations_seconds": {item.get("slug"): item.get("duration_seconds") for item in programs},
                "conditions": conditions, "validation_contract": validation_contract,
            },
            errors=errors,
            limitations=["Technical mix validation is not human listening acceptance."],
        )

    def audit_endurance(self) -> None:
        directory = self.root / "08_endurance"
        index_path = directory / "endurance-index.json"
        errors: list[str] = []
        if not index_path.is_file():
            self.add("endurance_nine_epochs", "PENDING", "Endurance index is missing.")
            return
        try:
            index = read_json(index_path)
        except (OSError, ValueError) as exc:
            self.add("endurance_nine_epochs", "FAIL", "Endurance index is unreadable.", errors=[str(exc)])
            return
        epochs = index.get("epochs", [])
        for item in epochs:
            alias = str(item.get("epoch_alias", "<missing-epoch>"))
            epoch_dir = resolved_path(item.get("output_dir"), directory)
            checks_path = epoch_dir / "machine-checks.json"
            schedule_path = epoch_dir / "four-hour-schedule.json"
            self.audited_file(checks_path, item.get("checks_sha256", ""), None, errors, f"{alias}:checks")
            self.audited_file(schedule_path, item.get("schedule_sha256", ""), None, errors, f"{alias}:schedule")
            for filename in ("thirty-minute-endurance-demo.wav", "thirty-minute-endurance-demo.m4a", "thirty-minute-demo-cues.csv", "thirty-minute-demo-cues.json", "SHA256SUMS.txt", "provenance.json"):
                if not (epoch_dir / filename).is_file():
                    errors.append(f"{alias}: missing {filename}")
            if checks_path.is_file():
                try:
                    checks = read_json(checks_path)
                    if checks.get("overall_structural_result") != "PASS" or not all(checks.get("structural_checks", {}).values()):
                        errors.append(f"{alias}: deterministic structural checks are not all PASS")
                    if checks.get("structural_checks", {}).get("deterministic_seed_replay") is not True:
                        errors.append(f"{alias}: deterministic seed replay failed")
                    if checks.get("event_counts", {}).get("total", 0) <= 0:
                        errors.append(f"{alias}: schedule has no events")
                except (OSError, ValueError, TypeError) as exc:
                    errors.append(f"{alias}: unreadable machine checks: {exc}")
            sums_path = epoch_dir / "SHA256SUMS.txt"
            if sums_path.is_file():
                try:
                    for expected, relative in parse_sha256sums(sums_path):
                        self.audited_file(epoch_dir / relative, expected, None, errors, f"{alias}:SHA256SUMS:{relative}")
                except (OSError, ValueError) as exc:
                    errors.append(f"{alias}: invalid SHA256SUMS: {exc}")
        config = index.get("configuration", {})
        conditions = {
            "epoch_count_9": len(epochs) == 9 and index.get("epoch_count") == 9,
            "expected_epoch_aliases": {item.get("epoch_alias") for item in epochs} == set(EXPECTED_EPOCHS),
            "all_structural_pass": all(item.get("structural_result") == "PASS" for item in epochs),
            "all_demos_rendered": all(item.get("rendered_demo") is True for item in epochs),
            "four_hour_config": config.get("total_seconds") == 14400,
            "thirty_minute_config": config.get("demo_seconds") == 1800,
            "prototype_status": index.get("status") == "PROTOTYPE_READY_FOR_OWNER_AUDITION",
        }
        errors.extend(f"condition failed: {key}" for key, passed in conditions.items() if not passed)
        self.add(
            "endurance_nine_epochs", "PASS" if not errors else "FAIL",
            "All nine four-hour deterministic schedules and 30-minute demonstrations reconcile with PASS structural checks and deterministic replay." if not errors else "Endurance reconciliation failed.",
            evidence={
                "index": str(index_path), "index_sha256": sha256_file(index_path, self.sha_cache),
                "configuration": config, "conditions": conditions,
            },
            errors=errors,
            limitations=["A deterministic playlist proxy cannot establish human fatigue, irritation, or long-session musical quality."],
        )

    def audit_app(self) -> None:
        app = self.root / "07_audition-app"
        client = app / "dist/client"
        catalogue_path = client / "data/catalogue.json"
        reveal_path = client / "data/reveal.json"
        assets_path = client / "data/asset-manifest.json"
        launcher = app / "START-AUDITION.command"
        server = app / "serve_audition.py"
        page_source = app / "app/page.tsx"
        errors: list[str] = []
        required = (catalogue_path, reveal_path, assets_path, launcher, server, page_source, client / "index.html")
        if any(not path.is_file() for path in required):
            self.add(
                "offline_audition_app", "PENDING", "The offline audition application is not fully assembled.",
                evidence={"missing": [str(path) for path in required if not path.is_file()]},
            )
            return
        try:
            catalogue = read_json(catalogue_path)
            reveal = read_json(reveal_path)
            asset_manifest = read_json(assets_path)
            source_text = page_source.read_text(encoding="utf-8")
            launcher_text = launcher.read_text(encoding="utf-8")
            server_text = server.read_text(encoding="utf-8")
            index_text = (client / "index.html").read_text(encoding="utf-8")
        except (OSError, ValueError) as exc:
            self.add("offline_audition_app", "FAIL", "Audition app evidence is unreadable.", errors=[str(exc)])
            return
        items = catalogue.get("items", [])
        music = [item for item in items if item.get("kind") == "music"]
        radio = [item for item in items if item.get("kind") == "radio"]
        primary = [item for item in music if item.get("tier") == "primary"]
        alternate = [item for item in music if item.get("tier") == "alternate"]
        for item in items:
            iid = str(item.get("id", "<missing-id>"))
            audio = str(item.get("audio", ""))
            if not audio.startswith("/audio/") or "://" in audio:
                errors.append(f"{iid}: audio path is not local: {audio}")
            elif not (client / audio.lstrip("/")).is_file():
                errors.append(f"{iid}: local audio asset missing: {audio}")
            seam = item.get("seam")
            if seam and (not str(seam).startswith("/audio/") or not (client / str(seam).lstrip("/")).is_file()):
                errors.append(f"{iid}: seam path is not a present local asset")
        for asset in asset_manifest.get("assets", []):
            path = client / str(asset.get("relativePath", ""))
            self.audited_file(path, asset.get("sha256", ""), asset.get("bytes"), errors, f"app:{asset.get('relativePath')}")
        authored = "\n".join((source_text, launcher_text, server_text))
        external_urls = sorted(set(re.findall(r"https?://[^\s\"'<>`]+", authored)))
        disallowed_urls = [url for url in external_urls if not url.startswith(("http://127.0.0.1", "http://localhost"))]
        if disallowed_urls:
            errors.append(f"authored app contains external URLs: {disallowed_urls}")
        network_api_tokens = ("XMLHttpRequest", "WebSocket(", "sendBeacon(", "navigator.sendBeacon", "google-analytics", "posthog", "sentry.io", "segment.io")
        present_network_tokens = [token for token in network_api_tokens if token.casefold() in authored.casefold()]
        if present_network_tokens:
            errors.append(f"authored app contains telemetry/network API tokens: {present_network_tokens}")
        fetch_targets = re.findall(r"fetch\(\s*['\"]([^'\"]+)", source_text)
        if any(not target.startswith("/") for target in fetch_targets):
            errors.append(f"non-local authored fetch target: {fetch_targets}")
        markup_refs = re.findall(r"(?:src|href)=[\"']([^\"']+)", index_text)
        if any(ref.startswith(("http://", "https://", "//")) for ref in markup_refs):
            errors.append("built index contains a remote script/style/resource reference")
        runtime_match = re.search(r'PYTHON_BIN="\$\{HOME[^}]*\}([^\"]+)"', launcher_text)
        runtime_path = None
        if runtime_match:
            runtime_path = Path.home() / runtime_match.group(1).lstrip("/")
        reveal_map = reveal.get("reveal", {})
        counts = asset_manifest.get("counts", {})
        feature_tokens = {
            "local_storage": "localStorage" in source_text,
            "export_csv": "Export CSV" in source_text and "text/csv" in source_text,
            "export_json": "Export JSON" in source_text and "application/json" in source_text,
            "blind_reveal_after_verdict": "Save keep / maybe / reject first" in source_text,
            "notes": "notes" in source_text and "textarea" in source_text,
            "ratings": all(token in source_text for token in ("quality", "eraFeel", "studioSpirit", "managementSuitability", "irritation", "repetition")),
        }
        conditions = {
            "item_count_57": len(items) == 57,
            "music_54": len(music) == 54,
            "primary_27": len(primary) == 27,
            "alternate_27": len(alternate) == 27,
            "radio_3": len(radio) == 3,
            "ids_unique": len({item.get("id") for item in items}) == 57,
            "reveal_57": len(reveal_map) == 57 and set(reveal_map) == {item.get("id") for item in items},
            "asset_counts": counts == {"musicPreviews": 54, "primarySeamChecks": 27, "radioPreviews": 3, "totalAssets": 84},
            "asset_rows_84": len(asset_manifest.get("assets", [])) == 84,
            "no_raw_audio_policy": "NO_RAW_AUDIO" in str(asset_manifest.get("policy", "")) and not any("02_raw" in str(value) for value in iter_json_values(catalogue)),
            "loopback_server": '("127.0.0.1", args.port)' in server_text and "0.0.0.0" not in server_text,
            "launcher_local": "serve_audition.py" in launcher_text and "--port 8765" in launcher_text,
            "isolated_runtime_present": runtime_path is not None and runtime_path.is_file() and os.access(runtime_path, os.X_OK),
            "offline_fetches_only": all(target.startswith("/") for target in fetch_targets) and len(fetch_targets) >= 2,
            "feature_surface": all(feature_tokens.values()),
            "prototype_status": catalogue.get("status") == "PROTOTYPE_READY_FOR_OWNER_AUDITION",
        }
        errors.extend(f"condition failed: {key}" for key, passed in conditions.items() if not passed)
        self.add(
            "offline_audition_app", "PASS" if not errors else "FAIL",
            "The localhost-only audition app has 27 primaries, 27 alternates, three radio reels, 84 hash-bound derivatives, blind reveal, local resume, ratings, notes, and CSV/JSON export." if not errors else "Offline audition-app reconciliation failed.",
            evidence={
                "app": str(app), "catalogue_sha256": sha256_file(catalogue_path, self.sha_cache),
                "asset_manifest_sha256": sha256_file(assets_path, self.sha_cache),
                "counts": {"items": len(items), "music": len(music), "primary": len(primary), "alternate": len(alternate), "radio": len(radio)},
                "features": feature_tokens, "fetch_targets": fetch_targets,
                "external_urls_in_authored_code": external_urls, "runtime_path": str(runtime_path) if runtime_path else None,
                "conditions": conditions,
            },
            errors=errors,
            limitations=["Static inspection proves the configured offline/local behavior and asset completeness; browser interaction remains a bounded runtime test, not a listening judgment."],
        )

    def audit_git(self) -> None:
        errors: list[str] = []
        listed = run_readonly(["git", "ls-files", "-z"], self.repo)
        if listed.returncode != 0:
            self.add("git_safety", "FAIL", "Could not enumerate Git-tracked paths.", errors=[listed.stderr.strip()])
            return
        tracked = [item for item in listed.stdout.split("\0") if item]
        preexisting_forbidden = [item for item in tracked if Path(item).suffix.casefold() in FORBIDDEN_GIT_SUFFIXES]
        phase_path = self.root / "09_provenance/phase-a-reconciliation.json"
        pilot_base = None
        if phase_path.is_file():
            try:
                pilot_base = read_json(phase_path).get("pilot_tip_after_preservation")
            except (OSError, ValueError, TypeError):
                pilot_base = None
        additions: list[str] = []
        if pilot_base:
            added = run_readonly(["git", "diff", "--diff-filter=A", "--name-only", f"{pilot_base}..HEAD"], self.repo)
            if added.returncode == 0:
                additions = [line.strip() for line in added.stdout.splitlines() if line.strip()]
            else:
                errors.append(f"could not compare marathon branch to pilot base {pilot_base}: {added.stderr.strip()}")
        else:
            errors.append("pilot base SHA is unavailable for Git provenance comparison")
        marathon_forbidden = [item for item in additions if Path(item).suffix.casefold() in FORBIDDEN_GIT_SUFFIXES]
        if marathon_forbidden:
            errors.append(f"marathon branch added audio/model-weight paths: {marathon_forbidden}")
        secret_hits: list[dict[str, str]] = []
        scanned = 0
        for relative in tracked:
            path = self.repo / relative
            if not path.is_file() or path.stat().st_size > 8 * 1024 * 1024:
                continue
            try:
                data = path.read_bytes()
            except OSError:
                continue
            scanned += 1
            for label, pattern in SECRET_PATTERNS.items():
                if pattern.search(data):
                    secret_hits.append({"path": relative, "pattern": label})
        if secret_hits:
            errors.append(f"strong credential signatures found: {secret_hits}")
        status = run_readonly(["git", "status", "--porcelain=v1", "--untracked-files=all"], self.repo)
        dirty = [line for line in status.stdout.splitlines() if line.strip()]
        head = run_readonly(["git", "rev-parse", "HEAD"], self.repo)
        branch = run_readonly(["git", "branch", "--show-current"], self.repo)
        upstream = run_readonly(["git", "rev-parse", "@{upstream}"], self.repo)
        conditions = {
            "no_audio_or_weights_added_by_marathon": not marathon_forbidden,
            "no_strong_credentials": not secret_hits,
            "expected_branch": branch.stdout.strip() == "codex/era-aware-audio-marathon-01",
            "upstream_configured": upstream.returncode == 0,
            "head_equals_upstream": upstream.returncode == 0 and head.stdout.strip() == upstream.stdout.strip(),
            "worktree_clean": not dirty,
        }
        # A dirty worktree while other marathon lanes are publishing is incomplete,
        # not evidence that unsafe content entered Git.  The final rerun must pass.
        if errors:
            result = "FAIL"
        elif conditions["expected_branch"] and conditions["upstream_configured"] and conditions["head_equals_upstream"] and conditions["worktree_clean"]:
            result = "PASS"
        else:
            result = "PENDING"
        self.add(
            "git_safety", result,
            "Git contains no tracked audio, model weights, or strong credential signatures; branch is clean and matches its upstream." if result == "PASS" else "Git safety content checks passed, but final branch cleanliness/upstream reconciliation is pending." if result == "PENDING" else "Git safety audit failed.",
            evidence={
                "repo": str(self.repo), "branch": branch.stdout.strip(), "head": head.stdout.strip(),
                "upstream_sha": upstream.stdout.strip() if upstream.returncode == 0 else None,
                "tracked_file_count": len(tracked), "text_files_scanned": scanned,
                "pilot_base": pilot_base,
                "marathon_added_path_count": len(additions),
                "marathon_added_audio_or_weight_paths": marathon_forbidden,
                "preexisting_tracked_audio_or_weight_paths": preexisting_forbidden,
                "secret_signature_hits": secret_hits,
                "dirty_paths": dirty, "conditions": conditions,
            },
            errors=errors,
        )

    def extract_return_manifest_rows(self, manifest: Path) -> list[dict[str, Any]]:
        if manifest.name == "SHA256SUMS.txt":
            return [{"path": relative, "sha256": digest} for digest, relative in parse_sha256sums(manifest)]
        value = read_json(manifest)
        for key in ("files", "artifacts", "entries", "assets"):
            if isinstance(value, dict) and isinstance(value.get(key), list):
                rows = []
                for item in value[key]:
                    if not isinstance(item, dict):
                        continue
                    path = item.get("relative_path") or item.get("relativePath") or item.get("path")
                    digest = item.get("sha256") or item.get("hash")
                    if path and digest:
                        rows.append({"path": path, "sha256": digest, "bytes": item.get("bytes")})
                if rows:
                    return rows
        return []

    def audit_return_package(self) -> None:
        package = self.return_root
        if not package.is_dir():
            self.add("return_package", "PENDING", "The Desktop return package has not been assembled yet.", evidence={"path": str(package)})
            return
        errors: list[str] = []
        required_top = (
            "START-HERE.md", "MACHINE-RANKINGS.csv", "EPOCH-SUMMARIES.md", "RIGHTS-AND-PROVENANCE.md",
            "UNITY-INTEGRATION-HANDOFF.md", "REJECTED-AND-EXCLUDED.md", "RESUME-STATE.json",
            "RETURN-PACKAGE-VALIDATION.json",
        )
        for name in required_top:
            if not (package / name).is_file():
                errors.append(f"missing top-level return artifact: {name}")
        normalized_by_epoch_rank = {
            (EPOCH_CODES.get(str(row.get("epoch_alias"))), int(row.get("role_rank", 0))): str(row.get("normalized_wav_sha256", ""))
            for row in self.primary_selections
        }
        for index in range(1, 10):
            code = f"E{index:02d}"
            directory = package / "BEST-OF-9-EPOCHS" / code
            if not directory.is_dir():
                errors.append(f"missing epoch return directory: {code}")
                continue
            for rank in range(1, 4):
                pick = directory / f"PICK-{rank:02d}.wav"
                if not pick.is_file():
                    errors.append(f"{code}: missing {pick.name}")
                else:
                    expected = normalized_by_epoch_rank.get((code, rank))
                    if not expected or sha256_file(pick, self.sha_cache) != expected:
                        errors.append(f"{code}: {pick.name} does not hash-match its shortlisted normalized master")
            files = [path.name.casefold() for path in directory.rglob("*") if path.is_file()]
            if sum("preview" in name or name.endswith(".m4a") for name in files) < 3:
                errors.append(f"{code}: fewer than three previews")
            if sum("loop" in name or "seam" in name for name in files) < 3:
                errors.append(f"{code}: fewer than three loop checks")
            if sum("metadata" in name and name.endswith(".json") for name in files) < 3:
                errors.append(f"{code}: fewer than three metadata JSON files")
        radio_expected = {"EARLY-STUDIO", "POSTWAR", "DIGITAL-ERA"}
        radio_root = package / "RADIO-DEMO"
        if not radio_root.is_dir() or not radio_expected.issubset({path.name for path in radio_root.iterdir() if path.is_dir()}):
            errors.append("return package does not contain all three RADIO-DEMO directories")
        audition = package / "AUDITION-APP"
        if not audition.is_dir() or not (audition / "START-AUDITION.command").is_file():
            errors.append("return package AUDITION-APP launcher is missing")
        manifest_candidates = [
            package / "RETURN-PACKAGE-MANIFEST.json", package / "MANIFEST.json", package / "SHA256SUMS.txt",
        ]
        manifest = next((path for path in manifest_candidates if path.is_file()), None)
        manifest_rows: list[dict[str, Any]] = []
        manifest_coverage = False
        if manifest is None:
            errors.append("return package hash manifest is missing")
        else:
            try:
                manifest_rows = self.extract_return_manifest_rows(manifest)
                if not manifest_rows:
                    errors.append(f"return package manifest has no auditable rows: {manifest}")
                for row in manifest_rows:
                    value = str(row.get("path", ""))
                    target = resolved_path(value, package)
                    try:
                        target.resolve().relative_to(package.resolve())
                    except ValueError:
                        errors.append(f"manifest path escapes return root: {value}")
                        continue
                    self.audited_file(target, str(row.get("sha256", "")), row.get("bytes"), errors, f"return:{value}")
                listed_paths = {str(row.get("path", "")) for row in manifest_rows}
                manifestable_paths = {
                    path.relative_to(package).as_posix()
                    for path in package.rglob("*")
                    if path.is_file() and path.name != "SHA256SUMS.txt"
                }
                manifest_coverage = listed_paths == manifestable_paths
                if not manifest_coverage:
                    missing_from_manifest = sorted(manifestable_paths - listed_paths)
                    stale_manifest_paths = sorted(listed_paths - manifestable_paths)
                    errors.append(
                        "return manifest coverage mismatch: "
                        f"unlisted={missing_from_manifest[:20]}, stale={stale_manifest_paths[:20]}"
                    )
            except (OSError, ValueError, TypeError) as exc:
                errors.append(f"return package manifest is invalid: {exc}")
        validation_path = package / "RETURN-PACKAGE-VALIDATION.json"
        validation_checks_pass = False
        validation_counts_match = False
        if validation_path.is_file():
            try:
                validation = read_json(validation_path)
                validation_checks_pass = bool(validation.get("checks")) and all(validation.get("checks", {}).values())
                counts = validation.get("counts", {})
                validation_counts_match = (
                    counts.get("epochs") == 9
                    and counts.get("primary_picks") == 27
                    and counts.get("radio_demo_programs") == 3
                    and counts.get("audition_app_assets") == 84
                    and len(validation.get("primary_mappings", [])) == 27
                    and validation.get("human_owner_listening_acceptance") is False
                )
                if not validation_checks_pass:
                    errors.append("RETURN-PACKAGE-VALIDATION checks are not all true")
                if not validation_counts_match:
                    errors.append("RETURN-PACKAGE-VALIDATION counts/authority boundary do not reconcile")
            except (OSError, ValueError, TypeError) as exc:
                errors.append(f"RETURN-PACKAGE-VALIDATION is invalid: {exc}")
        conditions = {
            "nine_epoch_directories": (package / "BEST-OF-9-EPOCHS").is_dir() and len([p for p in (package / "BEST-OF-9-EPOCHS").iterdir() if p.is_dir() and re.fullmatch(r"E0[1-9]", p.name)]) == 9,
            "twenty_seven_exact_pick_wavs": len(list((package / "BEST-OF-9-EPOCHS").glob("E0[1-9]/PICK-0[1-3].wav"))) == 27,
            "radio_demo_dirs": radio_root.is_dir() and radio_expected.issubset({p.name for p in radio_root.iterdir() if p.is_dir()}),
            "audition_app": audition.is_dir() and (audition / "START-AUDITION.command").is_file(),
            "hash_manifest_present": manifest is not None and bool(manifest_rows),
            "hash_manifest_complete": manifest_coverage,
            "package_validation_pass": validation_checks_pass and validation_counts_match,
        }
        errors.extend(f"condition failed: {key}" for key, passed in conditions.items() if not passed)
        self.add(
            "return_package", "PASS" if not errors else "FAIL",
            "The Desktop return package has the required structure, 27 hash-matched picks, three radio demos, offline audition app, handoff documents, resume state, and verified manifest." if not errors else "Return-package reconciliation failed.",
            evidence={
                "path": str(package), "manifest": str(manifest) if manifest else None,
                "manifest_row_count": len(manifest_rows),
                "validation": str(validation_path),
                "validation_sha256": sha256_file(validation_path, self.sha_cache) if validation_path.is_file() else None,
                "conditions": conditions,
            },
            errors=errors,
        )

    def allocated_size(self, roots: Iterable[Path]) -> dict[str, int]:
        seen: set[tuple[int, int]] = set()
        logical = 0
        allocated = 0
        files = 0
        for root in roots:
            if not root.exists():
                continue
            for directory, dirnames, filenames in os.walk(root, followlinks=False):
                # Symlinked directories are retained as links and are not traversed.
                dirnames[:] = [name for name in dirnames if not (Path(directory) / name).is_symlink()]
                for name in filenames:
                    path = Path(directory) / name
                    try:
                        st = path.lstat()
                    except OSError:
                        continue
                    key = (st.st_dev, st.st_ino)
                    if key in seen:
                        continue
                    seen.add(key)
                    files += 1
                    logical += st.st_size
                    allocated += st.st_blocks * 512
        return {"unique_inodes": len(seen), "files": files, "logical_bytes": logical, "allocated_bytes": allocated}

    def audit_disk(self) -> None:
        usage = self.allocated_size((self.root, self.return_root))
        cap = 80 * 1024**3
        passed = usage["allocated_bytes"] < cap and usage["logical_bytes"] < cap
        self.add(
            "retained_disk_cap", "PASS" if passed else "FAIL",
            f"Retained marathon and return-package allocation is {usage['allocated_bytes'] / 1024**3:.3f} GiB, below the 80 GiB cap." if passed else "Retained work exceeds the 80 GiB cap.",
            evidence={**usage, "cap_bytes": cap, "roots": [str(self.root), str(self.return_root)]},
        )

    def audit_processes(self) -> None:
        result = run_readonly(["ps", "-axo", "pid=,ppid=,etime=,state=,command="])
        if result.returncode != 0:
            self.add("process_teardown_and_collision", "FAIL", "Could not inspect the process table.", errors=[result.stderr.strip()])
            return
        unity: list[str] = []
        studio: list[str] = []
        p05: list[str] = []
        owned: list[str] = []
        for line in result.stdout.splitlines():
            folded = line.casefold()
            if "final_reconciliation_audit.py" in folded:
                continue
            if re.search(r"unity\.app/contents/macos/unity(?:\s|$)", folded) or ("unity" in folded and "-batchmode" in folded):
                unity.append(line.strip())
            if re.search(r"project studio\.app/contents/macos/project studio", folded):
                studio.append(line.strip())
            if ("p05" in folded or "p05-proof" in folded) and ("the movies" in folded or "project studio" in folded or "unity" in folded):
                p05.append(line.strip())
            if any(token in folded for token in ("sa3_mlx.py", "generate_canonical.py", "rescue_r1.py", "refinement_phase_f.py", "serve_audition.py")):
                owned.append(line.strip())
        if unity or studio or p05:
            status = "FAIL"
            summary = "Unity, packaged Project: Studio, or P05-specific processes are active."
        elif owned:
            status = "PENDING"
            summary = "Marathon-owned inference/server processes are still active; final teardown is pending."
        else:
            status = "PASS"
            summary = "No Unity Editor/batchmode, packaged Project: Studio, P05-specific, audition-server, or marathon-inference process is active."
        self.add(
            "process_teardown_and_collision", status, summary,
            evidence={"unity": unity, "project_studio_player": studio, "p05_specific": p05, "marathon_owned": owned},
            limitations=["A point-in-time process table proves only the observed instant; it does not prove historical non-launch or non-interference."],
        )

    def audit_status_language(self) -> None:
        errors: list[str] = []
        exact_forbidden = {"FINAL", "SHIP READY", "CLEARED FOR IMPORT", "CLEARED FOR SHIP", "COMMERCIAL MASTER", "OWNER APPROVED"}
        scanned = 0
        hits: list[dict[str, str]] = []
        roots = [
            self.root / "00_state", self.root / "01_catalogue", self.root / "03_analysis", self.root / "05_shortlists",
            self.root / "06_radio", self.root / "08_endurance", self.root / "09_provenance", self.root / "11_return-package",
        ]
        if self.return_root.exists():
            roots.append(self.return_root)
        for base in roots:
            if not base.exists():
                continue
            for path in base.rglob("*"):
                if not path.is_file() or path.suffix.casefold() not in {".json", ".csv"} or path.stat().st_size > 8 * 1024 * 1024:
                    continue
                if any(part in {"cache", ".jury-venv", "node_modules"} for part in path.parts):
                    continue
                scanned += 1
                try:
                    values: Iterable[Any]
                    if path.suffix.casefold() == ".json":
                        values = iter_json_values(read_json(path))
                    else:
                        values = (value for row in read_csv(path) for value in row.values())
                    for value in values:
                        if isinstance(value, str) and value.strip().upper() in exact_forbidden:
                            hits.append({"path": str(path), "value": value.strip().upper()})
                except (OSError, ValueError, TypeError):
                    continue
        if hits:
            errors.append(f"forbidden exact authority labels found: {hits}")
        self.add(
            "prototype_status_language", "PASS" if not errors else "FAIL",
            "Structured metadata contains no forbidden final/ship/Owner-approval status values." if not errors else "Forbidden authority language appears as structured status data.",
            evidence={"structured_files_scanned": scanned, "hits": hits}, errors=errors,
        )

    def audit_human_boundary(self) -> None:
        self.add(
            "human_owner_listening_acceptance", "NOT_PROVABLE",
            "No machine or filesystem audit can establish human/Owner listening acceptance, fatigue comfort, copyrightability, exclusivity, non-infringement, commercial clearance, cultural acceptance, or final musical quality.",
            mandatory=False,
            limitations=[
                "The package remains PROTOTYPE_ONLY or PROTOTYPE_READY_FOR_OWNER_AUDITION.",
                "Owner audition and rights/cultural review are required before any production decision.",
            ],
        )

    def run(self) -> dict[str, Any]:
        # Order matters: refinement source mapping depends on shortlist primaries.
        self.audit_phase_a()
        self.audit_pool_164()
        self.audit_shortlist()
        self.audit_refinements()
        self.audit_medium()
        self.audit_radio_scripts()
        self.audit_voice()
        self.audit_radio_demos()
        self.audit_endurance()
        self.audit_app()
        self.audit_git()
        self.audit_return_package()
        self.audit_disk()
        self.audit_processes()
        self.audit_status_language()
        self.audit_human_boundary()
        status_counts = Counter(check["status"] for check in self.checks)
        mandatory_failures = [check["id"] for check in self.checks if check["mandatory"] and check["status"] == "FAIL"]
        mandatory_pending = [check["id"] for check in self.checks if check["mandatory"] and check["status"] == "PENDING"]
        if mandatory_failures:
            overall = "FAIL"
        elif mandatory_pending:
            overall = "INCOMPLETE"
        else:
            overall = "PASS"
        return {
            "schema": "project-studio-audio-foundry-final-reconciliation/v1",
            "tool_version": VERSION,
            "generated_utc": utc_now(),
            "mode": "READ_ONLY_AUDIT_EXCEPT_ATOMIC_REPORT_OUTPUTS",
            "overall_status": overall,
            "status_counts": dict(sorted(status_counts.items())),
            "mandatory_failures": mandatory_failures,
            "mandatory_pending": mandatory_pending,
            "roots": {"marathon": str(self.root), "return_package": str(self.return_root), "documentation_repo": str(self.repo)},
            "checks": self.checks,
            "authority_boundary": {
                "deterministically_proved": "Only the exact file, hash, schema/count, status, launcher/static-code, Git-tree, disk-allocation, and point-in-time process checks recorded above.",
                "not_proved": "No human/Owner listening acceptance, musical quality, fatigue comfort, cultural acceptance, copyrightability, exclusivity, non-infringement, commercial clearance, or production suitability.",
                "rights_status": "All audio remains PROTOTYPE_ONLY or PROTOTYPE_READY_FOR_OWNER_AUDITION.",
                "unity_integration": "PREPARED BUT NOT EXECUTED; this auditor performs no Unity operation.",
            },
        }


def log_text(report: Mapping[str, Any]) -> str:
    lines = [
        f"Audio Foundry Marathon 01 final reconciliation ({report['tool_version']})",
        f"Generated UTC: {report['generated_utc']}",
        f"Overall: {report['overall_status']}",
        "",
    ]
    for check in report["checks"]:
        marker = "required" if check["mandatory"] else "non-blocking"
        lines.append(f"[{check['status']}] {check['id']} ({marker}) — {check['summary']}")
        for error in check.get("errors", []):
            lines.append(f"  ERROR: {error}")
        for limitation in check.get("limitations", []):
            lines.append(f"  LIMIT: {limitation}")
    lines.extend((
        "",
        "Authority boundary:",
        f"  Deterministically proved: {report['authority_boundary']['deterministically_proved']}",
        f"  Not proved: {report['authority_boundary']['not_proved']}",
        f"  Rights: {report['authority_boundary']['rights_status']}",
        f"  Unity: {report['authority_boundary']['unity_integration']}",
    ))
    return "\n".join(lines) + "\n"


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--marathon-root", type=Path, default=DEFAULT_MARATHON_ROOT)
    parser.add_argument("--return-root", type=Path, default=DEFAULT_RETURN_ROOT)
    parser.add_argument("--repo-root", type=Path, default=DEFAULT_REPO)
    parser.add_argument("--json-output", type=Path)
    parser.add_argument("--log-output", type=Path)
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    root = args.marathon_root.resolve()
    if not root.is_dir():
        print(f"Marathon root is missing: {root}", file=sys.stderr)
        return 2
    json_output = (args.json_output or root / "09_provenance/final-reconciliation-audit.json").resolve()
    log_output = (args.log_output or root / "10_logs/final-reconciliation-audit.log").resolve()
    auditor = Auditor(root, args.return_root, args.repo_root)
    report = auditor.run()
    encoded = (json.dumps(report, indent=2, sort_keys=True, ensure_ascii=False) + "\n").encode("utf-8")
    atomic_write(json_output, encoded)
    atomic_write(log_output, log_text(report).encode("utf-8"))
    print(json.dumps({
        "overall_status": report["overall_status"],
        "status_counts": report["status_counts"],
        "mandatory_failures": report["mandatory_failures"],
        "mandatory_pending": report["mandatory_pending"],
        "json_output": str(json_output),
        "json_sha256": sha256_file(json_output),
        "log_output": str(log_output),
        "log_sha256": sha256_file(log_output),
    }, indent=2, sort_keys=True))
    return 1 if report["overall_status"] == "FAIL" else 3 if report["overall_status"] == "INCOMPLETE" else 0


if __name__ == "__main__":
    raise SystemExit(main())
