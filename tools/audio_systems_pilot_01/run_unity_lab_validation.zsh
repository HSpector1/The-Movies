#!/bin/zsh
set -euo pipefail

UNITY_EXECUTABLE="/Applications/Unity/Hub/Editor/6000.3.22f1/Unity.app/Contents/MacOS/Unity"
UNITY_LAB_REPOSITORY="/Users/bruce/Project Studio - Audio Systems Pilot 01 Client"
DOCUMENTATION_REPOSITORY="/Users/bruce/The Movies - Audio Systems Pilot 01"
PILOT_ROOT="/Users/bruce/Project Studio Audio Systems Pilot 01"
LOG_ROOT="$PILOT_ROOT/09_unity-lab/Logs"
RESULT_ROOT="$PILOT_ROOT/09_unity-lab/TestResults"

if [[ ! -x "$UNITY_EXECUTABLE" ]]; then
  print -u2 "Unity executable unavailable: $UNITY_EXECUTABLE"
  exit 2
fi
if [[ "$(git -C "$UNITY_LAB_REPOSITORY" branch --show-current)" != "wip/audio-systems-pilot-01-client" ]]; then
  print -u2 "Wrong Unity Audio Lab branch."
  exit 3
fi
if [[ "$(git -C "$DOCUMENTATION_REPOSITORY" branch --show-current)" != "codex/audio-systems-pilot-01" ]]; then
  print -u2 "Wrong documentation/tooling branch."
  exit 4
fi
if [[ -n "$(git -C "$UNITY_LAB_REPOSITORY" status --porcelain --untracked-files=all)" || -n "$(git -C "$DOCUMENTATION_REPOSITORY" status --porcelain --untracked-files=all)" ]]; then
  print -u2 "Both pilot worktrees must be clean before SHA-bound Unity validation."
  exit 5
fi
if [[ "$(git -C "$UNITY_LAB_REPOSITORY" rev-parse HEAD)" != "$(git -C "$UNITY_LAB_REPOSITORY" rev-parse '@{upstream}')" || "$(git -C "$DOCUMENTATION_REPOSITORY" rev-parse HEAD)" != "$(git -C "$DOCUMENTATION_REPOSITORY" rev-parse '@{upstream}')" ]]; then
  print -u2 "Both pilot branches must equal their pushed upstreams."
  exit 6
fi

mkdir -p "$LOG_ROOT" "$RESULT_ROOT"
export PROJECT_STUDIO_AUDIO_PILOT_ROOT="$PILOT_ROOT"
export PROJECT_STUDIO_AUDIO_DOCS_SHA="$(git -C "$DOCUMENTATION_REPOSITORY" rev-parse HEAD)"
UNITY_GIT_SHA="$(git -C "$UNITY_LAB_REPOSITORY" rev-parse HEAD)"
export PROJECT_STUDIO_AUDIO_EXPECTED_UNITY_SHA="$UNITY_GIT_SHA"

active_unity_processes() {
  /bin/ps -axo pid=,command= | /usr/bin/awk '
    index($0, "/usr/bin/awk") { next }
    index($0, "/Unity.app/Contents/MacOS/Unity") { print }
  ' || true
}

# Do not mutate current/preserved validation pointers before the first collision
# check. Every later Unity invocation repeats the same check immediately before
# launch, so an unrelated editor is never terminated or joined.
PREARCHIVE_ACTIVE="$(active_unity_processes)"
if [[ -n "$PREARCHIVE_ACTIVE" ]]; then
  print -u2 "Unity collision gate deferred before evidence archival."
  print -u2 -- "$PREARCHIVE_ACTIVE"
  exit 75
fi

EVIDENCE_LOCK_PATH="$PILOT_ROOT/12_logs/locks/evidence-publication.lock"
PYTHONPATH="$DOCUMENTATION_REPOSITORY/tools/audio_systems_pilot_01" /usr/bin/python3 - "$EVIDENCE_LOCK_PATH" <<'PY'
import sys
from pathlib import Path
from common import PILOT_ROOT, contained_exclusive_lock

with contained_exclusive_lock(PILOT_ROOT, Path(sys.argv[1])):
    pass
PY
zmodload zsh/system
if ! zsystem flock -t 0 -f EVIDENCE_LOCK_FD "$EVIDENCE_LOCK_PATH"; then
  print -u2 "Another pilot evidence publisher is active; retry after it finishes."
  exit 76
fi

RUN_ID="$(date -u +%Y%m%dT%H%M%SZ)-$$"
CURRENT_RUN_INDEX="$PILOT_ROOT/09_unity-lab/CURRENT-VALIDATION-RUN.json"
if [[ -L "$CURRENT_RUN_INDEX" || ( -e "$CURRENT_RUN_INDEX" && ! -f "$CURRENT_RUN_INDEX" ) ]]; then
  print -u2 "Current Unity validation pointer is linked or special; refusing mutation."
  exit 8
