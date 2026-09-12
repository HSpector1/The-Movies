# REF-UH — exact source excerpts

Repository: `HSpector1/project-studio-unity-visual-spike`
Commit: `6420a4d91de52db1bffca2988f2c995672e7d53e`
Path: `Assets/Studio/Runtime/Presentation/UI/StudioWorkspaceHost.Laboratory.cs`
Full source Git blob: `17146ab94d4971ce28af0c4a3916f2764360b328`
Full source SHA-256: `e19143187734020bf17bc966537f8fb6a94fbe916ea5ed516794ddbfdab77143`
Full source bytes: 2967

[Immutable source](https://github.com/HSpector1/project-studio-unity-visual-spike/blob/6420a4d91de52db1bffca2988f2c995672e7d53e/Assets/Studio/Runtime/Presentation/UI/StudioWorkspaceHost.Laboratory.cs)

Selected lines only. Historical source; instructions and proposed numbers retain their original authority and are not execution orders.

## Original lines 1–59

```text
using System;
using Studio.Runtime.Data;
using UnityEngine.UIElements;

namespace ProjectStudio.UnitySpike.Presentation
{
    public sealed partial class StudioWorkspaceHost
    {
        private StudioLaboratoryWorkspace laboratoryWorkspace;
        private bool laboratoryRouteOpen;
        public bool LaboratoryRouteOpen => workspaceOpen && laboratoryRouteOpen;
        public StudioLaboratoryWorkspace LaboratoryWorkspace => laboratoryWorkspace;

        public static bool IsLaboratoryBuilding(StudioBridgeSnapshotResponse snapshot, string buildingId)
        {
            if (string.IsNullOrWhiteSpace(buildingId)) return false;
            var placements = snapshot?.snapshot?.construction?.placement?.placements;
            if (placements == null) return false;
            foreach (var placement in placements)
                if (placement != null && string.Equals(buildingId, "placed-" + placement.id, StringComparison.Ordinal))
                    return string.Equals(placement.capability, "laboratory", StringComparison.Ordinal) &&
                        string.Equals(placement.blueprintId, "research-laboratory", StringComparison.Ordinal);
            return false;
        }

        public void OpenLaboratory(string buildingId)
        {
            EnsureInitialized();
            if (!IsLaboratoryBuilding(client?.Current, buildingId)) return;
            if (laboratoryWorkspace == null)
            {
                laboratoryWorkspace = new StudioLaboratoryWorkspace(client, RequestCloseWorkspace,
                    id => SuspendForLocate(id, true), id => ResolveBuildingStableId(id) != null);
                uiDocument.rootVisualElement.Add(laboratoryWorkspace.Root);
            }
            ResetWorkspaceRouteFlags();
            UnsubscribeNavigationOriginRestored();
            retainedContext = null; industryReturn = null;
            releaseResultReturnsToHistory = releaseResultReturnsToProfile = false;
            suspendedForLocate = false;
            laboratoryRouteOpen = workspaceOpen = true;
            ApplyOpenVisualState(); inputContext?.SuspendForWorkspace();
            laboratoryWorkspace.Open(buildingId);
        }

        // Every direct route entry clears the same complete set. Return origins are deliberately
        // retained separately so a one-layer Back still restores its actual parent workspace.
        private void ResetWorkspaceRouteFlags()
        {
            if (buildRouteOpen)
            {
                buildWorkspace?.Reset(); pendingPlacementCommandId = null; pendingSetCommandId = null;
                if (StudioLotGrowthPresentation.Instance != null) StudioLotGrowthPresentation.Instance.GroundMapVisibleInBuildMode = false;
            }
            productionRouteOpen = releaseResultRouteOpen = historyRouteOpen = profileRouteOpen =
                rosterRouteOpen = financeRouteOpen = buildRouteOpen = industryRouteOpen = laboratoryRouteOpen = false;
        }
    }
}
```
