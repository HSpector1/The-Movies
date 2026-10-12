#!/bin/bash
# r7 broad UI run: the grep-derived UI files that open a founding and build or load a save (53 files, the
# mounted late-founding route included), one vitest process, ui project.
export PATH=/Users/zacheryspector/.nvm/versions/node/v20.20.2/bin:$PATH
P=/Users/zacheryspector/studio-scratch/1370-ar-1364-1365-founding-market-implementation-20261010-r1
C=/Users/zacheryspector/studio-specialists/founding
cd $C || exit 9
date +%H:%M:%S > $P/evidence/r7/broad-ui.start
nice -n 10 npx vitest run --project ui --no-file-parallelism --no-cache $(cat $P/evidence/r7/ui-broad.txt) --reporter=default --reporter=json --outputFile.json=$P/evidence/r7/broad-ui.json > $P/evidence/r7/broad-ui.log 2>&1
rc=$?
{ date +%H:%M:%S; echo "exit $rc"; } > $P/evidence/r7/broad-ui.end
exit $rc
