# UX-PRODUCTION.md — exact immutable excerpts

Source: `HSpector1/project-studio-unity-visual-spike@6420a4d91de52db1bffca2988f2c995672e7d53e`, `Assets/Studio/Runtime/Presentation/UI/StudioProductionWorkspace.cs`. Full Git blob `ce2af4468f2dbaaca27277591d1c161dc306a801`. Source bytes 35208; SHA-256 `b4b70032ffcf5a6521232cdf3d282d12b59c2b18fb0676d315ea6a9e9650c054`. Selected original lines only; source facts do not establish native observations.

## Lines 273–354

```text
            var nowSentence = StudioProductionWorkspaceContracts.NowSentence(
                row, StageRowByFacilityId(row.stageFacilityId)?.facilityLabel);
            if (!string.IsNullOrEmpty(nowSentence))
                rail.Add(Line("production-now-sentence", nowSentence, "ps-production-reason"));
            rail.Add(Line("production-next-milestone", row.nextMilestone, "ps-production-next"));
            detailView.Add(rail);

            // ── the ONE current operation ────────────────────────────────────
            var decision = StudioProductionWorkspaceContracts.DecideOperation(
                row, publishedIntents, actionsEnabledFor());
            renderedOperationButton = null;
            renderedOperationReason = null;
            renderedLocateButtons.Clear();
            renderedOperationProductionId = row.productionId;
            if (decision.HasControl)
            {
                var operation = Section("production-operation", "CURRENT DECISION");
                // P05A.2 §13: the player must never have to guess whether
                // this surface wants something — the banner names the cause
                // and the button is the one authoritative action. (The
                // published nextMilestone row in STATUS carries what follows;
                // hostile F2 removed a tautological duplicate here.)
                var banner = StudioProductionWorkspaceContracts.ActionRequiredBanner(row);
                if (!string.IsNullOrEmpty(banner))
                    operation.Add(Line("production-action-required", banner, "ps-production-state-label"));
                var pendingHere = string.Equals(
                    operationPendingForProductionId, row.productionId, StringComparison.Ordinal);
                var act = new Button(() => ExecuteOperation(row.productionId))
                {
                    name = "production-operation-execute",
                    text = pendingHere ? "SUBMITTED — SETTLING…" : decision.Label,
                };
                act.AddToClassList("ps-production-operation");
                act.SetEnabled(decision.Enabled && !pendingHere);
                // P06D §19: the CTA is pinned in the persistent footer (not the scroll
                // body) so it never scrolls off. Its construction/handler/enabled logic
                // are unchanged — only its PARENT differs; the banner and reason below
                // stay in the scrolling detail section.
                detailFooter.Add(act);
                detailFooter.style.display = DisplayStyle.Flex;
                var reason = Line(
                    "production-operation-reason",
                    decision.Enabled ? string.Empty : decision.DisabledReason,
                    "ps-production-reason");
                reason.style.display = decision.Enabled ? DisplayStyle.None : DisplayStyle.Flex;
                operation.Add(reason);
                if (string.Equals(operationNoticeProductionId, row.productionId, StringComparison.Ordinal) &&
                    !string.IsNullOrEmpty(operationNoticeMessage))
                {
                    // The engine's own refusal, verbatim — never our paraphrase.
                    operation.Add(Line(
                        "production-operation-notice", operationNoticeMessage, "ps-production-reason"));
                }
                detailView.Add(operation);
                renderedOperationButton = act;
                renderedOperationReason = reason;
                renderedOperationEnabled = decision.Enabled && !pendingHere;
                renderedOperationReasonText = decision.Enabled ? string.Empty : decision.DisabledReason;
            }
            else if (string.Equals(operationNoticeProductionId, row.productionId, StringComparison.Ordinal) &&
                     !string.IsNullOrEmpty(operationNoticeMessage))
            {
                var operation = Section("production-operation", "CURRENT DECISION");
                operation.Add(Line(
                    "production-operation-notice", operationNoticeMessage, "ps-production-reason"));
                detailView.Add(operation);
            }
            else
            {
                // P05A.2 §13: silence is not truth — when the engine wants
                // nothing from the player, the surface says so instead of
                // leaving a gap that reads like a hidden control.
                var noAction = StudioProductionWorkspaceContracts.NoActionLine(row);
                if (!string.IsNullOrEmpty(noAction))
                {
                    var operation = Section("production-operation", "CURRENT DECISION");
                    operation.Add(Line("production-no-action", noAction, "ps-production-reason"));
                    detailView.Add(operation);
                }
            }

            // ── blocker anatomy ──────────────────────────────────────────────
```

## Lines 356–471