fi
# Bootstrap/retry safety: a prior successful pointer is snapshotted before any
# archive or live metadata mutation. This is idempotent when its snapshot exists.
if [[ -f "$CURRENT_RUN_INDEX" ]]; then
  /usr/bin/python3 "$DOCUMENTATION_REPOSITORY/tools/audio_systems_pilot_01/snapshot_unity_validation_run.py"
fi
if [[ -f "$CURRENT_RUN_INDEX" ]]; then
  PRIOR_RUN_ID="$(/usr/bin/python3 - "$CURRENT_RUN_INDEX" "$PILOT_ROOT" "$DOCUMENTATION_REPOSITORY" <<'PY'
import json
import pathlib
import re
import sys

sys.path.insert(0, str(pathlib.Path(sys.argv[3]) / "tools/audio_systems_pilot_01"))
from common import read_contained_regular_bytes

payload = json.loads(read_contained_regular_bytes(
    pathlib.Path(sys.argv[2]), pathlib.Path(sys.argv[1])
)[0].decode("utf-8"))
run_id = payload.get("run_id")
if (payload.get("schema") != "project-studio-unity-validation-current-run/v1"
        or not isinstance(run_id, str) or re.fullmatch(r"[A-Za-z0-9][A-Za-z0-9._-]{0,127}", run_id) is None):
    raise SystemExit("Prior current-run index is malformed; refusing to misattribute its evidence.")
print(run_id)
PY
)"
  PRIOR_ATTRIBUTION="PRIOR_CURRENT_RUN_INDEX"
else
  PRIOR_RUN_ID="UNINDEXED-PRIOR-$RUN_ID"
  PRIOR_ATTRIBUTION="UNINDEXED_PRIOR_BYTES_NO_CURRENT_RUN_INDEX"
fi
PRIOR_RUN_FINAL="$PILOT_ROOT/09_unity-lab/ArchivedRuns/$PRIOR_RUN_ID"
PRIOR_RUN_ROOT="$PRIOR_RUN_FINAL"
ARCHIVE_STAGING_ROOT=""
ARCHIVE_STAGING_DEV=""
ARCHIVE_STAGING_INO=""
ARCHIVE_HAS_FILES=0
cleanup_archive_staging() {
  if [[ -n "$ARCHIVE_STAGING_ROOT" && -n "$ARCHIVE_STAGING_DEV" && -n "$ARCHIVE_STAGING_INO" ]]; then
    PYTHONPATH="$DOCUMENTATION_REPOSITORY/tools/audio_systems_pilot_01" /usr/bin/python3 - \
      "$ARCHIVE_STAGING_ROOT" "$ARCHIVE_STAGING_DEV" "$ARCHIVE_STAGING_INO" <<'PY' || true
import os
import sys
from pathlib import Path
from common import PILOT_ROOT, remove_contained_directory

path = Path(sys.argv[1])
if os.path.lexists(path):
    remove_contained_directory(PILOT_ROOT, path, (int(sys.argv[2]), int(sys.argv[3])))
PY
  fi
}
trap cleanup_archive_staging EXIT HUP INT TERM
REUSE_PRIOR_ARCHIVE=0
if [[ -L "$PRIOR_RUN_FINAL" || ( -e "$PRIOR_RUN_FINAL" && ! -d "$PRIOR_RUN_FINAL" ) ]]; then
  print -u2 "Prior Unity run archive destination is linked or special; refusing reuse."
  exit 9
fi
if [[ -d "$PRIOR_RUN_FINAL" ]]; then
  /usr/bin/python3 - "$PRIOR_RUN_FINAL" "$PRIOR_RUN_ID" "$CURRENT_RUN_INDEX" "$PILOT_ROOT" <<'PY'
import hashlib
import json
import os
import pathlib
import stat
import sys

lexical_root = pathlib.Path(os.path.abspath(sys.argv[1]))
pilot = pathlib.Path(os.path.abspath(sys.argv[4]))
lexical_root.relative_to(pilot)
cursor = lexical_root
while cursor != pilot:
    if (not os.path.lexists(cursor) or cursor.is_symlink()
            or not stat.S_ISDIR(os.lstat(cursor).st_mode)):
        raise SystemExit("Existing prior-run archive component is missing, linked, or special.")
    cursor = cursor.parent
root = lexical_root
manifest_path = root / "ARCHIVE-MANIFEST.json"
if manifest_path.is_symlink() or not stat.S_ISREG(os.lstat(manifest_path).st_mode):
    raise SystemExit("Existing prior-run archive manifest is linked or special.")
manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
expected_status = ("PRESERVED_UNINDEXED_ATTEMPT_BYTES" if sys.argv[2].startswith("UNINDEXED-PRIOR-")
                   else "PRESERVED_PRIOR_CURRENT_EVIDENCE")
if (manifest.get("schema") != "project-studio-unity-validation-run-archive/v1"
        or manifest.get("status") != expected_status
        or manifest.get("run_id") != sys.argv[2]):
    raise SystemExit("Existing prior-run archive identity is not reusable.")
expected_files = {row["relative_path"]: row for row in manifest.get("files", [])}
expected_links = {row["relative_path"]: row for row in manifest.get("symlinks", [])}
expected_dirs = {row["relative_path"]: row for row in manifest.get("directories", [])}
actual_files = {}
actual_links = {}
actual_dirs = {}
special_nodes = []
if not expected_files:
    raise SystemExit("Existing prior-run archive contains no preserved files.")
for path in root.rglob("*"):
    relative = str(path.relative_to(root))
    if path == manifest_path:
        continue
    if path.is_symlink():
        actual_links[relative] = os.readlink(path)
    elif path.is_file():
        payload = path.read_bytes()
        actual_files[relative] = (len(payload), hashlib.sha256(payload).hexdigest(), path.stat().st_mode & 0o777)
    elif path.is_dir():
        actual_dirs[relative] = path.stat().st_mode & 0o777
    elif not (stat.S_ISREG(os.lstat(path).st_mode) or stat.S_ISDIR(os.lstat(path).st_mode)
              or stat.S_ISLNK(os.lstat(path).st_mode)):
        special_nodes.append(relative)
if special_nodes:
    raise SystemExit("Existing prior-run archive contains a special node.")
if set(actual_files) != set(expected_files) or set(actual_links) != set(expected_links) or set(actual_dirs) != set(expected_dirs):
    raise SystemExit("Existing prior-run archive tree is not reusable.")
for relative, row in expected_files.items():
    if actual_files[relative] != (row.get("bytes"), row.get("sha256"), row.get("mode")):
        raise SystemExit("Existing prior-run archive file changed: " + relative)
for relative, row in expected_links.items():
    if actual_links[relative] != row.get("target"):
        raise SystemExit("Existing prior-run archive link changed: " + relative)
for relative, row in expected_dirs.items():
    if actual_dirs[relative] != row.get("mode"):
        raise SystemExit("Existing prior-run archive directory changed: " + relative)
current = pathlib.Path(sys.argv[3])
archived_current = root / "09_unity-lab/CURRENT-VALIDATION-RUN.json"
if current.is_file() and (not archived_current.is_file() or current.read_bytes() != archived_current.read_bytes()):
    raise SystemExit("Existing prior-run archive does not contain the exact current pointer.")
if archived_current.is_file():
    if archived_current.is_symlink():
        raise SystemExit("Existing prior-run archive pointer is linked.")
    pointer = json.loads(archived_current.read_text(encoding="utf-8"))
    pointer_rows = pointer.get("files", [])
    pointer_paths = [row.get("relative_path") for row in pointer_rows]
    if (not pointer_rows or None in pointer_paths
            or len(pointer_paths) != len(set(pointer_paths))):
        raise SystemExit("Existing prior-run archive pointer paths are malformed.")
    for row in pointer_rows:
        relative = pathlib.PurePosixPath(row["relative_path"])
        if relative.is_absolute() or ".." in relative.parts or str(relative) != row["relative_path"]:
            raise SystemExit("Existing prior-run archive pointer path is unsafe.")
        archived = root / pathlib.Path(*relative.parts)
        if (not archived.is_file() or archived.is_symlink()
                or archived.stat().st_size != row.get("bytes")
                or hashlib.sha256(archived.read_bytes()).hexdigest() != row.get("sha256")):
            raise SystemExit("Existing prior-run archive does not project its pointer bytes: " + row["relative_path"])
PY
  REUSE_PRIOR_ARCHIVE=1
fi
archive_prior_file() {
  local relative="$1"
  local source="$PILOT_ROOT/$relative"
  local copied
  copied="$(PYTHONPATH="$DOCUMENTATION_REPOSITORY/tools/audio_systems_pilot_01" /usr/bin/python3 - \
    "$source" "$PRIOR_RUN_ROOT/$relative" <<'PY'
import os
import sys
from pathlib import Path
from common import PILOT_ROOT, publish_immutable_bytes, read_contained_regular_bytes

source = Path(sys.argv[1])
if not os.path.lexists(source):
    print(0)
else:
    payload, _ = read_contained_regular_bytes(PILOT_ROOT, source)
    publish_immutable_bytes(PILOT_ROOT, Path(sys.argv[2]), payload, 0o444)
    print(1)
PY
)"
  if [[ "$copied" == "1" ]]; then
    ARCHIVE_HAS_FILES=1
  fi
}
if [[ "$REUSE_PRIOR_ARCHIVE" == "0" ]]; then
ARCHIVE_STAGING_ROOT="$PILOT_ROOT/12_logs/unity-archive-staging.$RUN_ID.$$.${RANDOM}${RANDOM}"
read ARCHIVE_STAGING_DEV ARCHIVE_STAGING_INO <<< "$(
  PYTHONPATH="$DOCUMENTATION_REPOSITORY/tools/audio_systems_pilot_01" /usr/bin/python3 - "$ARCHIVE_STAGING_ROOT" <<'PY'
