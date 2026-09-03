"use strict";

const STORAGE_KEY = "project-studio-audio-systems-pilot-01-ratings-v2";
const DIMENSIONS = [
  ["musicalQuality", "Musical quality"],
  ["eraFit", "Era fit"],
  ["studioIdentity", "Project: Studio identity"],
  ["managementSuitability", "Management suitability"],
  ["irritation", "Irritation"],
  ["repetition", "Repetition"],
  ["transitionQuality", "Transition quality"],
  ["ambienceQuality", "Ambience quality"],
  ["radioCopyCredibility", "Radio-copy credibility"],
  ["voicePerformance", "Voice performance"],
  ["ducking", "Ducking"],
  ["uiSoundRestraint", "UI sound restraint"],
  ["accessibility", "Accessibility"],
];

const ui = Object.fromEntries([
  "progress", "collection-filter", "search-filter", "catalogue-summary", "item-list", "player",
  "empty-state", "audition-card", "item-kicker", "item-title", "item-detail", "audio", "caption",
  "metadata", "rating-grid", "notes", "export-csv", "export-json", "clear-ratings",
  "captions-enabled", "audition-volume", "catalogue-hash",
  "transcript-panel", "transcript",
].map((id) => [id.replaceAll("-", "_"), document.getElementById(id)]));

let catalogue = { items: [], catalogueSha256: "" };
let visible = [];
let selectedId = null;
let ratings = readRatings();
let gamepadButtons = [];
let activeRatingKey = DIMENSIONS[0][0];
let activeRatingIndex = 0;
let selectionGeneration = 0;

function readRatings() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}"); }
  catch { return {}; }
}
function persist() { localStorage.setItem(STORAGE_KEY, JSON.stringify(ratings)); }
function csvCell(value) { return `"${String(value ?? "").replaceAll('"', '""')}"`; }
function download(name, content, type) {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const link = document.createElement("a");
  link.href = url; link.download = name; link.click();
  setTimeout(() => URL.revokeObjectURL(url), 0);
}
function escapeText(value) { return String(value ?? ""); }