```text
            {
                var anatomy = row.blockerAnatomy;
                var block = Section("production-blocker", "WHY IT WAITS");
                // P06D §19: converge with Casting's danger callout — a left-rule
                // warning, not a neutral section (styling only; content unchanged).
                block.AddToClassList("ps-production-blocker");
                block.Add(Line("production-blocker-headline", anatomy.headline, "ps-production-blocker-headline"));
                block.Add(Line("production-blocker-detail", anatomy.detail, "ps-production-blocker-line"));
                block.Add(Line("production-blocker-consequence", anatomy.consequence, "ps-production-blocker-line"));
                if (anatomy.projectedWeeks.HasValue)
                {
                    block.Add(Line(
                        "production-blocker-projection",
                        $"Projected wait: {anatomy.projectedWeeks.Value} wk",
                        "ps-production-blocker-line"));
                }
                for (var index = 0; index < anatomy.holders.Length; index++)
                {
                    var holder = anatomy.holders[index];
                    if (holder == null) continue;
                    block.Add(Line(
                        $"production-blocker-holder-{index}",
                        holder.freesInWeeks.HasValue
                            ? $"Held by {holder.title} — frees in {holder.freesInWeeks.Value} wk"
                            : $"Held by {holder.title}",
                        "ps-production-blocker-holder"));
                }
                for (var index = 0; index < anatomy.remedies.Length; index++)
                {
                    var remedy = anatomy.remedies[index];
                    if (remedy == null) continue;
                    // Remedy routes stay read-only in P05A: their canonical
                    // owners (queue/scenery/set surfaces) publish no exact
                    // opaque intent here, and a minted action is forbidden.
                    block.Add(Line(
                        $"production-blocker-remedy-{index}", remedy.label, "ps-production-remedy"));
                }
                detailView.Add(block);
            }

            // ── worksites + Locate ───────────────────────────────────────────
            var worksites = Section("production-worksites", "WORKSITES");
            worksites.Add(Line(
                "production-worksite-headline",
                StudioProductionWorkspaceContracts.WorksiteHeadline(row),
                "ps-production-worksite-headline"));
            var targetIndex = 0;
            foreach (var target in LocateOrder(row))
            {
                var line = new VisualElement { name = $"production-worksite-{targetIndex}" };
                line.AddToClassList("ps-production-worksite-row");
                line.Add(Line(
                    $"production-worksite-label-{targetIndex}", target.label, "ps-production-worksite-label"));
                var capturedTarget = target;
                var locate = new Button(() => ExecuteLocate(capturedTarget))
                {
                    name = $"production-worksite-locate-{targetIndex}",
                    text = "LOCATE",
                };
                locate.AddToClassList("ps-production-locate");
                // Render-time state is advisory; the same pure decision is
                // re-made at ACTIVATION with a fresh resolution (design §17.2).
                var preview = StudioProductionWorkspaceContracts.DecideLocate(
                    capturedTarget, resolveBuildingStableIdFor(capturedTarget.buildingId));
                locate.SetEnabled(preview.Enabled);
                renderedLocateButtons.Add((locate, capturedTarget));
                line.Add(locate);
                worksites.Add(line);
                if (string.Equals(locateNoticeResourceId, capturedTarget.resourceId, StringComparison.Ordinal) &&
                    !string.IsNullOrEmpty(locateNoticeMessage))
                {
                    // F10: an activation-time refusal is never silent — the
                    // refused target says exactly why, in place.
                    worksites.Add(Line(
                        $"production-worksite-notice-{targetIndex}",
                        locateNoticeMessage,
                        "ps-production-reason"));
                }
                targetIndex++;
            }
            detailView.Add(worksites);

            // ── company ──────────────────────────────────────────────────────
            var company = Section("production-company", "COMPANY");
            if (row.companyMembers == null)
            {
                company.Add(Line(
                    "production-company-withheld",
                    "Company roster withheld at this board size.",
                    "ps-production-company-line"));
            }
            else
            {
                foreach (var member in row.companyMembers)
                {
                    if (member == null) continue;
                    company.Add(Line(
                        $"production-company-{member.talentId}",
                        $"{RoleLabel(member.productionRole)} — {member.name}",
                        "ps-production-company-line"));
                }
            }
            detailView.Add(company);

            // ── current Stage/Set, separated from history ───────────────────
            var placement = Section("production-placement", "STAGE & SET");
            var stageRow = StageRowByFacilityId(row.stageFacilityId);
            if (row.stageFacilityId == null)
            {
                placement.Add(Line(
                    "production-stage-current",
                    "No live stage this week.",
                    "ps-production-placement-line"));
            }
            else
            {
```