import sys
from pathlib import Path
from common import PILOT_ROOT, create_contained_directory_once, ensure_contained_directory

path = Path(sys.argv[1])
ensure_contained_directory(PILOT_ROOT, path.parent)
_, identity = create_contained_directory_once(PILOT_ROOT, path)
print(identity[0], identity[1])
PY
)"
PRIOR_RUN_ROOT="$ARCHIVE_STAGING_ROOT"
if [[ ! -f "$CURRENT_RUN_INDEX" ]]; then
  for relative in \
  "09_unity-lab/Logs/compile-final.log" \
  "09_unity-lab/Logs/editmode-final.log" \
  "09_unity-lab/Logs/playmode-final.log" \
  "09_unity-lab/Logs/build-final.log" \
  "09_unity-lab/Logs/oracle-final.log" \
  "09_unity-lab/Logs/validation-summary-final.log" \
  "09_unity-lab/Logs/process-gate-compile-final.log" \
  "09_unity-lab/Logs/process-gate-editmode-final.log" \
  "09_unity-lab/Logs/process-gate-playmode-final.log" \
  "09_unity-lab/Logs/process-gate-build-final.log" \
  "09_unity-lab/Logs/process-gate-oracle-final.log" \
  "09_unity-lab/Logs/process-gate-validation-summary-final.log" \
  "09_unity-lab/TestResults/editmode-final.xml" \
  "09_unity-lab/TestResults/playmode-final.xml" \
  "09_unity-lab/RuntimeEvidence/audio-oracle-runtime-observations.json" \
  "09_unity-lab/Builds/macOS/Project Studio Audio Systems Pilot.app.build-receipt.json" \
  "09_unity-lab/UNITY-AUDIO-LAB-VALIDATION.json" \
  "09_unity-lab/CURRENT-VALIDATION-RUN.json"
  do
    archive_prior_file "$relative"
  done
else
  : # Indexed runs are copied only from their eager immutable completed-run snapshot below.
fi
if [[ -f "$CURRENT_RUN_INDEX" ]]; then
  /usr/bin/python3 - "$CURRENT_RUN_INDEX" "$PILOT_ROOT" "$PRIOR_RUN_ROOT" "$PRIOR_RUN_ID" "$DOCUMENTATION_REPOSITORY" <<'PY'
import hashlib
import json
import pathlib
import sys

sys.path.insert(0, str(pathlib.Path(sys.argv[5]) / "tools/audio_systems_pilot_01"))
from common import publish_immutable_bytes, read_contained_regular_bytes
from snapshot_unity_validation_run import verify_snapshot

pointer_path = pathlib.Path(sys.argv[1])
pilot = pathlib.Path(sys.argv[2])
archive = pathlib.Path(sys.argv[3])
pointer_body, _ = read_contained_regular_bytes(pilot, pointer_path)
payload = json.loads(pointer_body.decode("utf-8"))
if (payload.get("schema") != "project-studio-unity-validation-current-run/v1"
        or payload.get("status") != "PASS" or payload.get("run_id") != sys.argv[4]):
    raise SystemExit("Prior current-run pointer identity/status is malformed.")
rows = payload.get("files")
if not isinstance(rows, list) or not rows:
    raise SystemExit("Prior current-run pointer contains no file identities.")
completed = pilot / "09_unity-lab/CompletedRuns" / sys.argv[4]
completed_pointer = completed / "09_unity-lab/CURRENT-VALIDATION-RUN.json"
completed_payload = verify_snapshot(completed, sys.argv[4])
completed_pointer_body, _ = read_contained_regular_bytes(pilot, completed_pointer)
if completed_pointer_body != pointer_body:
    raise SystemExit("Prior current-run pointer lacks its exact eager completed-run snapshot.")
completed_rows = completed_payload.get("files")
if (completed_payload.get("schema") != "project-studio-unity-validation-completed-run/v1"
        or completed_payload.get("status") != "VERIFIED_SUCCESSFUL_RUN_BYTES"
        or completed_payload.get("run_id") != sys.argv[4]
        or completed_payload.get("documentation_sha") != payload.get("documentation_sha")
        or completed_payload.get("unity_sha") != payload.get("unity_sha")
        or not isinstance(completed_rows, list) or not completed_rows):
    raise SystemExit("Prior completed-run manifest identity is malformed.")
