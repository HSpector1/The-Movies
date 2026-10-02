#!/usr/bin/env bash
# Runs run-d16.sh on the writer's base tag, then on p15a1-b-r2. Run alone under lane-run.sh.
D=/Users/zacheryspector/studio-scratch/1361-d16
bash $D/run-d16.sh base base; echo "base exit $?"
bash $D/run-d16.sh p15a1-b-r2 b-r2; echo "b-r2 exit $?"
