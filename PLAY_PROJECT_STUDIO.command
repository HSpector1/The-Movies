#!/bin/zsh

set -eu

fail() {
  print -u2 -- "Project: Studio launch failed: $1"
  exit 1
}

script_path="${0:A}"
repository_root="${script_path:h}"

# A Finder launch enters here, then delegates to the same memorable npm command
# documented for Terminal. npm re-enters with the private flag to avoid recursion.
if [[ "${1:-}" != "--from-npm" ]]; then
  cd "$repository_root" || fail "cannot enter the TypeScript repository at $repository_root"
  command -v npm >/dev/null 2>&1 || fail "npm is not installed or is not available on PATH"
  if (( $# == 0 )); then
    exec npm run play
  fi
  exec npm run play -- "$@"
fi
shift

[[ "$OSTYPE" == darwin* ]] || fail "the current local Unity player is a macOS application"

node_executable="$(command -v node 2>/dev/null)" || fail "Node.js is not installed or is not available on PATH"
vite_node_entry="$repository_root/node_modules/vite-node/vite-node.mjs"
supervisor_entry="$repository_root/bridge/supervisor/cli.ts"
unity_project="${repository_root:h}/Project Studio - Unity Production Convergence 80H"
unity_settings="$unity_project/ProjectSettings/ProjectSettings.asset"
unity_app="$unity_project/Builds/macOS/Project Studio Visual Spike.app"
unity_info="$unity_app/Contents/Info.plist"
unity_executable="$unity_app/Contents/MacOS/Project Studio - Unity Visual Spike"

[[ -f "$repository_root/package.json" ]] || fail "package.json is missing from $repository_root"
[[ -f "$vite_node_entry" ]] || fail "dependencies are missing; run 'npm ci' in $repository_root"
[[ -f "$supervisor_entry" ]] || fail "the studio supervisor is missing at $supervisor_entry"
[[ -d "$unity_project" ]] || fail "the sibling Unity project is missing at $unity_project"
[[ -f "$unity_settings" ]] || fail "the sibling directory is not a Unity project: $unity_project"
[[ -d "$unity_app" ]] || fail "the standard macOS build is missing at $unity_app"
[[ -f "$unity_info" ]] || fail "the macOS build has no Info.plist: $unity_app"
[[ -x "$unity_executable" ]] || fail "the macOS build executable is missing or not executable: $unity_executable"

if [[ -n "${PROJECT_STUDIO_PROFILE_ROOT:-}" ]]; then
  profile_description="$PROJECT_STUDIO_PROFILE_ROOT (PROJECT_STUDIO_PROFILE_ROOT override)"
elif [[ -n "${HOME:-}" ]]; then
  profile_description="$HOME/Library/Application Support/Project Studio"
else
  profile_description="the supervisor's operating-system home default"
fi

print -- "[play] Project: Studio local CP20 candidate (not formal CURRENT BEST / Golden M5)"
print -- "[play] Unity project: $unity_project"
print -- "[play] Durable profile: $profile_description"

cd "$repository_root" || fail "cannot enter the TypeScript repository at $repository_root"
exec "$node_executable" "$vite_node_entry" \
  --script "$supervisor_entry" \
  --unity-project "$unity_project" \
  "$@"