completed_identities = {row.get("relative_path"): row for row in completed_rows}
if len(completed_identities) != len(completed_rows):
    raise SystemExit("Prior completed-run manifest contains duplicate file paths.")
completed_pointer_row = completed_identities.get("09_unity-lab/CURRENT-VALIDATION-RUN.json")
if (completed_pointer_row is None or completed_pointer_row.get("bytes") != len(pointer_body)
        or completed_pointer_row.get("sha256") != hashlib.sha256(pointer_body).hexdigest()):
    raise SystemExit("Prior completed-run manifest does not authenticate its pointer.")
pointer_destination = archive / "09_unity-lab/CURRENT-VALIDATION-RUN.json"
publish_immutable_bytes(pilot, pointer_destination, completed_pointer_body, 0o444)
seen = set()
for row in rows:
    relative = row.get("relative_path")
    candidate = pathlib.PurePosixPath(relative) if isinstance(relative, str) else None
    if candidate is None or candidate.is_absolute() or ".." in candidate.parts or relative in seen:
        raise SystemExit("Prior current-run file projection is unsafe or duplicate.")
    seen.add(relative)
    expected_sha = row.get("sha256")
    expected_bytes = row.get("bytes")
    if not isinstance(expected_sha, str) or len(expected_sha) != 64 or not isinstance(expected_bytes, int):
        raise SystemExit("Prior current-run file identity is malformed: " + relative)
    if completed_identities.get(relative, {}).get("sha256") != expected_sha or completed_identities[relative].get("bytes") != expected_bytes:
        raise SystemExit("Prior completed-run manifest does not project pointer identity: " + relative)
    source = completed / relative
    body, mode = read_contained_regular_bytes(pilot, source)
    if (len(body) != expected_bytes or hashlib.sha256(body).hexdigest() != expected_sha
            or mode != 0o444):
        raise SystemExit("No exact preserved source resolves prior pointer row: " + relative)
    destination = archive / pathlib.Path(*candidate.parts)
    published = publish_immutable_bytes(pilot, destination, body, 0o444)
    if published["bytes"] != expected_bytes or published["sha256"] != expected_sha:
        raise SystemExit("Prior pointer copy changed during archival: " + relative)
PY
  ARCHIVE_HAS_FILES=1
fi
if [[ "$ARCHIVE_HAS_FILES" == "1" ]]; then
  /usr/bin/python3 - "$PRIOR_RUN_ROOT" "$PILOT_ROOT" "$PRIOR_RUN_ID" "$RUN_ID" "$PRIOR_ATTRIBUTION" "$DOCUMENTATION_REPOSITORY" <<'PY'
import hashlib
import json
import os
import pathlib
import stat
import sys

sys.path.insert(0, str(pathlib.Path(sys.argv[6]) / "tools/audio_systems_pilot_01"))
from common import publish_immutable_bytes, read_contained_regular_bytes

archive = pathlib.Path(sys.argv[1])
pilot = pathlib.Path(sys.argv[2])
rows = []
links = []
directories = []
for path in sorted(archive.rglob("*")):
    relative = str(path.relative_to(archive))
    mode = os.lstat(path).st_mode
    if stat.S_ISLNK(mode):
        links.append({"relative_path": relative, "target": os.readlink(path)})
    elif stat.S_ISREG(mode):
        payload, file_mode = read_contained_regular_bytes(pilot, path)
        rows.append({
            "relative_path": relative,
            "bytes": len(payload),
            "sha256": hashlib.sha256(payload).hexdigest(),
            "mode": file_mode,
        })
    elif stat.S_ISDIR(mode):
        directories.append({"relative_path": relative, "mode": mode & 0o777})
    else:
        raise SystemExit("Refusing a special node in staged Unity validation evidence: " + relative)
if not rows:
    raise SystemExit("Refusing to publish an empty Unity validation archive.")
