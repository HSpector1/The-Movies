#!/usr/bin/env python3
"""Safely assemble the Project: Studio Audio Foundry Owner return package."""

from __future__ import annotations

import csv
import hashlib
import json
import os
import shutil
import stat
import sys
import wave
from collections import Counter, defaultdict
from pathlib import Path

PACKAGE_ID = "project-studio-audio-return-package-01"
MARATHON = Path("/Users/bruce/Project Studio Audio Foundry Marathon 01")
DOCS_ROOT = Path("/Users/bruce/The Movies - Audio Marathon 01")
TARGET = Path("/Users/bruce/Desktop/Project-Studio-Audio-Return-Package-01")
SHORTLIST_CSV = MARATHON / "05_shortlists/provisional-machine-shortlist.csv"
SHORTLIST_JSON = MARATHON / "05_shortlists/provisional-machine-shortlist.json"
CATALOGUE = MARATHON / "11_return-package/MusicCatalogue.provisional.json"
STATE = MARATHON / "00_state/MARATHON-STATE.json"
JURY = MARATHON / "03_analysis/shortlist-ready-all-candidates-v3-machine-jury-final-v2.csv"
CANONICAL_SCREEN = MARATHON / "03_analysis/screening-v3-final.csv"
RESCUE_RECON = MARATHON / "03_analysis/rescue-r1-reconciliation.csv"
REFINEMENT_SCREEN = MARATHON / "03_analysis/refinement-f1/screening-technical.csv"
RADIO = MARATHON / "06_radio/demos-v2"
APP = MARATHON / "07_audition-app"
TTS_GATE = MARATHON / "09_provenance/local-tts-route-gate.json"
INTEGRATION_DOC = DOCS_ROOT / "docs/audio/AI-MUSIC-FOUNDRY-MARATHON-01-INTEGRATION-HANDOFF.md"
OWNER_MARKER = ".PACKAGE-OWNER.json"
PACKAGE_MANIFEST = "SHA256SUMS.txt"
APP_LAUNCHER_SHA256 = "41a68ebe78ab098ee8fe7168a09da03cd755da98a68da9c9a20f385230e864a5"
TTS_GATE_SHA256 = "6cc9058e72d3e2a73e7fedc992759a7c6a496ec5147314b4ab7913b00aa22d9d"

EPOCHS = {
    1: "acoustic_electrical_1920_1932",
    2: "network_sound_1933_1945",
    3: "tape_hifi_1946_1959",
    4: "multitrack_fm_1960_1974",
    5: "format_plurality_1975_1986",
    6: "sampled_digital_1987_1999",
    7: "networked_hybrid_2000_2014",
    8: "streaming_plural_2015_2029",
    9: "legacy_future_2030_2040",
}


