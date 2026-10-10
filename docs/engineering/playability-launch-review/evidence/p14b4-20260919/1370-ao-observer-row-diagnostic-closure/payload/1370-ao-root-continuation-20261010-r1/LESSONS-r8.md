# AO major lessons — update 8

## Measure the serialized row, not only its canonical input

Actual diagnostic57182 reached the same genuine fixture packet as the earlier runs:12,428,510 bytes, SHA0ae4a9a261600c23b1bfd05eb860d65ef0f6769c9918670eb97bf7120b74ec62. It preserved the original observer Error and emitted one available diagnostic before cleanup. The failed row is an inputTuple at week196, authorCandidate ordinal2, subjectperson-studio-aca408ec-r01-0, issuerstudio-aca408ec-r02, sequence21, occurrence0, proposalSourceIndex70, familyPREFERRED_GENRE_OPPORTUNITY.

The exact failed row is17,305 bytes including its newline,921 above the16,384-byte limit. Canonical input bytes are15,360; serialized detail bytes16,733; context bytes468. Thus a canonical input below16KiB does not establish that its complete observer row fits. The row envelope and JSON-string representation matter. Source tracing identifies escaping as part of this representation, but this diagnostic does not emit the tuple body or measure each component's contribution. Do not claim that the entire1,945-byte difference from canonical input to row is escaping alone, or assign the overage to a particular project/resource list without further evidence.

The exact row identity is stronger than the former hypothesis that a count1001 promise expanded into1001 rows. It did not: the count is a scalar, and the measured failed family is an opportunity tuple. Speculatively reducing that count would have changed the fixture premise while leaving the actual cause unexplained.

## A useful diagnostic can end in an honest failed qualification

Recorder time was65.98286025400739 seconds with no timeout. Tool/helper/recorder exited2; controller/Node exited1. The baseline report has one failed test, with the same original M0 feasibility row-byte error. The meaningful typed-catch mutant did not run. Complete M0 AFTER proofs, terminal Node result, aggregate prefix flag and natural-week fields remain null in the failure readback. Successful fixture generation and earlier sequential checks are separate evidence; they do not convert this run into fullfunction acceptance.

Reviewed root reader10661 completed0 and produced readbackcd974aec with seven scoped PID/group ESRCH checks and a released lane. Actual helper20977, recorder21479, controller21480 and Node21747 are preserved with their real ownership roles. The Node PID is not treated as its own process group. The run used source review00f0 and combined source review945a; later reviewe957 remains supplemental only.

## Finish protection after failure before promoting the diagnosis

The original full shared postflight22313 is now running under scanner22355 against accepted current snapshot63fe5327. It remains required even though the diagnostic produced useful metadata. Its result cannot substitute for missing M0 AFTER proofs. Independent measured-row and observed-run reviews are pending at this cutoff. The next repair must preserve complete evidence and fixture premises or explicitly amend the relevant contract under appropriate authority; helper trace compression does not silently change the observer row cap.