function updateProgress() {
  const decided = catalogue.items.filter((item) => ratings[item.id]?.verdict).length;
  ui.progress.textContent = `${decided} / ${catalogue.items.length} rated`;
}
function renderFilters() {
  const collections = [...new Set(catalogue.items.map((item) => item.collection))];
  for (const collection of collections) {
    const option = document.createElement("option");
    option.value = collection; option.textContent = collection.replaceAll("_", " ");
    ui.collection_filter.append(option);
  }
}
function applyFilters() {
  const query = ui.search_filter.value.trim().toLowerCase();
  visible = catalogue.items.filter((item) =>
    (ui.collection_filter.value === "ALL" || item.collection === ui.collection_filter.value) &&
    (!query || [item.title, item.epoch, item.context, item.collection, item.id].join(" ").toLowerCase().includes(query)),
  );
  ui.catalogue_summary.textContent = `${visible.length} verified local audition items`;
  if (!visible.some((item) => item.id === selectedId)) selectedId = visible[0]?.id ?? null;
  renderList(); renderSelection();
}
function renderList() {
  ui.item_list.replaceChildren();
  visible.forEach((item, index) => {
    const li = document.createElement("li");
    const button = document.createElement("button");
    button.type = "button";
    button.className = item.id === selectedId ? "selected" : "";
    button.dataset.id = item.id;
    button.setAttribute("aria-current", item.id === selectedId ? "true" : "false");
    const idx = document.createElement("span"); idx.className = "index"; idx.textContent = String(index + 1).padStart(2, "0");
    const copy = document.createElement("span"); copy.className = "item-copy";
    const strong = document.createElement("strong"); strong.textContent = item.title;
    const small = document.createElement("small"); small.textContent = [item.epoch, item.context].filter(Boolean).join(" · ");
    copy.append(strong, small);
    const decision = ratings[item.id]?.verdict ?? "unrated";
    const marker = document.createElement("span"); marker.className = `decision-marker ${decision}`;
    marker.textContent = decision[0].toUpperCase() + decision.slice(1);
    button.append(idx, copy, marker);
    button.addEventListener("click", () => select(item.id));
    li.append(button); ui.item_list.append(li);
  });
}
function select(id) {
  selectedId = id;
  ui.audio.pause();
  renderList(); renderSelection();
}
function selected() { return catalogue.items.find((item) => item.id === selectedId) ?? null; }
function renderSelection() {
  const item = selected();
  ui.empty_state.hidden = Boolean(item); ui.audition_card.hidden = !item;
  if (!item) return;
  ui.item_kicker.textContent = `${item.collection.replaceAll("_", " ")} · ${item.status}`;
  ui.item_title.textContent = item.title;
  ui.item_detail.textContent = [item.epoch, item.context, item.durationSeconds ? `${Math.round(item.durationSeconds)} seconds` : null].filter(Boolean).join(" · ");
  ui.audio.src = item.audio;
  ui.audio.querySelectorAll("track").forEach((track) => track.remove());
  if (item.captionTrack) {
    const track = document.createElement("track");
    track.kind = "captions"; track.label = "English"; track.srclang = "en";
    track.src = item.captionTrack; track.default = ui.captions_enabled.checked;
    ui.audio.append(track);
  }
  ui.audio.volume = Number(ui.audition_volume.value);
  ui.caption.textContent = ui.captions_enabled.checked ? item.captionText || item.importantSoundCaption || "Audio preview." : "Captions hidden by local preference.";
  ui.metadata.replaceChildren();
  selectionGeneration += 1;
  const generation = selectionGeneration;
  ui.transcript_panel.hidden = !item.transcript;
  ui.transcript.textContent = item.transcript ? "Loading local transcript…" : "";
  if (item.transcript) fetch(item.transcript, { cache: "no-store" }).then((response) => {
    if (!response.ok) throw new Error(`transcript HTTP ${response.status}`);
    return response.text();
  }).then((value) => {
    if (generation === selectionGeneration) ui.transcript.textContent = value;
  }).catch((error) => {
    if (generation === selectionGeneration) ui.transcript.textContent = `Transcript unavailable: ${error.message}`;
  });
  for (const [label, value] of [["Prototype ID", item.id], ["Classification", item.classification], ["Bus", item.bus], ["Hash", item.sha256], ["Rights", item.rightsStatus]]) {
    if (!value) continue;
    const row = document.createElement("div"), dt = document.createElement("dt"), dd = document.createElement("dd");
    dt.textContent = label; dd.textContent = escapeText(value); row.append(dt, dd); ui.metadata.append(row);
  }
  renderRatings();
}
function updateRating(patch) {
  const item = selected(); if (!item) return;
  ratings[item.id] = { ...(ratings[item.id] ?? {}), ...patch, savedAt: new Date().toISOString() };
  persist(); renderRatings(); renderList(); updateProgress();
}
function renderRatings() {
  const item = selected(); if (!item) return;
  const rating = ratings[item.id] ?? {};
  ui.rating_grid.replaceChildren();
  DIMENSIONS.forEach(([key, label]) => {
    const fieldset = document.createElement("fieldset"), legend = document.createElement("legend"), row = document.createElement("div");
    legend.textContent = label; row.className = "score-row";
    for (let score = 1; score <= 5; score += 1) {
      const button = document.createElement("button");
      button.type = "button"; button.textContent = String(score); button.dataset.ratingKey = key;
      button.className = rating[key] === score ? "active" : "";
      button.setAttribute("aria-label", `${label}: ${score}`);
      button.addEventListener("focus", () => {
        activeRatingKey = key;
        activeRatingIndex = DIMENSIONS.findIndex(([candidate]) => candidate === key);
      });
      button.addEventListener("click", () => updateRating({ [key]: score })); row.append(button);
    }
    fieldset.append(legend, row); ui.rating_grid.append(fieldset);
  });
  document.querySelectorAll("[data-verdict]").forEach((button) => button.classList.toggle("active", button.dataset.verdict === rating.verdict));
  ui.notes.value = rating.notes ?? "";
}
function exportJson() {
  download(`project-studio-audio-systems-feedback-${new Date().toISOString().slice(0, 10)}.json`, JSON.stringify({
    schema: "project-studio-audio-systems-owner-feedback/v1", exportedAt: new Date().toISOString(),
    catalogueSha256: catalogue.catalogueSha256, status: "OWNER_FEEDBACK_NOT_PRODUCTION_OR_RIGHTS_ACCEPTANCE", ratings,
  }, null, 2) + "\n", "application/json");
}
function exportCsv() {
  const headers = ["item_id", "collection", "epoch", "context", ...DIMENSIONS.map(([key]) => key), "verdict", "notes", "saved_at"];
  const rows = [headers.map(csvCell).join(",")];
  for (const item of catalogue.items) {
    const rating = ratings[item.id] ?? {};
    rows.push([item.id, item.collection, item.epoch, item.context, ...DIMENSIONS.map(([key]) => rating[key]), rating.verdict, rating.notes, rating.savedAt].map(csvCell).join(","));
  }
  download(`project-studio-audio-systems-feedback-${new Date().toISOString().slice(0, 10)}.csv`, rows.join("\n") + "\n", "text/csv;charset=utf-8");
}
function move(delta) {
  if (!visible.length) return;
  const index = Math.max(0, visible.findIndex((item) => item.id === selectedId));
  select(visible[(index + delta + visible.length) % visible.length].id);
}
function moveRatingDimension(delta) {
  activeRatingIndex = (activeRatingIndex + delta + DIMENSIONS.length) % DIMENSIONS.length;
  activeRatingKey = DIMENSIONS[activeRatingIndex][0];
  ui.rating_grid.children[activeRatingIndex]?.querySelector("button")?.focus();
}
function adjustScore(delta) {
  const item = selected(); if (!item) return;
  const current = Number(ratings[item.id]?.[activeRatingKey] ?? 3);
  updateRating({ [activeRatingKey]: Math.max(1, Math.min(5, current + delta)) });
}
function cycleVerdict() {
  const item = selected(); if (!item) return;
  const values = ["keep", "maybe", "reject"];
  const current = ratings[item.id]?.verdict;
  updateRating({ verdict: values[(values.indexOf(current) + 1) % values.length] });
}
function pollGamepad() {
  const pad = navigator.getGamepads?.()[0];
  if (pad) {
    const pressed = pad.buttons.map((button) => button.pressed);
    if (pressed[12] && !gamepadButtons[12]) move(-1);
    if (pressed[13] && !gamepadButtons[13]) move(1);
    if (pressed[14] && !gamepadButtons[14]) adjustScore(-1);
    if (pressed[15] && !gamepadButtons[15]) adjustScore(1);
    if (pressed[4] && !gamepadButtons[4]) moveRatingDimension(-1);
    if (pressed[5] && !gamepadButtons[5]) moveRatingDimension(1);
    if (pressed[2] && !gamepadButtons[2]) cycleVerdict();
    if (pressed[0] && !gamepadButtons[0]) ui.audio.paused ? ui.audio.play().catch(() => {}) : ui.audio.pause();
    gamepadButtons = pressed;
  }
  requestAnimationFrame(pollGamepad);
}

