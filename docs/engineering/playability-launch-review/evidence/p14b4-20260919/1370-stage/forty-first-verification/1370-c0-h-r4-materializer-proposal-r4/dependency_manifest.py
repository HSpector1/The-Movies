#!/usr/bin/env python3
"""Separate dependency-row candidate builder; real input remains unrun."""

import json
import os
import time
from pathlib import Path

from materialize import (DEPENDENCY_BYTES, DEPENDENCY_ENTRIES,
                         DEPENDENCY_HISTORICAL_DIGEST, admit, check_real_directory,
                         comparable, held_chain, inventory, normalized_digest,
                         SCRATCH_ROOT)
from safe_output import canonical_dir, overlaps, protected_paths, PRODUCTION

PROTECTED_H = Path("/Users/zacheryspector/studio-scratch/1370-c0-h-m0-observer-mirrors-r2/20261008-h-types-r1")
REQUIRED_RECEIPTS = frozenset({
    "/Users/zacheryspector/studio-scratch/1370-c0-h-bridge-full-readback-independent-observed-review-r6/RECEIPT.json",
    "/Users/zacheryspector/studio-scratch/1370-c0-h-m0-corrected-overlay-source-manifest-r2/H-SOURCE-MANIFEST.json",
    "/Users/zacheryspector/studio-scratch/1370-c0-h-r13-root-drift-attribution-r5-independent-design-review-r1/RECEIPT.json",
    "/Users/zacheryspector/studio-scratch/1370-c0-h-r4-materializer-independent-static-review-r1/RECEIPT.json",
    "/Users/zacheryspector/studio-scratch/1370-c0-h-typecheck-r13-independent-observed-stop-review-r1/RECEIPT.json",
    "/Users/zacheryspector/studio-scratch/1370-c0-stage40-remote-audit-independent-observed-review-r2/RECEIPT.json",
})


def build(source, output, *, fixture=False, expected=None, binding=None):
    source = check_real_directory(source)
    output = Path(output)
    if not output.is_absolute() or output.exists() or output.is_symlink():
        raise RuntimeError("one-shot dependency manifest output must be absent")
    if SCRATCH_ROOT not in output.parents:
        raise RuntimeError("dependency manifest output outside studio scratch")
    parent = canonical_dir(output.parent)
    if not fixture and binding is None:
        raise RuntimeError("real dependency manifest requires exact protected binding")
    if not fixture and (
        binding.get("protectedH") != str(PROTECTED_H)
        or binding.get("productionDependencies") != str(source)
        or binding.get("evidenceCheckout") is None
        or not REQUIRED_RECEIPTS.issubset(binding.get("immutableReceiptSha256", {}))
    ):
        raise RuntimeError("real dependency manifest protected binding mismatch")
    protected = [canonical_dir(PRODUCTION), source]
    if binding is not None:
        protected.extend(protected_paths(binding))
    if any(overlaps(parent, item) for item in protected):
        raise RuntimeError("manifest output parent overlaps protected input")
    if not fixture and str(source) != "/Users/zacheryspector/The-Movies-headless-program/node_modules":
        raise RuntimeError("real dependency source path mismatch")
    with held_chain(source), held_chain(parent) as output_parent_fd:
        if not fixture:
            admit(output.parent, "dependency manifest before scan")
        scan = inventory(source, deadline=time.monotonic() + 300)
        rows = comparable(scan["rows"])
        count = len(rows)
        size = sum(row.get("size", 0) for row in rows)
        links = sum(row["kind"] == "link" for row in rows)
        target = expected if fixture else (DEPENDENCY_ENTRIES, DEPENDENCY_BYTES, 24)
        if (count, size, links) != target:
            raise RuntimeError("dependency roster count/bytes/links mismatch")
        if not fixture:
            admit(output.parent, "dependency manifest after scan")
        result = {"schema": "1370-c0-h-r4-dependency-path-manifest-proposal-r3",
                  "decision": "PROPOSED_DEPENDENCY_ROWS_PENDING_INDEPENDENT_REVIEW",
                  "source": str(source), "sourceRootIdentity": scan["rootIdentity"],
                  "historicalMetadataDigestSha256": DEPENDENCY_HISTORICAL_DIGEST,
                  "entryCount": count, "regularBytes": size, "symlinkCount": links,
                  "rowsSha256": normalized_digest(scan["rows"]), "rows": rows,
                  "claimLimit": "Current installed dependency paths/content/modes/links only; historical aggregate requires separate reconciliation"}
        payload = (json.dumps(result, sort_keys=True, separators=(",", ":")) + "\n").encode()
        fd = os.open(output.name, os.O_CREAT | os.O_EXCL | os.O_WRONLY | os.O_NOFOLLOW,
                     0o600, dir_fd=output_parent_fd)
        try:
            view = memoryview(payload)
            while view:
                view = view[os.write(fd, view):]
            os.fsync(fd)
        finally:
            os.close(fd)
        if inventory(source, deadline=time.monotonic() + 300) != scan:
            raise RuntimeError("dependency source changed during manifest build")
        return result
