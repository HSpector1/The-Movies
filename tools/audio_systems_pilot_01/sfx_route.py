#!/usr/bin/env python3
"""Gate and materialize the official Stable Audio Small-SFX MLX route.

This script deliberately avoids the gated canonical checkpoint.  It records
the canonical identity, checks the public optimized repository at an exact
revision, downloads only the required MLX SFX DiT, and makes private copies of
the already-approved shared weights.  No token is read or sent.
"""

from __future__ import annotations

import argparse
import copy
import datetime as dt
import json
import os
import shutil
import subprocess
import tempfile
import urllib.error
import urllib.request
from pathlib import Path
from typing import Any

from common import PILOT_ROOT, TOOLING_ROOT, atomic_write_json, materialize_verified, sha256_file, utc_now


CODE_COMMIT = "c3909628db1ae2b57bed40a493c73c67ad674dc5"
MUSIC_CANONICAL_REVISION = "0fef1392cd842149a2b6d445e181c97608faac06"
SFX_CANONICAL_REVISION = "ae12755283df9d62ca39a9b050a39a0b607b8c20"
OPTIMIZED_REVISION = "b5182df73f4aca4336c5c1b642ca6c44d5b085ec"
SFX_WEIGHT_BYTES = 919_193_814
SFX_WEIGHT_SHA256 = "7e702d2640699a57fe436ca975fda16832040ba568c1e092c2ae826987558118"
COMMUNITY_LICENSE_BYTES = 11_852
COMMUNITY_LICENSE_SHA256 = "d6f6b1a4dce5c852bd6d7d9482d002baf0ccdb71e662250b73be9eec8764ee8d"
GEMMA_LICENSE_BYTES = 10_541
GEMMA_LICENSE_SHA256 = "e77acc0d3163bb7534675045c584b4d04b387b529239fc4b3647da0a01ba4745"
OPTIMIZED_API_SNAPSHOT_BYTES = 12_527
OPTIMIZED_API_SNAPSHOT_SHA256 = "31c097a11eee9daadf12ae8f1c13dd6c1d46b5ae4eaad419ebc564040a16ca60"
CANONICAL_SFX_PROBE_BYTES = 29
CANONICAL_SFX_PROBE_SHA256 = "45b71fe98efe5f530b825dce6f5049d738e9c16869f10be4370ab81a9912d4a6"
EXPECTED_DECISION = "USE_PUBLIC_OPTIMIZED_MLX_SFX_WEIGHT_WITH_EXISTING_APPROVED_SHARED_COMPONENTS"
EXPECTED_TERMS_DECISION = "NO_NEW_TERMS_ACCEPTED; NO_CANONICAL_GATED_CHECKPOINT_DOWNLOADED"
EXPECTED_LIMITATIONS = [
    "The gate proves exact files, code identity, public route availability, and bounded download size only.",
    "Canonical Small-SFX license bytes were not independently captured because anonymous pinned endpoints returned HTTP 401; only the public optimized route is selected.",
    "It does not establish copyrightability, non-infringement, exclusivity, commercial clearance, historical accuracy, or listening quality.",
    "All generated outputs remain PROTOTYPE_ONLY pending Owner and rights review.",
]

OLD_CODE = TOOLING_ROOT / "stable-audio-3"
OLD_WEIGHTS = OLD_CODE / "optimized/mlx/models/mlx"
TOOLCHAIN = PILOT_ROOT / f"10_provenance/toolchain/stable-audio-3-{CODE_COMMIT}"
LICENSE_DIR = PILOT_ROOT / "10_provenance/sfx-route/licenses"
GATE_V1_PATH = PILOT_ROOT / "10_provenance/sfx-route-gate.json"
GATE_PATH = PILOT_ROOT / "10_provenance/sfx-route-gate.v2.json"
LOG_PATH = PILOT_ROOT / "12_logs/sfx-route-gate.v2.log"
MODEL_DIR = TOOLCHAIN / "optimized/mlx/models/mlx"

OPTIMIZED_REPO_ID = "stabilityai/stable-audio-3-optimized"
OPTIMIZED_API = (
    "https://huggingface.co/api/models/stabilityai/stable-audio-3-optimized/revision/"
    + OPTIMIZED_REVISION
)
OPTIMIZED_LICENSE_URL = (
    "https://huggingface.co/stabilityai/stable-audio-3-optimized/resolve/"
    + OPTIMIZED_REVISION
    + "/LICENSE.md"
)
OPTIMIZED_GEMMA_URL = (
    "https://huggingface.co/stabilityai/stable-audio-3-optimized/resolve/"
    + OPTIMIZED_REVISION
    + "/LICENSE_GEMMA.md"
)
MUSIC_LICENSE_URL = (
    "https://huggingface.co/stabilityai/stable-audio-3-small-music/resolve/"
    + MUSIC_CANONICAL_REVISION
    + "/LICENSE.md"
)
SFX_LICENSE_URL = (
    "https://huggingface.co/stabilityai/stable-audio-sfx/resolve/"
    + SFX_CANONICAL_REVISION
    + "/LICENSE.md"
)
SFX_GEMMA_URL = (
    "https://huggingface.co/stabilityai/stable-audio-sfx/resolve/"
    + SFX_CANONICAL_REVISION
    + "/LICENSE_GEMMA.md"
)
SFX_WEIGHT_URL = (
    "https://huggingface.co/stabilityai/stable-audio-3-optimized/resolve/"
    + OPTIMIZED_REVISION
    + "/MLX/dit_sm-sfx_f16.npz?download=true"
)