document.querySelectorAll("[data-verdict]").forEach((button) => button.addEventListener("click", () => updateRating({ verdict: button.dataset.verdict })));
ui.notes.addEventListener("input", () => updateRating({ notes: ui.notes.value }));
ui.collection_filter.addEventListener("change", applyFilters); ui.search_filter.addEventListener("input", applyFilters);
ui.export_csv.addEventListener("click", exportCsv); ui.export_json.addEventListener("click", exportJson);
ui.clear_ratings.addEventListener("click", () => { if (confirm("Clear every locally saved rating for this pilot?")) { ratings = {}; persist(); renderList(); renderRatings(); updateProgress(); } });
ui.captions_enabled.addEventListener("change", renderSelection); ui.audition_volume.addEventListener("input", () => { ui.audio.volume = Number(ui.audition_volume.value); });
document.addEventListener("keydown", (event) => {
  if (["INPUT", "TEXTAREA", "SELECT"].includes(document.activeElement?.tagName)) return;
  if (event.key.toLowerCase() === "j") move(1);
  if (event.key.toLowerCase() === "k") move(-1);
  if (/^[1-5]$/.test(event.key)) updateRating({ [activeRatingKey]: Number(event.key) });
  if (event.code === "Space") { event.preventDefault(); ui.audio.paused ? ui.audio.play().catch(() => {}) : ui.audio.pause(); }
});

fetch("data/catalogue.json", { cache: "no-store" }).then((response) => {
  if (!response.ok) throw new Error(`catalogue HTTP ${response.status}`);
  return response.json();
}).then((value) => {
  if (value.schema !== "project-studio-audio-systems-audition/v2" || value.telemetry !== false || value.networkRequired !== false) throw new Error("catalogue policy mismatch");
  catalogue = value; selectedId = value.items[0]?.id ?? null;
  ui.catalogue_hash.textContent = `Catalogue SHA-256 ${value.catalogueSha256}`;
  renderFilters(); applyFilters(); updateProgress(); pollGamepad();
}).catch((error) => {
  ui.empty_state.innerHTML = "";
  const title = document.createElement("h2"), body = document.createElement("p");
  title.textContent = "Local catalogue unavailable"; body.className = "error"; body.textContent = error.message;
  ui.empty_state.append(title, body);
});
