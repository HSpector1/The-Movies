# UX-FINANCE.md — exact immutable excerpts

Source: `HSpector1/project-studio-unity-visual-spike@6420a4d91de52db1bffca2988f2c995672e7d53e`, `Assets/Studio/Runtime/Presentation/UI/StudioFinanceWorkspace.cs`. Full Git blob `54c9be70299a2caeb0fb05c7cf6f63530f8ea0aa`. Source bytes 22988; SHA-256 `fe30bb8d3870a1c0d3ac4a68713d526cb9fbd6f0e1a23d2fcbe311b52eed3478`. Selected original lines only; source facts do not establish native observations.

## Lines 17–65

```text
        private string textSize = "100%";
        private float availableWidth = 1920f;
        private bool restoringScroll;
        private StudioFinanceSnapshot report;
        private int revision = -1;
        private string sessionId;
        private string selectedPeriod = "Last completed week", selectedTab = "Overview", employeeFilter = "All employees", facilityFilter = "All facilities", selectedFilm;
        private readonly Dictionary<string, float> offsets = new();
        private readonly Dictionary<string, Button> tabButtons = new();
        private readonly Button back;
        private readonly Action<string> profile, facility, result;
        private readonly Action history;
        private readonly Action<int> capitalHistory;
        public StudioFinanceSnapshot Report => report;
        public string SelectedPeriod => selectedPeriod;
        public string SelectedTab => selectedTab;
        public string SelectedFilm => selectedFilm;
        public float ScrollOffset => content.scrollOffset.y;
        public object Observation => new { tab = selectedTab, period = selectedPeriod, filmId = selectedFilm, employeeFilter, facilityFilter, textSize,
            upcomingWindowWeeks, historyWindowWeeks, portfolioFilter, portfolioSort, portfolioPage, selectedHistoryWeek, selectedCostKind, developmentProjectId,
            offset = content.scrollOffset.y, highValue = content.verticalScroller.highValue,
            contentHeight = content.contentContainer.layout.height, viewportHeight = content.contentViewport.layout.height,
            focus = (Root.panel?.focusController?.focusedElement as VisualElement)?.name, restoringScroll };

        public StudioFinanceWorkspace(Action close, Action<string> openProfile, Action<string> openFacility, Action<string> openResult, Action openHistory, Action<int> openCapitalHistory = null, Action<StudioFinanceRoute> openRoute = null)
        {
            profile = openProfile; facility = openFacility; result = openResult; history = openHistory; capitalHistory = openCapitalHistory;
            route = openRoute;
            Root = new VisualElement { name = "finance-workspace" };
            Root.AddToClassList("ps-finance");
            var sheet = Resources.Load<StyleSheet>("StudioFinanceWorkspace");
            if (sheet != null) Root.styleSheets.Add(sheet);
            var header = Box(Root, "ps-finance-header");
            var identity = Box(header, "ps-finance-identity");
            Text(identity, "ADMINISTRATION / FINANCE", "ps-finance-eyebrow");
            asOf = Text(identity, "Waiting for the studio", "ps-finance-asof");
            connection = Text(identity, "Connected", "ps-finance-connection");
            connection.name = "finance-connection";
            var sizeChoice = new DropdownField(new List<string> { "100%", "150%", "200%" }, 0) { name = "finance-text-size", label = "Text ▼" };
            sizeChoice.AddToClassList("ps-finance-text-size");
            sizeChoice.RegisterValueChangedCallback(e => {
                CaptureContext(); textSize = e.newValue;
                Root.EnableInClassList("ps-finance--large", textSize != "100%");
                Root.EnableInClassList("ps-finance--150", textSize == "150%");
                Root.EnableInClassList("ps-finance--200", textSize == "200%");
                Resize(availableWidth); Render(); RestoreContext();
            });
            header.Add(sizeChoice);
            back = ActionButton(header, "Back to lot", "finance-back", close);
```

## Lines 86–112

```text
        public void Focus() => back.Focus();
        public void ShowConnectionStatus(bool retainingLastView)
        {
            var message = retainingLastView ? "Connection unavailable · showing the last connected studio" : "Connected";
            if (connection.text != message) connection.text = message;
        }
        private string ContextKey => developmentProjectId == null ? selectedTab : "Project:" + developmentProjectId;
        public void CaptureContext() { if (!restoringScroll) offsets[ContextKey] = content.scrollOffset.y; }
        public void RestoreContext()
        {
            var tab = ContextKey; restoringScroll = true;
            StudioPeopleWorkspaceLayout.RestoreScroll(content, offsets.GetValueOrDefault(tab), () => ContextKey == tab,
                success => { restoringScroll = false; });
        }
        public void Bind(StudioFinanceSnapshot value, int stateRevision, string stateSession, StudioDevelopmentBoardSnapshot development = null)
        {
            if (revision == stateRevision && sessionId == stateSession && report != null) return;
            CaptureContext(); revision = stateRevision; sessionId = stateSession; report = value;
            developmentBoard = development;
            Render(); RestoreContext();
        }
        public void Resize(float availableWidth)
        {
            this.availableWidth = availableWidth;
            Root.EnableInClassList("ps-finance--narrow", availableWidth < 1300f);
            Root.style.width = new Length(availableWidth < 1300f || textSize != "100%" ? 96f : 68f, LengthUnit.Percent);
        }
```