manifest = {
    "schema": "project-studio-unity-validation-run-archive/v1",
    "run_id": sys.argv[3],
    "archived_by_run_id": sys.argv[4],
    "attribution": sys.argv[5],
    "status": ("PRESERVED_UNINDEXED_ATTEMPT_BYTES" if sys.argv[5] == "UNINDEXED_PRIOR_BYTES_NO_CURRENT_RUN_INDEX"
               else "PRESERVED_PRIOR_CURRENT_EVIDENCE"),
    "source_root": str(pilot),
    "superseded_app_disposition": "REPLACEABLE_DERIVED_APP_NOT_PRESERVED; ARCHIVED_RECEIPT_IS_HISTORICAL_NONCURRENT_METADATA_AND_NOT_INDEPENDENTLY_REVERIFIABLE",
    "files": rows,
    "symlinks": links,
    "directories": directories,
}
target = archive / "ARCHIVE-MANIFEST.json"
publish_immutable_bytes(
    pilot, target,
    (json.dumps(manifest, indent=2, sort_keys=True) + "\n").encode("utf-8"),
    0o444,
)
PY
  /usr/bin/python3 - "$PRIOR_RUN_ROOT" "$PRIOR_RUN_FINAL" "$PILOT_ROOT" \
    "$ARCHIVE_STAGING_DEV" "$ARCHIVE_STAGING_INO" <<'PY'
import ctypes
import os
import pathlib
import stat
import sys

source = pathlib.Path(sys.argv[1])
destination = pathlib.Path(sys.argv[2])
pilot = pathlib.Path(sys.argv[3]).resolve(strict=True)
destination.relative_to(pilot)
source.relative_to(pilot)
source_stat = os.lstat(source)
if (source.is_symlink() or not stat.S_ISDIR(source_stat.st_mode)
        or (source_stat.st_dev, source_stat.st_ino) != (int(sys.argv[4]), int(sys.argv[5]))):
    raise SystemExit("Unity archive staging identity changed before promotion.")
source_cursor = source.parent
while source_cursor != pilot:
    if (not os.path.lexists(source_cursor) or source_cursor.is_symlink()
            or not stat.S_ISDIR(os.lstat(source_cursor).st_mode)):
        raise SystemExit("Unity archive staging parent is missing, linked, or special: " + str(source_cursor))
    source_cursor = source_cursor.parent
cursor = destination.parent
while cursor != pilot:
    if (not os.path.lexists(cursor) or pathlib.Path(cursor).is_symlink()
            or not stat.S_ISDIR(os.lstat(cursor).st_mode)):
        raise SystemExit("Unity archive destination parent is missing, linked, or special: " + str(cursor))
    cursor = cursor.parent
if os.path.lexists(destination):
    raise SystemExit("Unity archive destination appeared before exclusive publication: " + str(destination))
libc = ctypes.CDLL(None, use_errno=True)
rename_exclusive = libc.renameatx_np
rename_exclusive.argtypes = [ctypes.c_int, ctypes.c_char_p, ctypes.c_int, ctypes.c_char_p, ctypes.c_uint]
rename_exclusive.restype = ctypes.c_int
AT_FDCWD = -2
RENAME_EXCL = 0x00000004
if rename_exclusive(AT_FDCWD, os.fsencode(source), AT_FDCWD, os.fsencode(destination), RENAME_EXCL) != 0:
    error = ctypes.get_errno()
    raise OSError(error, os.strerror(error), str(destination))
destination_stat = os.lstat(destination)
if (destination.is_symlink() or not stat.S_ISDIR(destination_stat.st_mode)
        or (destination_stat.st_dev, destination_stat.st_ino) != (int(sys.argv[4]), int(sys.argv[5]))):
    raise SystemExit("Promoted Unity archive identity differs from staged identity.")
PY
  PYTHONPATH="$DOCUMENTATION_REPOSITORY/tools/audio_systems_pilot_01" /usr/bin/python3 - <<'PY'
from package_owner_return import verify_unity_run_archives

proof = verify_unity_run_archives()
if proof.get("archive_supplement_count") != 1:
    raise SystemExit("Post-promotion Unity archive verification did not retain its bounded supplement.")
PY
  ARCHIVE_STAGING_ROOT=""
  ARCHIVE_STAGING_DEV=""
  ARCHIVE_STAGING_INO=""
  PRIOR_RUN_ROOT="$PRIOR_RUN_FINAL"
else
  cleanup_archive_staging
  ARCHIVE_STAGING_ROOT=""
  PRIOR_RUN_ROOT="$PRIOR_RUN_FINAL"
fi
fi
# Any indexed bytes now live in a hashed archive. Leaving the prior current
# pointer in place after a failed replacement run would falsely label stale
# evidence as current and would collide with the next retry.
if [[ -d "$PRIOR_RUN_ROOT" && ! -L "$PRIOR_RUN_ROOT" ]]; then
  PYTHONPATH="$DOCUMENTATION_REPOSITORY/tools/audio_systems_pilot_01" /usr/bin/python3 - "$CURRENT_RUN_INDEX" <<'PY'
import sys
from pathlib import Path
from common import PILOT_ROOT, remove_contained_regular_file

remove_contained_regular_file(PILOT_ROOT, Path(sys.argv[1]), missing_ok=True)
PY
fi

