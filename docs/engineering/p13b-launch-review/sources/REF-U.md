# REF-U — exact source excerpts

Repository: `HSpector1/project-studio-unity-visual-spike`
Commit: `6420a4d91de52db1bffca2988f2c995672e7d53e`
Path: `Assets/Studio/Runtime/Presentation/UI/StudioLaboratoryWorkspace.cs`
Full source Git blob: `7b03a290b0b54966170560b6a1ad6ccb2cbaa927`
Full source SHA-256: `7d53d26f12a70f9bca97bccb7322126cd3a5eb3477460264198738bbe6db60f6`
Full source bytes: 15899

[Immutable source](https://github.com/HSpector1/project-studio-unity-visual-spike/blob/6420a4d91de52db1bffca2988f2c995672e7d53e/Assets/Studio/Runtime/Presentation/UI/StudioLaboratoryWorkspace.cs)

Selected lines only. Historical source; instructions and proposed numbers retain their original authority and are not execution orders.

## Original lines 9–114

```text
{
    /// <summary>One exact Laboratory in one connected campaign. All research facts and verbs come from TypeScript.</summary>
    public sealed class StudioLaboratoryWorkspace
    {
        private readonly StudioBridgeClient client;
        private readonly Action<string> locate;
        private readonly Func<string, bool> canLocate;
        private readonly Label title, calendar, status;
        private readonly Button back, locateButton, previousPage, nextPage;
        private readonly Label pageLabel;
        private readonly ScrollView scroll;
        private StudioIndustryResponse page;
        private int generation, revision = -1, actionPage;
        private bool queued, waiting;
        private string session, digest, focusName;
        private string pendingCommand, lastFeedback;
        private StudioLaboratoryAction reviewAction;
        private Button confirmButton;
        private readonly Dictionary<Button, StudioLaboratoryAction> actionButtons = new();
        private Vector2 offset;
        private int textPercent = 100;
        public VisualElement Root { get; }
        public string BuildingId { get; private set; }
        public string SessionId => session;
        public StudioIndustryResponse Page => page;

        public StudioLaboratoryWorkspace(StudioBridgeClient client, Action close, Action<string> locate, Func<string, bool> canLocate)
        {
            this.client = client; this.locate = locate; this.canLocate = canLocate;
            Root = new VisualElement { name = "laboratory-workspace" };
            var sheet = Resources.Load<StyleSheet>("StudioPeopleWorkspace");
            if (sheet != null) Root.styleSheets.Add(sheet);
            Root.style.position = Position.Absolute;
            Root.style.left = Root.style.right = 28; Root.style.top = 110; Root.style.bottom = 28;
            Root.style.backgroundColor = new Color(.075f, .09f, .095f, 1f);
            Root.style.color = new Color(.94f, .92f, .84f);
            Root.style.paddingLeft = Root.style.paddingRight = 26;
            Root.style.paddingTop = Root.style.paddingBottom = 18;
            Root.style.overflow = Overflow.Hidden;
            var header = Row(); Root.Add(header);
            back = AddButton(header, "laboratory-back", "‹  Back to lot", close);
            title = Text("Research Laboratory"); title.style.flexGrow = 1;
            title.style.unityFontStyleAndWeight = FontStyle.Bold; header.Add(title);
            AddButton(header, "laboratory-refresh", "Refresh / first page", () => { actionPage = 0; Queue(); });
            AddButton(header, "laboratory-text-100", "Text 100%", () => textPercent = 100);
            AddButton(header, "laboratory-text-200", "Text 200%", () => textPercent = 200);
            calendar = Text(""); calendar.name = "laboratory-calendar"; Root.Add(calendar);
            var navigation = Row(); Root.Add(navigation);
            locateButton = AddButton(navigation, "laboratory-locate", "Locate this Laboratory", () => {
                if (!HasCurrentPage || canLocate?.Invoke(BuildingId) != true) return;
                CaptureContext(); locate?.Invoke(BuildingId);
            });
            status = Text("Reading this Laboratory…"); status.name = "laboratory-status"; Root.Add(status);
            scroll = new ScrollView(ScrollViewMode.Vertical) { name = "laboratory-scroll" };
            StudioPeopleWorkspaceLayout.ConstrainScroll(scroll, true);
            scroll.RegisterCallback<WheelEvent>(e => e.StopPropagation()); Root.Add(scroll);
            var pager = Row(); pager.name = "laboratory-pager"; Root.Add(pager);
            previousPage = AddButton(pager, "laboratory-page-previous", "‹ Previous decisions", () => ChangePage(-1));
            pageLabel = Text(""); pager.Add(pageLabel);
            nextPage = AddButton(pager, "laboratory-page-next", "More decisions ›", () => ChangePage(1));
            Root.style.display = DisplayStyle.None;
        }

        public void Open(string buildingId)
        {
            if (string.IsNullOrWhiteSpace(buildingId)) return;
            var sameTarget = BuildingId == buildingId && session == client?.Current?.sessionId;
            if (sameTarget) CaptureContext();
            Observe(client?.Current);
            if (!sameTarget) { offset = Vector2.zero; focusName = null; actionPage = 0; }
            BuildingId = buildingId; Queue(false);
            RestoreContext();
        }

        public void Observe(StudioBridgeSnapshotResponse snapshot)
        {
            if (snapshot == null) return;
            var changedSession = session != null && session != snapshot.sessionId;
            if (changedSession)
            {
                CancelDeferredReview("The campaign changed. Review the action in this campaign.");
                BuildingId = null; offset = Vector2.zero; focusName = null;
                actionPage = 0;
                pendingCommand = lastFeedback = null;
            }
            if (session == snapshot.sessionId && revision == snapshot.stateRevision && digest == snapshot.stateDigest) return;
            session = snapshot.sessionId; revision = snapshot.stateRevision; digest = snapshot.stateDigest;
            Queue(!changedSession);
        }

        public void CaptureContext()
        {
            offset = scroll.scrollOffset;
            focusName = (Root.panel?.focusController?.focusedElement as VisualElement)?.name ?? focusName;
        }

        public void SetVisible(bool visible)
        {
            if (!visible) CancelDeferredReview("The Laboratory review closed. Review the action again.");
            Root.style.display = visible ? DisplayStyle.Flex : DisplayStyle.None;
        }

        private void CancelDeferredReview(string reason)
        {
            if (pendingCommand != null) client?.CancelDeferredDisplayedIntent(pendingCommand, reason);
        }
```

## Original lines 210–251

```text

        private bool CanSubmit(StudioLaboratoryAction action) => HasCurrentPage && pendingCommand == null &&
            client?.CanSubmitDisplayedIntent == true && action?.enabled == true && action.intent != null &&
            Array.Exists(page.laboratory.actions, current => ReferenceEquals(current, action));

        private void Confirm()
        {
            if (!CanSubmit(reviewAction)) return;
            var action = reviewAction;
            var command = Guid.NewGuid().ToString("N");
            if (!client.SubmitDisplayedIntent(action.intent, command,
                () => pendingCommand == command && Root.style.display.value != DisplayStyle.None &&
                    ReferenceEquals(reviewAction, action) && HasCurrentPage,
                reason => {
                    if (pendingCommand != command) return;
                    pendingCommand = null; lastFeedback = reason; status.text = reason;
                })) return;
            // The exact visible review must survive the healthy read which owns a
            // deferred click. The accepted client seam then freezes its original POST.
            pendingCommand = command; lastFeedback = null;
            status.text = "Applying your decision…";
        }

        public bool TryBack()
        {
            if (reviewAction == null) return false;
            CancelDeferredReview("The Laboratory review closed. Review the action again.");
            reviewAction = null; RenderPage(); return true;
        }

        private void ChangePage(int delta)
        {
            if (!HasCurrentPage || reviewAction != null) return;
            var target = actionPage + delta;
            if (target < 0 || target >= page.pageCount) return;
            actionPage = target; offset = Vector2.zero; focusName = "laboratory-page-next"; Queue(false);
        }

        private VisualElement Section(string heading, string name, params string[] lines)
        {
            var block = new VisualElement { name = name };
            block.style.flexShrink = 0; block.style.paddingTop = 12; block.style.paddingBottom = 10;
```