SHARED_WEIGHTS = {
    "dit_sm-music_f16.npz": (919_193_814, "8ed3f38e2597f361ee675051f1265d9aa2ae2fffce1c61acd2e9fe31e1db1cbc"),
    "same_s_decoder_f32.npz": (218_090_820, "909928a8e6937c1ebe6ac4b729f0462bd3773704a11ea18278e42671dc69bfe4"),
    "t5gemma_f16.npz": (567_443_068, "8deb20489f36d9aec539f26c9c67321f99bc5fe300d470435ed6e76be4f16bbd"),
}


def file_record(path: Path) -> dict[str, Any]:
    return {"path": str(path), "bytes": path.stat().st_size, "sha256": sha256_file(path)}


def require_file(path: Path, expected_sha256: str | None = None) -> Path:
    if not path.is_file():
        raise RuntimeError(f"required file is missing: {path}")
    if expected_sha256 is not None and sha256_file(path) != expected_sha256:
        raise RuntimeError(f"required file hash mismatch: {path}")
    return path


def _safe_environment() -> dict[str, str]:
    env = dict(os.environ)
    for key in ("HF_TOKEN", "HUGGING_FACE_HUB_TOKEN"):
        env.pop(key, None)
    env.update(
        {
            "HF_HUB_DISABLE_TELEMETRY": "1",
            "DO_NOT_TRACK": "1",
            "GIT_TERMINAL_PROMPT": "0",
        }
    )
    return env


def _request_bytes(url: str) -> tuple[bytes, dict[str, str], int]:
    request = urllib.request.Request(
        url,
        headers={"User-Agent": "Project-Studio-Audio-Systems-Pilot/1.0"},
    )
    try:
        with urllib.request.urlopen(request, timeout=60) as response:
            return response.read(), dict(response.headers.items()), int(response.status)
    except urllib.error.HTTPError as error:
        body = error.read()
        raise RuntimeError(f"HTTP {error.code} for {url}: {body[:240]!r}") from error


def _request_status(url: str) -> dict[str, Any]:
    request = urllib.request.Request(
        url,
        headers={"User-Agent": "Project-Studio-Audio-Systems-Pilot/1.0"},
    )
    try:
        with urllib.request.urlopen(request, timeout=60) as response:
            payload = response.read()
            return {
                "http_status": int(response.status),
                "bytes": len(payload),
                "sha256": __import__("hashlib").sha256(payload).hexdigest(),
                "headers": {
                    key.lower(): value
                    for key, value in response.headers.items()
                    if key.lower() in {"etag", "x-repo-commit", "content-length", "date"}
                },
            }
    except urllib.error.HTTPError as error:
        payload = error.read()
        return {
            "http_status": int(error.code),
            "bytes": len(payload),
            "sha256": __import__("hashlib").sha256(payload).hexdigest(),
            "headers": {
                key.lower(): value
                for key, value in error.headers.items()
                if key.lower() in {"etag", "x-repo-commit", "content-length", "date", "x-error-code"}
            },
        }


def _publish_bytes(path: Path, payload: bytes, expected_sha256: str) -> dict[str, Any]:
    actual = __import__("hashlib").sha256(payload).hexdigest()
    if actual != expected_sha256:
        raise RuntimeError(f"payload hash mismatch for {path}: expected {expected_sha256}, got {actual}")
    path.parent.mkdir(parents=True, exist_ok=True)
    if path.exists():
        if not path.is_file() or sha256_file(path) != expected_sha256:
            raise RuntimeError(f"existing evidence differs; refusing overwrite: {path}")
        return {**file_record(path), "reused": True}
    descriptor, temp_name = tempfile.mkstemp(prefix=f".{path.name}.", suffix=".tmp", dir=path.parent)
    temp = Path(temp_name)
    try:
        with os.fdopen(descriptor, "wb") as handle:
            handle.write(payload)
            handle.flush()
            os.fsync(handle.fileno())
        os.chmod(temp, 0o444)
        os.replace(temp, path)
    finally:
        temp.unlink(missing_ok=True)
    return {**file_record(path), "reused": False}


