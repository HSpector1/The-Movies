// ── Host chrome ───────────────────────────────────────────────────────────────
// The plain HTML/CSS around the canvas: a top bar of studio facts, a mode toggle
// (the two presentation states), a camera reset, a selected-building info panel,
// and an action log. The action log is the visible integration proof — every
// navigation event the lot emits lands there.
//
// The host renders facts and forwards intent. It never simulates anything.

import type { StudioLotSnapshot, BuildingId } from '../snapshot/StudioLotSnapshot'
import type { SelectionInfo } from '../StudioLotView'
import type { FixtureKey } from '../snapshot/fixtures'

export type HostCallbacks = {
  onMode: (k: FixtureKey) => void
  onReset: () => void
  onAction: (id: BuildingId) => void
  onClosePanel: () => void
}

export type HostApi = {
  setTopBar: (snap: StudioLotSnapshot) => void
  showSelection: (sel: SelectionInfo | null) => void
  logAction: (label: string, action: string) => void
  setActiveMode: (k: FixtureKey) => void
}

const STANDING_LABEL: Record<StudioLotSnapshot['standing'], string> = {
  struggling: 'Struggling',
  'finding-footing': 'Finding its Footing',
  established: 'Established',
  prestige: 'Prestige',
}

const CASH_LABEL: Record<StudioLotSnapshot['cashBand'], string> = {
  'in-the-red': 'In the Red',
  tight: 'Tight',
  stable: 'Stable',
  flush: 'Flush',
}

const RECEPTION_LABEL: Record<string, string> = {
  flop: 'Flop',
  mixed: 'Mixed',
  hit: 'Hit',
  smash: 'Smash Hit',
}

const ACTION_LABEL: Record<string, string> = {
  'open-studio-overview': 'Open Studio Overview',
  'assemble-film': 'Assemble a Film',
  'browse-talent': 'Browse Talent',
  'review-productions': 'Review Productions',
  'view-released-films': 'View Released Films',
  'view-expansion': 'Plan Expansion',
}

function el<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  cls?: string,
  text?: string,
): HTMLElementTagNameMap[K] {
  const n = document.createElement(tag)
  if (cls) n.className = cls
  if (text !== undefined) n.textContent = text
  return n
}

