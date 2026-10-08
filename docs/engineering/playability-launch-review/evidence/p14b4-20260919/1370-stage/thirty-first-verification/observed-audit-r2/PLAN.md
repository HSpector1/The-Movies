# E0G p13a r12 observed audit correction r2

The frozen r1 audit (SHA-256 ddf6b704663d8ec0cf458e1ed67df686644839903a92ef643c78546e75811175) STOPPED on row 0 because it incorrectly hard-coded save version 45. The captured row 0 and summary independently report version 46. The r1 STOP report and receipt are preserved. This r2 changes only the row/summary version expectations to 46 and the output path to this directory. It retains original 300/330 limits, 416/417 horizon, lossless boundary checks, source pins, and all other assertions. Script SHA-256 74f16896d54a4b2b0082e42ac85e82f1a652aaef6842a6970315a96aedd86e5a.

Run under the recorded heavy lane after the original capture is complete. Any further failure remains STOP and requires independent diagnosis.
