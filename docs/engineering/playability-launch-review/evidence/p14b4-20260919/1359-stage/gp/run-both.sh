#!/usr/bin/env bash
# G-P then G1, full routes to 6240 on p13a-core-causal-01 and seed-b, one after the other in the same lane hold.
X=/Users/zacheryspector/studio-scratch/p15-probes
"$X/run-probe.sh" 1359-GP-probe.ts gp 6240 p13a-core-causal-01,seed-b; echo "gp exit $?"
"$X/run-probe.sh" 1355-G1-probe.ts g1 6240 p13a-core-causal-01,seed-b; echo "g1 exit $?"
