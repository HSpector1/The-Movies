# Independent static review request: r2 archive segments

Review `build_segments.py` at SHA-256 `c8f5b94d7b74635be5a6c6943bffa090525a839cc9b0404f70769d63aeb429ea` before executing it.

The source is the exact reviewed r2 failed adoption archive at `.../twenty-seventh-verification/ag-adoption-r10-failure-r2/EVIDENCE.tar.xz`: 113,296,808 bytes, SHA-256 `1d065ca4f946269a464c526a80e8d34b932cf56c06bf04fc812fc96590d567df`. The script must read that source without following symlinks, stage only under `/Users/zacheryspector/studio-scratch/1370-r10-adoption-r2-segments`, split into three ordered parts of at most 48 MiB, and reread both the source and concatenated parts. It must emit exact byte counts and SHA-256 hashes for each part and the complete stream in `SEGMENTS.json`.

After acceptance, run `python3 build_segments.py` from this proposal directory. Independently verify the staged manifest, part hashes, and concatenated SHA-256. Then publish the three parts, `SEGMENTS.json`, and `SEGMENTS-README.md` under the exact destination `docs/engineering/playability-launch-review/evidence/p14b4-20260919/1370-stage/twenty-seventh-verification/ag-adoption-r10-failure-r2/`. The 113 MB original archive must not be added to Git (GitHub rejects files over 100 MiB); preserve it locally until the segment publication is remote-verified. Preserve the raw failed leaf until the archive's full byte preservation and remote publication have been independently checked.

This proposal has not been executed, has not written chunks into the evidence worktree, and has not changed Git or the raw failed leaf.