process_gate() {
  local label="$1"
  local next_command="$2"
  local gate_log="$LOG_ROOT/process-gate-$label.log"
  local active
  # The collision law applies to every installed Unity version, not only this
  # pilot's pinned executable.  Match the canonical macOS player path and any
  # batchmode Unity command; never terminate a match.
  active="$(active_unity_processes)"
  {
    print "utc=$(date -u +%Y-%m-%dT%H:%M:%SZ)"
    print "next_command=$next_command"
    print "unity_git_sha=$UNITY_GIT_SHA"
    print "documentation_git_sha=$PROJECT_STUDIO_AUDIO_DOCS_SHA"
    if [[ -n "$active" ]]; then
      print "unrelated_unity_process_count=$(print -r -- "$active" | /usr/bin/awk 'NF { count++ } END { print count + 0 }')"
      print "matching_processes=ACTIVE_UNITY_DETECTED_SEE_STDERR"
      print "status=DEFERRED_ACTIVE_UNITY"
    else
      print "unrelated_unity_process_count=0"
      print "matching_processes=NONE"
      print "status=PASS_NO_ACTIVE_UNITY"
    fi
  } > "$gate_log"
  if [[ -n "$active" ]]; then
    print -u2 "Unity collision gate deferred $label; see $gate_log"
    print -u2 -- "$active"
    exit 75
  fi
}

run_editor_method() {
  local label="$1"
  local method="$2"
  local log_name="$3"
  local burst_policy="$4"
  if [[ "$burst_policy" == "DISABLE" ]]; then
    process_gate "$label" "PROJECT_STUDIO_AUDIO_EXPECTED_UNITY_SHA=$UNITY_GIT_SHA \"$UNITY_EXECUTABLE\" -batchmode -nographics --burst-disable-compilation -quit -projectPath \"$UNITY_LAB_REPOSITORY\" -executeMethod $method -logFile \"$LOG_ROOT/$log_name\""
    PROJECT_STUDIO_AUDIO_EXPECTED_UNITY_SHA="$UNITY_GIT_SHA" "$UNITY_EXECUTABLE" -batchmode -nographics --burst-disable-compilation -quit \
      -projectPath "$UNITY_LAB_REPOSITORY" \
      -executeMethod "$method" \
      -logFile "$LOG_ROOT/$log_name"
  else
    process_gate "$label" "PROJECT_STUDIO_AUDIO_EXPECTED_UNITY_SHA=$UNITY_GIT_SHA \"$UNITY_EXECUTABLE\" -batchmode -nographics -quit -projectPath \"$UNITY_LAB_REPOSITORY\" -executeMethod $method -logFile \"$LOG_ROOT/$log_name\""
    PROJECT_STUDIO_AUDIO_EXPECTED_UNITY_SHA="$UNITY_GIT_SHA" "$UNITY_EXECUTABLE" -batchmode -nographics -quit \
      -projectPath "$UNITY_LAB_REPOSITORY" \
      -executeMethod "$method" \
      -logFile "$LOG_ROOT/$log_name"
  fi
}

run_tests() {
  local label="$1"
  local platform="$2"
  local assembly="$3"
  local result_name="$4"
  local log_name="$5"
  process_gate "$label" "PROJECT_STUDIO_AUDIO_EXPECTED_UNITY_SHA=$UNITY_GIT_SHA \"$UNITY_EXECUTABLE\" -batchmode -nographics --burst-disable-compilation -projectPath \"$UNITY_LAB_REPOSITORY\" -runTests -testPlatform $platform -assemblyNames $assembly -testResults \"$RESULT_ROOT/$result_name\" -logFile \"$LOG_ROOT/$log_name\""
  PROJECT_STUDIO_AUDIO_EXPECTED_UNITY_SHA="$UNITY_GIT_SHA" "$UNITY_EXECUTABLE" -batchmode -nographics --burst-disable-compilation \
    -projectPath "$UNITY_LAB_REPOSITORY" \
    -runTests -testPlatform "$platform" -assemblyNames "$assembly" \
    -testResults "$RESULT_ROOT/$result_name" \
    -logFile "$LOG_ROOT/$log_name"
}

run_editor_method "compile-final" "ProjectStudio.AudioLab.Editor.AudioLabAssetBuilder.BuildLabAssets" "compile-final.log" "DISABLE"
if [[ -n "$(git -C "$UNITY_LAB_REPOSITORY" status --porcelain --untracked-files=all)" ]]; then
  print -u2 "Deterministic lab asset regeneration changed the clean Unity source tree."
  exit 7
