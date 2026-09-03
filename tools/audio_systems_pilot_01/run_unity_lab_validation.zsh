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

RUN_ID="$(date -u +%Y%m%dT%H%M%SZ)-$$"
CURRENT_RUN_INDEX="$PILOT_ROOT/09_unity-lab/CURRENT-VALIDATION-RUN.json"
if [[ -f "$CURRENT_RUN_INDEX" ]]; then
  PRIOR_RUN_ID="$(/usr/bin/python3 - "$CURRENT_RUN_INDEX" <<'PY'
import json
import pathlib
import re
import sys

payload = json.loads(pathlib.Path(sys.argv[1]).read_text(encoding="utf-8"))
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
PRIOR_RUN_ROOT="$PILOT_ROOT/09_unity-lab/ArchivedRuns/$PRIOR_RUN_ID"
REUSE_PRIOR_ARCHIVE=0
if [[ -e "$PRIOR_RUN_ROOT" ]]; then
  /usr/bin/python3 - "$PRIOR_RUN_ROOT" "$PRIOR_RUN_ID" "$CURRENT_RUN_INDEX" <<'PY'
import hashlib
import json
import os
import pathlib
import sys

root = pathlib.Path(sys.argv[1]).resolve(strict=True)
manifest_path = root / "ARCHIVE-MANIFEST.json"
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
PY
  REUSE_PRIOR_ARCHIVE=1
fi
archive_prior_file() {
  local relative="$1"
  local source="$PILOT_ROOT/$relative"
  if [[ -f "$source" ]]; then
    mkdir -p "$PRIOR_RUN_ROOT/${relative:h}"
    /bin/cp -p "$source" "$PRIOR_RUN_ROOT/$relative"
  fi
}
if [[ "$REUSE_PRIOR_ARCHIVE" == "0" ]]; then
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
if [[ -f "$CURRENT_RUN_INDEX" ]]; then
  /usr/bin/python3 - "$CURRENT_RUN_INDEX" <<'PY' | while IFS= read -r relative
import json
import pathlib
import sys

payload = json.loads(pathlib.Path(sys.argv[1]).read_text(encoding="utf-8"))
seen = set()
for row in payload.get("files", []):
    relative = row.get("relative_path")
    candidate = pathlib.PurePosixPath(relative) if isinstance(relative, str) else None
    if candidate is None or candidate.is_absolute() or ".." in candidate.parts or relative in seen:
        raise SystemExit("Prior current-run file projection is unsafe or duplicate.")
    seen.add(relative)
    print(relative)
PY
  do
    archive_prior_file "$relative"
  done
fi
if [[ -d "$PRIOR_RUN_ROOT" ]]; then
  /usr/bin/python3 - "$PRIOR_RUN_ROOT" "$PILOT_ROOT" "$PRIOR_RUN_ID" "$RUN_ID" "$PRIOR_ATTRIBUTION" <<'PY'
import hashlib
import json
import os
import pathlib
import sys
import tempfile

archive = pathlib.Path(sys.argv[1]).resolve(strict=True)
pilot = pathlib.Path(sys.argv[2]).resolve(strict=True)
rows = []
links = []
directories = []
for path in sorted(archive.rglob("*")):
    relative = str(path.relative_to(archive))
    if path.is_symlink():
        links.append({"relative_path": relative, "target": os.readlink(path)})
    elif path.is_file():
        payload = path.read_bytes()
        rows.append({
            "relative_path": relative,
            "bytes": len(payload),
            "sha256": hashlib.sha256(payload).hexdigest(),
            "mode": path.stat().st_mode & 0o777,
        })
    elif path.is_dir():
        directories.append({"relative_path": relative, "mode": path.stat().st_mode & 0o777})
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
descriptor, name = tempfile.mkstemp(prefix=".ARCHIVE-MANIFEST.", suffix=".tmp", dir=archive)
with os.fdopen(descriptor, "w", encoding="utf-8", newline="") as handle:
    json.dump(manifest, handle, indent=2, sort_keys=True)
    handle.write("\n")
    handle.flush()
    os.fsync(handle.fileno())
os.replace(name, target)
PY
fi
fi
# Any indexed bytes now live in a hashed archive. Leaving the prior current
# pointer in place after a failed replacement run would falsely label stale
# evidence as current and would collide with the next retry.
if [[ -d "$PRIOR_RUN_ROOT" ]]; then
  /bin/rm -f "$CURRENT_RUN_INDEX"
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

/usr/bin/python3 - "$CURRENT_RUN_INDEX" "$PILOT_ROOT" "$RUN_ID" "$PROJECT_STUDIO_AUDIO_DOCS_SHA" "$(git -C "$UNITY_LAB_REPOSITORY" rev-parse HEAD)" <<'PY'
import hashlib
import json
import os
import pathlib
import sys
import tempfile

target = pathlib.Path(sys.argv[1])
pilot = pathlib.Path(sys.argv[2]).resolve(strict=True)
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
for relative in relatives:
    path = (pilot / relative).resolve(strict=True)
    path.relative_to(pilot)
    payload = path.read_bytes()
    files.append({"relative_path": relative, "bytes": len(payload), "sha256": hashlib.sha256(payload).hexdigest()})
manifest = {
    "schema": "project-studio-unity-validation-current-run/v1",
    "run_id": sys.argv[3],
    "status": "PASS",
    "documentation_sha": sys.argv[4],
    "unity_sha": sys.argv[5],
    "files": files,
}
target.parent.mkdir(parents=True, exist_ok=True)
descriptor, name = tempfile.mkstemp(prefix=f".{target.name}.", suffix=".tmp", dir=target.parent)
with os.fdopen(descriptor, "w", encoding="utf-8", newline="") as handle:
    json.dump(manifest, handle, indent=2, sort_keys=True)
    handle.write("\n")
    handle.flush()
    os.fsync(handle.fileno())
os.replace(name, target)
PY

print "Unity Audio Lab validation chain complete."
print "documentation_sha=$PROJECT_STUDIO_AUDIO_DOCS_SHA"
print "unity_sha=$UNITY_GIT_SHA"
