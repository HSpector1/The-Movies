# 1344-M2 attempt 1: the recorded UI measurement died on a full disk

`1344-save43-broad-ui` started at 05:28 at b91c2f2f (HEAD equal to remote; preflight written). At 05:32 the recorder
failed with `ENOSPC` opening `1344-save43-broad-ui.json`. The raw file holds only four minutes of output. The guard
post then failed on the truncated record (`KeyError: 'fixedSource'`). **The run is void, and no number from it is
used.** Its files are kept as the record of the failure.

Cause: the data volume was at 99% (151 MB free). About 40 retained scratch trees (5.4 GB in the session scratchpad,
about 125 MB each) had accumulated on an already nearly full disk. The parent deleted the trees whose records are
committed, by literal path (free space 5.1 GB), and kept the four still in use. Rule from now on: check free space
before every recorded run, and delete a scratch tree once its record lands.

The measurement is re-run as `1344-save43-broad-ui-r2`.
