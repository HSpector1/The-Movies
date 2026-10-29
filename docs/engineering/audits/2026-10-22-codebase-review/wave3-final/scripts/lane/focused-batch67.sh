#!/bin/bash
# Batch 6 (UI/Lot) then Batch 7 (Bridge) in one lane job.
S=/Users/zacheryspector/studio-scratch/1370-codebase-review-20261022-r1/wave3-scripts
bash "$S/lane/focused-batch6.sh"
echo "=================== BATCH 7 ==================="
bash "$S/lane/focused-batch7.sh"
