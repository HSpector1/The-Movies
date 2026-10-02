#!/usr/bin/env bash
# 1359-X3 and 1355-X3: dry runs of the P15C producer r4 (1359-P) and the P15A.1 producer r3 (1355-P) at HEAD, each in
# its own tree: HEAD's src, the staged RED's tests (tests/* only), a real tests/fixtures/p15, only node_modules linked,
# the producer at its E path. Not a mint: the real mints run under the recorder at the last writer below the P15 step.
# Run under lane-run.sh (it holds HEAVY-LANE-LOCK).
set -u
R=/Users/zacheryspector/The-Movies-headless-program
EREL=docs/engineering/playability-launch-review/evidence/p14b4-20260919
E=$R/$EREL
X=/Users/zacheryspector/studio-scratch/p15-prod-x
BASE=$(git -C "$R" rev-parse HEAD)
export PATH=/Users/zacheryspector/.nvm/versions/node/v20.20.2/bin:$PATH
echo "node $(node --version), base $BASE"
build() { # build <dir> <red patch> <producer source> <producer name>
  local D=$1 RED=$2 PSRC=$3 PNAME=$4
  [ -e "$D" ] && { echo "$D exists"; exit 2; }
  mkdir -p "$D" && cd "$R" || exit 2
  git archive "$BASE" src bridge generated package.json tsconfig.json tsconfig.bridge.json tsconfig.src.json vitest.config.ts | tar -x -C "$D"
  git archive "$BASE" tests ':!tests/fixtures' | tar -x -C "$D"
  mkdir -p "$D/tests/fixtures/p15" "$D/$EREL"
  ln -sfn "$R/node_modules" "$D/node_modules"
  cp "$PSRC" "$D/$EREL/$PNAME"
  cd "$D" && git init -q && git add -A . && git commit -q -m "base $BASE" || exit 2
  git apply --index --include='tests/*' "$RED" && git commit -q -m "red tests $(basename "$RED")" || { echo "RED APPLY FAILED: $RED"; exit 1; }
  echo "$(basename "$D"): $(git log --format='%h %s' -1), producer sha256 $(shasum -a 256 "$EREL/$PNAME" | cut -c1-64)"
}

# 1359-X3: P15C producer r4 over RED r5
build "$X/ptree-1359" "$E/1359-stage/1359-p15c-wave2-red-r5.patch" "$E/1359-stage/1359-P-p15c2-route-l-producer-r4.ts" 1359-P-p15c2-route-l-producer.ts
cd "$X/ptree-1359" && date '+1359 producer start %H:%M:%S'
P15C2_PRODUCER_HEAD=$(git rev-parse HEAD) node_modules/.bin/vite-node "$EREL/1359-P-p15c2-route-l-producer.ts" > "$X/1359-p-dry.txt" 2>&1
echo "1359 producer exit $?"; ls -la tests/fixtures/p15/p15c2-route-l-captures 2>&1; echo "status: [$(git status --porcelain | tr '\n' ' ')]"

# 1355-X3: P15A.1 producer r3 over RED r4, mint mode (the shared capture below the P15 step)
build "$X/ptree-1355" "$E/1355-stage/1355-p15a1-wave2-red-r4.patch" "$E/1355-stage/1355-P-p15a1-market-producer-r3.ts" 1355-P-p15a1-market-producer.ts
cd "$X/ptree-1355" && date '+1355 producer start %H:%M:%S'
P15A1_PRODUCER_HEAD=$(git rev-parse HEAD) P15A1_CAPTURE_MODE=mint node_modules/.bin/vite-node "$EREL/1355-P-p15a1-market-producer.ts" > "$X/1355-p-dry.txt" 2>&1
echo "1355 producer exit $?"; ls -la tests/fixtures/p15/p15a1-market-pins tests/fixtures/p15/genuine-below-p15-save-step 2>&1; echo "status: [$(git status --porcelain | tr '\n' ' ')]"
date '+done %H:%M:%S'