def _clone_toolchain() -> dict[str, Any]:
    require_file(OLD_CODE / ".git/HEAD")
    old_head = subprocess.run(
        ["git", "rev-parse", "HEAD"], cwd=OLD_CODE, check=True, capture_output=True, text=True
    ).stdout.strip()
    if old_head != CODE_COMMIT:
        raise RuntimeError(f"old reference checkout moved: expected {CODE_COMMIT}, got {old_head}")
    if TOOLCHAIN.exists():
        if not (TOOLCHAIN / ".git").is_dir():
            raise RuntimeError(f"toolchain destination exists but is not a checkout: {TOOLCHAIN}")
        actual = subprocess.run(
            ["git", "rev-parse", "HEAD"], cwd=TOOLCHAIN, check=True, capture_output=True, text=True
        ).stdout.strip()
        if actual != CODE_COMMIT:
            raise RuntimeError(f"toolchain checkout mismatch: expected {CODE_COMMIT}, got {actual}")
        return {"path": str(TOOLCHAIN), "commit": actual, "reused": True, "source_checkout_head": old_head}

    TOOLCHAIN.parent.mkdir(parents=True, exist_ok=True)
    temp = TOOLCHAIN.parent / f".{TOOLCHAIN.name}.building-{os.getpid()}"
    if temp.exists():
        raise RuntimeError(f"stale toolchain build destination exists: {temp}")
    try:
        subprocess.run(
            ["git", "clone", "--no-hardlinks", "--no-checkout", str(OLD_CODE), str(temp)],
            check=True,
            env=_safe_environment(),
            capture_output=True,
            text=True,
        )
        subprocess.run(
            ["git", "checkout", "--detach", CODE_COMMIT],
            cwd=temp,
            check=True,
            env=_safe_environment(),
            capture_output=True,
            text=True,
        )
        subprocess.run(
            ["git", "remote", "remove", "origin"], cwd=temp, check=True, capture_output=True, text=True
        )
        os.replace(temp, TOOLCHAIN)
    except Exception:
        if temp.exists():
            shutil.rmtree(temp)
        raise
    return {"path": str(TOOLCHAIN), "commit": CODE_COMMIT, "reused": False, "source_checkout_head": old_head}


def _materialize_shared_weights() -> list[dict[str, Any]]:
    records: list[dict[str, Any]] = []
    for name, (expected_bytes, expected_hash) in SHARED_WEIGHTS.items():
        source = OLD_WEIGHTS / name
        if source.stat().st_size != expected_bytes:
            raise RuntimeError(f"shared source weight size mismatch: {source}")
        destination = MODEL_DIR / name
        record = materialize_verified(source, destination, expected_hash)
        source_stat = source.stat()
        destination_stat = destination.stat()
        if source.is_symlink() or destination.is_symlink():
            raise RuntimeError(f"weight must not be a symlink: {name}")
        if source_stat.st_ino == destination_stat.st_ino and source_stat.st_dev == destination_stat.st_dev:
            raise RuntimeError(f"weight unexpectedly shares an inode with preserved source: {name}")
        record.update(
            {
                "source": str(source),
                "source_bytes": expected_bytes,
                "copy_on_write_or_copy": True,
                "source_inode": source_stat.st_ino,
                "destination_inode": destination_stat.st_ino,
                "hardlink": False,
                "symlink": False,
            }
        )
        records.append(record)
    return records


def _download_sfx_weight() -> dict[str, Any]:
    destination = MODEL_DIR / "dit_sm-sfx_f16.npz"
    if destination.exists():
        if destination.stat().st_size != SFX_WEIGHT_BYTES or sha256_file(destination) != SFX_WEIGHT_SHA256:
            raise RuntimeError(f"existing SFX weight differs; refusing overwrite: {destination}")
        return {**file_record(destination), "reused": True, "url": SFX_WEIGHT_URL}
    destination.parent.mkdir(parents=True, exist_ok=True)
    partial = destination.with_name(f".{destination.name}.partial")
    completed = subprocess.run(
        [
            "curl",
            "--fail",
            "--location",
            "--retry",
            "3",
            "--retry-all-errors",
            "--continue-at",
            "-",
            "--user-agent",
            "Project-Studio-Audio-Systems-Pilot/1.0",
            "--output",
            str(partial),
            SFX_WEIGHT_URL,
        ],
        check=False,
        env=_safe_environment(),
        capture_output=True,
        text=True,
    )
    if completed.returncode != 0:
        raise RuntimeError(f"SFX MLX weight download failed: {completed.stderr.strip()}")
    if partial.stat().st_size != SFX_WEIGHT_BYTES:
        raise RuntimeError(
            f"SFX MLX weight size mismatch: expected {SFX_WEIGHT_BYTES}, got {partial.stat().st_size}"
        )
    actual = sha256_file(partial)
    if actual != SFX_WEIGHT_SHA256:
        raise RuntimeError(f"SFX MLX weight hash mismatch: expected {SFX_WEIGHT_SHA256}, got {actual}")
    os.chmod(partial, 0o444)
    os.replace(partial, destination)
    return {**file_record(destination), "reused": False, "url": SFX_WEIGHT_URL}


