# UX-CASTING.md — exact immutable excerpts

Source: `HSpector1/project-studio-unity-visual-spike@6420a4d91de52db1bffca2988f2c995672e7d53e`, `Assets/Studio/Runtime/Presentation/UI/StudioCastingWorkspace.cs`. Full Git blob `21caa5b32d08902acc868fa3b051b5e98ed79f3c`. Source bytes 299909; SHA-256 `9edb52253df76bca251852ae05f7848b3b5ba3fc95fb56ae348b7db845a3c862`. Selected original lines only; source facts do not establish native observations.

## Lines 3931–4052

```text
        private void RenderCompareBar(bool visible)
        {
            var showBar = visible && context != null && context.ComparePins.Count > 0;
            compareBar.style.display = showBar ? DisplayStyle.Flex : DisplayStyle.None;
            if (!showBar) return;
            compareBarLabel.text = $"Pinned to compare ({context.ComparePins.Count}/4)";
            compareOpenButton.SetEnabled(context.ComparePins.Count >= 2);
        }

        /// <summary>[Compare pinned]: requires >=2 pins (up to 4). Opening/closing never mutates a pin.</summary>
        public bool OpenCompare()
        {
            if (context == null || context.ComparePins.Count < 2) return false;
            context.CompareOpen = true;
            RenderAll();
            return true;
        }

        public bool CloseCompare()
        {
            if (context == null || !context.CompareOpen) return false;
            context.CompareOpen = false;
            RenderAll();
            return true;
        }

        private void RenderCompare(bool visible)
        {
            compareRoot.style.display = visible ? DisplayStyle.Flex : DisplayStyle.None;
            compareColumnsContainer.Clear();
            if (!visible || context == null) return;

            var roleKey = context.Role;
            var pins = context.ComparePins;

            MinMax(pins, roleKey, c => c.fit, out var fitMin, out var fitMax);
            MinMax(pins, roleKey, c => c.ovr, out var ovrMin, out var ovrMax);
            MinMax(pins, roleKey, c => c.epExpected, out var epMin, out var epMax);
            MinMax(pins, roleKey, c => c.starPower, out var starMin, out var starMax);

            foreach (var talentId in pins)
            {
                var live = FindCandidateInPool(roleKey, talentId);
                var column = live != null
                    ? BuildCompareColumn(live, roleKey, fitMin, fitMax, ovrMin, ovrMax, epMin, epMax, starMin, starMax)
                    : BuildUnavailableCompareColumn(talentId);
                compareColumnsContainer.Add(column);
            }
        }

        private void MinMax(List<string> pins, string roleKey, Func<StudioCastingCandidateSnapshot, int> selector, out int min, out int max)
        {
            min = int.MaxValue;
            max = int.MinValue;
            foreach (var talentId in pins)
            {
                var candidate = FindCandidateInPool(roleKey, talentId);
                if (candidate == null) continue;
                var value = selector(candidate);
                if (value < min) min = value;
                if (value > max) max = value;
            }
        }

        /// <summary>Factual higher/lower — text/weight, never color alone; no combined score, no "Recommended".</summary>
        private static string Mark(int value, int min, int max)
        {
            if (min > max || min == max) return string.Empty;
            if (value == max) return " (higher)";
            if (value == min) return " (lower)";
            return string.Empty;
        }

        /// <summary>
        /// One aligned column, in the frozen row order: portrait-block/name/
        /// contract/availability header, then Availability/current work,
        /// Role Fit, Camera-test Est+range (this role only), Role OVR,
        /// Expected performance, Genre experience, Star Power, Fee/payroll
        /// status, Top strength/concern.
        /// </summary>
        private VisualElement BuildCompareColumn(
            StudioCastingCandidateSnapshot candidate, string roleKey,
            int fitMin, int fitMax, int ovrMin, int ovrMax, int epMin, int epMax, int starMin, int starMax)
        {
            var column = new VisualElement { name = $"casting-compare-col-{candidate.talentId}" };
            column.AddToClassList("casting-compare-column");

            var portrait = new VisualElement { name = $"casting-compare-portrait-{candidate.talentId}" };
            portrait.AddToClassList("casting-dossier-portrait");
            column.Add(portrait);
            column.Add(new Label($"{candidate.name} — {candidate.professionLabel}") { name = $"casting-compare-name-{candidate.talentId}" });
            column.Add(new Label(BadgeText(candidate.contractBadge)) { name = $"casting-compare-contract-{candidate.talentId}" });
            column.Add(new Label(candidate.available ? "Available" : "Unavailable")
            {
                name = $"casting-compare-availbadge-{candidate.talentId}",
            });
            // P04A.2 (2): the comparison view never read the draft at all —
            // an actor already cast could be compared with no sign of it.
            AddCompareDraftBadge(column, candidate.talentId, roleKey);

            column.Add(new Label(candidate.available
                ? candidate.availabilityLabel
                : $"{candidate.availabilityLabel} · {candidate.currentWorkLabel}"));
            column.Add(new Label($"Fit {candidate.fit}{Mark(candidate.fit, fitMin, fitMax)}"));
            column.Add(new Label(candidate.evidence != null
                ? $"Tested: ~{candidate.evidence.estimate} (range {candidate.evidence.low}–{candidate.evidence.high})"
                : $"Not tested for {RoleLabelFor(roleKey)}"));
            column.Add(new Label($"OVR {candidate.ovr}{Mark(candidate.ovr, ovrMin, ovrMax)}"));
            column.Add(new Label(
                $"EP {candidate.epLow}–{candidate.epHigh} · expected {candidate.epExpected}{Mark(candidate.epExpected, epMin, epMax)}"));
            column.Add(new Label(candidate.genreExperienceLabel));
            column.Add(new Label($"Star Power {candidate.starPower}{Mark(candidate.starPower, starMin, starMax)}"));
            column.Add(new Label(candidate.projectCostLabel));
            var strongest = StrongestPositiveSignal(candidate);
            var concern = StrongestConcernSignal(candidate);
            column.Add(new Label($"{(strongest != null ? strongest.text : "No standout strength noted")} / " +
                                  $"{(concern != null ? concern.text : "No concerns noted")}"));

            column.Add(BuildUnpinButton(candidate.talentId));
            return column;
        }

```