fi
run_tests "editmode-final" "EditMode" "ProjectStudio.AudioLab.Tests.EditMode" "editmode-final.xml" "editmode-final.log"
run_tests "playmode-final" "PlayMode" "ProjectStudio.AudioLab.Tests.PlayMode" "playmode-final.xml" "playmode-final.log"
run_editor_method "build-final" "ProjectStudio.AudioLab.Editor.AudioLabAssetBuilder.BuildMacOSLab" "build-final.log" "ALLOW"
run_editor_method "oracle-final" "ProjectStudio.AudioLab.Editor.AudioOracleBatchRunner.RunAll" "oracle-final.log" "DISABLE"
run_editor_method "validation-summary-final" "ProjectStudio.AudioLab.Editor.AudioLabValidationSummaryWriter.Write" "validation-summary-final.log" "DISABLE"

/usr/bin/python3 - "$CURRENT_RUN_INDEX" "$PILOT_ROOT" "$RUN_ID" "$PROJECT_STUDIO_AUDIO_DOCS_SHA" "$(git -C "$UNITY_LAB_REPOSITORY" rev-parse HEAD)" "$DOCUMENTATION_REPOSITORY" <<'PY'
import hashlib
import json
import pathlib
import sys

sys.path.insert(0, str(pathlib.Path(sys.argv[6]) / "tools/audio_systems_pilot_01"))
from common import read_contained_regular_bytes, replace_contained_bytes

target = pathlib.Path(sys.argv[1])
pilot = pathlib.Path(sys.argv[2])
relatives = [
    "09_unity-lab/Logs/compile-final.log",
    "09_unity-lab/Logs/editmode-final.log",
    "09_unity-lab/Logs/playmode-final.log",
    "09_unity-lab/Logs/build-final.log",
    "09_unity-lab/Logs/oracle-final.log",
    "09_unity-lab/Logs/validation-summary-final.log",
    "09_unity-lab/Logs/process-gate-compile-final.log",
    "09_unity-lab/Logs/process-gate-editmode-final.log",
    "09_unity-lab/Logs/process-gate-playmode-final.log",
    "09_unity-lab/Logs/process-gate-build-final.log",
    "09_unity-lab/Logs/process-gate-oracle-final.log",
    "09_unity-lab/Logs/process-gate-validation-summary-final.log",
    "09_unity-lab/TestResults/editmode-final.xml",
    "09_unity-lab/TestResults/playmode-final.xml",
    "09_unity-lab/RuntimeEvidence/audio-oracle-runtime-observations.json",
    "09_unity-lab/Builds/macOS/Project Studio Audio Systems Pilot.app.build-receipt.json",
    "09_unity-lab/UNITY-AUDIO-LAB-VALIDATION.json",
    "07_audio-oracle/AUDIO-ORACLE-SUITE.v1.json",
    "07_audio-oracle/AUDIO-ORACLE-EVIDENCE-ARCHIVE-REGISTER.v1.json",
    "05_management-sfx/semantic-pack/management-semantic-catalogue.v4.json",
]
files = []
payloads = {}
for relative in relatives:
    path = pilot / relative
    payload, _ = read_contained_regular_bytes(pilot, path)
    payloads[relative] = payload
    files.append({"relative_path": relative, "bytes": len(payload), "sha256": hashlib.sha256(payload).hexdigest()})
summary = json.loads(payloads["09_unity-lab/UNITY-AUDIO-LAB-VALIDATION.json"].decode("utf-8"))
required_components = ("compile", "edit_mode", "play_mode", "build", "codesign", "audio_oracle", "process_gates")
management = next(row for row in files if row["relative_path"] == "05_management-sfx/semantic-pack/management-semantic-catalogue.v4.json")
if (summary.get("schema") != "project-studio-unity-audio-lab-validation/v1"
        or summary.get("machine_verdict") != "PASS" or summary.get("unity_git_sha") != sys.argv[5]
        or summary.get("direct_pinned_management_sha256") != management["sha256"]
        or any(summary.get(name, {}).get("status") != "PASS" for name in required_components)):
    raise SystemExit("Unity validation summary is not fully PASS; refusing current-run pointer.")
manifest = {
    "schema": "project-studio-unity-validation-current-run/v1",
    "run_id": sys.argv[3],
    "status": "PASS",
    "documentation_sha": sys.argv[4],
    "unity_sha": sys.argv[5],
    "files": files,
}
replace_contained_bytes(
    pilot, target,
    (json.dumps(manifest, indent=2, sort_keys=True) + "\n").encode("utf-8"),
    expected_existing_sha256=None,
)
PY

/usr/bin/python3 "$DOCUMENTATION_REPOSITORY/tools/audio_systems_pilot_01/snapshot_unity_validation_run.py"

zsystem flock -u "$EVIDENCE_LOCK_FD"

print "Unity Audio Lab validation chain complete."
print "documentation_sha=$PROJECT_STUDIO_AUDIO_DOCS_SHA"
print "unity_sha=$UNITY_GIT_SHA"