def verify_gate_data(data: dict[str, Any]) -> None:
    expected_top_keys = {
        "schema_version", "generated_at_utc", "status", "decision", "rights_status", "terms_decision",
        "official_identities", "route_checks", "license_evidence", "toolchain", "shared_weights",
        "small_sfx_weight", "download_url", "errors", "limitations", "supersedes",
    }
    if set(data) != expected_top_keys or data.get("status") != "PASSED" or data.get("schema_version") != 2:
        raise RuntimeError("SFX route manifest is not a v2 pass")
    try:
        dt.datetime.fromisoformat(str(data["generated_at_utc"]).replace("Z", "+00:00"))
    except ValueError as error:
        raise RuntimeError("SFX route generated timestamp is malformed") from error
    if (data.get("decision") != EXPECTED_DECISION
            or data.get("rights_status") != "PROTOTYPE_ONLY"
            or data.get("terms_decision") != EXPECTED_TERMS_DECISION
            or data.get("limitations") != EXPECTED_LIMITATIONS
            or data.get("errors") != []
            or data.get("download_url") != SFX_WEIGHT_URL):
        raise RuntimeError("SFX route decision/status/terms/limitations contract mismatch")
    identities = data.get("official_identities", {})
    expected_identities = {
        "code_repository": "Stability-AI/stable-audio-3",
        "code_commit": CODE_COMMIT,
        "canonical_small_music_repository": "stabilityai/stable-audio-3-small-music",
        "canonical_small_music_revision": MUSIC_CANONICAL_REVISION,
        "canonical_small_sfx_repository": "stabilityai/stable-audio-sfx",
        "canonical_small_sfx_revision": SFX_CANONICAL_REVISION,
        "optimized_repository": OPTIMIZED_REPO_ID,
        "optimized_revision": OPTIMIZED_REVISION,
    }
    if identities != expected_identities:
        raise RuntimeError("SFX route identity mismatch")
    route = data.get("route_checks", {})
    expected_route_scalars = {
        "official_optimized_repository_ungated": True,
        "optimized_repository_private": False,
        "optimized_repository_gated": False,
        "optimized_api_http_status": 200,
        "additional_weight_download_bytes": SFX_WEIGHT_BYTES,
        "additional_weight_download_limit_bytes": 1_500_000_000,
        "within_download_limit": True,
        "network_or_cloud_inference": False,
        "paid_service": False,
        "system_install": False,
    }
    if (set(route) != {*expected_route_scalars, "optimized_api_snapshot", "optimized_api_response_headers"}
            or any(route.get(key) is not value if isinstance(value, bool) else route.get(key) != value
                   for key, value in expected_route_scalars.items())):
        raise RuntimeError("SFX route public/download/no-cloud decision checks are not exact")
    api_headers = route.get("optimized_api_response_headers", {})
    if (api_headers.get("content-length") != "9315"
            or api_headers.get("etag") != 'W/"2463-QlDgHVmWoduKXNuatDSqRdBo+7A"'):
        raise RuntimeError("SFX route optimized API response identity mismatch")
    metadata_record = route["optimized_api_snapshot"]
    expected_metadata_path = PILOT_ROOT / "10_provenance/sfx-route/optimized-repository-api.v2.json"
    if metadata_record != {
        "path": str(expected_metadata_path), "bytes": OPTIMIZED_API_SNAPSHOT_BYTES,
        "sha256": OPTIMIZED_API_SNAPSHOT_SHA256, "reused": False,
    }:
        raise RuntimeError("SFX route optimized API snapshot record mismatch")
    metadata_path = require_file(expected_metadata_path, OPTIMIZED_API_SNAPSHOT_SHA256)
    if metadata_path.stat().st_size != OPTIMIZED_API_SNAPSHOT_BYTES or metadata_path.is_symlink():
        raise RuntimeError("SFX route optimized API snapshot size/type mismatch")
    metadata = json.loads(metadata_path.read_text(encoding="utf-8"))
    siblings = {row.get("rfilename") for row in metadata.get("siblings", []) if isinstance(row, dict)}
    if (metadata.get("id") != OPTIMIZED_REPO_ID or metadata.get("modelId") != OPTIMIZED_REPO_ID
            or metadata.get("sha") != OPTIMIZED_REVISION or metadata.get("private") is not False
            or metadata.get("gated") is not False or metadata.get("disabled") is not False
            or metadata.get("library_name") != "stable-audio-3" or metadata.get("pipeline_tag") != "text-to-audio"
            or not {"LICENSE.md", "LICENSE_GEMMA.md", "MLX/dit_sm-sfx_f16.npz"} <= siblings):
        raise RuntimeError("SFX route optimized API snapshot content mismatch")

    toolchain_record = data.get("toolchain", {})
    if (toolchain_record.get("path") != str(TOOLCHAIN) or toolchain_record.get("commit") != CODE_COMMIT
            or toolchain_record.get("source_checkout_head") != CODE_COMMIT
            or not isinstance(toolchain_record.get("reused"), bool)):
        raise RuntimeError("SFX route toolchain record mismatch")
    toolchain = Path(toolchain_record["path"])
    actual_commit = subprocess.run(
        ["git", "rev-parse", "HEAD"], cwd=toolchain, check=True, capture_output=True, text=True
    ).stdout.strip()
    if actual_commit != CODE_COMMIT:
        raise RuntimeError(f"toolchain commit mismatch: {actual_commit}")
    tracked_changes = subprocess.run(
        ["git", "status", "--porcelain", "--untracked-files=no"],
        cwd=toolchain,
        check=True,
        capture_output=True,
        text=True,
    ).stdout.strip()
    if tracked_changes:
        raise RuntimeError(f"toolchain tracked files changed: {tracked_changes}")

    license_evidence = data.get("license_evidence", {})
    expected_license_records = {
        "optimized_license": (LICENSE_DIR / "stable-audio-3-optimized-LICENSE.md", COMMUNITY_LICENSE_BYTES, COMMUNITY_LICENSE_SHA256),
        "optimized_gemma_license": (LICENSE_DIR / "stable-audio-3-optimized-LICENSE_GEMMA.md", GEMMA_LICENSE_BYTES, GEMMA_LICENSE_SHA256),
        "canonical_small_music_license": (LICENSE_DIR / "canonical-small-music-LICENSE.md", COMMUNITY_LICENSE_BYTES, COMMUNITY_LICENSE_SHA256),
        "prior_approved_license": (LICENSE_DIR / "prior-approved-canonical-LICENSE.md", COMMUNITY_LICENSE_BYTES, COMMUNITY_LICENSE_SHA256),
        "prior_approved_gemma_license": (LICENSE_DIR / "prior-approved-Gemma-LICENSE.md", GEMMA_LICENSE_BYTES, GEMMA_LICENSE_SHA256),
    }
    expected_basis = [
        "The user-supplied binding authority states that Small-SFX and Small-Music license files are byte-identical; that statement is recorded, not upgraded to independent proof.",
        "The pinned canonical Small-Music license, public optimized repository license, and locally preserved prior-approved copy are independently byte-identical here.",
        "The pinned canonical Small-SFX LICENSE and Gemma endpoints returned HTTP 401 without credentials, so their bytes were not captured and no terms were accepted.",
        "No inference about commercial clearance is made from byte identity.",
    ]
    expected_license_scalars = {
        "user_supplied_authority_statement_small_sfx_and_small_music_license_byte_identical": True,
        "canonical_small_sfx_and_small_music_license_byte_identity_independently_captured_this_run": False,
        "independent_comparison_status": "NOT_CAPTURED_CANONICAL_SMALL_SFX_REPOSITORY_RETURNED_HTTP_401",
        "optimized_route_and_canonical_small_music_community_license_byte_identical": True,
        "community_license_sha256": COMMUNITY_LICENSE_SHA256,
        "community_license_bytes": COMMUNITY_LICENSE_BYTES,
        "basis": expected_basis,
    }
    expected_license_keys = {
        *expected_license_scalars, *expected_license_records,
        "canonical_small_sfx_license_probe", "canonical_small_sfx_gemma_probe",
        "optimized_license_headers", "optimized_gemma_headers", "canonical_small_music_license_headers",
    }
    if set(license_evidence) != expected_license_keys or any(license_evidence.get(key) != value for key, value in expected_license_scalars.items()):
        raise RuntimeError("SFX route license decision evidence mismatch")
    for key, (expected_path, expected_bytes, expected_hash) in expected_license_records.items():
        record = license_evidence[key]
        if (set(record) != {"path", "bytes", "sha256", "reused"}
                or record.get("path") != str(expected_path) or record.get("bytes") != expected_bytes
                or record.get("sha256") != expected_hash or not isinstance(record.get("reused"), bool)):
            raise RuntimeError(f"license evidence role record mismatch: {key}")
        path = require_file(expected_path, expected_hash)
        if path.stat().st_size != expected_bytes or path.is_symlink():
            raise RuntimeError(f"license evidence size/type mismatch: {path}")
    expected_probes = {
        "canonical_small_sfx_license_probe": 401,
        "canonical_small_sfx_gemma_probe": 401,
    }
    for key, status in expected_probes.items():
        probe = license_evidence[key]
        if (probe.get("http_status") != status or probe.get("bytes") != CANONICAL_SFX_PROBE_BYTES
                or probe.get("sha256") != CANONICAL_SFX_PROBE_SHA256
                or probe.get("headers", {}).get("content-length") != str(CANONICAL_SFX_PROBE_BYTES)):
            raise RuntimeError(f"canonical Small-SFX HTTP probe mismatch: {key}")
    expected_header_projections = {
        "optimized_license_headers": (str(COMMUNITY_LICENSE_BYTES), OPTIMIZED_REVISION, '"1d9ce2ee1067327543544de197291726e4fc57a4"'),
        "optimized_gemma_headers": (str(GEMMA_LICENSE_BYTES), OPTIMIZED_REVISION, '"d483de1f58e5de355d8d184f6a7bf42f05875b63"'),
        "canonical_small_music_license_headers": (str(COMMUNITY_LICENSE_BYTES), MUSIC_CANONICAL_REVISION, '"1d9ce2ee1067327543544de197291726e4fc57a4"'),
    }
    for key, (length, commit, etag) in expected_header_projections.items():
        headers = license_evidence[key]
        if headers.get("content-length") != length or headers.get("x-repo-commit") != commit or headers.get("etag") != etag:
            raise RuntimeError(f"license response-header identity mismatch: {key}")

    shared = data.get("shared_weights", [])
    if len(shared) != len(SHARED_WEIGHTS) or {Path(row.get("path", "")).name for row in shared} != set(SHARED_WEIGHTS):
        raise RuntimeError("shared weight identities are incomplete or duplicate")
    for record in shared:
        name = Path(record["path"]).name
        expected_bytes, expected_hash = SHARED_WEIGHTS[name]
        expected_destination = MODEL_DIR / name
        expected_source = OLD_WEIGHTS / name
        if (record.get("path") != str(expected_destination) or record.get("source") != str(expected_source)
                or record.get("bytes") != expected_bytes or record.get("source_bytes") != expected_bytes
                or record.get("sha256") != expected_hash or record.get("copy_on_write_or_copy") is not True
                or record.get("hardlink") is not False or record.get("symlink") is not False
                or not isinstance(record.get("reused"), bool)):
            raise RuntimeError(f"shared weight record mismatch: {name}")
        destination = require_file(expected_destination, expected_hash)
        source = require_file(expected_source, expected_hash)
        if destination.is_symlink() or source.is_symlink():
            raise RuntimeError(f"shared weight symlink detected: {destination}")
        source_stat = source.stat()
        destination_stat = destination.stat()
        if source_stat.st_dev == destination_stat.st_dev and source_stat.st_ino == destination_stat.st_ino:
            raise RuntimeError(f"shared weight hardlink detected: {destination}")
    weight_record = data.get("small_sfx_weight", {})
    expected_weight_path = MODEL_DIR / "dit_sm-sfx_f16.npz"
    if (weight_record.get("path") != str(expected_weight_path) or weight_record.get("bytes") != SFX_WEIGHT_BYTES
            or weight_record.get("sha256") != SFX_WEIGHT_SHA256 or weight_record.get("url") != SFX_WEIGHT_URL
            or not isinstance(weight_record.get("reused"), bool)):
        raise RuntimeError("SFX weight record/download identity mismatch")
    sfx_weight = require_file(expected_weight_path, SFX_WEIGHT_SHA256)
    if sfx_weight.stat().st_size != SFX_WEIGHT_BYTES or sfx_weight.is_symlink():
        raise RuntimeError("SFX weight size/type mismatch")
    supersedes = data.get("supersedes", {})
    if supersedes != {
        "path": str(GATE_V1_PATH), "bytes": 7_343,
        "sha256": "b53c7a9fef6b7bf13bb5dbeeb42284d9826a24c7f9bfc409cba0c94f36c4d699",
        "reason": "v1 overstated independent canonical Small-SFX license comparison and had a shallow verifier",
    }:
        raise RuntimeError("SFX route superseded evidence identity mismatch")