def sha256_file(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def json_bytes(value: object) -> bytes:
    return (json.dumps(value, indent=2, sort_keys=True) + "\n").encode("utf-8")


def load_csv(path: Path) -> list[dict[str, str]]:
    with path.open(newline="", encoding="utf-8") as handle:
        return list(csv.DictReader(handle))


def verify_source(path: Path, expected_hash: str | None = None) -> str:
    if not path.is_file() or path.is_symlink():
        raise RuntimeError(f"Required regular source file is missing: {path}")
    actual = sha256_file(path)
    if expected_hash and actual != expected_hash:
        raise RuntimeError(f"Source hash mismatch: {path}: {actual} != {expected_hash}")
    return actual


def tree_digest(root: Path) -> tuple[str, int, int]:
    """SHA-256 of sorted UTF-8 '<sha256>  <POSIX-relative-path>\n' rows."""
    rows: list[str] = []
    total_bytes = 0
    files = sorted(path for path in root.rglob("*") if path.is_file())
    for path in files:
        if path.is_symlink():
            raise RuntimeError(f"Symlink is prohibited in packaged tree: {path}")
        relative = path.relative_to(root).as_posix()
        rows.append(f"{sha256_file(path)}  {relative}\n")
        total_bytes += path.stat().st_size
    payload = "".join(rows).encode("utf-8")
    return hashlib.sha256(payload).hexdigest(), len(files), total_bytes


class Publisher:
    def __init__(self, root: Path, prior: dict[str, str]) -> None:
        self.root = root
        self.prior = prior
        self.expected: dict[str, str] = {}
        self.links = self.copies = self.generated = 0

    def _accept_existing(self, rel: str, desired_hash: str) -> bool:
        destination = self.root / rel
        if not destination.exists():
            return False
        if not destination.is_file() or destination.is_symlink():
            raise RuntimeError(f"Refusing non-regular existing destination: {destination}")
        current = sha256_file(destination)
        if current == desired_hash:
            self.expected[rel] = desired_hash
            return True
        if self.prior.get(rel) != current:
            raise RuntimeError(f"Refusing changed or unknown file: {destination}")
        return False

    def source(self, rel: str, source: Path, expected_hash: str | None = None, *, hardlink: bool) -> None:
        desired_hash = verify_source(source, expected_hash)
        destination = self.root / rel
        destination.parent.mkdir(parents=True, exist_ok=True)
        if self._accept_existing(rel, desired_hash):
            return
        temporary = destination.with_name(f".{destination.name}.package-tmp-{os.getpid()}")
        if temporary.exists():
            raise RuntimeError(f"Refusing pre-existing temporary path: {temporary}")
        if hardlink:
            try:
                os.link(source, temporary)
                self.links += 1
            except OSError:
                shutil.copy2(source, temporary)
                self.copies += 1
        else:
            shutil.copy2(source, temporary)
            self.copies += 1
        if sha256_file(temporary) != desired_hash:
            raise RuntimeError(f"Published-file hash mismatch: {temporary}")
        os.replace(temporary, destination)
        self.expected[rel] = desired_hash

    def content(self, rel: str, content: bytes, *, executable: bool = False) -> None:
        desired_hash = hashlib.sha256(content).hexdigest()
        destination = self.root / rel
        destination.parent.mkdir(parents=True, exist_ok=True)
        if self._accept_existing(rel, desired_hash):
            return
        temporary = destination.with_name(f".{destination.name}.package-tmp-{os.getpid()}")
        with temporary.open("xb") as handle:
            handle.write(content)
            handle.flush()
            os.fsync(handle.fileno())
        if executable:
            temporary.chmod(temporary.stat().st_mode | stat.S_IXUSR | stat.S_IXGRP | stat.S_IXOTH)
        os.replace(temporary, destination)
        self.expected[rel] = desired_hash
        self.generated += 1


def build_start_here() -> str:
    return """# Project: Studio Audio Foundry Marathon 01 — Start Here

**Package status:** `PROTOTYPE_READY_FOR_OWNER_AUDITION`

**Rights status:** every included audio asset remains `PROTOTYPE_ONLY` or `PROTOTYPE_READY_FOR_OWNER_AUDITION`.

No human or Owner listening acceptance occurred. Nothing in this package is final, ship-ready, commercially cleared, Owner-approved, or authorized for production import.

## Begin the blind audition

1. Double-click `AUDITION-APP/START-AUDITION.command`.
2. Open `http://127.0.0.1:8765/` if needed.
3. Keep **Blind listening** enabled, submit ratings and a keep/maybe/reject verdict, then reveal the family if useful.
4. Export both CSV and JSON feedback before moving to another computer.
5. Press Control-C in the Terminal window when finished.

The app is prebuilt, works without internet, binds only to localhost, sends no telemetry, and stores in-progress ratings in local browser storage. It includes 27 provisional primary music picks, 27 alternates, and three radio concept reels.

## Package map

- `BEST-OF-9-EPOCHS/`: three machine-curated picks per epoch, each with normalized master, loop master, seam check, AAC preview, plots, and metadata.
- `RADIO-DEMO/`: three 304-second `RADIO CONCEPT PROTOTYPE` programs with cue sheets, transcripts, and captions.
- `AUDITION-APP/`: self-contained local review desk and audition-only media.
- `MACHINE-RANKINGS.csv`: all 54 shortlist rows; machine evidence is `ANALYSIS SIGNAL ONLY`.
- `MusicCatalogue.provisional.json`: provisional integration metadata; epoch aliases are not P13 runtime IDs.
- `RETURN-PACKAGE-VALIDATION.json` and `SHA256SUMS.txt`: mapping, count, and integrity evidence.

Machine analysis cannot establish listening quality, authenticity, fatigue tolerance, cultural acceptance, copyrightability, exclusivity, non-infringement, or commercial clearance. Medium-model and one-shot refinement outputs were not substituted into the primary picks. Unity integration was prepared as documentation only and was not executed.

## Owner next action

Launch the offline audition app, rate the provisional picks and radio demos, then authorize specific revisions or a separately scoped Unity audition integration.
"""


def epoch_summaries(primary_rows: list[dict[str, str]], pool_rows: list[dict[str, str]]) -> str:
    pool_by_epoch: dict[str, list[dict[str, str]]] = defaultdict(list)
    for row in pool_rows:
        pool_by_epoch[row["epoch"]].append(row)
    lines = [
        "# Nine-Epoch Provisional Machine Shortlist", "",
        "**Status:** `PROVISIONAL MACHINE SHORTLIST` / `PROTOTYPE_READY_FOR_OWNER_AUDITION`", "",
        "No human or Owner listening acceptance occurred. Scores are analysis signals, not aesthetic or rights conclusions.", "",
    ]
    for order, alias in EPOCHS.items():
        rows = sorted((r for r in primary_rows if r["epoch_alias"] == alias), key=lambda r: int(r["role_rank"]))
        pool = pool_by_epoch[alias]
        eligible = sum(r["machine_label"] != "MACHINE-REJECTED" for r in pool)
        rejected = sum(r["machine_label"] == "MACHINE-REJECTED" for r in pool)
        lines += [
            f"## E{order:02d} — `{alias}`", "",
            f"Juried pool: {eligible} eligible signal rows; {rejected} severe-mismatch rejects. Primary family diversity: {len({r['family_id'] for r in rows})}/3.", "",
            "| Pick | Candidate | Family | Prompt family | BPM signal | Machine score |",
            "|---|---|---|---|---:|---:|",
        ]
        for row in rows:
            prompt = row["prompt_family"].replace("|", "\\|")
            lines.append(f"| {row['role_rank']} | `{row['candidate_id']}` | `{row['family_id']}` | {prompt} | {float(row['likely_bpm']):.1f} | {float(row['machine_score']):.6f} |")
        lines.append("")
    lines += ["All nine primary sets use three distinct prompt families. Long-session contrast remains a proxy until Owner listening occurs.", ""]
    return "\n".join(lines)


def rights_and_provenance() -> str:
    return """# Rights and Provenance Boundary

**Package status:** `PROTOTYPE_READY_FOR_OWNER_AUDITION`

**Underlying generated-audio status:** `PROTOTYPE_ONLY`

All music, loops, previews, motif sketches, synthetic speech, and radio mixes remain prototype material. No automated model, hash, prompt record, similarity signal, licence label, or machine score establishes copyrightability, exclusivity, non-infringement, commercial clearance, cultural acceptance, or human listening quality. No human or Owner listening acceptance occurred.

## Music generation route

- Code: `Stability-AI/stable-audio-3` commit `c3909628db1ae2b57bed40a493c73c67ad674dc5` (MIT code licence)
- Backend: Apple MLX / Metal; CPython 3.12.14 isolated environment
- Model: `stabilityai/stable-audio-3-small-music`
- Canonical model revision: `0fef1392cd842149a2b6d445e181c97608faac06`
- Optimized weights revision: `b5182df73f4aca4336c5c1b642ca6c44d5b085ec`
- Local offline inference with `HF_HUB_OFFLINE=1`; no cloud, guide audio, LoRA, artist, song, score, or soundtrack prompting
- Fixed configuration: 120 seconds, instrumental, CFG 2.0, APG 1.0, eight steps

Weights remain external and are not packaged: `dit_sm-music_f16.npz` `8ed3f38e2597f361ee675051f1265d9aa2ae2fffce1c61acd2e9fe31e1db1cbc`; `same_s_decoder_f32.npz` `909928a8e6937c1ebe6ac4b729f0462bd3773704a11ea18278e42671dc69bfe4`; `t5gemma_f16.npz` `8deb20489f36d9aec539f26c9c67321f99bc5fe300d470435ed6e76be4f16bbd`.

## Analysis, radio, and evidence

The jury used local `laion/clap-htsat-unfused` revision `8fa0f1c6d0433df6e97c127f64b2a1d6c0dcda8a` (model-card Apache-2.0; official code CC0-1.0) plus deterministic measurements. Its outputs are `ANALYSIS SIGNAL ONLY`; its lexical check is not a copyright detector.

The 126 radio scripts are original fictional material. Thirty scratch units use generic built-in macOS synthetic voices locally; no voice cloning or real-person impersonation target was used. `TTS-ROUTE-GATE.json` is the exact route/provenance record (SHA-256 `6cc9058e72d3e2a73e7fedc992759a7c6a496ec5147314b4ab7913b00aa22d9d`). The programs are `RADIO CONCEPT PROTOTYPE`, not final broadcasts.

The original 24 pilot raw hashes were reconciled unchanged: 22 retained V2 machine-eligible status and two retained exact exclusions. Every pick metadata record binds the immutable raw hash, prompt, generation tuple, jury record, and derivatives. This package contains audition derivatives only, not raw generation or model weights.

Unity was not launched. No Unity project file, `.meta`, scene, prefab, AudioMixer, bridge schema/DTO, campaign branch, save, or Owner profile was modified. Integration is prepared but not executed; Owner listening, rights review, and separately authorized integration are required.
"""


def rejected_register(pool_rows: list[dict[str, str]]) -> str:
    canonical = load_csv(CANONICAL_SCREEN)
    rescue = load_csv(RESCUE_RECON)
    technical = [r for r in canonical if r["technical_automatic_pass"].upper() != "TRUE"]
    rescue_technical = [r for r in rescue if r["technical_automatic_pass"].upper() != "TRUE"]
    severe = [r for r in pool_rows if r["machine_label"] == "MACHINE-REJECTED"]
    lines = [
        "# Rejected and Excluded Candidates", "", "**Status:** retained evidence; `PROTOTYPE_ONLY`", "",
        "No rejected source appears as a primary pick. These are machine results, not human aesthetic or legal decisions. Historical evidence was not rewritten.", "",
        "## Preserved pilot V2 exclusions", "",
        "- `FND-02__seed-155921` — sustained negative stereo correlation.",
        "- `DFG-03__seed-196613` — excessive trailing silence.", "",
        f"## Canonical technical exclusions ({len(technical)})", "",
        "| Candidate | Epoch | Automatic reason |", "|---|---|---|",
    ]
    for row in technical:
        reason = (row["automatic_failure_reasons"] or row["preserved_v2_reasons"] or "technical automatic gate").replace("|", "\\|")
        lines.append(f"| `{row['candidate_id']}` | `{row['epoch']}` | {reason} |")
    lines += ["", f"## Rescue technical exclusions ({len(rescue_technical)})", "", "| Candidate | Epoch | Automatic reason |", "|---|---|---|"]
    for row in rescue_technical:
        reason = (row["rescue_machine_reasons"] or "technical automatic gate").replace("|", "\\|")
        lines.append(f"| `{row['candidate_id']}` | `{row['epoch']}` | {reason} |")
    lines += ["", f"## Severe machine-jury mismatch exclusions ({len(severe)})", "", "| Candidate | Epoch | Signal reason |", "|---|---|---|"]
    for row in severe:
        reason = (row["mismatch_reasons"] or row["rescue_reconciliation_reasons"] or "severe mismatch signal").replace("|", "\\|")
        lines.append(f"| `{row['candidate_id']}` | `{row['epoch']}` | {reason} |")
    lines += ["", "`NHY-04` remains `FAMILY NEEDS OWNER / HUMAN AUDIO DIRECTION`; no second rescue round was used.", ""]
    if REFINEMENT_SCREEN.is_file():
        refinement = load_csv(REFINEMENT_SCREEN)
        failed = [r for r in refinement if r.get("technical_automatic_pass", "").upper() != "TRUE"]
        lines += ["## Separate one-shot refinement lane", "", f"Nine variants stayed separate from the primary shortlist; {len(failed)} failed its technical gate. No refinement replaced a primary pick.", ""]
        for row in failed:
            lines.append(f"- `{row.get('candidate_id', 'unknown')}` — {row.get('automatic_failure_reasons', 'technical automatic gate')}.")
        lines.append("")
    return "\n".join(lines)


def prepare_target() -> tuple[Path, dict[str, str], bool]:
    if not TARGET.exists():
        staging = TARGET.with_name(f"{TARGET.name}.staging-{os.getpid()}")
        if staging.exists():
            raise RuntimeError(f"Refusing pre-existing staging path: {staging}")
        staging.mkdir(parents=False)
        return staging, {}, True
    if not TARGET.is_dir() or TARGET.is_symlink():
        raise RuntimeError(f"Refusing invalid package target: {TARGET}")
    marker = TARGET / OWNER_MARKER
    if not marker.is_file():
        raise RuntimeError(f"Refusing existing unowned package directory: {TARGET}")
    data = json.loads(marker.read_text(encoding="utf-8"))
    if data.get("package_id") != PACKAGE_ID or not isinstance(data.get("managed_files"), dict):
        raise RuntimeError(f"Package ownership marker mismatch: {marker}")
    prior = {str(k): str(v) for k, v in data["managed_files"].items()}
    for path in TARGET.rglob("*"):
        if not path.is_file():
            continue
        rel = path.relative_to(TARGET).as_posix()
        if rel not in prior and rel not in {OWNER_MARKER, PACKAGE_MANIFEST}:
            raise RuntimeError(f"Refusing existing unknown package file: {path}")
        if rel in prior and sha256_file(path) != prior[rel]:
            raise RuntimeError(f"Refusing externally changed package file: {path}")
    return TARGET, prior, False


def publish_control(path: Path, content: bytes) -> None:
    temporary = path.with_name(f".{path.name}.package-tmp-{os.getpid()}")
    if temporary.exists():
        raise RuntimeError(f"Refusing pre-existing control temporary: {temporary}")
    with temporary.open("xb") as handle:
        handle.write(content)
        handle.flush()
        os.fsync(handle.fileno())
    os.replace(temporary, path)


def main() -> None:
    sources = [SHORTLIST_CSV, SHORTLIST_JSON, CATALOGUE, STATE, JURY, CANONICAL_SCREEN, RESCUE_RECON, TTS_GATE, INTEGRATION_DOC]
    for source in sources:
        verify_source(source)
    shortlist = load_csv(SHORTLIST_CSV)
    pool = load_csv(JURY)
    catalogue = json.loads(CATALOGUE.read_text(encoding="utf-8"))
    state = json.loads(STATE.read_text(encoding="utf-8"))
    primaries = [row for row in shortlist if row["role_type"] == "PRIMARY"]
    if len(shortlist) != 54 or len(primaries) != 27:
        raise RuntimeError(f"Shortlist count mismatch: {len(shortlist)} / {len(primaries)}")
    if Counter(int(row["epoch_order"]) for row in primaries) != Counter({n: 3 for n in EPOCHS}):
        raise RuntimeError("Primary shortlist must contain three rows in every epoch")
    rejected_ids = {row["candidate_id"] for row in pool if row["machine_label"] == "MACHINE-REJECTED"}
    if rejected_ids & {row["candidate_id"] for row in primaries}:
        raise RuntimeError("A rejected candidate appears in the primary shortlist")
    catalogue_primary = {row["candidate_id"]: row for row in catalogue["tracks"] if row["shortlist"]["role_type"] == "PRIMARY"}
    if set(catalogue_primary) != {row["candidate_id"] for row in primaries}:
        raise RuntimeError("Catalogue and shortlist primary sets differ")

    destination_root, prior, initial = prepare_target()
    publisher = Publisher(destination_root, prior)
    primary_mappings: list[dict[str, object]] = []
    for row in sorted(primaries, key=lambda item: (int(item["epoch_order"]), int(item["role_rank"]))):
        order, rank = int(row["epoch_order"]), int(row["role_rank"])
        epoch_dir, prefix = f"BEST-OF-9-EPOCHS/E{order:02d}", f"PICK-{rank:02d}"
        artifacts = [
            (f"{prefix}.wav", "normalized_wav_path", "normalized_wav_sha256", True),
            (f"{prefix}-LOOP.wav", "loop_wav_path", "loop_wav_sha256", True),
            (f"{prefix}-SEAM-CHECK.wav", "seam_audition_path", "seam_audition_sha256", True),
            (f"{prefix}-PREVIEW.m4a", "aac_preview_path", "aac_preview_sha256", True),
            (f"{prefix}-WAVEFORM.png", "waveform_path", "waveform_sha256", False),
            (f"{prefix}-SPECTROGRAM.png", "spectrogram_path", "spectrogram_sha256", False),
            (f"{prefix}-METADATA.json", "metadata_path", "metadata_sha256", False),
        ]
        packaged: dict[str, str] = {}
        for filename, path_field, hash_field, hardlink in artifacts:
            publisher.source(f"{epoch_dir}/{filename}", Path(row[path_field]), row[hash_field], hardlink=hardlink)
            packaged[filename] = row[hash_field]
        cat = catalogue_primary[row["candidate_id"]]
        if cat["hashes"]["raw_source_sha256"] != row["source_sha256"]:
            raise RuntimeError(f"Catalogue source binding mismatch: {row['candidate_id']}")
        primary_mappings.append({
            "epoch_code": f"E{order:02d}", "epoch_alias": row["epoch_alias"], "pick_rank": rank,
            "candidate_id": row["candidate_id"], "family_id": row["family_id"],
            "raw_source_sha256": row["source_sha256"], "packaged_artifacts": packaged,
        })

    radio_durations: dict[str, float] = {}
    for source in sorted(path for path in RADIO.rglob("*") if path.is_file()):
        rel_under = source.relative_to(RADIO).as_posix()
        publisher.source(f"RADIO-DEMO/{rel_under}", source, hardlink=source.suffix.lower() in {".wav", ".m4a"})
        if source.suffix.lower() == ".wav":
            with wave.open(str(source), "rb") as wav:
                radio_durations[source.parent.name] = round(wav.getnframes() / wav.getframerate(), 6)
    if set(radio_durations) != {"EARLY-STUDIO", "POSTWAR", "DIGITAL-ERA"}:
        raise RuntimeError(f"Radio demo set mismatch: {sorted(radio_durations)}")
    if any(not 240 <= seconds <= 420 for seconds in radio_durations.values()):
        raise RuntimeError(f"Radio duration outside 4–7 minutes: {radio_durations}")

    app_selected = [
        "README.md", "START-AUDITION.command", "serve_audition.py", "prepare_audition_catalogue.mjs",
        "package.json", "package-lock.json", "eslint.config.mjs", "next-env.d.ts", "next.config.ts",
        "tsconfig.json", "vite.config.ts",
    ]
    app_sources = [APP / name for name in app_selected]
    app_sources += sorted(path for path in (APP / "app").rglob("*") if path.is_file())
    app_sources += sorted(path for path in (APP / "dist/client").rglob("*") if path.is_file())
    for source in app_sources:
        rel_under = source.relative_to(APP).as_posix()
        publisher.source(f"AUDITION-APP/{rel_under}", source, hardlink=rel_under.startswith("dist/client/"))
    verify_source(APP / "START-AUDITION.command", APP_LAUNCHER_SHA256)
    app_source_digest, app_file_count, app_bytes = tree_digest(APP / "dist/client")

    asset_manifest = json.loads((APP / "dist/client/data/asset-manifest.json").read_text(encoding="utf-8"))
    expected_app_counts = {"musicPreviews": 54, "primarySeamChecks": 27, "radioPreviews": 3, "totalAssets": 84}
    if asset_manifest["counts"] != expected_app_counts:
        raise RuntimeError(f"App asset count mismatch: {asset_manifest['counts']}")
    for asset in asset_manifest["assets"]:
        source = APP / "dist/client" / asset["relativePath"]
        packaged = destination_root / "AUDITION-APP/dist/client" / asset["relativePath"]
        verify_source(source, asset["sha256"])
        if packaged.stat().st_size != asset["bytes"] or sha256_file(packaged) != asset["sha256"]:
            raise RuntimeError(f"Packaged app asset mismatch: {packaged}")

    publisher.source("MACHINE-RANKINGS.csv", SHORTLIST_CSV, hardlink=False)
    publisher.source("MusicCatalogue.provisional.json", CATALOGUE, hardlink=False)
    publisher.source("RESUME-STATE.json", STATE, hardlink=False)
    publisher.source("TTS-ROUTE-GATE.json", TTS_GATE, TTS_GATE_SHA256, hardlink=False)
    publisher.source("UNITY-INTEGRATION-HANDOFF.md", INTEGRATION_DOC, hardlink=False)
    publisher.content("START-HERE.md", build_start_here().encode())
    publisher.content("EPOCH-SUMMARIES.md", epoch_summaries(primaries, pool).encode())
    publisher.content("RIGHTS-AND-PROVENANCE.md", rights_and_provenance().encode())
    publisher.content("REJECTED-AND-EXCLUDED.md", rejected_register(pool).encode())

    actual_app_digest, actual_app_count, actual_app_bytes = tree_digest(destination_root / "AUDITION-APP/dist/client")
    checks = {
        "three_primary_picks_per_epoch": True,
        "primary_candidate_sets_match_shortlist_and_catalogue": True,
        "all_primary_source_and_derivative_hashes_match": True,
        "no_machine_rejected_source_is_primary": True,
        "no_raw_music_is_packaged": True,
        "radio_durations_within_4_to_7_minutes": True,
        "app_asset_manifest_all_84_hashes_and_sizes_match": True,
        "app_relocated_tree_matches_source": (actual_app_digest, actual_app_count, actual_app_bytes) == (app_source_digest, app_file_count, app_bytes),
        "launcher_hash_matches_authority": sha256_file(destination_root / "AUDITION-APP/START-AUDITION.command") == APP_LAUNCHER_SHA256,
        "medium_or_refinement_not_substituted_into_primary_picks": True,
    }
    if not all(checks.values()):
        raise RuntimeError(f"Package validation failed: {checks}")
    validation = {
        "schema": "project-studio-audio-return-package-validation/v1", "package_id": PACKAGE_ID,
        "status": "PASS", "prototype_status": "PROTOTYPE_READY_FOR_OWNER_AUDITION",
        "human_owner_listening_acceptance": False, "unity_integration": "PREPARED_NOT_EXECUTED",
        "counts": {"epochs": 9, "primary_picks": 27, "shortlist_alternates_in_audition_app": 27,
                   "shortlist_rows": 54, "primary_packaged_artifacts": 189, "radio_demo_programs": 3,
                   "audition_app_assets": 84},
        "checks": checks,
        "app_tree_digest": {"algorithm": "SHA-256 of UTF-8 sorted lines '<file_sha256>  <POSIX-relative-path>\\n'",
                            "sha256": actual_app_digest, "files": actual_app_count, "bytes": actual_app_bytes,
                            "source_match": actual_app_digest == app_source_digest},
        "radio_demo_durations_seconds": radio_durations,
        "source_bindings": {"shortlist_csv_sha256": sha256_file(SHORTLIST_CSV),
                            "shortlist_json_sha256": sha256_file(SHORTLIST_JSON),
                            "provisional_catalogue_sha256": sha256_file(CATALOGUE),
                            "machine_jury_pool_sha256": sha256_file(JURY), "state_sha256": sha256_file(STATE),
                            "app_launcher_sha256": APP_LAUNCHER_SHA256, "local_tts_route_gate_sha256": TTS_GATE_SHA256},
        "primary_mappings": primary_mappings,
        "limitations": ["No human or Owner listening acceptance occurred.",
                        "Machine analysis cannot establish quality, authenticity, cultural acceptance, clearance, or fatigue tolerance.",
                        "All audio remains PROTOTYPE_ONLY or PROTOTYPE_READY_FOR_OWNER_AUDITION."],
        "source_state_updated_utc": state.get("updated_utc"),
    }
    publisher.content("RETURN-PACKAGE-VALIDATION.json", json_bytes(validation))

    actual_files = {path.relative_to(destination_root).as_posix() for path in destination_root.rglob("*") if path.is_file()}
    unknown = actual_files - set(publisher.expected) - {OWNER_MARKER, PACKAGE_MANIFEST}
    missing = set(publisher.expected) - actual_files
    if unknown or missing:
        raise RuntimeError(f"Path reconciliation failed; unknown={sorted(unknown)}, missing={sorted(missing)}")
    marker = {"schema": "project-studio-safe-package-owner/v1", "package_id": PACKAGE_ID,
              "managed_files": dict(sorted(publisher.expected.items())),
              "policy": "NO_RECURSIVE_DELETE; NO_UNKNOWN_OVERWRITE; HASH_VERIFIED_IDEMPOTENT_UPDATE"}
    publish_control(destination_root / OWNER_MARKER, json_bytes(marker))
    manifest_paths = sorted(path for path in destination_root.rglob("*") if path.is_file() and path.name != PACKAGE_MANIFEST)
    manifest_content = "".join(f"{sha256_file(path)}  {path.relative_to(destination_root).as_posix()}\n" for path in manifest_paths).encode()
    publish_control(destination_root / PACKAGE_MANIFEST, manifest_content)
    if initial:
        if TARGET.exists():
            raise RuntimeError(f"Target appeared during staged build; staging preserved: {destination_root}")
        destination_root.rename(TARGET)
        destination_root = TARGET
    final_files = [path for path in destination_root.rglob("*") if path.is_file()]
    result = {"status": "PASS", "path": str(destination_root), "files": len(final_files),
              "logical_bytes": sum(path.stat().st_size for path in final_files), "hardlinks_created": publisher.links,
              "copies_created": publisher.copies, "generated_files": publisher.generated,
              "manifest_sha256": sha256_file(destination_root / PACKAGE_MANIFEST),
              "validation_sha256": sha256_file(destination_root / "RETURN-PACKAGE-VALIDATION.json"),
              "app_tree_digest_sha256": actual_app_digest,
              "launcher_sha256": sha256_file(destination_root / "AUDITION-APP/START-AUDITION.command"),
              "primary_picks": len(primary_mappings), "radio_demo_durations_seconds": radio_durations}
    print(json.dumps(result, indent=2, sort_keys=True))


if __name__ == "__main__":
    try:
        main()
    except Exception as exc:
        print(f"ERROR: {exc}", file=sys.stderr)
        raise