export function createHost(app: HTMLElement, initialMode: FixtureKey, cb: HostCallbacks): HostApi {
  // ── top bar ────────────────────────────────────────────────────────────────
  const top = el('header', 'top-bar')
  const brand = el('div', 'brand')
  const mark = el('div', 'brand-mark', '★')
  const brandText = el('div', 'brand-text')
  const studioName = el('div', 'studio-name', 'Studio')
  const tagline = el('div', 'tagline', 'Studio Lot — visual spike')
  brandText.append(studioName, tagline)
  brand.append(mark, brandText)

  const stats = el('div', 'stats')
  const mkStat = (label: string): { wrap: HTMLElement; val: HTMLElement } => {
    const wrap = el('div', 'stat')
    const l = el('div', 'stat-label', label)
    const v = el('div', 'stat-value', '—')
    wrap.append(l, v)
    return { wrap, val: v }
  }
  const weekStat = mkStat('Week')
  const standingStat = mkStat('Standing')
  const cashStat = mkStat('Cash')
  stats.append(weekStat.wrap, standingStat.wrap, cashStat.wrap)

  // Player-facing controls only: camera reset lives with the studio chrome.
  const controls = el('div', 'controls')
  const resetBtn = el('button', 'ghost-btn', 'Reset View')
  resetBtn.addEventListener('click', () => cb.onReset())
  controls.append(resetBtn)

  top.append(brand, stats, controls)

  // ── info panel ───────────────────────────────────────────────────────────────
  const panel = el('aside', 'info-panel')
  panel.classList.add('hidden')
  const close = el('button', 'panel-close', '×')
  close.addEventListener('click', () => cb.onClosePanel())
  const pTitle = el('h2', 'panel-title', '')
  const pStatus = el('div', 'panel-status', '')
  const pBlurb = el('p', 'panel-blurb', '')
  const pProd = el('div', 'panel-prod')
  pProd.classList.add('hidden')
  const pReleases = el('div', 'panel-releases')
  pReleases.classList.add('hidden')
  const pAction = el('button', 'action-btn', '')
  pAction.addEventListener('click', () => {
    const id = panel.dataset.building as BuildingId | undefined
    if (id) cb.onAction(id)
  })
  panel.append(close, pTitle, pStatus, pBlurb, pProd, pReleases, pAction)

  // ── prototype dock ───────────────────────────────────────────────────────────
  // Everything the SHIPPING app would not show a player lives here, visually set
  // apart (dashed frame, muted) from the studio chrome: the state toggle (the host
  // supplies real state later) and the navigation-event log (integration evidence).
  const dock = el('section', 'proto-dock')
  const dockHead = el('div', 'dock-head')
  dockHead.append(el('span', 'dock-tag', 'PROTOTYPE'), el('span', 'dock-sub', 'spike controls — not shipping UI'))

  const toggleRow = el('div', 'dock-row')
  toggleRow.append(el('div', 'dock-label', 'Studio state'))
  const toggle = el('div', 'mode-toggle')
  const btnStruggle = el('button', 'mode-btn', 'Small')
  const btnSuccess = el('button', 'mode-btn', 'Established')
  btnStruggle.addEventListener('click', () => cb.onMode('struggling'))
  btnSuccess.addEventListener('click', () => cb.onMode('successful'))
  toggle.append(btnStruggle, btnSuccess)
  toggleRow.append(toggle)

  const log = el('div', 'action-log')
  const logHead = el('div', 'log-head', 'Navigation events → host')
  const logList = el('ul', 'log-list')
  const logEmpty = el('li', 'log-empty', 'Select a building, then choose its action.')
  logList.append(logEmpty)
  log.append(logHead, logList)

  dock.append(dockHead, toggleRow, log)

  // ── hint ─────────────────────────────────────────────────────────────────────
  const hint = el('div', 'hint', 'Drag to pan · Scroll to zoom · WASD/Arrows · R to reset')

  app.append(top, panel, dock, hint)

  // ── api ───────────────────────────────────────────────────────────────────────
  const setActiveMode = (k: FixtureKey): void => {
    btnStruggle.classList.toggle('active', k === 'struggling')
    btnSuccess.classList.toggle('active', k === 'successful')
  }
  setActiveMode(initialMode)

  let latest: StudioLotSnapshot | null = null

  const setTopBar = (snap: StudioLotSnapshot): void => {
    latest = snap
    studioName.textContent = snap.studioName
    weekStat.val.textContent = String(snap.week)
    standingStat.val.textContent = STANDING_LABEL[snap.standing]
    cashStat.val.textContent = CASH_LABEL[snap.cashBand]
    standingStat.val.className = 'stat-value tone-' + snap.standing
    cashStat.val.className = 'stat-value cash-' + snap.cashBand
  }

  const showSelection = (sel: SelectionInfo | null): void => {
    if (!sel) {
      panel.classList.add('hidden')
      return
    }
    panel.classList.remove('hidden')
    panel.dataset.building = sel.buildingId
    pTitle.textContent = sel.label
    pStatus.textContent = sel.available ? 'Open' : 'Not yet open'
    pStatus.className = 'panel-status ' + (sel.available ? 'ok' : 'closed')
    pBlurb.textContent = sel.blurb

    if (sel.production) {
      pProd.classList.remove('hidden')
      const pct = Math.round(sel.production.progress01 * 100)
      pProd.innerHTML = ''
      const t = el('div', 'prod-title', sel.production.title)
      const meta = el(
        'div',
        'prod-meta',
        `${sel.production.genre} · ${sel.production.weeksRemaining} weeks remaining · ${
          sel.production.active ? 'shooting' : 'paused'
        }`,
      )
      const barWrap = el('div', 'prod-bar')
      const bar = el('div', 'prod-bar-fill')
      bar.style.width = pct + '%'
      barWrap.append(bar)
      const pctLabel = el('div', 'prod-pct', pct + '% complete')
      pProd.append(t, meta, barWrap, pctLabel)
    } else {
      pProd.classList.add('hidden')
    }

    // theater: list recent releases with their reception badge
    if (sel.buildingId === 'theater' && latest && latest.releasedFilms.length) {
      pReleases.classList.remove('hidden')
      pReleases.innerHTML = ''
      pReleases.append(el('div', 'releases-head', 'On the marquee'))
      for (const f of latest.releasedFilms.slice(0, 4)) {
        const row = el('div', 'release-row')
        const name = el('span', 'release-name', f.title)
        const badge = el('span', 'release-badge badge-' + f.reception, RECEPTION_LABEL[f.reception] ?? f.reception)
        row.append(name, badge)
        pReleases.append(row)
      }
    } else {
      pReleases.classList.add('hidden')
    }

    pAction.textContent = ACTION_LABEL[sel.action] ?? 'Open'
    pAction.disabled = !sel.available
  }

  const logAction = (label: string, action: string): void => {
    logEmpty.remove()
    const li = el('li', 'log-item')
    const a = el('span', 'log-action', ACTION_LABEL[action] ?? action)
    const b = el('span', 'log-from', label)
    li.append(a, b)
    logList.prepend(li)
    while (logList.children.length > 8) logList.lastChild?.remove()
  }

  return { setTopBar, showSelection, logAction, setActiveMode }
}