def run_gate() -> dict[str, Any]:
    if GATE_PATH.exists():
        existing = json.loads(GATE_PATH.read_text(encoding="utf-8"))
        verify_gate_data(existing)
        return existing

    errors: list[dict[str, Any]] = []
    metadata_bytes, metadata_headers, metadata_status = _request_bytes(OPTIMIZED_API)
    metadata = json.loads(metadata_bytes)
    metadata_record = _publish_bytes(
        PILOT_ROOT / "10_provenance/sfx-route/optimized-repository-api.v2.json",
        json.dumps(metadata, indent=2, sort_keys=True).encode("utf-8") + b"\n",
        __import__("hashlib").sha256(
            json.dumps(metadata, indent=2, sort_keys=True).encode("utf-8") + b"\n"
        ).hexdigest(),
    )
    if metadata_status != 200 or metadata.get("sha") != OPTIMIZED_REVISION:
        raise RuntimeError("optimized repository API did not resolve the exact requested revision")
    if metadata.get("gated") is not False or metadata.get("private") is not False:
        raise RuntimeError("optimized repository is not publicly accessible and ungated")

    license_bytes, license_headers, _ = _request_bytes(OPTIMIZED_LICENSE_URL)
    gemma_bytes, gemma_headers, _ = _request_bytes(OPTIMIZED_GEMMA_URL)
    optimized_license = _publish_bytes(
        LICENSE_DIR / "stable-audio-3-optimized-LICENSE.md", license_bytes, COMMUNITY_LICENSE_SHA256
    )
    optimized_gemma = _publish_bytes(
        LICENSE_DIR / "stable-audio-3-optimized-LICENSE_GEMMA.md", gemma_bytes, GEMMA_LICENSE_SHA256
    )
    if len(license_bytes) != COMMUNITY_LICENSE_BYTES or len(gemma_bytes) != GEMMA_LICENSE_BYTES:
        raise RuntimeError("official optimized license byte size changed")

    music_license_bytes, music_license_headers, _ = _request_bytes(MUSIC_LICENSE_URL)
    if len(music_license_bytes) != COMMUNITY_LICENSE_BYTES:
        raise RuntimeError("canonical Small-Music license byte size changed")
    canonical_music_license = _publish_bytes(
        LICENSE_DIR / "canonical-small-music-LICENSE.md",
        music_license_bytes,
        COMMUNITY_LICENSE_SHA256,
    )
    canonical_sfx_license_probe = _request_status(SFX_LICENSE_URL)
    canonical_sfx_gemma_probe = _request_status(SFX_GEMMA_URL)

    # The prior approved Small-Music route preserved these exact official bytes.
    # Direct anonymous access to canonical model repositories is intentionally not
    # required here because those model repositories are gated.
    prior_license = TOOLING_ROOT / "stable-audio-3-medium-weights/LICENSE.md"
    prior_gemma = TOOLING_ROOT / "stable-audio-3-medium-weights/LICENSE_GEMMA.md"
    require_file(prior_license, COMMUNITY_LICENSE_SHA256)
    require_file(prior_gemma, GEMMA_LICENSE_SHA256)
    preserved_license = materialize_verified(
        prior_license, LICENSE_DIR / "prior-approved-canonical-LICENSE.md", COMMUNITY_LICENSE_SHA256
    )
    preserved_gemma = materialize_verified(
        prior_gemma, LICENSE_DIR / "prior-approved-Gemma-LICENSE.md", GEMMA_LICENSE_SHA256
    )

    toolchain = _clone_toolchain()
    shared_weights = _materialize_shared_weights()
    sfx_weight = _download_sfx_weight()
    weight_head = subprocess.run(
        [
            "curl",
            "--silent",
            "--show-error",
            "--head",
            "--location",
            "--max-time",
            "60",
            "--user-agent",
            "Project-Studio-Audio-Systems-Pilot/1.0",
            SFX_WEIGHT_URL,
        ],
        check=True,
        capture_output=True,
        text=True,
        env=_safe_environment(),
    ).stdout
    lower_head = weight_head.lower()
    if OPTIMIZED_REVISION not in lower_head or str(SFX_WEIGHT_BYTES) not in lower_head:
        errors.append(
            {
                "classification": "NON_FATAL_HEADER_VARIANCE",
                "detail": "redirect chain did not repeat both exact revision and size; byte/hash proof remains authoritative",
            }
        )

    result: dict[str, Any] = {
        "schema_version": 2,
        "generated_at_utc": utc_now(),
        "status": "PASSED",
        "decision": "USE_PUBLIC_OPTIMIZED_MLX_SFX_WEIGHT_WITH_EXISTING_APPROVED_SHARED_COMPONENTS",
        "rights_status": "PROTOTYPE_ONLY",
        "terms_decision": "NO_NEW_TERMS_ACCEPTED; NO_CANONICAL_GATED_CHECKPOINT_DOWNLOADED",
        "official_identities": {
            "code_repository": "Stability-AI/stable-audio-3",
            "code_commit": CODE_COMMIT,
            "canonical_small_music_repository": "stabilityai/stable-audio-3-small-music",
            "canonical_small_music_revision": MUSIC_CANONICAL_REVISION,
            "canonical_small_sfx_repository": "stabilityai/stable-audio-sfx",
            "canonical_small_sfx_revision": SFX_CANONICAL_REVISION,
            "optimized_repository": OPTIMIZED_REPO_ID,
            "optimized_revision": OPTIMIZED_REVISION,
        },
        "route_checks": {
            "official_optimized_repository_ungated": True,
            "optimized_repository_private": metadata.get("private"),
            "optimized_repository_gated": metadata.get("gated"),
            "optimized_api_http_status": metadata_status,
            "optimized_api_snapshot": metadata_record,
            "optimized_api_response_headers": {
                key.lower(): value
                for key, value in metadata_headers.items()
                if key.lower() in {"etag", "x-repo-commit", "content-length", "date"}
            },
            "additional_weight_download_bytes": SFX_WEIGHT_BYTES,
            "additional_weight_download_limit_bytes": 1_500_000_000,
            "within_download_limit": SFX_WEIGHT_BYTES <= 1_500_000_000,
            "network_or_cloud_inference": False,
            "paid_service": False,
            "system_install": False,
        },
        "license_evidence": {
            "user_supplied_authority_statement_small_sfx_and_small_music_license_byte_identical": True,
            "canonical_small_sfx_and_small_music_license_byte_identity_independently_captured_this_run": False,
            "independent_comparison_status": "NOT_CAPTURED_CANONICAL_SMALL_SFX_REPOSITORY_RETURNED_HTTP_401",
            "optimized_route_and_canonical_small_music_community_license_byte_identical": True,
            "community_license_sha256": COMMUNITY_LICENSE_SHA256,
            "community_license_bytes": COMMUNITY_LICENSE_BYTES,
            "basis": [
                "The user-supplied binding authority states that Small-SFX and Small-Music license files are byte-identical; that statement is recorded, not upgraded to independent proof.",
                "The pinned canonical Small-Music license, public optimized repository license, and locally preserved prior-approved copy are independently byte-identical here.",
                "The pinned canonical Small-SFX LICENSE and Gemma endpoints returned HTTP 401 without credentials, so their bytes were not captured and no terms were accepted.",
                "No inference about commercial clearance is made from byte identity.",
            ],
            "canonical_small_sfx_license_probe": canonical_sfx_license_probe,
            "canonical_small_sfx_gemma_probe": canonical_sfx_gemma_probe,
            "canonical_small_music_license": canonical_music_license,
            "optimized_license": optimized_license,
            "optimized_gemma_license": optimized_gemma,
            "prior_approved_license": preserved_license,
            "prior_approved_gemma_license": preserved_gemma,
            "optimized_license_headers": {
                key.lower(): value
                for key, value in license_headers.items()
                if key.lower() in {"etag", "x-repo-commit", "content-length", "date"}
            },
            "optimized_gemma_headers": {
                key.lower(): value
                for key, value in gemma_headers.items()
                if key.lower() in {"etag", "x-repo-commit", "content-length", "date"}
            },
            "canonical_small_music_license_headers": {
                key.lower(): value
                for key, value in music_license_headers.items()
                if key.lower() in {"etag", "x-repo-commit", "content-length", "date"}
            },
        },
        "toolchain": toolchain,
        "shared_weights": shared_weights,
        "small_sfx_weight": sfx_weight,
        "download_url": SFX_WEIGHT_URL,
        "errors": errors,
        "limitations": [
            "The gate proves exact files, code identity, public route availability, and bounded download size only.",
            "Canonical Small-SFX license bytes were not independently captured because anonymous pinned endpoints returned HTTP 401; only the public optimized route is selected.",
            "It does not establish copyrightability, non-infringement, exclusivity, commercial clearance, historical accuracy, or listening quality.",
            "All generated outputs remain PROTOTYPE_ONLY pending Owner and rights review.",
        ],
    }
    if GATE_V1_PATH.exists():
        result["supersedes"] = {
            **file_record(GATE_V1_PATH),
            "reason": "v1 overstated independent canonical Small-SFX license comparison and had a shallow verifier",
        }
    verify_gate_data(result)
    atomic_write_json(GATE_PATH, result)
    LOG_PATH.parent.mkdir(parents=True, exist_ok=True)
    log_payload = (
        f"{result['generated_at_utc']} status=PASSED code={CODE_COMMIT} optimized={OPTIMIZED_REVISION} "
        f"weight_sha256={SFX_WEIGHT_SHA256} weight_bytes={SFX_WEIGHT_BYTES}\n"
    )
    if LOG_PATH.exists():
        existing = LOG_PATH.read_text(encoding="utf-8")
        if existing != log_payload:
            raise RuntimeError(f"existing log differs; refusing overwrite: {LOG_PATH}")
    else:
        LOG_PATH.write_text(log_payload, encoding="utf-8")
        os.chmod(LOG_PATH, 0o444)
    return result


def self_test() -> None:
    original = json.loads(GATE_PATH.read_text(encoding="utf-8"))
    verify_gate_data(original)
    mutations: list[tuple[str, tuple[str, ...], Any]] = [
        ("decision", ("decision",), "USE_UNREVIEWED_ROUTE"),
        ("rights", ("rights_status",), "CLEARED_FOR_SHIP"),
        ("terms", ("terms_decision",), "TERMS_ACCEPTED"),
        ("ungated", ("route_checks", "official_optimized_repository_ungated"), False),
        ("http", ("route_checks", "optimized_api_http_status"), 204),
        ("snapshot", ("route_checks", "optimized_api_snapshot", "sha256"), "0" * 64),
        ("download bytes", ("route_checks", "additional_weight_download_bytes"), 1),
        ("download limit", ("route_checks", "additional_weight_download_limit_bytes"), 2_000_000_000),
        ("download result", ("route_checks", "within_download_limit"), False),
        ("cloud", ("route_checks", "network_or_cloud_inference"), True),
        ("paid", ("route_checks", "paid_service"), True),
        ("install", ("route_checks", "system_install"), True),
        ("download URL", ("download_url",), "https://example.invalid/weight"),
        ("limitations", ("limitations",), []),
        ("license role path", ("license_evidence", "optimized_gemma_license", "path"), str(LICENSE_DIR / "stable-audio-3-optimized-LICENSE.md")),
        ("license role bytes", ("license_evidence", "prior_approved_gemma_license", "bytes"), COMMUNITY_LICENSE_BYTES),
        ("probe status", ("license_evidence", "canonical_small_sfx_license_probe", "http_status"), 200),
        ("weight URL", ("small_sfx_weight", "url"), "https://example.invalid/sfx"),
    ]
    for label, path, replacement in mutations:
        candidate = copy.deepcopy(original)
        target: dict[str, Any] = candidate
        for key in path[:-1]:
            target = target[key]
        target[path[-1]] = replacement
        try:
            verify_gate_data(candidate)
        except RuntimeError:
            continue
        raise AssertionError(f"SFX gate mutation was accepted: {label}")


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--verify-only", action="store_true", help="verify an existing completed gate")
    parser.add_argument("--self-test", action="store_true", help="run adversarial verifier mutations")
    args = parser.parse_args()
    if args.self_test:
        self_test()
        print(json.dumps({"status": "PASSED", "mutation_tests": 18}, sort_keys=True))
        return 0
    if args.verify_only:
        data = json.loads(GATE_PATH.read_text(encoding="utf-8"))
        verify_gate_data(data)
        print(json.dumps({"status": "PASSED", "manifest": str(GATE_PATH)}, sort_keys=True))
        return 0
    result = run_gate()
    print(json.dumps({"status": result["status"], "manifest": str(GATE_PATH)}, sort_keys=True))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
